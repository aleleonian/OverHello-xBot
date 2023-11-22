const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(pluginStealth());

// const puppeteerClassic = require("puppeteer");
// const iPhone = KnownDevices["iPhone X"];
// const KnownDevices = puppeteerClassic.KnownDevices;

const BROWSER_OPEN_FAIL = 0;
const exitCodeStrings = [
    "Could not open browser :(!"
]

let pupConfig = {
    headless: false,
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
}
module.exports = XBot;