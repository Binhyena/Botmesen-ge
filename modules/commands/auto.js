const fs = require('fs-extra');
const pathReaction = __dirname + '/cache/data/autoreaction.txt';
const pathSeen = __dirname + '/cache/data/autoseen.txt';

// Tạo file mặc định nếu chưa tồn tại
if (!fs.existsSync(pathReaction)) {
  fs.writeFileSync(pathReaction, 'true');
}
if (!fs.existsSync(pathSeen)) {
  fs.writeFileSync(pathSeen, 'true');
}

module.exports.config = {
  name: "auto",
  version: "1.2.0",
  hasPermssion: 3,
  credits: "Tác giả :Trần bình07",
  description: "Tự động seen và/hoặc thả cảm xúc ngẫu nhiên",
  commandCategory: "Hệ Thống",
  usages: "reaction on/off | seen on/off",
  cooldowns: 5,
};

const messageStats = {};
const lastSeenTime = {};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    const isReactionEnabled = fs.readFileSync(pathReaction, 'utf-8').trim() === 'true';
    const isSeenEnabled = fs.readFileSync(pathSeen, 'utf-8').trim() === 'true';

    const { threadID, messageID, senderID } = event;
    const currentUserID = await api.getCurrentUserID();

    if (senderID === currentUserID) return; // Bỏ qua tin nhắn của bot

    // Tự động thả cảm xúc
    if (isReactionEnabled) {
      if (!messageStats[threadID]) {
        messageStats[threadID] = {
          count: 0,
          threshold: Math.floor(Math.random() * 16) + 15,
        };
      }

      messageStats[threadID].count++;

      if (messageStats[threadID].count >= messageStats[threadID].threshold) {
        const reactions = ['😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

        messageStats[threadID] = {
          count: 0,
          threshold: Math.floor(Math.random() * 16) + 15,
        };

        try {
          await new Promise((resolve, reject) => {
            api.setMessageReaction(randomReaction, messageID, true, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        } catch (err) {
          console.error(`[ERROR] Không thể thả cảm xúc ở threadID: ${threadID}`, err);
        }
      }
    }

    // Tự động seen tin nhắn
    // Tự động seen tin nhắn với delay
if (isSeenEnabled) {
  const currentTime = Date.now();
  const delayTime = 120000;

  if (!lastSeenTime[threadID] || currentTime - lastSeenTime[threadID] >= delayTime) {
    try {
      await api.markAsReadAll(threadID);
      lastSeenTime[threadID] = currentTime;
    } catch (err) {
    }
  } else {
  }
}
  } catch (e) {
    console.error(`[ERROR] Xử lý sự kiện thất bại`, e);
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  try {
    if (args[0] === 'reaction') {
      if (args[1] === 'on') {
        fs.writeFileSync(pathReaction, 'true');
        api.sendMessage('✅ Đã bật tự động thả cảm xúc.', threadID, messageID);
      } else if (args[1] === 'off') {
        fs.writeFileSync(pathReaction, 'false');
        api.sendMessage('🛑 Đã tắt tự động thả cảm xúc.', threadID, messageID);
      } else {
        api.sendMessage('⚠️ Sai cú pháp. Vui lòng sử dụng:\n-reaction on: Bật tự động thả cảm xúc\n-reaction off: Tắt tự động thả cảm xúc.', threadID, messageID);
      }
    } else if (args[0] === 'seen') {
      if (args[1] === 'on') {
        fs.writeFileSync(pathSeen, 'true');
        api.sendMessage('✅ Đã bật tự động seen tin nhắn.', threadID, messageID);
      } else if (args[1] === 'off') {
        fs.writeFileSync(pathSeen, 'false');
        api.sendMessage('🛑 Đã tắt tự động seen tin nhắn.', threadID, messageID);
      } else {
        api.sendMessage('⚠️ Sai cú pháp. Vui lòng sử dụng:\n-seen on: Bật tự động seen tin nhắn\n-seen off: Tắt tự động seen tin nhắn.', threadID, messageID);
      }
    } else {
      api.sendMessage(
        '⚠️ Sai cú pháp. Vui lòng sử dụng:\n-reaction on/off: Bật/tắt tự động thả cảm xúc\n-seen on/off: Bật/tắt tự động seen tin nhắn.',
        threadID,
        messageID
      );
    }
  } catch (e) {
    api.sendMessage("⚠️ Đã xảy ra lỗi khi thay đổi trạng thái.", threadID, messageID);
  }
};
