module.exports = async (varz, m, body, from) => {
    switch(body.toLowerCase()) {
        case "!menu":
            const menuText = `
╔════════════《✧》════════════╗
         🤖 *BOT MENU*

📋 *Available Commands:*
• !ping
• !menu
• !sticker

Silakan pilih menu di atas!
╚════════════《✧》════════════╝
            `;
            await varz.sendMessage(from, { text: menuText });
            break;
    }
}