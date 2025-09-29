module.exports = async(varz, m, body, from) => {
    switch(body.toLowerCase()) {
        case "menu":
            await varz.sendMessage(from, { text: "MENU:\n\n- !menu\n- !ping\n- !sticker\n- !ytmp3 < link >\n- !ytmp4 < link >"}, { quoted: m})
            break;
    }
}