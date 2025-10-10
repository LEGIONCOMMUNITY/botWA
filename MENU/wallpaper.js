const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (varz, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "⚠️ Masukkan kata kunci, contoh:\n.wallpaper anime" });
            return;
        }

        await varz.sendMessage(from, { text: `🖼️ Mencari wallpaper HD untuk: *${query}* ...` });

        const searchUrl = `https://www.wallpaperflare.com/search?wallpaper=${encodeURIComponent(query)}`;
        const res = await axios.get(searchUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });

        const $ = cheerio.load(res.data);
        const images = [];

        $("img.lazy").each((i, el) => {
            const src = $(el).attr("data-src");
            if (src && src.startsWith("https://r1.wallpaperflare.com")) {
                images.push(src);
            }
        });

        if (images.length === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak menemukan wallpaper HD untuk kata kunci tersebut." });
            return;
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];
        const img = await axios.get(randomImage, { responseType: "arraybuffer" });

        await varz.sendMessage(from, {
            image: img.data,
            caption: `✅ Wallpaper HD untuk: *${query}*`
        });

    } catch (err) {
        console.error("Wallpaper HD Error:", err.message);
        await varz.sendMessage(from, { text: "❌ Terjadi kesalahan saat mengambil wallpaper HD." });
    }
};
