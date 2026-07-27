module.exports.config = {
    name: 'menu',
    version: '2.0.0',
    hasPermssion: 0,
    credits: "Tác giả :Trần bình07",
    description: 'Xem danh sách nhóm lệnh, thông tin lệnh',
    commandCategory: 'Danh sách lệnh',
    usages: '[...name commands|all|per <permission level>]',
    cooldowns: 5,
    envConfig: {
        autoUnsend: {
            status: true,
            timeOut: 60
        },
        sendAttachments: {
            status: true,
            random: true,
            url: 'https://i.imgur.com/LKkw8SL.jpg'
        }
    }
};

const {
    autoUnsend = module.exports.config.envConfig.autoUnsend,
    sendAttachments = module.exports.config.envConfig.sendAttachments
} = global.config == undefined ? {} : global.config.menu == undefined ? {} : global.config.menu;

const { compareTwoStrings, findBestMatch } = require('string-similarity');
const { readFileSync, writeFileSync, existsSync } = require('fs-extra');

// ─── ANIME STYLE HELPERS ───────────────────────────────────────────────────

const ICONS = {
    star:   "✦",
    dot:    "◈",
    arrow:  "➤",
    sword:  "⚔️",
    sakura: "🌸",
    moon:   "🌙",
    crown:  "👑",
    scroll: "📜",
    katana: "🗡️",
    spirit: "⚡",
    eye:    "👁️",
    heart:  "💮",
    flame:  "🔥",
    gem:    "💎",
    bot:    "🤖",
    time:   "⏳",
    perm:   "🛡️",
    ver:    "📌",
    use:    "📖",
    cat:    "🗂️",
    info:   "💠",
};

function line(char = "━", len = 30) {
    return char.repeat(len);
}

function center(text, width = 32) {
    const visLen = text.replace(/[^\x00-\x7F]/g, "xx").length;
    const pad = Math.max(0, Math.floor((width - visLen) / 2));
    return " ".repeat(pad) + text;
}

// ─── MAIN MENU (category list) ─────────────────────────────────────────────
function buildMainMenu(data, totalCmds, botName, prefix) {
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    let txt = "";
    txt += `╔══════════════════════════╗\n`;
    txt += `║  ${ICONS.sakura} ${center("MENU HỆ THỐNG", 22)}${ICONS.sakura}  ║\n`;
    txt += `╠══════════════════════════╣\n`;
    txt += `║  ${ICONS.bot} Bot   : ${botName}\n`;
    txt += `║  ${ICONS.star} Prefix: [ ${prefix} ]\n`;
    txt += `║  ${ICONS.gem} Lệnh  : ${totalCmds} lệnh\n`;
    txt += `╠══════════════════════════╣\n`;
    txt += `║  ${ICONS.scroll} DANH SÁCH NHÓM LỆNH\n`;
    txt += `╠══════════════════════════╣\n`;

    let count = 0;
    for (const { commandCategory, commandsName } of data) {
        count++;
        const bar = buildMiniBar(commandsName.length, totalCmds);
        txt += `║ ${ICONS.dot} ${count}. ${commandCategory}\n`;
        txt += `║    ${bar} (${commandsName.length})\n`;
    }

    txt += `╠══════════════════════════╣\n`;
    txt += `║  ${ICONS.arrow} Reply số để xem lệnh\n`;
    txt += `║  ${ICONS.time} Tự xóa sau: 60 giây\n`;
    txt += `║  ${ICONS.moon} ${now}\n`;
    txt += `╚══════════════════════════╝`;
    return txt;
}

function buildMiniBar(count, total) {
    const filled = Math.round((count / total) * 10);
    return "▰".repeat(filled) + "▱".repeat(10 - filled);
}

