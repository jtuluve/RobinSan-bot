//local process env
import dotenv from "dotenv";
dotenv.config();

//imports
import express from "express";
import { Telegraf, session, Scenes } from "telegraf";
import { api } from "./api.js";
import { superWizard } from "./scenes.js";

import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const API_URL = process.env.URL;

const bot = new Telegraf(process.env.BOT_TOKEN);

// bot.on("message", async (ctx, next) => {
//   console.log(ctx.message);
//   return await next();
// });

// Get the directory name in ESM
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Load the image into memory during initialization

bot.command("start", async (ctx) => {
  console.log("started");
  await ctx.replyWithPhoto(
    { source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")) },
    {
      caption:
        "Konnichiwa😇😇\n\nI'm <b>Robin</b>. I can generate anime related informations, latest episodes, popular animes and much more. I'm still learning (beta) and I may make mistakes. I look forward to help you.✨✨",
      parse_mode: "html",
    }
  );
});

//top airing command
bot.command("/top-airing", async (ctx) => {
  await api(`${API_URL}/top/anime?filter=airing`, async (d) => {
    if (d.data.length < 1) {
      await ctx.replyWithPhoto(
        readFileSync(join(__dirname, "../assets/no-robin.jpg")),
        {
          caption: "<b>💨 No anime found!!</b>\n\n🔴 Please try again later.",
          parse_mode: "html",
        }
      );
      return;
    }
    let message = "✨Top Airing Anime(page 1)✨\n\n";
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (let e of d.data) {
      message += `${i}) Title:  <b>${
        e.title_english || e.title || "No Title"
      }</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${e.mal_id}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${e.mal_id}` }];
      }
      i++;
    }
    d.pagination.has_next_page &&
      rowb.push({ text: ">", callback_data: "topairpage 2" });
    buttons.push(rowb);
    message += "🔻select any anime for more details🔻";
    await ctx.replyWithPhoto(
      d.data[0]?.images.jpg?.large_image_url
        ? {
            url: d.data[0]?.images.jpg?.large_image_url,
          }
        : readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
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
bot.action(/topairpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await api(`${API_URL}/top/anime?filter=airing&page=${pgnum}`, async (d) => {
    let message = `✨Top Airing Anime✨(page ${pgnum})\n\n`;
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (let e of d.data) {
      message += `${i}) Title:  <b>${
        e.title_english || e.title || "No Title"
      }</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${e.mal_id}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${e.mal_id}` }];
      }
      i++;
    }
    if (pgnum > 1)
      rowb.push({ text: "<", callback_data: `topairpage ${pgnum - 1}` });
    if (d.pagination.has_next_page)
      rowb.push({ text: ">", callback_data: `topairpage ${pgnum + 1}` });
    buttons.push(rowb);
    message += "\n🔻select any anime for more details🔻";
    /* ctx.replyWithPhoto({url: d.data[0].animeImg}, {
        caption: message.trim(), 
        parse_mode:"html",
        reply_markup : {
            "inline_keyboard": buttons
        }
    }) */
    await ctx
      .editMessageMedia(
        {
          media:
            d.data[0]?.images.jpg?.large_image_url ||
            readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
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
bot.command("popular", async (ctx) => {
  await api(`${API_URL}/top/anime?filter=bypopularity`, async (d) => {
    let message = "✨Popular Anime✨\n\n";
    let i = 1;
    let buttons = [];
    let rowb = [];
    for (let e of d.data) {
      message += `${i}) Title:  <b>${
        e.title_english || e.title || "No Title"
      }</b>\n`;
      if (rowb.length < 4) {
        rowb.push({ text: `${i}`, callback_data: `details ${e.mal_id}` });
      } else {
        buttons.push(rowb);
        rowb = [{ text: `${i}`, callback_data: `details ${e.mal_id}` }];
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
    await ctx.replyWithPhoto(
      d.data[0]?.images.jpg?.large_image_url
        ? {
            url: d.data[0]?.images.jpg?.large_image_url,
          }
        : readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
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

bot.action(/popularpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await api(
    `${API_URL}/top/anime?filter=bypopularity&page=${pgnum}`,
    async (d) => {
      if (d.data.length < 1) {
        await ctx.reply("No more found!!");
      }
      let message = `✨Popular Anime✨(page ${pgnum})\n\n`;
      let i = 1;
      let buttons = [];
      let rowb = [];
      for (let e of d.data) {
        message += `${i}) Title:  <b>${
          e.title_english || e.title || "No Title"
        }</b>\n`;
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
      if (d.pagination.has_next_page)
        rowb.push({ text: ">", callback_data: `popularpage ${pgnum + 1}` });
      buttons.push(rowb);
      message += "\n🔻select any anime for more details🔻";
      await ctx
        .editMessageMedia(
          {
            media:
              d.data[0]?.images.jpg?.large_image_url ||
              readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
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
    }
  );
});

//Recent Episodes
// bot.command(["recentsubep", "recentsubeps", "newsubep"], async (ctx) => {
//   api(`${API_URL}/recent-release?type=1&page=1`, (d) => {
//     console.log(d);
//     if (d.data?.length < 1) {
//       ctx.reply("Sorry no episodes found!! Please try again later.");
//       return;
//     }
//     ctx.replyWithPhoto(
//       {
//         url:
//           d.data[0]?.images.jpg?.large_image_url || process.env.BOT_URL+"assets/robin-facing.jpg",
//       },
//       {
//         caption: `<b>✨LATEST SUB EP✨</b>\n🔸Anime: <b>${
//           e.title_english ||
//           e.title ||
//           "No Title"
//         }</b>\n\n🔸New Episode Number: <b>${
//           d.data[0].episodeNum || "N/A"
//         }</b>\n🔸Type: <b>${d.data[0].subOrDub || "N/A"}</b>`,
//         parse_mode: "html",
//         reply_markup: {
//           inline_keyboard: [
//             [
//               { text: "Watch Now", url: d.data[0].episodeUrl },
//               { text: "anime details", callback_data: "details 2" },
//             ],
//             [{ text: "next >", callback_data: "recentep sub 1" }],
//           ],
//         },
//       }
//     );
//   });
// });

// bot.action(/recentep ([A-z]+) ([0-9]+)/, async (ctx) => {
//   let ep = parseInt(ctx.match[2]) - 1;
//   let types = { sub: 1, dub: 2, chi: 3 };
//   let type = types[ctx.match[1]] || 1;
//   api(`${API_URL}/recent-release?type=${type}`, (d) => {
//     ep = ep == -1 ? d.data.length - 1 : ep;
//     console.log(d.data[0], d[1]);
//     if (!d[ep]) return ctx.reply("No new episodes!!");
//     let buttons = [];
//     let btn = [];
//     //continue working from here

//     if (ep > 1)
//       btn.push({
//         text: "< prev",
//         callback_data: `recentep ${ctx.match[1]} ` + ep,
//       });
//     if (ep + 2 > d.data.length)
//       btn.push({
//         text: "next >",
//         callback_data: `recentep ${ctx.match[1]} ` + (ep + 2),
//       });
//     buttons.push([
//       { text: "Watch Now", url: d[ep].episodeUrl },
//       { text: "anime details", callback_data: `recentep ${ctx.match[1]} ` },
//     ]);
//     buttons.push(btn);
//     ctx.editMessageMedia(
//       {
//         media: d[ep].animeImg || process.env.BOT_URL+"robin.jpg",
//         type: "photo",
//         chat_id: ctx.callbackQuery.message.chat.id,
//         message_id: ctx.callbackQuery.message.message_id,
//         caption: `<b>✨LATEST SUB EP✨</b>\n🔸Anime: <b>${
//           e.title_english ||
//           e.title ||
//           "No Title"
//         }</b>\n\n🔸New Episode Number: <b>${
//           d[ep].episodeNum || "N/A"
//         }</b>\n🔸Type: <b>${d[ep].subOrDub || "N/A"}</b>`,
//         parse_mode: "html",
//       },
//       {
//         reply_markup: {
//           inline_keyboard: buttons,
//         },
//       }
//     );
//   });
// });

const stage = new Scenes.Stage([superWizard]);

bot.use(session());
bot.use(stage.middleware());

//anime search
bot.command(["search", "animesearch", "anime", "anime-search"], async (ctx) =>
  ctx.scene.enter("anime-search")
);

//anime details action
bot.action(/details ([0-9]+)/, async (ctx) => {
  let id = ctx.match[1];
  await api(`${API_URL}/anime/${id}`, async (d) => {
    if (!d || d.error || !d.data || !d.data.title) {
      await ctx.reply("Sorry. Anime Not Found.");
      return;
    }
    let caption = `<b>Title</b>: ${
      d.data.title_english || d.data.title
    } \n\n<b>Type</b>: ${d.data.type || "N/A"}\n\n<b>Released on</b>: ${
      d.data.releasedDate
    }\n\n<b>Status</b>: ${
      d.data.status || "N/A"
    }\n\n<b>Genres</b>: ${d.data.genres
      .map((e) => e.name)
      .join(", ")}\n\n<b>Other Name</b>: ${
      d.data.titles.map((e) => e.title).join(", ") || "N/A"
    }\n\n<b>Total Episodes</b>: ${d.data.episodes}\n\n`;
    caption += `<b>Description</b>: ${
      caption.length + d.data.synopsis.length > 1024
        ? d.data.synopsis.slice(0, 1000 - caption.length) + "..."
        : d.data.synopsis
    }`;
    await ctx.sendPhoto(
      d.data.images.jpg?.large_image_url ||
        readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
      {
        caption,
        parse_mode: "HTML",
      }
    );
  });
});
const app = express();
app.use("/static", express.static(join(__dirname, "../assets")));

async function initializeServer() {
  try {
    // First, define your routes
    app.use(
      await bot.createWebhook({
        domain: process.env.BOT_URL,
      })
    );
    console.log(app._router);
    app.get("/", function (req, res) {
      res.send("Hello World");
      console.log("running");
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
  }
}

// Call the initialization function
await initializeServer();

export default app;
