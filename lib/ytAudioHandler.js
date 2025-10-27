const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

async function downloadYouTubeAudio(url) {
    try {
        if (!ytdl.validateURL(url)) throw new Error("Link YouTube tidak valid!");

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '');
        const outputPath = path.join(__dirname, "../temp", `${title}.mp3`);

        return new Promise((resolve, reject) => {
            const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" })
                .pipe(fs.createWriteStream(outputPath));

            stream.on("finish", () => resolve({ 
                file: outputPath, 
                title, 
                thumbnail: info.videoDetails.thumbnails.pop().url 
            }));
            stream.on("error", reject);
        });

    } catch (err) {
        console.error("Error download:", err);
        throw new Error("Gagal mendownload audio!");
    }
}

module.exports = downloadYouTubeAudio;
