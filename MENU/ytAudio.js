const { yta } = require('../lib/y2mate');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = async (varz, m, from, text) => {
  try {
    if (!text) {
      return await varz.sendMessage(from, { text: '❌ Masukkan link YouTube!\nContoh: .ytaudio https://youtu.be/xxxx' });
    }

    // Info loading
    await varz.sendMessage(from, { text: '⏳ Sedang mengambil audio dari YouTube...' });

    // === Proses download via y2mate ===
    let res = await yta(text, '128kbps'); // ambil audio 128 kbps
    if (!res || !res.dl_link) {
      return await varz.sendMessage(from, { text: '❌ Gagal mengambil data dari y2mate.' });
    }

    let url = res.dl_link;
    let title = res.title || 'yt-audio';

    // Path file sementara
    let filePath = path.join(__dirname, `./${Date.now()}-${title}.mp3`);

    // === Download file MP3 ===
    let audioRes = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(filePath, audioRes.data);

    // Cek ukuran file (WhatsApp batas ±100MB)
    const fileSize = fs.statSync(filePath).size / 1024 / 1024;
    if (fileSize > 100) {
      fs.unlinkSync(filePath);
      return await varz.sendMessage(from, { text: `⚠️ File terlalu besar (${fileSize.toFixed(1)} MB) dan tidak bisa dikirim melalui WhatsApp.` });
    }

    // === Kirim ke WhatsApp ===
    await varz.sendMessage(from, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false, // kalau mau jadi VN, ubah ke true
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'YouTube Audio',
          sourceUrl: text
        }
      }
    });

    // Hapus file temporer
    fs.unlinkSync(filePath);

  } catch (err) {
    console.log(err);
    await varz.sendMessage(from, { text: '❌ Terjadi kesalahan saat download audio.' });
  }
};
