// ===============================
// 📁 FILE: MENU/ytVideo.js
// ===============================

const ytdl = require("@distube/ytdl-core"); // pastikan sudah install: npm install @distube/ytdl-core

/**
 * Download video dari YouTube
 * @param {string} query - Link atau judul video YouTube
 * @returns {Promise<{title: string, url: string, buffer: Buffer}>}
 */
async function downloadYouTubeVideo(query) {
    try {
        // Jika user kirim link langsung
        let videoUrl = query;
        if (!ytdl.validateURL(query)) {
            // Kalau bukan link, cari otomatis
            const ytSearch = await import("yt-search");
            const res = await ytSearch.default(query);
            if (!res.videos.length) throw new Error("Video tidak ditemukan!");
            videoUrl = res.videos[0].url;
        }

        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;

        // Ambil stream video dengan kualitas rendah agar cepat dikirim
        const stream = ytdl(videoUrl, { filter: "videoandaudio", quality: "lowest" });

        // Ubah stream ke buffer
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);

        return { title, url: videoUrl, buffer };
    } catch (error) {
        console.error("YT Download Error:", error);
        throw new Error("Gagal download video dari YouTube!");
    }
}

module.exports = { downloadYouTubeVideo };