// ─── CATEGORY DETAIL (command list inside a group) ─────────────────────────
function buildCategoryMenu(category, commandsName, prefix) {
    let txt = "";
    txt += `╔══════════════════════════╗\n`;
    txt += `║ ${ICONS.flame} ${category}\n`;
    txt += `╠══════════════════════════╣\n`;

    commandsName.forEach((name, i) => {
        const icon = i % 2 === 0 ? ICONS.star : ICONS.dot;
        txt += `║ ${icon} ${i + 1}. ${prefix}${name}\n`;
    });

    txt += `╠══════════════════════════╣\n`;
    txt += `║ ${ICONS.arrow} Reply số để xem chi tiết\n`;
    txt += `║ ${ICONS.time} Tự xóa sau: 60 giây\n`;
    txt += `╚══════════════════════════╝`;
    return txt;
}

// ─── COMMAND INFO ──────────────────────────────────────────────────────────
function buildCommandInfo(a) {
    let txt = "";
    txt += `╔══════════════════════════╗\n`;
    txt += `║ ${ICONS.sword} ${a.name.toUpperCase()}\n`;
    txt += `╠══════════════════════════╣\n`;
    txt += `║ ${ICONS.ver}  Phiên bản : ${a.version}\n`;
    txt += `║ ${ICONS.perm}  Quyền hạn : ${premssionTxt(a.hasPermssion)}\n`;
    txt += `║ ${ICONS.crown}  Tác giả   : ${a.credits}\n`;
    txt += `║ ${ICONS.cat}  Nhóm      : ${a.commandCategory}\n`;
    txt += `║ ${ICONS.info}  Mô tả     :\n`;
    txt += `║   ${a.description}\n`;
    txt += `║ ${ICONS.use}  Cách dùng :\n`;
    txt += `║   ${a.usages}\n`;
    txt += `║ ${ICONS.time}  Cooldown  : ${a.cooldowns}s\n`;
    txt += `╚══════════════════════════╝`;
    return txt;
}

// ─── ALL COMMANDS LIST ─────────────────────────────────────────────────────
function buildAllMenu(cmds, prefix) {
    let txt = `╔══════════════════════════╗\n`;
    txt += `║ ${ICONS.sakura} TẤT CẢ LỆNH\n`;
    txt += `╠══════════════════════════╣\n`;
    let count = 0;
    for (const cmd of cmds) {
        count++;
        txt += `║ ${ICONS.dot} ${count}. ${prefix}${cmd.config.name}\n`;
        txt += `║    ↳ ${cmd.config.description}\n`;
    }
    txt += `╚══════════════════════════╝`;
    return txt;
}

// ─── MODULE EXPORTS ────────────────────────────────────────────────────────

module.exports.run = async function({ api, event, args }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const cmds = global.client.commands;
    const isAdmin = global.config.ADMINBOT.includes(sid);
    const pfx = prefix(tid);
    const botName = global.config.BOTNAME || "Bot";

    if (args.length >= 1) {
        // per <level>
        if (args[0] === 'per' && !isNaN(args[1])) {
            const permissionLevel = parseInt(args[1]);
            const filteredCmds = filterCommandsByPermission(cmds.values(), permissionLevel);
            let txt = `╔══════════════════════════╗\n`;
            txt += `║ ${ICONS.perm} QUYỀN CẤP ${permissionLevel}\n`;
            txt += `╠══════════════════════════╣\n`;
            let count = 0;
            for (const cmd of filteredCmds) {
                txt += `║ ${ICONS.dot} ${++count}. ${pfx}${cmd.config.name}\n`;
                txt += `║    ↳ ${cmd.config.description}\n`;
            }
            txt += `╚══════════════════════════╝`;
            const msg = sendAttachments.status ? { body: txt } : txt;
            return send(msg, tid, (a, b) => autoUnsend.status ? setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID) : '');
        }

        // exact command name
        if (typeof cmds.get(args.join(' ')) == 'object') {
            const body = buildCommandInfo(cmds.get(args.join(' ')).config);
            const msg = sendAttachments.status ? { body } : body;
            return send(msg, tid, mid);
        } else {
            if (args[0] == 'all') {
                const data = filterCommands(cmds.values(), isAdmin);
                const txt = buildAllMenu(data, pfx);
                const msg = sendAttachments.status ? { body: txt } : txt;
                return send(msg, tid, (a, b) => autoUnsend.status ? setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID) : '');
            } else {
                const cmdsValue = filterCommands(cmds.values(), isAdmin);
                const arrayCmds = [];
                for (const cmd of cmdsValue) arrayCmds.push(cmd.config.name);
                const similarly = findBestMatch(args.join(' '), arrayCmds);
                if (similarly.bestMatch.rating >= 0.3) {
                    const txt = `${ICONS.eye} Bạn muốn dùng lệnh "${similarly.bestMatch.target}" không?`;
                    return send(txt, tid, mid);
                }
            }
        }
    } else {
        const data = commandsGroup(isAdmin);
        const totalCmds = data.reduce((acc, cur) => acc + cur.commandsName.length, 0);
        const txt = buildMainMenu(data, totalCmds, botName, pfx);
        const msg = sendAttachments.status ? { body: txt } : txt;
        send(msg, tid, (a, b) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: b.messageID,
                author: sid,
                'case': 'infoGr',
                data
            });
            if (autoUnsend.status) setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID);
        });
    }
};

