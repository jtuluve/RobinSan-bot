//local process env
require("dotenv").config();

//imports
const { Telegraf, session, Scenes } = require("telegraf");
const express = require("express");
const { capitalCase } = require("case-anything");
const { api } = require("../api.js");
const { superWizard } = require("../scenes.js");
const URL = process.env.URL;
// const {hideIt, retrieveMessage} = require("./hidden.js")
// console.log(retrieveMessage(hideIt("yo", "mama")))

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.replyWithPhoto(
    { source: "./assets/robin-facing.jpg" },
    {
      caption:
        "Konnichiwa😇😇\n\nI'm <b>Robin</b>. I can generate anime related informations, latest episodes, popular animes and much more. I'm still learning (beta) and I may make mistakes. I look forward to help you.✨✨",
      parse_mode: "html",
    }
  );
});

//top airing command
bot.command("topairing", (ctx) => {
  api(`${URL}/top-airing`, (d) => {
    let message = "✨Top Airing Anime✨\n\n";
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (e of d) {
      message += `${i}) Title:  <b>${capitalCase(
        e.animeId.split("-").join(" ")
      )}</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${i}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${i}` }];
      }
      i++;
    }
    rowb.push({ text: ">", callback_data: "topairpage 2" });
    buttons.push(rowb);
    message += "🔻select any anime for more details🔻";
    ctx.replyWithPhoto(
      { url: d[0].animeImg },
      {
        caption: message.trim(),
        parse_mode: "html",
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
    );
  });
});

//topairingaction
bot.action(/topairpage ([0-9]+)/, (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  api(`${URL}/top-airing?page=${pgnum}`, (d) => {
    let message = `✨Top Airing Anime✨(page ${pgnum})\n\n`;
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (e of d) {
      message += `${i}) Title:  <b>${capitalCase(
        e.animeId.split("-").join(" ")
      )}</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${i}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${i}` }];
      }
      i++;
    }
    if (pgnum - 1 > 0)
      rowb.push({ text: "<", callback_data: `topairpage ${pgnum - 1}` });
    if (pgnum + 1 < 26)
      rowb.push({ text: ">", callback_data: `topairpage ${pgnum + 1}` });
    buttons.push(rowb);
    message += "\n🔻select any anime for more details🔻";
    /* ctx.replyWithPhoto({url: d[0].animeImg}, {
        caption: message.trim(), 
        parse_mode:"html",
        reply_markup : {
            "inline_keyboard": buttons
        }
    }) */
    let m = ctx
      .editMessageMedia(
        {
          media: d[0].animeImg,
          type: "photo",
          chat_id: ctx.callbackQuery.message.chat.id,
          message_id: ctx.callbackQuery.message.message_id,
          caption: message.trim(),
          parse_mode: "html",
        },
        {
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
      )
      .then(() => {
        return;
      });
  });
});

//popular command
bot.command("popular", (ctx) => {
  api(`${URL}/popular`, (d) => {
    let message = "✨Popular Anime✨\n\n";
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (e of d) {
      message += `${i}) Title:  <b>${capitalCase(
        e.animeId.split("-").join(" ")
      )}</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${i}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${i}` }];
      }
      i++;
    }
    if (rowb.length > 1) {
      buttons.push(rowb);
      rowb = [];
    }
    rowb.push({ text: ">", callback_data: "popularpage 2" });
    buttons.push(rowb);
    message += "\n🔻select any anime for more details🔻";
    ctx.replyWithPhoto(
      { url: d[0].animeImg },
      {
        caption: message.trim(),
        parse_mode: "html",
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
    );
  });
});

bot.action(/popularpage ([0-9]+)/, (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  api(`${URL}/popular?page=${pgnum}`, (d) => {
    if (d.length < 1) {
      ctx.reply("No more found!!");
    }
    let message = `✨Popular Anime✨(page ${pgnum})\n\n`;
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (e of d) {
      message += `${i}) Title:  <b>${capitalCase(
        e.animeId.split("-").join(" ")
      )}</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${i}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${i}` }];
      }
      i++;
    }
    if (pgnum - 1 > 0)
      rowb.push({ text: "<", callback_data: `popularpage ${pgnum - 1}` });
    if (pgnum + 1 < 26)
      rowb.push({ text: ">", callback_data: `popularpage ${pgnum + 1}` });
    buttons.push(rowb);
    message += "\n🔻select any anime for more details🔻";
    ctx
      .editMessageMedia(
        {
          media: d[0].animeImg,
          type: "photo",
          chat_id: ctx.callbackQuery.message.chat.id,
          message_id: ctx.callbackQuery.message.message_id,
          caption: message.trim(),
          parse_mode: "html",
        },
        {
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
      )
      .then(() => {
        return;
      })
      .catch((err) => console.log(err));
  });
});
// {
//     animeId: 'mashle',
//     episodeId: 'mashle-episode-7',
//     animeTitle: 'Mashle',
//     episodeNum: '7',
//     subOrDub: 'SUB',
//     animeImg: 'https://gogocdn.net/cover/mashle-1680202211.png',
//     episodeUrl: 'https://gogoanime.film///mashle-episode-7'
//   }

