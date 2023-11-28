var express = require('express');
var router = express.Router();
const XBot = require("../classes/XBot");
const fs = require("fs");
const path = require("path");

let statusCode = 200;

router.get('/ping', function (req, res) {
    let responseObject = {};
    responseObject.success = true
    res.status(200).json(responseObject);
});

router.get('/init', async function (req, res) {
    let responseObject = {};

    if (!req.app.locals.myXBot) {
        req.app.locals.myXBot = new XBot();
        await req.app.locals.myXBot.init();

        responseObject.success = true;
        responseObject.message = "OK!"
    }
    else {
        responseObject.success = false;
        responseObject.message = "Already initiated."
    }
    res.status(200).json(responseObject);
});

//TODO this is not working
router.get('/close', function (req, res) {
    let responseObject = {};
    console.log("req.app.locals.myXBot->", req.app.locals.myXBot);
    if (!req.app.locals.myXBot) {
        responseObject.success = false;
        responseObject.message = "Not initiated."
        res.status(301).json(responseObject);
    }
    else {
        try {
            req.app.locals.myXBot.browser.close();
            req.app.locals.myXBot = null;
            responseObject.success = true;
            responseObject.message = "Bot closed."
            res.status(200).json(responseObject);
        }
        catch (error) {
            console.log("Error!->", error);
            responseObject.success = false;
            responseObject.message = "Could not close bot."
            res.status(301).json(responseObject);
        }
    }
});
router.get('/getboturl', async function (req, res) {
    let responseObject = {};

    if (!req.app.locals.myXBot) {
        responseObject.success = false;
        responseObject.message = "Not initiated."
        res.status(301).json(responseObject);
    }
    else {
        try {
            const url = req.app.locals.myXBot.getCurrentBotUrl();
            responseObject.success = true;
            responseObject.url = url;
            res.status(200).json(responseObject);
        }
        catch (error) {
            console.log("Error!->", error);
            responseObject.success = false;
            responseObject.message = "Could not close bot."
            res.status(301).json(responseObject);
        }
    }
});
router.get('/gettweet', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.userId) {
            const userId = req.query.userId;
            const tweetUrl = await req.app.locals.myXBot.getTweet(userId);
            if (tweetUrl) {
                responseObject.url = tweetUrl;
                statusCode = 200;
            }
            else {
                responseObject.message = "Did not find tweet url for userId " + userId; 
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No USERID?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

router.get('/goto', async function (req, res) {

    console.log("req.app.locals.myXBot->", req.app.locals.myXBot);

    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.url) {
            const urlToVisit = req.query.url;
            const isVisiting = await req.app.locals.myXBot.goto(urlToVisit);
            responseObject.success = isVisiting;
            if (isVisiting) {
                responseObject.message = "Bot visiting " + urlToVisit;
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot NOT visiting";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No URL?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/setbusy', async function (req, res) {

    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.state) {
            const busy = JSON.parse(req.query.state);
            const setBusy = await req.app.locals.myXBot.setBusy(busy);
            if (setBusy) {
                responseObject.message = "Bot isBusy = " + busy;
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot did NOT set isBusy";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No STATE?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/isloggedin', async function (req, res) {

    let responseObject = {};

    if (req.app.locals.myXBot) {
        const isLoggedIn = req.app.locals.myXBot.isLoggedIn;
        if (isLoggedIn) {
            responseObject.message = "Bot is logged in!";
            responseObject.success = true;
            statusCode = 200;
        }
        else {
            responseObject.message = "Bot NOT logged in";
            responseObject.success = false;
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }
    return res.status(statusCode).json(responseObject);

});

router.get('/tweet', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.text && req.query.userId) {
            const text = req.query.text;
            const userId = req.query.userId;
            const hasTweeted = await req.app.locals.myXBot.tweet(userId, text);
            if (hasTweeted.success) {
                responseObject.message = "Bot tweeted!";
                responseObject.url = hasTweeted.data;
                responseObject.success = true;
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot did NOT tweet: " + hasTweeted.message;
                responseObject.success = false;
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No TEXT?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/verify', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        if (req.query && req.query.code) {
            const code = req.query.code;
            const hasInputedCode = await req.app.locals.myXBot.inputVerificationCode(code);
            responseObject.success = hasInputedCode;
            if (hasInputedCode) {
                responseObject.message = "Bot inputed verification code!";
                statusCode = 200;
            }
            else {
                responseObject.message = "Bot did input verification code";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "No CODE?"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/lastposturl', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const lastTweetUrl = await req.app.locals.myXBot.getLastTweetUrl();
        if (lastTweetUrl) {
            responseObject.message = "Got last tweet's url";
            statusCode = 200;
            responseObject.url = lastTweetUrl;
        }
        else {
            responseObject.message = "Did not get last tweet's url";
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }
    return res.status(statusCode).json(responseObject);

});
router.get('/takepic', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const tookPic = await req.app.locals.myXBot.takePic();
        if (tookPic) {
            return res.redirect("/images/xBotSnap.jpg");
        }
        else {
            responseObject.message = "Did not get the pic";
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }
    return res.status(statusCode).json(responseObject);

});

router.get('/login', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {

        const hasLoggedIn = await req.app.locals.myXBot.loginToX();

        if (hasLoggedIn.success) {
            responseObject.message = hasLoggedIn.message;
            responseObject.success = true;
            statusCode = 200;
        }
        else {
            responseObject.message = hasLoggedIn.message;
            responseObject.success = false;
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.get('/logout', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {

        const hasLoggedOut = await req.app.locals.myXBot.logOut();

        if (hasLoggedOut.succes) {
            responseObject.message = hasLoggedOut.message;
            responseObject.success = true;
            statusCode = 200;
        }
        else {
            responseObject.message = hasLoggedOut.message;
            responseObject.success = false;
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

router.post('/findtype', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target && data.text) {
            const isSuccess = await req.app.locals.myXBot.findAndType(data.target, data.text);
            responseObject.success = isSuccess;
            if (isSuccess) {
                responseObject.message = "Found and typed";
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or typed";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target and text!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.post('/findclick', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target) {
            const isSuccess = await req.app.locals.myXBot.findAndClick(data.target);
            responseObject.success = isSuccess;
            if (isSuccess) {
                responseObject.message = "Found and clicked!";
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or clicked!";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});
router.post('/gettext', async function (req, res) {
    let responseObject = {};

    if (req.app.locals.myXBot) {
        const data = req.body;

        if (data && data.target) {
            const isSuccess = await req.app.locals.myXBot.findAndGetText(data.target);
            responseObject.success = isSuccess.success;
            if (isSuccess) {
                responseObject.message = "Found and got text!";
                responseObject.text = isSuccess.text;
                statusCode = 200;
            }
            else {
                responseObject.message = "Not found and/or got text!";
                statusCode = 301;
            }
        }
        else {
            responseObject.success = false;
            responseObject.message = "Needed target!"
            statusCode = 301;
        }
    }
    else {
        responseObject.success = false;
        responseObject.message = "Bot not initiated."
        statusCode = 301;
    }

    return res.status(statusCode).json(responseObject);

});

module.exports = router;
