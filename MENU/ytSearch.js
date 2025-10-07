const ytSearch = require("yt-search");
const setting = require("../setting");
const bot = setting.bot;

/**
 * @param {string} query
 * @returns {string}
 */

async function searchYouTube(query) {
    if (!query) return "❌ Masukkan kata kunci untuk mencari video!";

    const result = await ytSearch(query);
    const videos = result.videos.slice(0, 5); // ambil 5 teratas

    if (!videos || videos.length === 0) {
        return `🔍 Tidak ditemukan hasil untuk: *${query}*`;
    }

    let text = `🔎 *Hasil pencarian YouTube untuk:* _${query}_\n\n`;

    videos.forEach((v, i) => {
        text += `🎬 *${i + 1}. ${v.title}*\n`;
        text += `📺 Channel: ${v.author.name}\n`;
        text += `⏱️ Durasi: ${v.timestamp}\n`;
        text += `📅 Upload: ${v.ago}\n`;
        text += `🔗 Link: ${v.url}\n\n`;
    });

    return text + `✨ Gunakan perintah ${bot.prefix}ytvideo <link> untuk download video.`;
}

module.exports = { searchYouTube };