module.exports.handleReply = async function({ handleReply: $, api, event }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid, args } = event;
    const isAdmin = global.config.ADMINBOT.includes(sid);
    const pfx = prefix(tid);

    if (sid != $.author) {
        const msg = `${ICONS.eye} Đây không phải menu của bạn!`;
        return send(msg, tid, mid);
    }

    switch ($.case) {
        case 'infoGr': {
            const data = $.data[(+args[0]) - 1];
            if (data == undefined) {
                const txt = `${ICONS.eye} "${args[0]}" không hợp lệ, hãy chọn số trong menu.`;
                return send(txt, tid, mid);
            }
            un($.messageID);
            const txt = buildCategoryMenu(data.commandCategory, data.commandsName, pfx);
            const msg = sendAttachments.status ? { body: txt } : txt;
            send(msg, tid, (a, b) => {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: b.messageID,
                    author: sid,
                    'case': 'infoCmds',
                    data: data.commandsName
                });
                if (autoUnsend.status) setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID);
            });
            break;
        }

        case 'infoCmds': {
            const data = global.client.commands.get($.data[(+args[0]) - 1]);
            if (typeof data != 'object') {
                const txt = `${ICONS.eye} "${args[0]}" không hợp lệ, hãy chọn số trong danh sách.`;
                return send(txt, tid, mid);
            }
            un($.messageID);
            const { config = {} } = data || {};
            const body = buildCommandInfo(config);
            const msg = sendAttachments.status ? { body } : body;
            send(msg, tid, mid);
            break;
        }

        default:
            break;
    }
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

function filterCommands(commands, isAdmin) {
    return Array.from(commands).filter(cmd => {
        const { commandCategory, hasPermssion } = cmd.config;
        if (isAdmin) return true;
        return commandCategory !== 'Hệ Thống' && hasPermssion < 2;
    });
}

function filterCommandsByPermission(commands, permissionLevel) {
    return Array.from(commands).filter(cmd => cmd.config.hasPermssion === permissionLevel);
}

function commandsGroup(isAdmin) {
    const array = [],
        cmds = filterCommands(global.client.commands.values(), isAdmin);
    for (const cmd of cmds) {
        const { name, commandCategory } = cmd.config;
        const find = array.find(i => i.commandCategory == commandCategory);
        !find ? array.push({ commandCategory, commandsName: [name] }) : find.commandsName.push(name);
    }
    array.sort(sortCompare('commandsName'));
    return array;
}

function premssionTxt(a) {
    return a == 0 ? '👤 Thành Viên' : a == 1 ? '🛡️ Quản Trị Viên Nhóm' : a == 2 ? '⚔️ Người Điều Hành Bot' : '👑 ADMINBOT';
}

function prefix(a) {
    const tidData = global.data.threadData.get(a) || {};
    return tidData.PREFIX || global.config.PREFIX;
}

function sortCompare(k) {
    return function(a, b) {
        return (a[k].length > b[k].length ? 1 : a[k].length < b[k].length ? -1 : 0) * -1;
    };
}
