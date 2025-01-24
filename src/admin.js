const { Context } = require("telegraf");

/**
 * @param {Context} ctx
 * @param {string} message
 */
exports.informAdmin = async function informAdmin(ctx, message) {
  if (!process.env.ADMIN_ID) {
    console.log("Admin id not found!");
  }
  try {
    await ctx.reply("Something went wrong! Please try again later.");
    await ctx.telegram.sendMessage(
      process.env.ADMIN_ID,
      "‼️⁉️⚠️⚠️⚠️‼️⁉️\n" + message
    );
  } catch {
    console.log("Failed to send message to admin");
  }
};
