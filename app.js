;
const puppeteer = require("puppeteer");
const KnownDevices = puppeteer.KnownDevices;
const iPhone = KnownDevices["iPhone X"];


const BROWSER_OPEN_FAIL = 0;
const exitCodeStrings = [
    "Could not open browser :(!"
]

async function main() {

    // const pageToVisit = "https://www.latigo.com.ar/test";
    const pageToVisit = "https://www.twitter.com/login";

    let pupConfig = {
        headless: false,
        defaultViewport: null
    };

    const browser = await puppeteer.launch(pupConfig);

    if (!browser) {
        abortExecution(
            BROWSER_OPEN_FAIL,
            exitCodeStrings[BROWSER_OPEN_FAIL]
        );
    }

    const page = await browser.newPage();

    await page.emulate(iPhone);

    await page.goto(pageToVisit, {
        waitUntil: "load",
    });

    // await driver.get('https://www.twitter.com/login');



    //*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[5]/label/div/div[2]/div/input

    // await page.screenshot({path: `twitter-load.png` });

    // await userInput.type("Oh you wished me well, you couldn't tell...");

    // await wait(10000);

    const userInput = await page.waitForSelector('[name="text"]');
    // .then(() => console.log('First URL with image: ' + currentURL));

    // const userInput = await page.$('[name="text"]');

    await userInput.type("Oh you wished me well, you couldn't tell...");

    // this xpath is valid for puppeteer's chrome but in other browsers, it's a different one.
    const nextButton = await page.waitForXPath('//span[contains(., "Next")]');

    await wait(5000);

    nextButton.click();

    await wait(5000);

    browser.close();

}


main();



function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function abortExecution(exitCode, exitMessage) {
    errorLog("ABORTING! " + exitMessage);
    process.exit(exitCode);
}

function errorLog(message) {
    let Reset = "\x1b[0m";
    let FgRed = "\x1b[31m";

    console.log(`${FgRed}%s${Reset}`, message);
}