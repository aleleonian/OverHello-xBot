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
        return this.init();
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
            return responseObject;
        }
    }
}
module.exports = XBot;