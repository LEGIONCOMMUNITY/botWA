const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan kata kunci Pinterest!" });
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest: *${query}* ...` });

        const res = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(res.data);
        const imageUrls = [];

        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.startsWith('https://i.pinimg.com/')) {
                imageUrls.push(src);
            }
        });

        if (imageUrls.length === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak menemukan gambar dari Pinterest." });
            return;
        }

        const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        const img = await axios.get(randomImage, { responseType: "arraybuffer" });

        await varz.sendMessage(from, {
            image: img.data,
            caption: `📷 Hasil random dari Pinterest untuk: *${query}*`
        });

    } catch (err) {
        console.error("Pinterest Scraper Error:", err.message);
        await varz.sendMessage(from, { text: "❌ Terjadi kesalahan saat mengambil data Pinterest." });
    }
};
