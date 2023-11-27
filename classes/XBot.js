const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
// const dataDirPlugin = require("puppeteer-extra-plugin-user-data-dir");
puppeteer.use(pluginStealth());
const path = require("path");
// const {executablePath} = require('puppeteer')
// puppeteer.use(dataDirPlugin('/Users/aleleonian/Library/Application Support/Google/Chrome/Default'));

// const puppeteerClassic = require("puppeteer");
// const iPhone = KnownDevices["iPhone X"];
// const KnownDevices = puppeteerClassic.KnownDevices;

const BROWSER_OPEN_FAIL = 0;
const exitCodeStrings = [
    "Could not open browser :(!"
]


let pupConfig = {
    headless: JSON.parse(process.env.XBOT_HEADLESS),
    defaultViewport: null,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ],
    executablePath: '/usr/bin/chromium-browser',
};

if (process.env.EXECUTABLE_PATH) {
    pupConfig.executablePath = process.env.EXECUTABLE_PATH;
}

class XBot {

    constructor() {
        this.browser;
        this.page;
        this.tweets = {};
        this.isLoggedIn = false;
        this.isBusy = false;
        this.queue = [];
        this.queueTimer = false;
    }

    async init() {
        const browser = await puppeteer.launch(pupConfig);
        let responseObject = {};
        if (!browser) {
            responseObject = {
                success: false,
                exitCode: BROWSER_OPEN_FAIL,
                message: exitCodeStrings[BROWSER_OPEN_FAIL]
            }
            return responseObject;
        }
        else {
            this.browser = browser;
            responseObject = {
                success: true,
            }
            this.page = await browser.newPage();
            // this.page.setDefaultTimeout(10000);
            return responseObject;
        }
    }
    async goto(urlToVisit) {
        try {
            await this.page.goto(urlToVisit, {
                waitUntil: "load",
            });
            return true;
        }
        catch (error) {
            console.log("Error! ", error);
            return false;
        }
    }
    async takePic(filePath) {
        if (!filePath) {
            filePath = path.resolve(__dirname, "../public/images/xBotSnap.jpg")
        }
        try {
            await this.page.screenshot({ path: filePath });
            return true;
        }
        catch (error) {
            console.log("takePic() error->", error);
            return false;
        }
    }
    async findAndType(targetElement, text) {
        try {
            let inputElement = await this.page.waitForSelector(targetElement);

            await inputElement.type(text);

            return true;

        }
        catch (error) {
            console.log("Error! ", error);
            return false;
        }
    }
    async findAndClick(targetElement) {
        try {
            let inputElement = await this.page.waitForSelector(targetElement);

            await inputElement.click();

            return true;

        }
        catch (error) {
            console.log("Error! ", error);
            return false;
        }
    }
    async findAndGetText(targetElement) {
        try {
            let inputElement = await this.page.waitForSelector(targetElement);

            const text = await this.page.$eval(targetElement, el => el.innerText);

            let responseObject = {}
            responseObject.success = true;
            responseObject.text = text;

            return responseObject;

        }
        catch (error) {
            console.log("Error! ", error);
            return false;
        }
    }
    getUrl() {
        return this.page.url();
    }
    async getLastTweetUrl() {
        let hasVisited = await this.goto("https://www.x.com" + "/" + process.env.TWEETER_BOT_USERNAME);
        if (!hasVisited) return false;

        let foundAndClicked = await this.findAndClick(process.env.TWEETER_LAST_POST_IN_PROFILE);
        if (!foundAndClicked) return false;

        return this.getUrl();
    }

