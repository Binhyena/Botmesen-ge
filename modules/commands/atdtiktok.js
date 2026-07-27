const axios = require("axios");
const fs = require("fs");

const isURL = (u) => /^http(|s):\/\//.test(u);

exports.handleEvent = async function (o) {
  try {
    const str = o.event.body;
    const send = (msg) =>
      o.api.sendMessage(msg, o.event.threadID, o.event.messageID);
    const head = (app) =>
      `==『 AUTODOWN ${app.toUpperCase()} 』==\n────────────────`;
    
      if (/(^https:\/\/)((vm|vt|www|v)\.)?(tiktok|douyin)\.com\//.test(str)) {
                const json = await infoPostTT(str);
                let attachment = [];
                if (json.images != undefined) {
                    for (const $ of json.images) {
                        attachment.push(await streamURL($, 'png'));
                    }
                } else {
                    attachment = await streamURL(json.play, 'mp4');
                }
          o.api.sendMessage({body: `            ====『𝐀𝐮𝐭𝐨𝐝𝐨𝐰𝐧 𝐓𝐢𝐤𝐭𝐨𝐤』====       
▱▱▱▱▱▱▱▱▱▱▱▱▱▱
•👤 𝐓𝐞̂𝐧 𝐊𝐞̂𝐧𝐡: ${json.author.nickname}
•😽 𝐈𝐃 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̀𝐧𝐠: ${json.author.unique_id}
•🌐 𝐐𝐮𝐨̂́𝐜 𝐠𝐢𝐚: ${json.region}
•💬 𝐓𝐢𝐞̂𝐮 Đ𝐞̂̀: ${json.title}
•❤️ 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗶𝗺: ${json.digg_count}
•👁‍🗨 𝐋𝐮̛𝐨̛̣𝐭 𝐱𝐞𝐦: ${json.play_count}
•💭 𝐋𝐮̛𝐨̛̣𝐭 𝗯𝗶̀𝗻𝗵 𝗹𝘂𝗮̣̂𝗻: ${json.comment_count}
•🔗 𝗟𝘂̛𝗼̛̣𝘁 𝗰𝗵𝗶𝗮 𝘀𝗲̉: ${json.share_count}
•⏰ Thời gian: ${json.duration}s
•📥 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗮̉𝗶: ${json.download_count}
•𝗧𝗵𝗮̉ 😼 𝗻𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘁𝗮̉𝗶 𝗻𝗵𝗮̣𝗰
▱▱▱▱▱▱▱▱▱▱▱▱▱▱`, attachment },o.event.threadID,(error, info) => {
    global.client.handleReaction.push({
      name: this.config.name, 
      messageID: info.messageID,
      author: o.event.senderID,
      data: json
      
          })
                },o.event.messageID);
                    } 

                    
    } catch(e) {
    }
};
exports.run = () => {};
exports.handleReaction = async function (o){
  const { threadID: t, messageID: m, reaction: r } = o.event
  const { handleReaction: _ } = o
  if (r != "😼") return; 
  o.api.sendMessage({ body: `
  ====『 MUSIC TIKTOK 』====
▱▱▱▱▱▱▱▱▱▱▱▱▱▱
👤 𝐈𝐃: ${_.data.music_info.id}
💬 𝐓𝐢𝐞̂𝐮 Đ𝐞̂̀: ${_.data.music_info.title}
🔗 𝐋𝐢𝐧𝐤: ${_.data.music_info.play}
⏱️ 𝐓𝐡𝐨̛̀𝐢 𝐠𝐢𝐚𝐧: ${_.data.music_info.duration}
▱▱▱▱▱▱▱▱▱▱▱▱▱▱`,attachment: await streamURL(_.data.music, "mp3")},t,m)
}

exports.config = {
    name: 'atdtiktok',
    version: '1',
    hasPermssion: 0,
    credits: "Tác giả :Trần bình07",
    description: '',
    commandCategory: 'Tiện ích',
    usages: [],
    cooldowns: 3
};

function streamURL(url, type) {
    return axios.get(url, {
        responseType: 'arraybuffer'
    }).then(res => {
        const path = __dirname + `/cache/${Date.now()}.${type}`;
        fs.writeFileSync(path, res.data);
        setTimeout(p => fs.unlinkSync(p), 1000 * 60, path);
        return fs.createReadStream(path);
    });
}

function infoPostTT(url) {
    return axios({
        method: 'post',
        url: `https://tikwm.com/api/`,
        data: {
            url
        },
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => res.data.data);
  }