// youtubeAudioHandler.js
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const TEMP_DIR = path.join(__dirname, 'tmp_ytaudio');

function hasFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function safeName(s) {
  return s.replace(/[^a-z0-9\-_\. ]/gi, '').substr(0, 120) || 'audio';
}

module.exports = async (varz, m, from, query, options = {}) => {
  await fs.ensureDir(TEMP_DIR);

  try {
    if (!query) {
      await varz.sendMessage(from, { text: '❌ Masukkan URL YouTube atau kata kunci.' });
      return;
    }

    let videoInfo;
    const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query.trim());
    if (!isUrl) {
      await varz.sendMessage(from, { text: '🔎 Mencari di YouTube...' });
      const r = await ytSearch(query);
      const first = r && r.videos && r.videos.length ? r.videos[0] : null;
      if (!first) {
        await varz.sendMessage(from, { text: '❌ Tidak menemukan hasil untuk kata kunci tersebut.' });
        return;
      }
      videoInfo = await ytdl.getInfo(first.url);
    } else {
      // URL path
      try {
        videoInfo = await ytdl.getInfo(query);
      } catch (e) {
        await varz.sendMessage(from, { text: '❌ Gagal mengambil info video. Pastikan link benar.' });
        return;
      }
    }

    const title = safeName(videoInfo.videoDetails.title || 'youtube-audio');
    const rawFilePath = path.join(TEMP_DIR, `${title}-${Date.now()}.webm`); 
    const outFilePath = path.join(TEMP_DIR, `${title}-${Date.now()}.mp3`); 

    const formats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
    formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
    const chosen = formats[0];

    if (!chosen) {
      await varz.sendMessage(from, { text: '❌ Tidak ada format audio yang tersedia.' });
      return;
    }

    await varz.sendMessage(from, { text: `⬇️ Mendownload audio: *${videoInfo.videoDetails.title}*` });

    const dlStream = ytdl.downloadFromInfo(videoInfo, { quality: chosen.itag || 'highestaudio' });

    let downloaded = 0;
    dlStream.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
      downloaded = downloadedBytes;
    });

    const writeStream = fs.createWriteStream(rawFilePath);

    await new Promise((resolve, reject) => {
      pipeline(dlStream, writeStream, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const stats = await fs.stat(rawFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    const WHATSAPP_LIMIT_MB = 99;
    if (fileSizeMB > WHATSAPP_LIMIT_MB) {
      if (!hasFFmpeg()) {
        await varz.sendMessage(from, { text: `⚠️ File terlalu besar (${fileSizeMB.toFixed(1)} MB) dan ffmpeg tidak tersedia untuk mengecilkan. Batalkan atau minta kualitas lebih rendah.` });
        await fs.remove(rawFilePath);
        return;
      } else {
        await varz.sendMessage(from, { text: `🔧 File ${fileSizeMB.toFixed(1)} MB. Meng-compress dengan ffmpeg ke bitrate lebih rendah...` });
        await new Promise((resolve, reject) => {
          ffmpeg(rawFilePath)
            .audioBitrate(options.targetBitrate || '128k')
            .format('mp3')
            .on('error', (err) => reject(err))
            .on('end', () => resolve())
            .save(outFilePath);
        });
        await fs.remove(rawFilePath);
      }
    } else {
      if (options.forceMp3 && hasFFmpeg()) {
        await varz.sendMessage(from, { text: '🔧 Mengonversi ke MP3...' });
        await new Promise((resolve, reject) => {
          ffmpeg(rawFilePath)
            .audioBitrate(options.targetBitrate || '160k')
            .format('mp3')
            .on('error', (err) => reject(err))
            .on('end', () => resolve())
            .save(outFilePath);
        });
        await fs.remove(rawFilePath);
      } else {
        await fs.move(rawFilePath, outFilePath);
      }
    }

    const finalStats = await fs.stat(outFilePath);
    const finalSizeMB = finalStats.size / (1024 * 1024);

    await varz.sendMessage(from, {
      audio: fs.createReadStream(outFilePath),
      fileName: `${title}.${path.extname(outFilePath).replace('.', '')}`,
      mimetype: 'audio/mpeg',
      contextInfo: { externalAdReply: { title: videoInfo.videoDetails.title, body: `YouTube Audio`, sourceUrl: videoInfo.videoDetails.video_url } }
    });

    await fs.remove(outFilePath);

  } catch (err) {
    console.error('YT Audio Handler error:', err);
    try { await varz.sendMessage(from, { text: '❌ Terjadi kesalahan saat memproses audio. Coba lagi nanti.' }); } catch (e) {}
  } finally {
    try {
      const files = await fs.readdir(TEMP_DIR);
      const now = Date.now();
      for (const f of files) {
        const p = path.join(TEMP_DIR, f);
        const st = await fs.stat(p);
        if (now - st.mtimeMs > 1000 * 60 * 60) { 
          await fs.remove(p);
        }
      }
    } catch (e) {
    }
  }
};