    async tweet(userId, text) {

        // if the xBot is busy then the userId and tweetText will be kept in an object in 
        // the queue array
        // if the queue array's length == 1, then the queue monitor will be turned on
        // the queue monitor is a function that checks every 5 seconds whether the xBot is 
        // still busy or not
        // when it finds the xBot to not be busy, then it pops the next item from the queue
        // and tweets it
        // if the queue is empty, then the queue monitor turns itself off
        console.log("userId->", userId);
        console.log("text->", text);

        if (!this.isBusy) {
            console.log("this.isBusy->", this.isBusy);

            this.isBusy = true;
            let hasVisited = await this.goto("https://www.x.com");
            if (!hasVisited) return this.respond(false, "Could not visit x.com");

            // TODO: if the TWEETER_NEW_TWEET_INPUT is not found it's because Twitter
            // suspects i'm a bot and wants my email
            let foundAndClicked = await this.findAndClick(process.env.TWEETER_NEW_TWEET_INPUT);
            if (!foundAndClicked) return this.respond(false, "Could not find TWEETER_NEW_TWEET_INPUT");

            let foundAndTyped = await this.findAndType(process.env.TWEETER_NEW_TWEET_INPUT, text);
            if (!foundAndTyped) return this.respond(false, "Could not find and type WEETER_NEW_TWEET_INPUT");

            foundAndClicked = await this.findAndClick(process.env.TWEETER_POST_BUTTON);
            if (!foundAndClicked) return this.respond(false, "Could not find and click TWEETER_POST_BUTTON");

            await this.wait(10000);

            const tweetUrl = await this.getLastTweetUrl();
            this.tweets[userId] = tweetUrl;
            this.isBusy = false;

            if (tweetUrl) {
                return this.respond(true, "xBot tweeted!", tweetUrl);
            }
            else {
                return this.respond(true, "xBot tweeted but could not get tweet's url");
            }
        }
        else {
            console.log('xBot is busy, queuing task.');
            this.queue.push({ userId, text });
            if (this.queue.length == 1) {
                console.log('starting queue monitor');
                this.startQueueMonitor();
            }
            return this.respond(false, "xBot is busy");
        }
    }

    async twitterSuspects() {
        try {
            const TwitterSuspects = await this.page.waitForXPath(`//*[contains(text(), '${process.env.SUSPICION_TEXT}')]`, { timeout: 10000 })
            if (TwitterSuspects) {
                console.log("Found SUSPICION_TEXT!")
                return true;
            }
            else {
                console.log("Did NOT find SUSPICION_TEXT!")
                return false;
            }
        }
        catch (error) {
            console.log("twitterSuspects() exception! -> Did NOT find SUSPICION_TEXT!")
            return false;
        }
    }
    async twitterWantsVerification() {
        try {
            const TwitterWantsToVerify = await this.page.waitForXPath(`//*[contains(text(), '${process.env.VERIFICATION_TEXT}')]`, { timeout: 10000 })
            if (TwitterWantsToVerify) {
                console.log("Alert: found VERIFICATION_TEXT!!");
                const pageContent = await this.page.content();
                // console.log(pageContent);
                let response = {}
                response.success = true;
                response.pageContent = pageContent;
                return response;
            }
            else {
                console.log("Did NOT find VERIFICATION_TEXT!");
                let response = {}
                response.success = false;
                return response;
            }
        }
        catch (error) {
            console.log("twitterSuspects() exception! -> Did NOT find VERIFICATION_TEXT!")
            return false;
        }
    }
    // TODO: set less time for the timeout for finding elements
    // try catch each and every interaction attempt
    // detect wheter i'm being requested my email

