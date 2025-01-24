const { Scenes } = require("telegraf");
const { informAdmin } = require("./admin");
const URL = process.env.URL;

const superWizard = new Scenes.WizardScene(
  "anime-search",
  async (ctx) => {
    try {
      await ctx.reply("Send me the name of the anime to search");
      return ctx.wizard.next();
    } catch (e) {
      await informAdmin(ctx, e.message + "\n" + "anime-search");
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message.text || ctx.message.text.length < 2) {
        ctx.reply("Please enter valid search with more than 2 letters");
        return;
      }

      let d = (
        await axios.get(
          `${URL}/anime?q=${encodeURIComponent(ctx.message.text)}`
        )
      ).data;
      if (d.length < 1) {
        ctx.replyWithPhoto(
          { source: "./assets/no-robin.jpg" },
          {
            caption:
              "<b>💨 No anime found!!</b>\n\n🔴 Please try different keywords and try again.",
            parse_mode: "html",
          }
        );
        return;
      }
      let message = "🔍 Search Result\n\n";
      let buttons = [];
      let row = [];
      for (let i in d.data) {
        let e = d.data[i];
        let tempmessage = `${parseInt(i) + 1}) <b>${
          e.titles.find((e) => e.type == "English")?.title ||
          e.titles[0]?.title ||
          "No Title"
        }</b>\n`;
        if ((message + tempmessage).length > 1024) {
          break;
        }
        message += tempmessage;
        if (row.length < 4) {
          row.push({
            text: parseInt(i) + 1,
            callback_data: `details ${e.mal_id}`,
          });
        } else {
          buttons.push(row);
          row = [];
          row.push({
            text: parseInt(i) + 1,
            callback_data: `details ${e.mal_id}`,
          });
        }
      }
      if (row.length > 0) buttons.push(row);
      message += "\n🔻select any anime for more details🔻";
      ctx.replyWithPhoto(
        d.data[0]?.images.jpg?.large_image_url || "./assets/robin-facing.jpg",
        {
          caption: message,
          parse_mode: "html",
          reply_markup: { inline_keyboard: buttons },
        }
      );
      return await ctx.scene.leave();
    } catch (e) {
      await informAdmin(ctx, e.message + "\n" + "anime-search");
    }
  }
);

exports.superWizard = superWizard;