//Recent Episodes
bot.command(["recentsubep", "recentsubeps", "newsubep"], (ctx) => {
  api(`${URL}/recent-release?type=1&page=1`, (d) => {
    if (d.length < 1) {
      ctx.reply("Sorry no episodes found!! Please try again later.");
      return;
    }
    ctx.replyWithPhoto(
      { url: d[0].animeImg || "./robin.jpg" },
      {
        caption: `<b>✨LATEST SUB EP✨</b>\n🔸Anime: <b>${capitalCase(
          d[0].animeId.split("-").join(" ")
        )}</b>\n\n🔸New Episode Number: <b>${
          d[0].episodeNum || "N/A"
        }</b>\n🔸Type: <b>${d[0].subOrDub || "N/A"}</b>`,
        parse_mode: "html",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Watch Now", url: d[0].episodeUrl },
              { text: "anime details", callback_data: "details 2" },
            ],
            [{ text: "next >", callback_data: "recentep sub 1" }],
          ],
        },
      }
    );
  });
});

bot.action(/recentep ([A-z]+) ([0-9]+)/, (ctx) => {
  let ep = parseInt(ctx.match[2]) - 1;
  let types = { sub: 1, dub: 2, chi: 3 };
  let type = types[ctx.match[1]] || 1;
  api(`${URL}/recent-release?type=${type}`, (d) => {
    ep = ep == -1 ? d.length - 1 : ep;
    console.log(d[0], d[1]);
    if (!d[ep]) return ctx.reply("No new episodes!!");
    let buttons = [];
    let btn = [];
    //continue working from here

    if (ep > 1)
      btn.push({
        text: "< prev",
        callback_data: `recentep ${ctx.match[1]} ` + ep,
      });
    if (ep + 2 > d.length)
      btn.push({
        text: "next >",
        callback_data: `recentep ${ctx.match[1]} ` + (ep + 2),
      });
    buttons.push([
      { text: "Watch Now", url: d[ep].episodeUrl },
      { text: "anime details", callback_data: `recentep ${ctx.match[1]} ` },
    ]);
    buttons.push(btn);
    ctx.editMessageMedia(
      {
        media: d[ep].animeImg || "./robin.jpg",
        type: "photo",
        chat_id: ctx.callbackQuery.message.chat.id,
        message_id: ctx.callbackQuery.message.message_id,
        caption: `<b>✨LATEST SUB EP✨</b>\n🔸Anime: <b>${capitalCase(
          d[ep].animeId.split("-").join(" ")
        )}</b>\n\n🔸New Episode Number: <b>${
          d[ep].episodeNum || "N/A"
        }</b>\n🔸Type: <b>${d[ep].subOrDub || "N/A"}</b>`,
        parse_mode: "html",
      },
      {
        reply_markup: {
          inline_keyboard: buttons,
        },
      }
    );
  });
});

const stage = new Scenes.Stage([superWizard]);

bot.use(session());
bot.use(stage.middleware());

//anime search
bot.command(["search", "animesearch", "anime", "anime-search"], (ctx) =>
  ctx.scene.enter("anime-search")
);

//anime details action
bot.action(/details ([0-9]+)/, (ctx) => {
  let select =
    ctx.callbackQuery.message.caption_entities[parseInt(ctx.match[1]) - 1];
  let id = ctx.callbackQuery.message.caption
    .slice(select.offset, select.offset + select.length)
    .split(" ")
    .join("-");
  api(`${URL}/anime-details/${id}`, (d) => {
    if (d.error) {
      ctx.reply("Sorry. Anime Not Found.");
      return;
    }
    ctx.sendPhoto(d.animeImg, {
      caption: `<b>Title</b>: ${d.animeTitle} \n\n<b>Type</b>: ${
        d.type || "N/A"
      }\n\n<b>Released on</b>: ${d.releasedDate}\n\n<b>Status</b>: ${
        d.status || "N/A"
      }\n\n<b>Genres</b>: ${d.genres.join(", ")}\n\n<b>Other Name</b>: ${
        d.otherNames || "N/A"
      }\n\n<b>Total Episodes</b>: ${d.totalEpisodes}\n\n<b>Details</b>: ${
        d.synopsis || "N/A"
      }`,
      parse_mode: "HTML",
    });
  });
});
bot.launch({
  webhook: { domain: process.env.BOT_URL, port: process.env.PORT },
});

const app = express();

app.get("/", function (req, res) {
  res.send("Hello World");
  console.log("running");
});

app.listen(3000);

//functions
