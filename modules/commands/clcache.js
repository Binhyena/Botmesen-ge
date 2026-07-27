module.exports.config = {
    name: "clcache",
    version: "0.0.2",
    hasPermssion: 3,
    credits: "Tác giả :Trần bình07",
    description: "Xóa bộ nhớ cache của bot",
    commandCategory: "Hệ Thống",
    usages: "Y/N",
    cooldowns: 5,
   };
   const fs = require('fs');
   module.exports.run = async function ({ api, event, args, utils }) {
    api.sendMessage('Bạn muốn xóa theo AI hay tự chọn Y/N', event.threadID, (e, info) => {
    global.client.handleReply.push({
    name: this.config.name,
    author: event.senderID,
    messageID: info.messageID
    });
    });
   }
   module.exports.handleReply = async function ({ api, event, args, handleReply }) {
    if (handleReply.type === 'n') {
    var a = [],
    success = [],
    txt = event.body.split(' ');
    for (const type of txt) {
    a.push(type);
    const fileb = fs
    .readdirSync(__dirname + `/cache`)
    .filter((file) => file.endsWith(`.` + type));
    for (const filec of fileb) {
    try {
    fs.unlinkSync(__dirname + `/cache/` + filec);
    success.push(filec);
    } catch {
    api.sendMessage("[ ERROR ] - Lỗi khi xóa lưu trữ: " + filec, event.threadID);
    }
    }
    }
    if (success.length === 0) {
    return api.sendMessage(`[ CLEAR ] - Bộ nhớ của bạn đã được xóa trước đó ❎`, event.threadID);
    }
    api.sendMessage(`[ CLEAR ] - Xóa lưu trữ thành công ☑️`, event.threadID);
    }
   
    switch (event.args[0]) {
    case 'y':
    case 'Y': {
    const a = [],
    success = [],
    txt = ["png", "jpg", "mp4", "jpeg", "gif", "m4a", "txt", "mp3", "wav"];
    for (const type of txt) {
    a.push(type);
    const fileb = fs
    .readdirSync(__dirname + `/cache`)
    .filter((file) => file.endsWith(`.` + type));
    for (const filec of fileb) {
    try {
    fs.unlinkSync(__dirname + `/cache/` + filec);
    success.push(filec);
    } catch {
    api.sendMessage("[ ERROR ] - Lỗi khi xóa lưu trữ: " + filec, event.threadID);
    }
    }
    }
    if (success.length === 0) {
    return api.sendMessage(`[ CLEAR ] - Bộ nhớ của bạn đã được xóa trước đó ❎`, event.threadID);
    }
    api.sendMessage(`[ CLEAR ] - Xóa lưu trữ thành công ☑️`, event.threadID);
    }
    break;
    case 'n':
    case 'N': {
    api.sendMessage('📌 Vui lòng trả lời những loại tệp cần xóa\nVí dụ: mp3 mp4', event.threadID, (e, info) => {
    global.client.handleReply.push({
    type: 'n',
    name: this.config.name,
    author: event.senderID,
    messageID: info.messageID
    });
    });
    }
    }
   }