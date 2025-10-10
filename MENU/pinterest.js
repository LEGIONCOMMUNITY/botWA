const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan kata kunci pencarian Pinterest!" });
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest untuk *${query}* ...` });

        const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        const $ = cheerio.load(res.data);
        const imageUrls = new Set();

        $('img').each((i, el) => {
            let src =
                $(el).attr("src") ||
                $(el).attr("srcset") ||
                $(el).attr("data-src") ||
                $(el).attr("data-srcset");

            if (src && src.includes("i.pinimg.com")) {
                // Ambil versi resolusi tinggi
                const match = src.match(/https:\/\/i\.pinimg\.com\/[^ ]+/);
                if (match) imageUrls.add(match[0].split(" ")[0]);
            }
        });

        if (imageUrls.size === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak menemukan gambar dari Pinterest. Coba kata kunci lain!" });
            return;
        }

        const urls = Array.from(imageUrls);
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        const img = await axios.get(randomUrl, { responseType: "arraybuffer" });

        await varz.sendMessage(from, {
            image: img.data,
            caption: `📷 Hasil random Pinterest untuk: *${query}*`
        });

    } catch (err) {
        console.error("Pinterest Scraper Error:", err.message);
        await varz.sendMessage(from, { text: "❌ Terjadi kesalahan saat mengambil data dari Pinterest." });
    }
};
