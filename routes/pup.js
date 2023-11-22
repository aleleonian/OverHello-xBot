var express = require('express');
var router = express.Router();
const XBot = require("../classes/XBot");
let myXBot;

let responseObject = {};
let statusCode = 200;

router.get('/init', async function (req, res, next) {
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

router.get('/close', function (req, res, next) {

  if (!req.app.locals.myXBot) {
    responseObject.success = false;
    responseObject.message = "Not initiated."
    res.status(301).json(responseObject);
  }
  else {
    try {
      console.log(myXBot);
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

router.get('/goto', async function (req, res, next) {

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

// {
//   "target": "[jsname=\"yZiJbe\"]",
//   "text": "que pasa, que pasa"
// }

router.post('/findtype', async function (req, res, next) {

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
router.post('/findclick', async function (req, res, next) {

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
router.post('/gettext', async function (req, res, next) {

  if (req.app.locals.myXBot) {
    const data = req.body;

    if (data && data.target) {
      const isSuccess = await req.app.locals.myXBot.findAndGetText(data.target);
      responseObject.success = isSuccess;
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



//   if (!req.app.locals.myXBot) {
//   req.app.locals.myXBot = new XBot();
//   await req.app.locals.myXBot.init();

//   responseObject.success = true;
//   responseObject.message = "OK!"
//   console.log(req.app.locals.myXBot);
// }
// else {
//   responseObject.success = false;
//   responseObject.message = "Already initiated."
// }
// res.status(200).json(responseObject);



module.exports = router;
