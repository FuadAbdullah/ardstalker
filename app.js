const TelegramBot = require("node-telegram-bot-api");

const token = "5846017464:AAEueYZzggOflHOm6nyBZVf3H5RAJgMZfw4";
const ardstalker = new TelegramBot(token, {
  polling: true,
});

const myUser = {
  id: 493412172,
  username: "atipoad",
}; // atipoad user id
const yeemunUser = {
  id: 1350135933,
  username: "yeemun_ooi",
}; // atipoad user id

// Repeat the text given
ardstalker.onText(/\/echo (.+)/, (msg, match) => {
  debugMsg({ message: `Echo feature triggered, input = ${match[1]}` });
  const chatId = msg.chat.id;
  const response = match[1];

  ardstalker.sendMessage(chatId, response);
});

ardstalker.on("location", (msg) => {
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
    ardstalker.sendLocation(myUser.id, msg.location.latitude, msg.location.longitude);
  }
});

const debugMsg = ({ message = "Test Message" }) => {
  console.log(message);
};
