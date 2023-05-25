//local process env
require('dotenv').config();
const { Telegraf } = require("telegraf")
const bot = new Telegraf(process.env.BOT_TOKEN)
const https = require("https")
const express = require('express')
const {capitalCase} = require("case-anything")

const URL = process.env.URL;



//top airing command
bot.command("topairing", (ctx)=>{
    api(`${URL}/top-airing`, (d)=>{
        let message = "✨Top Airing Anime✨\n\n"
        let i = 1;
        let buttons = []
        let rowb = []
        for(e of d){
            message += `${i}) Title:  <b>${capitalCase(e.animeId.split("-").join(" "))}</b>\n`;
            if(rowb.length <4){
                rowb.push({"text":`${i}`, "callback_data": `details ${i}`})
            }else{
                buttons.push(rowb)
                rowb = [{"text":`${i}`, "callback_data": `details ${i}`}]
            }
            i++;
        }
        rowb.push({"text":">", "callback_data":"topairpage 2"})
        buttons.push(rowb)
        message += '🔻select any anime for more details🔻'
        ctx.replyWithPhoto({url: d[0].animeImg}, {
            caption: message.trim(), 
            parse_mode:"html",
            reply_markup : {
                "inline_keyboard": buttons
            }
        })
    })
    
})


//topairingaction
bot.action(/topairpage ([0-9]+)/, (ctx)=>{
    let pgnum = parseInt(ctx.match[1])
        api(`${URL}/top-airing?page=${pgnum}`, (d)=>{
            let message = `✨Top Airing Anime✨(page ${pgnum})\n\n`
            let i = 1;
            let buttons = []
            let rowb = []
            for(e of d){
                message += `${i}) Title:  <b>${capitalCase(e.animeId.split("-").join(" "))}</b>\n`;
                if(rowb.length <4){
                    rowb.push({"text":`${i}`, "callback_data": `details ${i}`})
                }else{
                    buttons.push(rowb)
                    rowb = [{"text":`${i}`, "callback_data": `details ${i}`}]
                }
                i++;
            }
            if(pgnum-1>0) rowb.push({"text":"<", "callback_data":`topairpage ${pgnum-1}`});
            if(pgnum+1<26) rowb.push({"text":">", "callback_data":`topairpage ${pgnum+1}`});
            buttons.push(rowb)
            message += '\n🔻select any anime for more details🔻'
            /* ctx.replyWithPhoto({url: d[0].animeImg}, {
                caption: message.trim(), 
                parse_mode:"html",
                reply_markup : {
                    "inline_keyboard": buttons
                }
            }) */
            let m = ctx.editMessageMedia({
                media: d[0].animeImg,
                type: 'photo',
                chat_id:ctx.callbackQuery.message.chat.id,
                message_id: ctx.callbackQuery.message.message_id,
                caption: message.trim(),
                parse_mode:"html",
                
            }, {reply_markup : {
                "inline_keyboard": buttons
                }}).then(()=>{return})
        })
    
})


//popular command
bot.command("popular", (ctx)=>{
    api(`${URL}/popular`, (d)=>{
        let message = "✨Popular Anime✨\n\n"
        let i = 1;
        let buttons = []
        let rowb = []
        for(e of d){
            message += `${i}) Title:  <b>${capitalCase(e.animeId.split("-").join(" "))}</b>\n`;
            if(rowb.length <4){
                rowb.push({"text":`${i}`, "callback_data": `details ${i}`})
            }else{
                buttons.push(rowb)
                rowb = [{"text":`${i}`, "callback_data": `details ${i}`}]
            }
            i++;
        }
        rowb.push({"text":">", "callback_data":"popularpage 2"})
        buttons.push(rowb)
        message += '🔻select any anime for more details🔻'
        ctx.replyWithPhoto({url: d[0].animeImg}, {
            caption: message.trim(), 
            parse_mode:"html",
            reply_markup : {
                "inline_keyboard": buttons
            }
        })
    })
    
})

bot.action(/popularpage ([0-9]+)/, (ctx)=>{
    let pgnum = parseInt(ctx.match[1])
        api(`${URL}/popular?page=${pgnum}`, (d)=>{
            let message = `✨Popular Anime✨(page ${pgnum})\n\n`
            let i = 1;
            let buttons = []
            let rowb = []
            for(e of d){
                message += `${i}) Title:  <b>${capitalCase(e.animeId.split("-").join(" "))}</b>\n`;
                if(rowb.length <4){
                    rowb.push({"text":`${i}`, "callback_data": `details ${i}`})
                }else{
                    buttons.push(rowb)
                    rowb = [{"text":`${i}`, "callback_data": `details ${i}`}]
                }
                i++;
            }
            if(pgnum-1>0) rowb.push({"text":"<", "callback_data":`popularpage ${pgnum-1}`});
            if(pgnum+1<26) rowb.push({"text":">", "callback_data":`popularpage ${pgnum+1}`});
            buttons.push(rowb)
            message += '\n🔻select any anime for more details🔻'
            let m = ctx.editMessageMedia({
                media: d[0].animeImg,
                type: 'photo',
                chat_id:ctx.callbackQuery.message.chat.id,
                message_id: ctx.callbackQuery.message.message_id,
                caption: message.trim(),
                parse_mode:"html",
                
            }, {reply_markup : {
                "inline_keyboard": buttons
                }}).then(()=>{return}).catch((err)=>console.log(err))
        })
    
})

bot.action(/details ([0-9]+)/, (ctx)=>{
    let select = ctx.callbackQuery.message.caption_entities[parseInt(ctx.match[1])-1]
    let id = ctx.callbackQuery.message.caption.slice(select.offset, select.offset+select.length).split(" ").join("-")
    api(`${URL}/anime-details/${id}`,(d)=>{
        if(d.error){ctx.reply("Sorry. Anime Not Found."); return;}
        ctx.sendPhoto(d.animeImg, {
            caption: `<b>Title</b>: ${d.animeTitle} \n\n<b>Type</b>: ${d.type}\n\n<b>Released on</b>: ${d.releasedDate}\n\n<b>Status</b>: ${d.status}\n\n<b>Genres</b>: ${d.genres.join(", ")}\n\n<b>Other Name</b>: ${d.otherNames}\n\n<b>Total Episodes</b>: ${d.totalEpisodes}\n\n<b>Details</b>: ${d.synopsis}`,
            parse_mode: "HTML"
        })

    })
})
bot.launch()

const app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
  console.log("running")
})

app.listen(3000)

//functions
function api(url, callback){
  
    const request = https.request(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });
      
        response.on('end', ()=>{
            callback(JSON.parse(data))
        });
    })
      
    request.on('error', (error) => {
        console.log('An error', error);
    });
      
    request.end();
}