const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
// const dataDirPlugin = require("puppeteer-extra-plugin-user-data-dir");
puppeteer.use(pluginStealth());
// puppeteer.use(dataDirPlugin('/Users/aleleonian/Library/Application Support/Google/Chrome/Default'));

// const puppeteerClassic = require("puppeteer");
// const iPhone = KnownDevices["iPhone X"];
// const KnownDevices = puppeteerClassic.KnownDevices;

const BROWSER_OPEN_FAIL = 0;
const exitCodeStrings = [
    "Could not open browser :(!"
]

let pupConfig = {
    headless: true,
    defaultViewport: null,
    executablePath: process.env.EXECUTABLE_PATH,
    ignoreDefaultArgs: ["--enable-automation"]
};

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
    async tweet(text) {
        console.log("process.env.TWEETER_INPUT_FIELD->", process.env.TWEETER_INPUT_FIELD);
        let hasVisited = await this.goto("https://www.x.com");
        if (!hasVisited) return false;
        let foundAndClicked = await this.findAndClick(process.env.TWEETER_INPUT_FIELD);
        if (!foundAndClicked) return false;
        let foundAndTyped = await this.findAndType(process.env.TWEETER_INPUT_FIELD, text);
        if (!foundAndTyped) return false;
        foundAndClicked = await this.findAndClick(process.env.TWEETER_POST_BUTTON);
        return foundAndClicked;

    }
    async loginToX() {
        let hasVisited = await this.goto("https://www.x.com/login");
        if (!hasVisited) return false;
        let foundAndClicked = await this.findAndClick('[name=\"text\"]');
        if (!foundAndClicked) return false;

        let foundAndTyped = await this.findAndType("[name=\"text\"]", "OverHelloBot");
        if (!foundAndTyped) return false;
        foundAndClicked = await this.findAndClick('#layers > div > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-14lw9ot.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-13qz1uu.r-1ye8kvj > div > div > div > div:nth-child(6) > div > span');
        if (!foundAndClicked) return false;
       
        foundAndClicked = await this.findAndClick('[name="password"]');
        if (!foundAndClicked) return false;
        
        foundAndTyped = await this.findAndType("[name=\"password\"]", "Latigazo2023!");
        if (!foundAndTyped) return false;

        await this.page.keyboard.press('Enter');
        return true;
        // #react-root > div > div > div > main > div > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox > div.css-175oi2r.r-16y2uox.r-1jgb5lz.r-13qz1uu.r-1ye8kvj > div > div:nth-child(6) > div > span > span
    }
}
module.exports = XBot;