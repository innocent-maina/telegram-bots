require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TOKEN;
const express = require("express");
const axios = require("axios");

const { TOKEN, SERVER_URL, PORT } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express();
app.use(express.json());

//launch the bot
const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

//functi

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true,
});

// In-memory storage
const URLs = [];
const URLLabels = [];
let tempSiteURL = "";

// Listener (handler) for telegram's /bookmark event
bot.onText(/\/bookmark/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match.input.split(" ")[1];

  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content of the message

  if (url === undefined) {
    bot.sendMessage(chatId, "Please provide URL of article!");
    return;
  }

  URLs.push(url);
  bot.sendMessage(chatId, "URL has been successfully saved!");
});

// Listener (handler) for telegram's /label event
bot.onText(/\/label/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match.input.split(" ")[1];

  if (url === undefined) {
    bot.sendMessage(chatId, "Please provide URL of article!");
    return;
  }

  tempSiteURL = url;
  bot.sendMessage(chatId, "URL has been successfully saved!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Development",
            callback_data: "development",
          },
          {
            text: "Lifestyle",
            callback_data: "lifestyle",
          },
          {
            text: "Other",
            callback_data: "other",
          },
        ],
      ],
    },
  });
});

// Listener (handler) for callback data from /label command
bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const category = callbackQuery.data;

  URLLabels.push({
    url: tempSiteURL,
    label: category,
  });

  tempSiteURL = "";

  bot.sendMessage(
    message.chat.id,
    `URL has been labeled with category "${category}"`
  );
});

// Listener (handler) for showcasing different keyboard layout
bot.onText(/\/keyboard/, (msg) => {
  bot.sendMessage(msg.chat.id, "Alternative keybaord layout", {
    reply_markup: {
      keyboard: [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]],
      resize_keyboard: true,
      one_time_keyboard: true,
      force_reply: true,
    },
  });
});

// Inline keyboard options
const inlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "YES",
          callback_data: JSON.stringify({
            command: "mycommand1",
            answer: "YES",
          }),
        },
        {
          text: "NO",
          callback_data: JSON.stringify({
            command: "mycommand1",
            answer: "NO",
          }),
        },
      ],
    ],
  },
};

// Listener (handler) for showcasing inline keyboard layout
bot.onText(/\/inline/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "You have to agree with me, OK?",
    inlineKeyboard
  );
});

// Keyboard layout for requesting phone number access
const requestPhoneKeyboard = {
  reply_markup: {
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: "My phone number",
          request_contact: true,
          one_time_keyboard: true,
        },
      ],
      ["Cancel"],
    ],
  },
};

// Listener (handler) for retrieving phone number
bot.onText(/\/phone/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Can we get access to your phone number?",
    requestPhoneKeyboard
  );
});

// Handler for phone number request when user gives permission
bot.on("contact", async (msg) => {
  const phone = msg.contact.phone_number;
  bot.sendMessage(msg.chat.id, `Phone number saved: ${phone}`);
});

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `
            Welcome at <b>Wahome's ArticleBot</b>, thank you for using my service
      
            Available commands:
        
            /bookmark <b>URL</b> - save interesting article URL
        `,
    {
      parse_mode: "HTML",
    }
  );
});

app.listen(4000, async () => {
  console.log(`App is running on port:4000`);
  await init();
});
