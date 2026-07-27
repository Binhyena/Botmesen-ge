module.exports.config = {
  name: "restart",
  version: "2.0.2",
  hasPermssion: 3,
  credits: "Tác giả :Trần bình07",
  description: "Khởi động lại bot",
  commandCategory: "Hệ Thống",
  usages: "restart",
  cooldowns: 5,
  dependencies: {}
}

module.exports.run = async function({ api, args, Users, event }) {
  const { threadID, messageID, senderID } = event;
  const axios = global.nodemodule["axios"];
  const moment = require("moment-timezone");
  const fs = require("fs");

  if (!global.config.ADMINBOT.includes(event.senderID.toString())) {
    return api.sendMessage(`» 𝐁𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐨́ 𝐪𝐮𝐲𝐞̂̀𝐧`, event.threadID, event.messageID);
}

  let name = await Users.getNameUser(event.senderID);
  var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH");
  var phut = moment.tz("Asia/Ho_Chi_Minh").format("mm");
  var giay = moment.tz("Asia/Ho_Chi_Minh").format("ss");

  if (args.length == 0) {
      api.sendMessage(`Đã nhận lệnh restart từ ADMIN vui lòng đợi!!!`, event.threadID, () => process.exit(1));
  } else {
      let time = args.join(" ");
      setTimeout(() => 
          api.sendMessage(`Bot sẽ khởi động lại sau: ${time}s\n[⏰] Bây giờ là: ${gio}:${phut}:${giay}`, threadID), 0
      );
      setTimeout(() => 
          api.sendMessage("Bắt đầu khởi động lại...", event.threadID, () => process.exit(1)), 
          1000 * `${time}`
      );
  }
};
