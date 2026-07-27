module.exports.config = {
    name: "checktt", // Tên lệnh, được sử dụng trong việc gọi lệnh
    version: "1.0.1", // phiên bản của module này
    hasPermssion: 0, // Quyền hạn sử dụng, với 0 là toàn bộ thành viên, 1 là quản trị viên trở lên, 2 là admin/owner
    credits: "Tác giả :Trần bình07", // Công nhận module sở hữu là ai
    description: "Check tương tác ngày/tuần/toàn bộ", // Thông tin chi tiết về lệnh
    commandCategory: "Quản Lí Box", // Thuộc vào nhóm nào: system, other, game-sp, game-mp, random-img, edit-img, media, economy, ...
    usages: "< checktt all/week/day/locmem > ", // Cách sử dụng lệnh
    cooldowns: 5, // Thời gian một người có thể lặp lại lệnh
    dependencies: {
        "fs": " ",
        "moment-timezone": " "
    }
};

const path = __dirname + '/tuongtac/checktt/';
const { min } = require('moment-timezone');
const moment = require('moment-timezone');
const { format } = require('path');

module.exports.onLoad = () => {
    const fs = require('fs');
    if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
        fs.mkdirSync(path, { recursive: true });
    }
  setInterval(() => {
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const checkttData = fs.readdirSync(path);
    checkttData.forEach(file => {
        if (!file.endsWith('.json')) return; // Bỏ qua file không phải JSON
      
        const filePath = path + file;
        try {
          const content = fs.readFileSync(filePath, 'utf8').trim();
          if (!content) return; // Bỏ qua file trống
      
          let fileData = JSON.parse(content);
      
          if (fileData.time != today) {
            setTimeout(() => {
              try {
                const delayedContent = fs.readFileSync(filePath, 'utf8').trim();
                if (!delayedContent) return;
                let delayedData = JSON.parse(delayedContent);
                if (delayedData.time != today) {
                  delayedData.time = today;
                  fs.writeFileSync(filePath, JSON.stringify(delayedData, null, 4));
                }
              } catch (e) {
                console.error(`[checktt] Lỗi JSON (trì hoãn) ở file ${file}:`, e.message);
              }
            }, 60 * 1000);
          }
        } catch (e) {
          console.error(`[checktt] Lỗi JSON ở file ${file}:`, e.message);
        }
      });
  }, 60 * 1000);
}

module.exports.handleEvent = async function ({ api, args, Users, event, Threads, }) {
  const threadInfo = await api.getThreadInfo(event.threadID)
    if (global.client.sending_top == true) return;
    const fs = global.nodemodule['fs'];
    const { threadID, senderID } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();

    if (!fs.existsSync(path + threadID + '.json')) {
        const newObj = {
            total: [],
            week: [],
            day: [],
            time: today
        };
        fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
        const threadInfo = await Threads.getInfo(threadID) || {};
        if (threadInfo.hasOwnProperty('isGroup') && threadInfo.isGroup) {
            const UserIDs = threadInfo.participantIDs;
            for (user of UserIDs) {
                if (!newObj.total.find(item => item.id == user)) {
                    newObj.total.push({
                        id: user,
                        count: 0
                    });
                }
                if (!newObj.week.find(item => item.id == user)) {
                    newObj.week.push({
                        id: user,
                        count: 0
                    });
                }
                if (!newObj.day.find(item => item.id == user)) {
                    newObj.day.push({
                        id: user,
                        count: 0
                    });
                }
            }
        }
        fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
    }
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    if (threadData.time != today) {
      global.client.sending_top = true;
      setTimeout(() => global.client.sending_top = false, 5 * 60 * 1000);
    }
    const userData_week_index = threadData.week.findIndex(e => e.id == senderID);
    const userData_day_index = threadData.day.findIndex(e => e.id == senderID);
    const userData_total_index = threadData.total.findIndex(e => e.id == senderID);
    if (userData_total_index == -1) {
        threadData.total.push({
            id: senderID,
            count: 1,
        });
    } else threadData.total[userData_total_index].count++;
    if (userData_week_index == -1) {
        threadData.week.push({
            id: senderID,
            count: 1
        });
    } else threadData.week[userData_week_index].count++;
    if (userData_day_index == -1) {
        threadData.day.push({
            id: senderID,
            count: 1
        });
    } else threadData.day[userData_day_index].count++;
      if (threadData.time != today) {
         threadData.day.forEach(e => {
             e.count = 0;
         });
         if (today == 1) {
             threadData.week.forEach(e => {
                e.count = 0;
           });
    }
        threadData.time = today;
    }

    fs.writeFileSync(path + threadID + '.json', JSON.stringify(threadData, null, 4));
}

