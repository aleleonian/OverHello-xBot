const puppeteer = require('puppeteer-extra')
// Add stealth plugin and use defaults 
const pluginStealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(pluginStealth());

const puppeteerClassic = require("puppeteer");
const KnownDevices = puppeteerClassic.KnownDevices;
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
        defaultViewport: null,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ignoreDefaultArgs: ["--enable-automation"]
    };

    const browser = await puppeteer.launch(pupConfig);

    if (!browser) {
        abortExecution(
            BROWSER_OPEN_FAIL,
            exitCodeStrings[BROWSER_OPEN_FAIL]
        );
    }

    const page = await browser.newPage();

    // await page.emulate(iPhone);

    await page.goto(pageToVisit, {
        waitUntil: "load",
    });

    // await driver.get('https://www.twitter.com/login');



    //*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[5]/label/div/div[2]/div/input

    // await page.screenshot({path: `twitter-load.png` });

    // await userInput.type("Oh you wished me well, you couldn't tell...");

    // await wait(10000);

    let userInput = await page.waitForSelector('[name="text"]');
    // .then(() => console.log('First URL with image: ' + currentURL));

    // const userInput = await page.$('[name="text"]');

    await userInput.type("lector@latigo.com.ar");

    // this xpath is valid for puppeteer's chrome but in other browsers, it's a different one.
    const nextButton = await page.waitForXPath('//span[contains(., "Next")]');

    // await wait(5000);

    nextButton.click();

    // await wait(5000);

    let passwordInput;
    try {
        passwordInput = await page.waitForSelector('[name="password"]');

        await passwordInput.type("Latigazo2023!");
    }
    catch (error) {
        console.log("passwordInput not found!");
        passwordInput = null;
    }

    if (!passwordInput) {
        // if we arrive here, Twitter suspects something and wants us to 
        // type our username again
        // Enter your phone number or username
        // There was unusual login activity on your account. 
        // To help keep your account safe, please enter your phone number or username to verify it’s you.

        // /html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div[1]/div/div/div[2]/label/div/div[2]/div/input
        // #react-root > div > div > div > main > div > div > div > div.css-1dbjc4n.r-6koalj.r-16y2uox > div.css-1dbjc4n.r-16y2uox.r-1jgb5lz.r-13qz1uu > div.css-1dbjc4n.r-1fq43b1.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div > div.css-1dbjc4n.r-mk0yit.r-kmv1fd > label > div > div.css-1dbjc4n.r-18u37iz.r-16y2uox.r-1wbh5a2.r-19h5ruw.r-1udh08x.r-xd6kpl.r-1pn2ns4.r-1b3ntt7 > div > input
        // document.querySelector("#react-root > div > div > div > main > div > div > div > div.css-1dbjc4n.r-6koalj.r-16y2uox > div.css-1dbjc4n.r-16y2uox.r-1jgb5lz.r-13qz1uu > div.css-1dbjc4n.r-1fq43b1.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div > div.css-1dbjc4n.r-mk0yit.r-kmv1fd > label > div > div.css-1dbjc4n.r-18u37iz.r-16y2uox.r-1wbh5a2.r-19h5ruw.r-1udh08x.r-xd6kpl.r-1pn2ns4.r-1b3ntt7 > div > input")
        {/* <input autocapitalize="none" autocomplete="on" autocorrect="off" inputmode="text" name="text" spellcheck="false" type="text" dir="auto" class="r-30o5oe r-1dz5y72 r-13qz1uu r-1niwhzg r-17gur6a r-1yadl64 r-deolkf r-homxoj r-poiln3 r-7cikom r-1ny4l3l r-t60dpp r-fdjqy7" data-testid="ocfEnterTextTextInput" value=""> */ }
        console.log("we gonna try find the userName selector");

        try {
            userInput = await page.waitForSelector('[name="text"]');

            await userInput.type("LatigoLector");

            await wait(5000);

            await page.keyboard.press('Enter');

            console.log("I pressed enter!");

        }
        catch (error) {
            console.log("We did not find the userName selector!");
        }
    }

    try {
        console.log("we gonna try find the passwordInput");

        passwordInput = await page.waitForSelector('[name="password"]');

        await passwordInput.type("Peroponetedeperfil2023!");

        await wait(5000);

        await page.keyboard.press('Enter');

        console.log("I pressed enter! 2");

    }
    catch (error) {
        console.log("passwordInput2 not found!");
    }

    // <div data-offset-key="1rv1p-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key="1rv1p-0-0"><br data-text="true"></span></div>
    // <br data-text="true"> <- this is what holds the tweet once you write something
    // <br data-text="true"> <- this is the future tweet placeholder
        ///html/body/div[1]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/div/div[2]/div[1]/div/div/div/div[2]/div[1]/div/div/div/div/div/div/div/div/div/div/label/div[1]/div/div/div/div/div/div[2]/div/div/div/div/span/br

    // await wait(500000);
    // TODO: make this app a web server that runs commands in the target browser and returns results
    

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