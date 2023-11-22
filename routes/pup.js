var express = require('express');
var router = express.Router();
const XBot = require("../classes/XBot");
let myXBot;

let responseObject = {};

router.get('/init', function (req, res, next) {
  if (!myXBot) {
    myXBot = new XBot();
    responseObject.success = true;
    responseObject.message = "OK!"
  }
  else {
    responseObject.success = false;
    responseObject.message = "Already initiated."
  }
  res.status(200).json(responseObject);


});

module.exports = router;
