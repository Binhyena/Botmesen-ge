module.exports.config = {
	name: "autosetname",
	eventType: ["log:subscribe"],
	version: "1.0.3",
	credits: "Tác giả :Trần bình07",
	description: "Tự động set biệt danh thành viên mới"
};

module.exports.run = async function({ Threads, api, event, Users }) {
  const { createReadStream, existsSync, mkdirSync, readdirSync } = global.nodemodule["fs-extra"];
  const { join } =  global.nodemodule["path"];
const { threadID } = event;
var memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId)
	for (let idUser of memJoin) {
		const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
		const { join } = global.nodemodule["path"]
		const pathData = join("./modules/commands","data", "autosetname.json");
		var dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
		var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };
		if (thisThread.nameUser.length == 0) return 
		if (thisThread.nameUser.length != 0) {  
		var setName = thisThread.nameUser[0] 
		await new Promise(resolve => setTimeout(resolve, 1000));
		var namee1 = await api.getUserInfo(idUser)
        var namee = namee1[idUser].name
		api.changeNickname(`${setName}`, threadID, idUser);
		} 
	}
	return api.sendMessage({body:
    `𝐁𝐨𝐭 𝐯𝐮̛̀𝐚 𝐬𝐞𝐭 𝐛𝐢𝐞̣̂𝐭 𝐝𝐚𝐧𝐡 𝐭𝐚̣𝐦 𝐭𝐡𝐨̛̀𝐢 𝐜𝐡𝐨 𝐭𝐡𝐚̀𝐧𝐡 𝐯𝐢𝐞̂𝐧 𝐦𝐨̛́𝐢`}, threadID, event.messageID)
}