// ===============================
// 📁 FILE: MENU/ytAudio.js
// ===============================

const ytdl = require("@distube/ytdl-core");

/**
 * Download audio dari YouTube
 * @param {string} query - Link atau judul YouTube
 * @returns {Promise<{title: string, url: string, buffer: Buffer}>}
 */
async function downloadYouTubeAudio(query) {
    try {
        // Jika bukan URL langsung, cari video dulu
        let videoUrl = query;
        if (!ytdl.validateURL(query)) {
            const ytSearch = await import("yt-search");
            const res = await ytSearch.default(query);
            if (!res.videos.length) throw new Error("Video tidak ditemukan!");
            videoUrl = res.videos[0].url;
        }

        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;

        // Ambil stream audio saja
        const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });

        // Ubah stream jadi buffer
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        return { title, url: videoUrl, buffer };
    } catch (error) {
        console.error("YT Audio Error:", error);
        throw new Error("Gagal download audio dari YouTube!");
    }
}

module.exports = { downloadYouTubeAudio };