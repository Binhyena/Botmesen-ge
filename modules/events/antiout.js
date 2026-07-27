module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "0.0.1",
    credits: "Tác giả :Trần bình07",
    description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    if (!data.antiout) return;
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
    const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "tự rời" : "bị quản trị viên đuổi";
    if (type == "tự rời") {
        api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
            if (error) {
                api.sendMessage(`[ANTIOUT] 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐦𝐨̛̀𝐢 ${name} 𝐯𝐚̀𝐨 𝐥𝐚̣𝐢 𝐧𝐡𝐨́𝐦 `, event.threadID)
            } else api.sendMessage(`[ANTIOUT] 𝐃𝐚̃ 𝐦𝐨̛̀𝐢 ${name} 𝐯𝐚̀𝐨 𝐥𝐚̣𝐢 𝐧𝐡𝐨́𝐦`, event.threadID);
        })
    }
}