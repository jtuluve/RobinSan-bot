const { Context } = require("telegraf");
const { readFileSync } = require("fs");
const { join } = require("path");
const { informAdmin } = require("./admin");

/**
 * Splits the data into multiple messages and sends them
 * @param {string} caption The caption to be sent with the data
 * @param {Context} ctx The Telegraf Context
 * @param {string} paginationCallbackCommand The pagination command
 * @param {any} data The data to be split
 * @param {(i,data)=>string} func The function to format the data
 */
async function splitAndSend(
  caption,
  ctx,
  paginationCallbackCommand,
  data,
  func
) {
  let buttons = [];
  let rowb = [];
  let list = data.data;

  const isCallbackQuery = !!ctx.callbackQuery;
  let edited = false;
  const sendOrEdit = async (caption, buttons) => {
    try {
      if (isCallbackQuery && !edited) {
        edited = true;
        await ctx.editMessageMedia(
          {
            media: list[0]?.images?.jpg?.large_image_url || {
              source: readFileSync(
                join(__dirname, "../assets/robin-facing.jpg")
              ),
            },
            type: "photo",
            chat_id: ctx.callbackQuery.message.chat.id,
            message_id: ctx.callbackQuery.message.message_id,
            caption,
            parse_mode: "html",
          },
          {
            reply_markup: {
              inline_keyboard: buttons,
            },
          }
        );
      } else {
        await ctx.replyWithPhoto(
          list[0]?.images?.jpg?.large_image_url || {
            source: readFileSync(join(__dirname, "../assets/robin-facing.jpg")),
          },
          {
            caption,
            parse_mode: "html",
            reply_markup: {
              inline_keyboard: buttons,
            },
          }
        );
      }
    } catch (e) {
      await informAdmin(
        ctx,
        e.message +
          "\nsplitAndSend, " +
          paginationCallbackCommand +
          ", " +
          data.pagination.current_page
      );
    }
  };

  for (let i = 0; i < list.length; i++) {
    const messagePart = func(i + 1, list[i]);

    // limit check
    if (caption.length + messagePart.length > 965) {
      buttons.push(rowb);
      await sendOrEdit(
        caption + "\n(Continued...) \n\n🔻select an anime for more details🔻",
        buttons
      );

      caption = "";
      buttons = [];
      rowb = [];
    }

    caption += messagePart;

    if (rowb.length < 4) {
      rowb.push({
        text: `${i + 1}`,
        callback_data: `details ${list[i].mal_id}`,
      });
    } else {
      buttons.push(rowb);
      rowb = [{ text: `${i + 1}`, callback_data: `details ${list[i].mal_id}` }];
    }
  }

  if (data.pagination?.current_page > 1)
    rowb.push({
      text: "<",
      callback_data: `${paginationCallbackCommand} ${
        data.pagination.current_page - 1
      }`,
    });
  if (data.pagination?.has_next_page)
    rowb.push({
      text: ">",
      callback_data: `${paginationCallbackCommand} ${
        data.pagination.current_page + 1
      }`,
    });
  if (rowb.length > 0) buttons.push(rowb);

  // Send the remaining caption after the loop finishes
  if (caption.length > 0)
    await sendOrEdit(
      caption + "\n\n🔻select an anime for more details🔻",
      buttons
    );
}

exports.splitAndSend = splitAndSend;
