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

let myGFLocationMsgID = 0;

// Repeat the text given
ardstalker.onText(/\/echo (.+)/, (msg, match) => {
  debugMsg({ message: `Echo feature triggered, input = ${match[1]}` });
  const chatId = msg.chat.id;
  const response = match[1];

  ardstalker.sendMessage(chatId, response);
});

ardstalker.on("location", (msg) => {
  notifyLatestLocation(msg);
});

ardstalker.on("edited_message", (msg) => {
  // ardstalker.sendMessage(msg.chat.id, "Your message was edited");
  if (typeof msg.location !== "undefined") {
    // ardstalker.sendMessage(msg.chat.id, "This is a location");
    liveLocationUpdatePublisher(myGFLocationMsgID, msg);
    if (typeof msg.location.live_period === "undefined")
      // ardstalker.sendMessage(msg.chat.id, "You have stopped live location");
      liveLocationUpdateHalter(myGFLocationMsgID, msg);
  }
});

ardstalker.on("polling_error", (msg) => {
  debugMsg(msg);
});

ardstalker.on("error", (msg) => {
  debugMsg(msg);
});

const debugMsg = ({ message = "Test Message" }) => {
  if (process.env.ENVIRONMENT_STATUS !== "PRODUCTION") console.log(message);
};

const notifyLatestLocation = (msg) => {
  if (
    typeof msg.location !== "undefined" &&
    typeof msg.location.live_period === "undefined"
  )
    msg.location.live_period = 0;

  if (
    msg.chat.id === yeemunUser.id ||
    msg.chat.username === yeemunUser.username
  ) {
    debugMsg({ message: `Yee Mun has shared her location` });
    debugMsg({
      message: `Live period is set? ${msg.location.live_period !== 0}`,
    });
    locationDetailsMessage(msg, true);
    sendLocationToUser(
      msg,
      true,
      msg.location.live_period !== 0,
      msg.location.live_period
    );
  } else {
    locationDetailsMessage(msg);
  }

  debugMsg({ message: `UserID: ${msg.chat.id}` });
  debugMsg({ message: `Username: ${msg.chat.username}` });
  debugMsg({ message: `Location received` });
  debugMsg({ message: `Latitude: ${msg.location.latitude}` });
  debugMsg({ message: `Longitude: ${msg.location.longitude}` });
};

const locationDetailsMessage = (msg, isMyGF = false) => {
  const otherUsers = `<strong>${msg.chat.username} of user ID ${msg.chat.id} has shared their location</strong>\n\n<i>Location details:</i>\nLatitude: <u>${msg.location.latitude}</u>\nLongitude: <u>${msg.location.longitude}</u>`;
  const myGF = `<strong>Yee Mun has shared her location</strong>\n\n<i>Location details:</i>\nLatitude: <u>${msg.location.latitude}</u>\nLongitude: <u>${msg.location.longitude}</u>\nLive Period: <u>${msg.location.live_period} seconds</u>`;

  if (isMyGF)
    ardstalker.sendMessage(myUser.id, myGF, {
      parse_mode: "HTML",
    });
};

const sendLocationToUser = (
  msg,
  isMyGF = false,
  isLive = false,
  livePeriod = 60
) =>
  ardstalker
    .sendLocation(
      isMyGF ? myUser.id : msg.chat.id,
      msg.location.latitude,
      msg.location.longitude,
      {
        live_period: isLive ? livePeriod : 0,
      }
    )
    .then((msg) => {
      if (isMyGF) myGFLocationMsgID = msg.message_id;
    });

const liveLocationUpdatePublisher = (receiverSideMsgID, msg) => {
  debugMsg({
    message: `Chat ID: ${msg.chat.id}`,
  });
  debugMsg({
    message: `Sender Message ID: ${msg.message_id}`,
  });
  debugMsg({
    message: `Receiver Side Message ID: ${receiverSideMsgID}`,
  });

  ardstalker.editMessageLiveLocation(
    msg.location.latitude,
    msg.location.longitude,
    { chat_id: myUser.id, message_id: receiverSideMsgID }
  );
};

const liveLocationUpdateHalter = (receiverSideMsgID, msg) => {
  debugMsg({
    message: `Chat ID: ${msg.chat.id}`,
  });
  debugMsg({
    message: `Sender Message ID: ${msg.message_id}`,
  });
  debugMsg({
    message: `Receiver Side Message ID: ${receiverSideMsgID}`,
  });

  ardstalker.stopMessageLiveLocation({
    chat_id: myUser.id,
    message_id: receiverSideMsgID,
  });
};
