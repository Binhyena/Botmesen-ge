const { readdirSync, statSync, unlinkSync, rmdirSync, createReadStream } = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'allfile',
    version: '1.1.1',
    hasPermssion: 3,
    credits: "Tác giả :Trần bình07",
    description: 'Xem item trong folder, xóa, xem file',
    commandCategory: 'Hệ Thống',
    usages: '[đường dẫn]',
    cooldowns: 0,
};

module.exports.run = function({ api, event, args }) {
    openFolder(api, event, path.resolve(process.cwd(), args[0] || ''));
};

module.exports.handleReply = function({ handleReply, api, event }) {
    if (event.senderID != handleReply.author) return;

    const command = event.body.split(' ')[0].toLowerCase();
    const indices = event.body.split(' ').slice(1).map(i => parseInt(i, 10) - 1);

    switch (command) {
        case 'open':
            if (indices.length === 1 && handleReply.data[indices[0]].info.isDirectory()) {
                openFolder(api, event, handleReply.data[indices[0]].dest);
            } else {
                api.sendMessage('Vui lòng cung cấp một chỉ mục thư mục hợp lệ.', event.threadID, event.messageID);
            }
            break;

        case 'del':
            const deletedFiles = [];
            const deletedFolders = [];

            indices.forEach(i => {
                const { dest, info } = handleReply.data[i];
                if (info.isFile()) {
                    unlinkSync(dest);
                    deletedFiles.push(path.basename(dest));
                } else if (info.isDirectory()) {
                    rmdirSync(dest, { recursive: true });
                    deletedFolders.push(path.basename(dest));
                }
            });

            const response = `✅ Đã xóa các tệp: ${deletedFiles.join(', ')}\n` +
                             `✅ Đã xóa các thư mục: ${deletedFolders.join(', ')}`;
            api.sendMessage(response, event.threadID, event.messageID);
            break;

        case 'view':
            if (indices.length === 1 && handleReply.data[indices[0]].info.isFile()) {
                api.sendMessage({
                    attachment: createReadStream(handleReply.data[indices[0]].dest)
                }, event.threadID, event.messageID);
            } else {
                api.sendMessage('Vui lòng cung cấp một chỉ mục tệp hợp lệ.', event.threadID, event.messageID);
            }
            break;

        default:
            api.sendMessage(`📌 Reply [ open | del | view ] + số chỉ mục`, event.threadID, event.messageID);
            break;
    }
};

function convertBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
}

function openFolder(api, event, folderPath) {
    try {
        const files = readdirSync(folderPath);
        const fileList = [];
        let message = '';
        let totalSize = 0;

        files.forEach((file, index) => {
            const fullPath = path.join(folderPath, file);
            const info = statSync(fullPath);
            const fileType = info.isFile() ? '📄' : info.isDirectory() ? '📁' : '';
            const fileSize = info.isDirectory() ? getFolderSize(fullPath) : info.size;
            totalSize += fileSize;
            message += `${index + 1}. ${fileType} - ${file} (${convertBytes(fileSize)})\n`;
            fileList.push({ dest: fullPath, info });
        });

        message += `\n📌 Tổng dung lượng: ${convertBytes(totalSize)}\n`;
        message += '\n📌 Reply [ open | del | view ] + số chỉ mục';

        api.sendMessage(message, event.threadID, (err, data) => {
            if (err) return console.error(err);
            global.client.handleReply.push({
                name: 'allfile',
                messageID: data.messageID,
                author: event.senderID,
                data: fileList
            });
        }, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.', event.threadID, event.messageID);
    }
}

function getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(directory) {
        const files = readdirSync(directory);

        files.forEach(file => {
            const fullPath = path.join(directory, file);
            const stats = statSync(fullPath);

            if (stats.isDirectory()) {
                calculateSize(fullPath);
            } else {
                totalSize += stats.size;
            }
        });
    }

    calculateSize(folderPath);
    return totalSize;
}
