import { Context } from "telegraf";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { join } from "path";
import axios from "axios";
import { splitAndSend } from "./util.js";
import { informAdmin } from "./admin.js";

const API_URL = process.env.API_URL;
const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 *
 * @param {Context} ctx
 */
export async function sendRandomAnime(ctx) {
  try {
    let d = (await axios.get(`${API_URL}/random/anime`)).data;
    if (!d || d.error || !d.data) {
      await ctx.reply("Sorry. Failed to fetch random anime.");
      return;
    }

    const anime = d.data;
    let caption =
      `<b>🎲 Random Anime Recommendation</b>\n\n` +
      `<b>Title</b>: ${anime.title_english || anime.title}\n\n` +
      `<b>Type</b>: ${anime.type || "N/A"}\n\n` +
      `<b>Rating</b>: ${anime.score || "?"}/10\n\n` +
      `<b>Episodes</b>: ${anime.episodes || "N/A"}\n\n` +
      `<b>Status</b>: ${anime.status || "N/A"}\n\n`;

    // Add synopsis with length check
    caption += `<b>Synopsis</b>: ${
      caption.length + (anime.synopsis?.length || 0) > 1024
        ? anime.synopsis?.slice(0, 1000 - caption.length) + "..."
        : anime.synopsis || "No synopsis available."
    }`;
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      await ctx.editMessageMedia(
        {
          media: anime?.images.jpg?.large_image_url || {
            source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
          },
          type: "photo",
          chat_id: ctx.callbackQuery.message.chat.id,
          message_id: ctx.callbackQuery.message.message_id,
          caption,
          parse_mode: "HTML",
        },
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎲",
                  callback_data: "random",
                },
                {
                  text: "More Details",
                  callback_data: `details ${anime.mal_id}`,
                },
              ],
            ],
          },
        }
      );
      ctx.answerCbQuery();
    } else {
      await ctx.sendPhoto(
        anime.images.jpg?.large_image_url || {
          source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
        },
        {
          caption,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎲",
                  callback_data: "random",
                },
                {
                  text: "More Details",
                  callback_data: `details ${anime.mal_id}`,
                },
              ],
            ],
          },
        }
      );
    }
  } catch (e) {
    await informAdmin(ctx, e.message + "\n" + "sendRandomAnime");
  }
}

/**
 *
 * @param {Context} ctx
 * @param {number} pgnum
 */
export async function sendTopAiring(ctx, pgnum) {
  try {
    let d = (
      await axios.get(`${API_URL}/top/anime?filter=airing&page=${pgnum}`)
    ).data;
    if (d.data.length < 1) {
      await ctx.replyWithPhoto(
        {
          source: readFileSync(join(__dirname, "../assets/no-robin.jpg")),
        },
        {
          caption: "<b>💨 No anime found!!</b>\n\n🔴 Please try again later.",
          parse_mode: "HTML",
        }
      );
      return;
    }
    await splitAndSend(
      `✨Top Airing Anime(page ${pgnum})✨\n\n`,
      ctx,
      "topairpage",
      d,
      (i, e) => {
        return `${i}) <b>${e.title_english || e.title || "No Title"}</b>\n`;
      }
    );
  } catch (e) {
    await informAdmin(ctx, e.message + "\n" + "sendTopAiring, " + pgnum);
  }
}

/**
 *
 * @param {Context} ctx
 * @param {number} pgnum
 */
export async function sendPopular(ctx, pgnum) {
  try {
    let d = (
      await axios.get(`${API_URL}/top/anime?filter=bypopularity&page=${pgnum}`)
    ).data;
    if (d.data.length < 1) {
      await ctx.reply("No more found!!");
    }
    splitAndSend(
      `✨Popular Anime✨(page ${pgnum})\n\n`,
      ctx,
      "popularpage",
      d,
      (i, e) => {
        return `${i}) <b>${e.title_english || e.title || "No Title"}</b>\n`;
      }
    );
  } catch (e) {
    await informAdmin(ctx, e.message + "\n" + "sendPopular, " + pgnum);
  }
}

/**
 *
 * @param {Context} ctx
 * @param {number} pgnum
 */
export async function sendSeasonalNow(ctx, pgnum) {
  try {
    let d = (await axios.get(`${API_URL}/seasons/now?page=${pgnum}&limit=10`))
      .data;
    if (!d || d.error || !d.data || d.data.length < 1) {
      await ctx.reply("Sorry. Failed to fetch seasonal anime.");
      return;
    }

    await splitAndSend(
      `🌸 Current Seasonal Anime (Page - ${pgnum}) 🌸\n\n`,
      ctx,
      "seasonalpage",
      d,
      (i, e) => {
        let message = `${i}) <b>${
          e.title_english || e.title || "No Title"
        }</b>\n`;
        message += `Rating: ⭐${e.score || "N/A"}\n`;
        message += `Episodes: ${e.episodes || "?"}\n`;
        message += `Status: ${e.status}\n\n`;
        return message;
      }
    );
  } catch (e) {
    await informAdmin(ctx, e.message + "\n" + "sendSeasonalNow, " + pgnum);
  }
}

/**
 *
 * @param {Context} ctx
 * @param {number} pgnum
 */
export async function sendTopUpcoming(ctx, pgnum) {
  try {
    let d = (
      await axios.get(`${API_URL}/top/anime?filter=upcoming&page=${pgnum}`)
    ).data;

    if (d.data.length < 1) {
      await ctx.reply("No more found!!");
    }

    await splitAndSend(
      `✨Top Upcoming Anime✨(page ${pgnum})\n\n`,
      ctx,
      "upcomingpage",
      d,
      (i, e) => {
        return `${i}) <b>${e.title_english || e.title || "No Title"}</b>\n`;
      }
    );
  } catch (e) {
    await informAdmin(ctx, e.message + "\n" + "sendTopUpcoming, " + pgnum);
  }
}

/**
 *
 * @param {Context} ctx
 * @param {number|string} mal_id
 * @param {number} pgnum
 */
export async function sendAnimeByGenre(ctx, mal_id, pgnum) {
  try {
    console.log(mal_id, pgnum);
    let d = (await axios.get(`${API_URL}/anime?genres=${mal_id}&page=${pgnum}`))
      .data;

    if (d.data.length < 1) {
      await ctx.reply("No anime found!!");
    }

    await splitAndSend(
      `✨Anime by Genre✨(page ${pgnum})\n\n`,
      ctx,
      `genrepage ${mal_id}`,
      d,
      (i, e) => {
        return `${i}) <b>${e.title_english || e.title || "No Title"}</b>\n`;
      }
    );
  } catch (e) {
    await informAdmin(
      ctx,
      e.message + "\n" + "sendAnimeByGenre, " + mal_id + ", " + pgnum
    );
  }
}
