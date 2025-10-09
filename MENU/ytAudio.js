// ===============================
// 📁 FILE: MENU/ytAudio.js
// ===============================

const fs = require("fs");
const path = require("path");
const youtubedl = require("youtube-dl-exec");
const ytSearch = require("yt-search");
const { YtDlp } = require("ytdlp-nodejs"); // fallback

async function downloadYouTubeAudio(query) {
    try {
        let videoUrl = query;

        // Jika bukan URL langsung, cari dulu
        if (!/^https?:\/\/(www\.)?youtube\.com\/|youtu\.be\//.test(query)) {
            const res = await ytSearch(query);
            if (!res.videos || res.videos.length === 0) {
                throw new Error("🔍 Tidak ditemukan video untuk kata kunci itu!");
            }
            videoUrl = res.videos[0].url;
        }

        // Gunakan youtube-dl-exec / yt-dlp sebagai prioritas
        const tempFileName = `audio_${Date.now()}.m4a`;
        const tempPath = path.join(__dirname, tempFileName);

        // Download metadata dulu
        const meta = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            addHeader: [
                "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "referer: https://www.youtube.com"
            ],
        });

        const title = meta.title || "audio_youtube";

        // Download audio saja
        await youtubedl(videoUrl, {
            extractAudio: true,
            audioFormat: "m4a", 
            // bisa juga 'mp3' tapi kadang perlu konversi
            output: tempPath,
            // tambahan header
            addHeader: [
                "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "referer: https://www.youtube.com"
            ],
        });

        // Baca buffer
        const buffer = fs.readFileSync(tempPath);
        // hapus file sementara
        fs.unlinkSync(tempPath);

        return { title, url: videoUrl, buffer };

    } catch (err) {
        console.warn("youtube-dl-exec gagal, coba fallback:", err.message);

        // Fallback ke ytdlp-nodejs
        try {
            const ytdlp = new YtDlp();
            const output = await ytdlp.downloadAsync(query, {
                filter: "audioonly",
                quality: "highestaudio",
            });
            // output.path adalah path file yang di-download
            const buffer2 = fs.readFileSync(output.path);
            // hapus lokal file setelah dibaca
            fs.unlinkSync(output.path);
            return { title: output.title || "audio_fallback", url: query, buffer: buffer2 };
        } catch (err2) {
            console.error("Fallback YTDLP juga gagal:", err2.message);
            throw new Error("❌ Gagal download audio YouTube!");
        }
    }
}

module.exports = { downloadYouTubeAudio };
