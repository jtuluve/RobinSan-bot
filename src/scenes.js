const { Scenes /* , session, Telegraf */ } = require("telegraf");
const { api } = require("./api");
const URL = process.env.URL;
// const bot = new Telegraf("5787466260:AAHeqMGHynCjb2ZP2cWuYWocEp919aZi6mY");

// bot.on("message", ctx=>console.log(ctx.message))

const superWizard = new Scenes.WizardScene(
  "anime-search",
  async (ctx) => {
    await ctx.reply("Send me the name of the anime to search");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message.text || ctx.message.text.length < 2) {
      ctx.reply("Please enter valid search with more than 2 letters");
      return;
    }
    if (
      ["/search", "/animesearch", "/anime", "/anime-search"].includes(
        ctx.message.text
      )
    ) {
      ctx.scene.enter("anime-search");
      return await ctx.scene.leave();
    }
    //work from here
    api(`${URL}/anime?q=${encodeURIComponent(ctx.message.text)}`, (d) => {
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
            callback_data: `details ${parseInt(i) + 1}`,
          });
        } else {
          buttons.push(row);
          row = [];
          row.push({
            text: parseInt(i) + 1,
            callback_data: `details ${parseInt(i) + 1}`,
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
    });
    return await ctx.scene.leave();
  }
);

// const stage = new Scenes.Stage([superWizard]);
exports.superWizard = superWizard;
// bot.use(session());
// bot.use(stage.middleware());
// bot.command("he", ctx=>ctx.scene.enter("anime-search"))
// bot.launch();
