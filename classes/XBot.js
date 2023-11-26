const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
// const dataDirPlugin = require("puppeteer-extra-plugin-user-data-dir");
puppeteer.use(pluginStealth());
const path = require("path");
const {executablePath} = require('puppeteer')
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
    executablePath: executablePath()
};

if (process.env.EXECUTABLE_PATH) {
    pupConfig.executablePath = process.env.EXECUTABLE_PATH;
}

class XBot {

    constructor() {
        this.browser;
        this.page
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
        catch (error){
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

    async tweet(text) {
        let hasVisited = await this.goto("https://www.x.com");
        if (!hasVisited) return false;

        // TODO: if the TWEETER_NEW_TWEET_INPUT is not found it's because Twitter
        // suspects i'm a bot and wants my email
        let foundAndClicked = await this.findAndClick(process.env.TWEETER_NEW_TWEET_INPUT);
        if (!foundAndClicked) return false;

        let foundAndTyped = await this.findAndType(process.env.TWEETER_NEW_TWEET_INPUT, text);
        if (!foundAndTyped) return false;

        foundAndClicked = await this.findAndClick(process.env.TWEETER_POST_BUTTON);
        return foundAndClicked;
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
                console.log("Did NOT find SUSPICION_TEXT!");
                let response = {}
                response.success = false;
                return response;
            }
        }
        catch (error) {
            console.log("twitterSuspects() exception! -> Did NOT find SUSPICION_TEXT!")
            return false;
        }
    }
    // TODO: i gotta learn how to circumvent the email request when Twitter suspects i'm a bot.
    // check Log in to X _ X.html in noupload/
    // TODO: set less time for the timeout for finding elements
    // try catch each and every interaction attempt
    // detect wheter i'm being requested my email

    async loginToX() {
        let hasVisited = await this.goto("https://www.x.com/login");
        if (!hasVisited) {
            console.log("Can't visit https://www.x.com");
            return false;
        }
        console.log("We're at https://www.x.com");

        let foundAndClicked = await this.findAndClick(process.env.TWEETER_USERNAME_INPUT);
        if (!foundAndClicked) {
            console.log("Can't find TWEETER_USERNAME_INPUT");
            return false;
        }
        console.log("Found and clicked TWEETER_USERNAME_INPUT");

        let foundAndTyped = await this.findAndType(process.env.TWEETER_USERNAME_INPUT, process.env.TWEETER_BOT_USERNAME);
        if (!foundAndTyped) {
            console.log("Can't find and type TWEETER_USERNAME_INPUT");
            return false;
        }
        console.log("Found and typed TWEETER_USERNAME_INPUT");

        foundAndClicked = await this.findAndClick(process.env.TWEETER_USERNAME_SUBMIT_BUTTON);
        if (!foundAndClicked) {
            console.log("Can't find and click TWEETER_USERNAME_SUBMIT_BUTTON");
            return false;
        }
        console.log("Found and clicked TWEETER_USERNAME_SUBMIT_BUTTON");

        foundAndClicked = await this.findAndClick(process.env.TWEETER_PASSWORD_INPUT);
        if (!foundAndClicked) {
            console.log("Can't find and click TWEETER_PASSWORD_INPUT");
            return false;
        }
        console.log("Found and clicked TWEETER_USERNAME_INPUT");

        foundAndTyped = await this.findAndType(process.env.TWEETER_PASSWORD_INPUT, process.env.TWEETER_BOT_PASSWORD);
        if (!foundAndTyped) {
            console.log("Can't find and type TWEETER_PASSWORD_INPUT");
            return false;
        }
        console.log("Found and typed TWEETER_PASSWORD_INPUT");

        await this.page.keyboard.press('Enter');

        return true;
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
}
module.exports = XBot;