    async logOut() {
        this.isLoggedIn = false;
        return true;
    }
    async loginToX() {

        if (!this.isLoggedIn) {
            let hasVisited = await this.goto("https://www.x.com/login");
            if (!hasVisited) {
                console.log("Can't visit https://www.x.com");
                return this.respond(false, "Could not visit x.com");
            }
            console.log("We're at https://www.x.com");

            let foundAndClicked = await this.findAndClick(process.env.TWEETER_USERNAME_INPUT);
            if (!foundAndClicked) {
                console.log("Can't find TWEETER_USERNAME_INPUT");
                return this.respond(false, "Can't find TWEETER_USERNAME_INPUT");
            }
            console.log("Found and clicked TWEETER_USERNAME_INPUT");

            let foundAndTyped = await this.findAndType(process.env.TWEETER_USERNAME_INPUT, process.env.TWEETER_BOT_USERNAME);
            if (!foundAndTyped) {
                console.log("Can't find and type TWEETER_USERNAME_INPUT");
                return this.respond(false, "Can't find and type TWEETER_USERNAME_INPUT");
            }
            console.log("Found and typed TWEETER_USERNAME_INPUT");

            foundAndClicked = await this.findAndClick(process.env.TWEETER_USERNAME_SUBMIT_BUTTON);
            if (!foundAndClicked) {
                console.log("Can't find and click TWEETER_USERNAME_SUBMIT_BUTTON");
                return this.respond(false, "Can't find and click TWEETER_USERNAME_SUBMIT_BUTTON");
            }
            console.log("Found and clicked TWEETER_USERNAME_SUBMIT_BUTTON");

            foundAndClicked = await this.findAndClick(process.env.TWEETER_PASSWORD_INPUT);
            if (!foundAndClicked) {
                console.log("Can't find and click TWEETER_PASSWORD_INPUT");
                return this.respond(false, "Can't find and click TWEETER_PASSWORD_INPUT");
            }
            console.log("Found and clicked TWEETER_USERNAME_INPUT");

            foundAndTyped = await this.findAndType(process.env.TWEETER_PASSWORD_INPUT, process.env.TWEETER_BOT_PASSWORD);
            if (!foundAndTyped) {
                console.log("Can't find and type TWEETER_PASSWORD_INPUT");
                return this.respond(false, "Can't find and type TWEETER_PASSWORD_INPUT");
            }
            console.log("Found and typed TWEETER_PASSWORD_INPUT");

            await this.page.keyboard.press('Enter');

            console.log("Twitter Bot has logged in, we now will try to detect suspicion.");

            let confirmedSuspicion = await this.twitterSuspects();

            if (confirmedSuspicion) {
                console.log("Twitter suspects, will try to convince them.");
                let emailWasInput = await this.inputEmail();
                if (emailWasInput) {
                    console.log("We succeeded convincing twitter. We're in.");
                    return this.respond(true, "xBot is logged in, we convinced Elon!");
                }
                else {
                    console.log("We did not convince Elon :(");
                    return this.respond(false, "xBot is not logged in :(");
                }
            }
            else {
                console.log("We will now try to see if Twitter wants verification from us.")
                let confirmedVerification = await this.twitterWantsVerification();
                if (confirmedVerification.success) {
                    console.log("Twitter wants verification from us!")
                    // now we must check the code that was sent to us
                    // (or read the email automatically)
                    // and send it to the browser.
                    // The thing is i don't know how to locate that input field yet.
                    return this.respond(false, "Bot did NOT log in / Twitter wants verification code.")
                    // res.download(filePath);
                }
                else {
                    console.log("Apparently Twitter does not suspect, so we're logged in!");
                    this.isLoggedIn = true;
                    return this.respond(true, "xBot is logged in!")
                }
            }
        }
        else {
            console.log("xBot is already logged in!");
            return this.respond(false, "xBot is already logged in!");
        }
    }

    async inputEmail() {
        let foundAndClicked = await this.findAndClick(process.env.TWEETER_EMAIL_INPUT);
        if (!foundAndClicked) {
            console.log("Cant't find TWEETER_EMAIL_INPUT");
            return false;
        }
        console.log("Found TWEETER_EMAIL_INPUT");

        let foundAndTyped = await this.findAndType(process.env.TWEETER_EMAIL_INPUT, process.env.TWEETER_BOT_EMAIL);
        if (!foundAndTyped) {
            console.log("Can't find and type TWEETER_EMAIL_INPUT");
            return false;
        }
        console.log("Found and typed TWEETER_EMAIL_INPUT");

        await this.page.keyboard.press('Enter');

        return true;
    }
    async inputVerificationCode(code) {
        let foundAndClicked = await this.findAndClick(process.env.TWEETER_VERIFICATION_CODE_INPUT);
        if (!foundAndClicked) {
            console.log("Cant't find TWEETER_VERIFICATION_CODE_INPUT");
            return false;
        }
        console.log("Found TWEETER_VERIFICATION_CODE_INPUT");

        let foundAndTyped = await this.findAndType(process.env.TWEETER_VERIFICATION_CODE_INPUT, code);
        if (!foundAndTyped) {
            console.log("Can't find and type TWEETER_VERIFICATION_CODE_INPUT");
            return false;
        }
        console.log("Found and typed TWEETER_VERIFICATION_CODE_INPUT");

        await this.page.keyboard.press('Enter');

        return true;
    }
    respond(success, message, data) {
        let responseObj = {};
        responseObj.success = success;
        responseObj.message = message;
        if (data) {
            responseObj.data = data;
        }
        return responseObj;
    }
    startQueueMonitor() {
        this.queueTimer = setInterval(() => this.processQueue(this), 5000);
    }
    stopQueueMonitor() {
        clearInterval(this.queueTimer);
    }
    async processQueue(xBotClassContext) {
        if (!xBotClassContext.isBusy) {
            console.log("xBotClassContext.isBusy->" + xBotClassContext.isBusy)
            console.log("xBot is not busy, so processQueue will start completing pending tasks");
            while (xBotClassContext.queue.length > 0) {
                const nextItem = xBotClassContext.queue.pop();
                console.log("nextItem->", JSON.stringify(nextItem));
                const tweetResult = await xBotClassContext.tweet(nextItem.userId, nextItem.text);
                //wait some time
            }
            xBotClassContext.stopQueueMonitor();
        }
        else return;
    }
    wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
module.exports = XBot;