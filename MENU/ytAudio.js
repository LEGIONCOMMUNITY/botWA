const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

module.exports = async (varz, m, from, link) => {
    try {
        if (!link) {
            return varz.sendMessage(from, { text: "⚠️ Kirim link YouTube!\nContoh: .ytaudio https://youtu.be/xxxx" });
        }

        const info = await ytdl.getInfo(link);
        const title = info.videoDetails.title;
        const filePath = `./temp/${Date.now()}.mp3`;

        await varz.sendMessage(from, { text: `🎵 Sedang download audio: *${title}*...` });

        ffmpeg(ytdl(link, { filter: 'audioonly' }))
            .audioBitrate(128)
            .format('mp3')
            .save(filePath)
            .on('end', async () => {
                await varz.sendMessage(from, {
                    audio: { url: filePath },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                });
            })
            .on('error', (err) => {
                console.log(err);
                varz.sendMessage(from, { text: "❌ Gagal convert/download audio!" });
            });

    } catch (e) {
        console.log(e);
        varz.sendMessage(from, { text: "⚠️ Link salah atau error dari server!" });
    }
};
