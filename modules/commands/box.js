module.exports.config = {
  name: "box",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Tác giả :Trần bình07",
  description: "Cài đặt và thông tin nhóm",
  commandCategory: "Quản Lí Box",
  usages: "<id/name/setname/setnameall/me qtv/setqtv/emoji/image/info>",
  cooldowns: 1,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
};

const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports.run = async ({ api, event, args, Threads }) => {
  const threadInfo = await api.getThreadInfo(event.threadID);

  if (!args[0]) {
    return api.sendMessage(
      `====『 BOX CONFIG 』====\n
1. box id: Lấy ID nhóm
2. box name: Lấy tên nhóm
3. box me setqtv: Thêm bạn làm quản trị viên
4. box setqtv <tag/response>: Thêm người dùng làm quản trị viên
5. box emoji <icon>: Đổi biểu tượng nhóm
6. box image <phản hồi ảnh>: Đổi ảnh nhóm
7. box info: Lấy thông tin nhóm`,
      event.threadID
    );
  }

  switch (args[0]) {
    case "id":
      return api.sendMessage(`ID nhóm: ${event.threadID}`, event.threadID);

    case "name":
      return api.sendMessage(
        `Tên nhóm: ${threadInfo.threadName}`,
        event.threadID
      );

    case "me":
      if (args[1] === "setqtv") {
        if (!global.config.ADMINBOT.includes(event.senderID)) {
          return api.sendMessage(
            "❌ Bạn không có quyền để tự thêm mình làm quản trị viên nhóm.",
            event.threadID
          );
        }
        api.changeAdminStatus(event.threadID, event.senderID, true, (err) => {
          if (err) {
            return api.sendMessage(
              "❌ Không thể thêm bạn làm quản trị viên nhóm.",
              event.threadID
            );
          }
          api.sendMessage(
            "✅ Đã thêm bạn làm quản trị viên nhóm.",
            event.threadID
          );
        });
      }
      break;

    case "setqtv":
      if (!threadInfo.adminIDs.some(admin => admin.id === event.senderID)) {
        return api.sendMessage(
          "❌ Chỉ quản trị viên nhóm mới có thể sử dụng lệnh này.",
          event.threadID,
          event.messageID
        );
      }
      const adminID = event.messageReply
        ? event.messageReply.senderID
        : Object.keys(event.mentions)[0];

      if (!adminID) {
        return api.sendMessage(
          "❌ Vui lòng tag thành viên hoặc reply tin nhắn để thêm người đó làm quản trị viên.",
          event.threadID,
          event.messageID
        );
      }
      api.changeAdminStatus(event.threadID, adminID, true, (err) => {
        if (err) {
          return api.sendMessage(
            "❌ Không thể thêm người dùng làm quản trị viên.",
            event.threadID,
            event.messageID
          );
        }
        api.sendMessage(
          "✅ Đã thêm người dùng làm quản trị viên nhóm.",
          event.threadID,
          event.messageID
        );
      });
      break;

    case "emoji":
      const emoji = args[1];
      if (!emoji)
        return api.sendMessage("Vui lòng nhập biểu tượng mới.", event.threadID);

      api.changeThreadEmoji(emoji, event.threadID, (err) => {
        if (err)
          return api.sendMessage(
            "Không thể đổi biểu tượng nhóm.",
            event.threadID
          );
        api.sendMessage("Đã đổi biểu tượng nhóm.", event.threadID);
      });
      break;

    case "image":
      if (
        event.type !== "message_reply" ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0
      )
        return api.sendMessage(
          "Bạn cần reply một ảnh để đổi ảnh nhóm.",
          event.threadID
        );

      const imagePath = __dirname + "/cache/group_image.png";
      const imageURL = event.messageReply.attachments[0].url;

      request(imageURL)
        .pipe(fs.createWriteStream(imagePath))
        .on("close", () =>
          api.changeGroupImage(
            fs.createReadStream(imagePath),
            event.threadID,
            () => fs.unlinkSync(imagePath)
          )
        );

      return api.sendMessage("Đang cập nhật ảnh nhóm...", event.threadID);

    case "info":
      const admins = threadInfo.adminIDs.map(admin => admin.id);
      const totalAdmins = admins.length;
      const maleMembers = threadInfo.userInfo.filter(user => user.gender === "MALE").length;
      const femaleMembers = threadInfo.userInfo.filter(user => user.gender === "FEMALE").length;

      const prefix = global.config.PREFIX; 

      const groupImageURL = threadInfo.imageSrc;
      const imagePath1 = __dirname + "/cache/group_image1.png";

      const groupInfoMessage = 
        `=== [ Thông Tin Nhóm ] ===\n\n` +
        `🌐 Tên nhóm: ${threadInfo.threadName}\n` +
        `🆔 ID nhóm: ${event.threadID}\n` +
        `👥 Thành viên: ${threadInfo.participantIDs.length}\n` +
        `👨 Nam: ${maleMembers}\n` +
        `👩 Nữ: ${femaleMembers}\n` +
        `🛡️ Quản trị viên: ${totalAdmins}\n` +
        `🔑 Prefix: ${prefix}\n` +
        `💬 Tổng số tin nhắn: ${threadInfo.messageCount}`;

      if (groupImageURL) {
        try {
          const response = await axios.get(groupImageURL, { responseType: "arraybuffer" });
          if (response.status === 200) {
            fs.writeFileSync(imagePath1, response.data);
            api.sendMessage(
              {
                body: groupInfoMessage,
                attachment: fs.createReadStream(imagePath1),
              },
              event.threadID,
              () => fs.unlinkSync(imagePath1)
            );
          }
        } catch (error) {}
      } else {
        api.sendMessage(groupInfoMessage, event.threadID);
      }
      break;

    default:
      return api.sendMessage(
        "Lệnh không hợp lệ. Vui lòng xem danh sách lệnh bằng cách '#box'.",
        event.threadID
      );
  }
};
