const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;
const ardstalker = new TelegramBot(token, {
  polling: true,
});

const myUser = {
  id: process.env.MY_ID,
  username: process.env.MY_USERNAME,
}; // atipoad user id
const yeemunUser = {
  id: process.env.YEEMUN_ID,
  username: process.env.YEEMUN_USERNAME,
}; // atipoad user id

// Repeat the text given
ardstalker.onText(/\/echo (.+)/, (msg, match) => {
  debugMsg({ message: `Echo feature triggered, input = ${match[1]}` });
  const chatId = msg.chat.id;
  const response = match[1];

  ardstalker.sendMessage(chatId, response);
});

ardstalker.on("location", (msg) => {
  notifyMeOfYeeMunLocation(msg);
});

const notifyMeOfYeeMunLocation = (msg) => {
  debugMsg({ message: `UserID: ${msg.chat.id}` });
  debugMsg({ message: `Username: ${msg.chat.username}` });

  debugMsg({ message: `Location received` });
  debugMsg({ message: `Latitude: ${msg.location.latitude}` });
  debugMsg({ message: `Longitude: ${msg.location.longitude}` });

  if (
    msg.chat.id === yeemunUser.id ||
    msg.chat.username === yeemunUser.username
  ) {
    debugMsg({ message: `User is Yee Mun` });
    ardstalker.sendMessage(myUser.id, `Yee Mun has sent a location`);
    ardstalker.sendMessage(
      myUser.id,
      `Location details: \n\nLatitude: ${msg.location.latitude} \n\nLongitude: ${msg.location.longitude}`
    );

    ardstalker.sendLocation(
      myUser.id,
      msg.location.latitude,
      msg.location.longitude,
      { live_period: 60 }
    ).then((msg) => {
        liveLocationUpdatePublisher(msg, true);
        setTimeout(() => {
            clearInterval();
        }, 60000)
    });
  }
};

const liveLocationUpdatePublisher = (msg, isFromYeeMun = false, timer = 5000) => {
  debugMsg({
    message: `Chat ID: ${isFromYeeMun ? myUser.id : msg.chat.id}`,
  });
  debugMsg({
    message: `Message ID: ${msg.message_id}`,
  });
  setInterval(
    () =>
      ardstalker.editMessageLiveLocation(
        msg.location.latitude,
        msg.location.longitude,
        { chat_id: myUser.id, message_id: msg.message_id }
      ),
    timer
  );
};

// Continue working on live location dispenser from live message edit

const liveLocationSubscriber = (msg, timer = 5000) => {
    setInterval(() => {

    }, timer);
}

ardstalker.on("polling_error", (msg) => {
  debugMsg(msg);
});

const debugMsg = ({ message = "Test Message" }) => {
  console.log(message);
};
