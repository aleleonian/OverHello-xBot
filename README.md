# OverHello-xBOT

This is a Twitter/X bot used for the OverHello silly app.

(https://overhello-frontend-0d0f00dd7856.herokuapp.com/)

### What is it about

This is a Twitter Bot that does not use the Twitter API.
It's a remote Chrome controlled by puppeteer that interacts with Twitter.

## Code
This app was built in Node.js / Express and Docker. The reason why everything runs inside a Docker container is because part of the 'nature' of the OverHello app is to make things complicated in an unnecessary way.

* https://github.com/aleleonian/OverHello-frontend
* https://github.com/aleleonian/OverHello-backend
* https://github.com/aleleonian/OverHello-xBot

## Environment Variables

You must set the following env vars, otherwise the app won't run properly.

### `TWITTER_NEW_TWEET_INPUT`
The selector for the "new tweet' field:
"#react-root > div > div > div.css-175oi2r.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.css-175oi2r.r-14lw9ot.r-184en5c > div > div.css-175oi2r.r-14lw9ot.r-1h8ys4a > div:nth-child(1) > div > div > div > div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > label > div.css-175oi2r.r-1wbh5a2.r-16y2uox > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div"

(put it between quotes in the .env file)

### `TWITTER_POST_BUTTON`
The selector for the "post" button. The button that posts the newly written tweet:
"#react-root > div > div > div.css-175oi2r.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-14lw9ot.r-jxzhtn.r-13l2t4g.r-1ljd8xs.r-1phboty.r-16y2uox.r-184en5c.r-61z16t.r-11wrixw.r-1jgb5lz.r-13qz1uu.r-1ye8kvj > div > div.css-175oi2r.r-14lw9ot.r-184en5c > div > div.css-175oi2r.r-14lw9ot.r-1h8ys4a > div:nth-child(1) > div > div > div > div.css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t > div.css-175oi2r.r-14lw9ot.r-jumn1c.r-xd6kpl.r-gtdqiz.r-ipm5af.r-184en5c > div:nth-child(2) > div > div > div > div.css-175oi2r.r-sdzlij.r-1phboty.r-rs99b7.r-lrvibr.r-19u6a5r.r-2yi16.r-1qi8awa.r-ymttw5.r-1loqt21.r-o7ynqc.r-6416eg.r-1ny4l3l"


### `TWITTER_LAST_POST_IN_PROFILE`
The selector for the last post in the twitter profile page for a given user:
"#react-root > div > div > div.css-175oi2r.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div:nth-child(3) > div > div > section > div > div > div:nth-child(1) > div > div > article > div > div > div.css-175oi2r.r-18u37iz"

### `TWITTER_PROFILE_URL`
The url for the profile of a given user.

### `TWITTER_USERNAME_INPUT`
The selector for the username field while logging in:
[name="text"]

### `TWITTER_EMAIL_INPUT`
The selector for the email field while logging in:
[name="text"]

### `TWITTER_PASSWORD_INPUT`
The selector for the password field while logging in:
[name="password"]

### `TWITTER_VERIFICATION_CODE_INPUT`
The selector for the verification code field while logging in. If Twitter suspects something, they will send you an email with a verification code.

### `TWITTER_USERNAME_SUBMIT_BUTTON`
The selector for a submit button:
"#layers > div > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-14lw9ot.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-13qz1uu.r-1ye8kvj > div > div > div > div:nth-child(6) > div > span"


### `TWITTER_BOT_USERNAME`
Self explanatory

### `TWITTER_BOT_PASSWORD`
Self explanatory

### `TWITTER_BOT_EMAIL`
Self explanatory

### `XBOT_HEADLESS`
Set it to true for production.

### `SUSPICION_TEXT`
The text that will show up if Twitter suspects you're a bot:
Help us keep your account safe

### `VERIFICATION_TEXT`
The text that will show up after Twitter suspects you're a bot:
Check your email

