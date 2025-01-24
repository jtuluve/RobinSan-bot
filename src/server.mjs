//local process env
import dotenv from "dotenv";
dotenv.config();

//imports
import express from "express";
import { Telegraf, session, Scenes } from "telegraf";
import { superWizard } from "./scenes.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import {
  sendAnimeByGenre,
  sendPopular,
  sendRandomAnime,
  sendSeasonalNow,
  sendTopAiring,
  sendTopUpcoming,
} from "./helpers.mjs";
import axios from "axios";
import { informAdmin } from "./admin.js";

const API_URL = process.env.API_URL;
const bot = new Telegraf(process.env.BOT_TOKEN);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

/* Bot commands */
bot.command("start", async (ctx) => {
  await ctx.replyWithPhoto(
    { source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")) },
    {
      caption:
        "Konnichiwa😇😇\n\nI'm <b>Robin</b>. I can generate anime related informations, latest episodes, popular animes and much more. I'm still learning (beta) and I may make mistakes. I look forward to help you.✨✨",
      parse_mode: "html",
    }
  );
});

//help
bot.command("help", async (ctx) => {
  try {
    await ctx.reply(
      `<b>✨ Robin - Your Anime Companion ✨</b>

Here are the commands you can use:

<b>General Commands:</b>
/start - Begin your journey with me
/help - View this help message

<b>Anime Exploration:</b>
/topairing - Discover the top currently airing anime 📺
/popular - Explore the most popular anime 🎉
/seasonal - Check out anime from the current season 🍁
/upcoming - See the most anticipated upcoming anime 📅
/random - Get a random anime recommendation 🎲

<b>Search & Discover:</b>
/search - Search for anime by name 🔍
/genre - Browse anime by genres 🗂️

I’m here to make your anime journey enjoyable and informative. Feel free to reach out anytime! 😊`,
      { parse_mode: "html" }
    );
  } catch (error) {
    await informAdmin(ctx, error.message + "\n" + "help");
  }
});

//top airing command
bot.command("topairing", async (ctx) => {
  await sendTopAiring(ctx, 1);
});

//popular command
bot.command("popular", async (ctx) => {
  await sendPopular(ctx, 1);
});

//anime search
bot.command("search", async (ctx) => ctx.scene.enter("anime-search"));

// Seasonal anime command
bot.command("seasonal", async (ctx) => {
  await sendSeasonalNow(ctx, 1);
});

// Top upcoming
bot.command("upcoming", async (ctx) => {
  await sendTopUpcoming(ctx, 1);
});

// Random anime command
bot.command("random", async (ctx) => {
  await sendRandomAnime(ctx);
});

// Genre
bot.command("genre", async (ctx) => {
  try {
    const genres = (await axios.get(`${API_URL}/genres/anime`)).data?.data;

    if (!genres || genres.length === 0) {
      return ctx.reply("No genres found. Please try again later.");
    }
    let l = [];
    let keyboard = [];
    genres.forEach((genre) => {
      l.push({
        text: genre.name,
        callback_data: `genrepage ${genre.mal_id} 1`,
      });
      if (l.length >= 4) {
        keyboard.push(l);
        l = [];
      }
    });
    if (l.length > 0) keyboard.push(l);

    await ctx.reply("Select a genre to see anime:", {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    await informAdmin(ctx, error.message + "\n" + "genre");
  }
});

/* ACTIONS */
//anime details action
bot.action(/details ([0-9]+)/, async (ctx) => {
  let id = ctx.match[1];
  let d = (await axios.get(`${API_URL}/anime/${id}`)).data;

  if (!d || d.error || !d.data || !d.data.title) {
    await ctx.reply("Sorry. Anime Not Found.");
    return;
  }

  let caption =
    `<b>Title</b>: ${d.data.title_english || d.data.title}\n\n` +
    `<b>Type</b>: ${d.data.type || "N/A"}\n\n` +
    `<b>Aired date</b>: ${d.data.aired?.string || "N/A"}\n\n` +
    `<b>Status</b>: ${d.data.status || "N/A"}\n\n` +
    `<b>Rating</b>: ${d.data.score || "?"}/10\n\n` +
    `<b>Genres</b>: ${d.data.genres.map((e) => e.name).join(", ")}\n\n` +
    `<b>Other Name</b>: ${
      d.data.titles?.map((e) => e.title).join(", ") || "N/A"
    }\n\n` +
    `<b>Total Episodes</b>: ${d.data.episodes || "N/A"}\n\n`;
  caption += `<b>Description</b>: ${
    caption.length + d.data.synopsis.length > 1024
      ? d.data.synopsis.slice(0, 1000 - caption.length) + "..."
      : d.data.synopsis
  }`;

  await ctx.sendPhoto(
    d.data?.images.jpg?.large_image_url || {
      source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
    },
    {
      caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "More Details",
              url: d.data.url,
            },
          ],
        ],
      },
    }
  );
});

//topairing action
bot.action(/topairpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await sendTopAiring(ctx, pgnum);
});

bot.action(/popularpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await sendPopular(ctx, pgnum);
});

// random action
bot.action("random", async (ctx) => {
  await sendRandomAnime(ctx);
});

// seasonal action
bot.action(/seasonalpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await sendSeasonalNow(ctx, pgnum);
});

// upcoming action
bot.action(/upcomingpage ([0-9]+)/, async (ctx) => {
  let pgnum = parseInt(ctx.match[1]);
  await sendTopUpcoming(ctx, pgnum);
});

// genre action
bot.action(/genrepage ([0-9]+) ([0-9]+)/, async (ctx) => {
  let id = ctx.match[1];
  let pgnum = parseInt(ctx.match[2]);
  await sendAnimeByGenre(ctx, id, pgnum);
});

// bot setup
bot.use(session());
bot.use(new Scenes.Stage([superWizard]).middleware());

// server
const app = express();

async function initializeServer() {
  try {
    app.use(
      await bot.createWebhook({
        domain: process.env.BOT_URL,
      })
    );

    app.get("/", function (req, res) {
      res.send("Hello World");
      console.log("running");
    });

    const PORT = process.env.PORT || 3000;
    if (global.expServer) global.expServer.close();
    global.expServer = app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
  }
}

await initializeServer();

export default app;