module.exports.run = async function ({ api, event, args, Users, Threads }) {
  let threadInfo = await api.getThreadInfo(event.threadID);
    await new Promise(resolve => setTimeout(resolve, 500));
    const fs = global.nodemodule['fs'];
    const { threadID, messageID, senderID, mentions } = event;
    if (!fs.existsSync(path + threadID + '.json')) {
        return api.sendMessage("𝐂𝐡𝐮̛𝐚 𝐜𝐨́ 𝐭𝐡𝐨̂́𝐧𝐠 𝐤𝐞̂ 𝐝𝐮̛̃ 𝐥𝐢𝐞̣̂𝐮", threadID);
    }
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    const query = args[0] ? args[0].toLowerCase() : '';

    if(query == 'locmem') {
        const moment = require("moment-timezone");
        const today = moment.tz("Asia/Ho_Chi_Minh").day(); // 0 - CN, 6 - Thứ 7
      
        if (!threadInfo.adminIDs.some(e => e.id == senderID))
        return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID);

        const botID = api.getCurrentUserID();
if (!threadInfo.adminIDs.some(e => e.id == botID)) {
  return api.sendMessage("⚠️ Bot cần quyền quản trị viên để có thể lọc thành viên!\n👉 Hãy cấp quyền quản trị viên cho bot trước.", threadID);
}

        if (today !== 0 && today !== 6) {
          const thu = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
          return api.sendMessage(
            `Hôm nay là ${thu[today]}.\n📌 Dữ liệu lọc thành viên sẽ được đặt lại vào mỗi thứ Hai hàng tuần.\n👉 Bạn nên lọc vào Thứ Bảy hoặc Chủ Nhật để dữ liệu chính xác hơn.`,
            threadID
          );
        }
      
        if(!threadInfo.adminIDs.some(e => e.id == senderID))
          return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", threadID);
        if(!threadInfo.isGroup)
          return api.sendMessage("Chỉ có thể sử dụng trong nhóm.", threadID);
        if(!args[1] || isNaN(args[1]))
          return api.sendMessage("Vui lòng nhập số tin nhắn tối thiểu, ví dụ: #checktt locmem 5", threadID);
      
        const minCount = parseInt(args[1]);
        const allUser = threadInfo.participantIDs;
        const usersToRemove = [];
      
        for (let user of allUser) {
          if (user == api.getCurrentUserID()) continue;
          const userWeek = threadData.week.find(e => e.id == user);
          if (!userWeek || userWeek.count < minCount) {
            usersToRemove.push(user);
          }
        }
      
        if (usersToRemove.length === 0) {
            return api.sendMessage(`✅ Không có thành viên nào dưới ${minCount} tin nhắn.`, threadID);
          }
          
          let msg = `📊 Có ${usersToRemove.length} thành viên dưới ${minCount} tin nhắn trong 7 ngày gần đây:\n\n`;
let index = 1;

for (const uid of usersToRemove) {
  const name = (await api.getUserInfo(uid))[uid]?.name || "Không rõ tên";
  const userWeek = threadData.week.find(e => e.id == uid);
  const count = userWeek ? userWeek.count : 0;
  msg += `${index++} → ${name} : ${count} tin nhắn\n`;
}

          msg += `\n👉 Bạn có muốn lọc những thành viên này không?\nVui lòng reply vào tin nhắn này: "có" hoặc "không".`;
          
          api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
              type: "reply_locmem",
              name: this.config.name,
              messageID: info.messageID,
              author: senderID,
              threadID,
              usersToRemove,
              minCount
            });
          });
        return;
      }   

    var header = '',
        body = '',
        footer = '',
        msg = '',
        count = 1,
        storage = [],
        data = 0;
    if (query == 'all' || query == '-a') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗔𝗟𝗟===\n';
        data = threadData.total;
    } else if (query == 'week' || query == '-w') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗧𝗨𝗔̂̀𝗡===\n';
        data = threadData.week;
    } else if (query == 'day' || query == '-d') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗡𝗚𝗔̀𝗬===\n';
        data = threadData.day;
    } else {
        data = threadData.total;
    }
    for (const item of data) {
        const userName = await Users.getNameUser(item.id) || 'Tên không tồn tại';
        const itemToPush = item;
        itemToPush.name = userName;
        storage.push(itemToPush);
    };
    let check = ['all', '-a', 'week', '-w', 'day', '-d'].some(e => e == query);
    if (!check && Object.keys(mentions).length > 0) {
        storage = storage.filter(e => mentions.hasOwnProperty(e.id));
    }
    //sort by count from high to low if equal sort by name
    storage.sort((a, b) => {
        if (a.count > b.count) {
            return -1;
        }
        else if (a.count < b.count) {
            return 1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    if ((!check && Object.keys(mentions).length == 0) || (!check && Object.keys(mentions).length == 1) || (!check && event.type == 'message_reply')) {
        const UID = event.messageReply ? event.messageReply.senderID : Object.keys(mentions)[0] ? Object.keys(mentions)[0] : senderID;
        const userRank = storage.findIndex(e => e.id == UID);
        const userTotal = threadData.total.find(e => e.id == UID) ? threadData.total.find(e => e.id == UID).count : 0;
        const userTotalWeek = threadData.week.find(e => e.id == UID) ? threadData.week.find(e => e.id == UID).count : 0;
        const userTotalDay = threadData.day.find(e => e.id == UID) ? threadData.day.find(e => e.id == UID).count : 0;
        const nameUID = storage[userRank].name || 'Tên không tồn tại';
        const target = UID == senderID ? 'Bạn' : nameUID;
      const moment = require("moment-timezone");
  const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
      var permission;
        if (global.config.ADMINBOT.includes(UID)) permission = `Admin Bot`;
else if
(global.config.NDH.includes(UID)) 
permission = `Người Hỗ Trợ`; else if (threadInfo.adminIDs.some(i => i.id == UID)) permission = `Quản Trị Viên`; else permission = `Thành Viên`;
      var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = '𝐂𝐡𝐮̉ 𝐍𝐡𝐚̣̂𝐭'
  if (thu == 'Monday') thu = '𝐓𝐡𝐮̛́ 𝐇𝐚𝐢'
  if (thu == 'Tuesday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚'
  if (thu == 'Wednesday') thu = '𝐓𝐡𝐮̛́ 𝐓𝐮̛'
  if (thu == "Thursday") thu = '𝐓𝐡𝐮̛́ 𝐍𝐚̆𝐦'
  if (thu == 'Friday') thu = '𝐓𝐡𝐮̛́ 𝐒𝐚́𝐮'
  if (thu == 'Saturday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚̉𝐲'
      let threadName = threadInfo.threadName;
        if (userRank == -1) {
            return api.sendMessage(`→ ${target} chưa có thống kê dữ liệu`, threadID);
        }
        body +=
          `==== [ 𝗖𝗛𝗘𝗖𝗞 𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 ] ====\n━━━━━━━━━━━━━━━━━━\n\n[👤] → 𝗡𝗮𝗺𝗲: ${nameUID}\n[🌸] → 𝗜𝗗: ${UID}\n[💓] → 𝗖𝗵𝘂̛́𝗰 𝘃𝘂̣: ${permission}\n[🔰] → 𝗧𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadName}\n━━━━━━━━━━━━━━━━━━\n[💌] → 𝗧𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝘁𝗿𝗼𝗻𝗴 𝗻𝗴𝗮̀𝘆: ${userTotalDay}\n[💓] → 𝗛𝗮̣𝗻𝗴 𝘁𝗿𝗼𝗻𝗴 𝗻𝗴𝗮̀𝘆: ${count++}\n[💬] → 𝗧𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝘁𝗿𝗼𝗻𝗴 𝘁𝘂𝗮̂̀𝗻: ${userTotalWeek}\n[💝] → 𝗛𝗮̣𝗻𝗴 𝘁𝗿𝗼𝗻𝗴 𝘁𝘂𝗮̂̀𝗻: ${count++}\n[🌟] → 𝗧𝗼̂̉𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻: ${userTotal}\n[🥇] → 𝗛𝗮̣𝗻𝗴 𝘁𝗼̂̉𝗻𝗴:  ${userRank + 1}\n━━━━━━━━━━━━━━━━━━\n💢 𝗡𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘅𝗲𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗼́𝗺 𝗯𝗮̣𝗻 𝘁𝗵𝗮̉ 𝗰𝗮̉𝗺 𝘅𝘂́𝗰 "❤" 𝘃𝗮̀𝗼 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝗰𝘂̉𝗮 𝗯𝗼𝘁\n🌸 𝐏/𝐒: 𝐜𝐡𝐞𝐜𝐤𝐭𝐭 𝐝𝐚𝐲/𝐰𝐞𝐞𝐤/𝐚𝐥𝐥/𝐥𝐨𝐜𝐦𝐞𝐦`.replace(/^ +/gm, '');
    } else {
        body = storage.map(item => {
            return `${count++}. ${item.name} (${item.count})`;
        }).join('\n');
        footer = `→ Tổng Tin Nhắn: ${storage.reduce((a, b) => a + b.count, 0)}`;
    }
  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
};
    msg = `${header}\n${body}\n${footer}`;
    api.sendMessage({body: msg, attachment: [await streamURL(threadInfo.imageSrc), await streamURL(`
https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)]}, threadID, (err, info) => {
    global.client.handleReaction.push({
      name: this.config.name, 
      messageID: info.messageID,
      author: event.senderID,
    })
    },event.messageID);
                     }
module.exports.handleReaction = async ({ event, api, handleReaction, Currencies, Users}) => {
const axios = global.nodemodule["axios"];
const fs = global.nodemodule["fs-extra"];
const { threadID, messageID, userID } = event;
  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
};
  let threadInfo = await api.getThreadInfo(event.threadID);
  let threadName = threadInfo.threadName;
  let id = threadInfo.threadID;
  let sex = threadInfo.approvalMode;
  var pd = sex == false ? 'Tắt' : sex == true ? 'Bật' : '\n';
  let qtv = threadInfo.adminIDs.length;
let color = threadInfo.color;
  let icon = threadInfo.emoji;
  let threadMem = threadInfo.participantIDs.length;
if (event.userID != handleReaction.author) return;
if (event.reaction != "❤") return; 
 api.unsendMessage(handleReaction.messageID);
        var msg = `=====「 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 𝗡𝗛𝗢́𝗠 」=====\n\n🏘️ 𝗧𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadName}\n⚙️ 𝗜𝗗 𝗻𝗵𝗼́𝗺: ${id}\n👥 𝗦𝗼̂́ 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadMem}\n💞 𝗤𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻: ${qtv}\n🌷 𝗣𝗵𝗲̂ 𝗱𝘂𝘆𝗲̣̂𝘁: ${pd}\n😻 𝗕𝗶𝗲̂̉𝘂 𝘁𝘂̛𝗼̛̣𝗻𝗴 𝗰𝗮̉𝗺 𝘅𝘂́𝗰: ${icon ? icon : 'Không sử dụng'}\n💝 𝗠𝗮̃ 𝗴𝗶𝗮𝗼 𝗱𝗶𝗲̣̂𝗻: ${color}\n━━━━━━━━━━━━━━━━━━\n💭 𝗧𝗼̂̉𝗻𝗴 𝘀𝗼̂́ 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗰𝘂̉𝗮 𝗻𝗵𝗼́𝗺: ${threadInfo.messageCount}\n🌸 𝐏/𝐒: 𝐜𝐡𝐞𝐜𝐤𝐭𝐭 𝐝𝐚𝐲/𝐰𝐞𝐞𝐤/𝐚𝐥𝐥/𝐥𝐨𝐜𝐦𝐞𝐦 `
        return api.sendMessage({body: msg, attachment: await streamURL(threadInfo.imageSrc)},event.threadID,event.messageID);
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, senderID, messageID, body } = event;
  
    if (handleReply.type == "reply_locmem" && handleReply.author == senderID) {
      const answer = body.trim().toLowerCase();
      if (answer != "có" && answer != "co" && answer != "yes") {
        return api.sendMessage("lọc thành viên đã bị hủy bỏ.", threadID);
      }
  
      const fs = require("fs");
      const threadData = JSON.parse(fs.readFileSync(path + threadID + ".json"));
      const usersToRemove = handleReply.usersToRemove;
  
      api.sendMessage(`Bắt đầu xóa ${usersToRemove.length} thành viên...`, threadID, () => {
        let delay = 1000;
        for (let i = 0; i < usersToRemove.length; i++) {
          const user = usersToRemove[i];
          setTimeout(async () => {
            try {
              await api.removeUserFromGroup(user, threadID);
              for (let e in threadData) {
                if (Array.isArray(threadData[e])) {
                  threadData[e] = threadData[e].filter(item => item.id != user);
                }
              }
              fs.writeFileSync(path + threadID + ".json", JSON.stringify(threadData, null, 4));
      
              if (i === usersToRemove.length - 1) {
                api.sendMessage(` Hoàn thành! Đã xóa ${usersToRemove.length} thành viên dưới ${handleReply.minCount} tin nhắn.`, threadID);
              }
            } catch (e) {
              console.error(` Không thể xóa người dùng ${user}: ${e.message}`);
            }
          }, delay * i);
        }        
      });      
    }
  };