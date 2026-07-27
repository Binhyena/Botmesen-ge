const moment = require('moment-timezone');

module.exports.config = {
    name: "top",
    version: "1.1.1",
    credits: "Tác giả :Trần bình07",
    hasPermssion: 0,
    description: "Xem top money ở trong box hoặc server",
    usages: "[boxmoney|svmoney] + độ dài list (mặc định là 10)",
    commandCategory: "Tiện ích",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID: t, messageID: m, senderID: s, participantIDs: pI } = event;
    let arr = [], newArr = [], msg = "", type = args[0], leng = parseInt(args[1]) - 1 || 9;
    const allType = ["boxmoney", "svmoney"];
    if (!allType.includes(type)) return api.sendMessage(`>>>𝐂𝐇𝐄𝐂𝐊𝐓𝐎𝐏<<<\n-> #𝐭𝐨𝐩 𝐛𝐨𝐱𝐦𝐨𝐧𝐞𝐲: 𝐱𝐞𝐦 𝐭𝐨𝐩 𝐦𝐨𝐧𝐞𝐲 𝐭𝐫𝐨𝐧𝐠 𝐧𝐡𝐨́𝐦\n-> #𝐭𝐨𝐩 𝐬𝐯𝐦𝐨𝐧𝐞𝐲: 𝐱𝐞𝐦 𝐭𝐨𝐩 𝐦𝐨𝐧𝐞𝐲 𝐬𝐞𝐫𝐯𝐞𝐫`, t, m);
    if (isNaN(leng) && leng) return api.sendMessage(`➝ 𝐃𝐨̣̂ 𝐝𝐚̀𝐢 𝐥𝐢𝐬𝐭 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝟏 𝐜𝐨𝐧 𝐬𝐨̂́`, t, m);

    switch (type) {
        case "boxmoney": {
            for (const id of pI) {
                let data = await Currencies.getData(id);
                if (!data) continue;
                let money = data.money || 0;
                arr.push({ id: id, money: money });
            }
            arr.sort((a, b) => b.money - a.money);
            newArr = arr.slice(0, leng + 1);
            msg = `=== [ 𝐓𝐎𝐏 𝟏𝟎 𝐍𝐆𝐔̛𝐎̛̀𝐈 𝐆𝐈𝐀̀𝐔 ] ===\n━━━━━━━━━━━━━━━━━━\n`.toUpperCase();
            for (let i = 0; i < newArr.length; i++) {
                let name = (await Users.getData(newArr[i].id)).name || "";
                msg += `${i < 4 ? ICON(i) : `${i+1}.`} ${name}\n→ 𝐌𝐎𝐍𝐄𝐘: ${CC(newArr[i].money)}$\n`;
            }
            let find = newArr.find(i => i.id == s);
            if (find) msg += TX("money", find.stt, find.money);
            api.sendMessage(msg, t, m);
        }
        break;

        case "svmoney": {
            let get = await Currencies.getAll(['userID', 'money']);
            get.sort((a, b) => b.money - a.money);
            arr = get.slice(0, leng + 1).map((item, index) => ({ stt: index + 1, id: item.userID, money: item.money }));
            msg = `=== [ 𝐓𝐎𝐏 𝟏𝟎 𝐍𝐆𝐔̛𝐎̛̀𝐈 𝐆𝐈𝐀̀𝐔] ===\n━━━━━━━━━━━━━━━━━━\n`.toUpperCase();
            for (let i = 0; i < arr.length; i++) {
                let name = (await Users.getData(arr[i].id)).name || "";
                msg += `${i < 4 ? ICON(i) : `${i+1}.`} ${name}\n→ 𝐌𝐎𝐍𝐄𝐘: ${CC(arr[i].money)}$\n`;
            }
            let find = arr.find(i => i.id == s);
            if (find) msg += TX("money", find.stt, find.money);
            api.sendMessage(msg, t, m);
        }
        break;
    }
};

function CC(n) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function ICON(i) {
    return i == 0 ? "🏆" : i == 1 ? "🥇" : i == 2 ? "🥈" : i == 3 ? "🥉" : "";
}

function TX(tx, i, x) {
    return `━━━━━━━━━━━━━━━━━━\n${i >= 11 ? `→ 𝐁𝐚̣𝐧 𝐝𝐮̛́𝐧𝐠 𝐭𝐡𝐮̛́: ${i}\n➝ ${tx == "money" ? `𝐌𝐎𝐍𝐄𝐘: ${CC(x)}$` : `𝐋𝐞𝐯𝐞𝐥: ${LV(x)}`}` : i >= 1 && i <= 4 ? "→ 𝐁𝐚̣𝐧 𝐡𝐢𝐞̣̂𝐧 𝐝𝐚𝐧𝐠 𝐜𝐨́ 𝐦𝐚̣̆𝐭 𝐭𝐫𝐨𝐧𝐠 𝐓𝐎𝐏" : i == 0 ? "➝ 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̣𝐧 𝐥𝐚̀ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̛́𝐧𝐠 𝐓𝐎𝐏 𝐝𝐚̂̀𝐮 " : "→ 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̣𝐧 𝐝𝐚𝐧𝐠 𝐝𝐮̛́𝐧𝐠 𝐭𝐫𝐨𝐧𝐠 𝐓𝐎𝐏 𝟏𝟎"}`;
}
