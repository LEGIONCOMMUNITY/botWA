const axios = require("axios");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan kata kunci Pinterest!" });
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest: *${query}* ...` });

        const apiKey = "YOUR_API_KEY";
        const url = `https://api.scrapecreators.com/v1/pinterest/search?query=${encodeURIComponent(query)}`;

        const resp = await axios.get(url, {
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!resp.data || !resp.data.pins || resp.data.pins.length === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak ada hasil ditemukan di Pinterest." });
            return;
        }

        // ambil random pin
        const pin = resp.data.pins[Math.floor(Math.random() * resp.data.pins.length)];

        // cari URL gambar (struktur akan tergantung response pin)
        let imageUrl = null;
        if (pin.images && pin.images.orig && pin.images.orig.url) {
            imageUrl = pin.images.orig.url;
        } else if (pin.image_url) {
            imageUrl = pin.image_url;
        } else if (pin.media && pin.media.image && pin.media.image.url) {
            imageUrl = pin.media.image.url;
        }

        if (!imageUrl) {
            await varz.sendMessage(from, { text: "⚠️ Gambar tidak tersedia di pin ini." });
            return;
        }

        // download gambar
        const imgResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await varz.sendMessage(from, {
            image: imgResp.data,
            caption: `📷 Gambar random dari Pinterest untuk: *${query}*`
        });

    } catch (err) {
        console.error("Error Pinterest:", err.response ? err.response.data : err.message);
        await varz.sendMessage(from, { text: "❌ Terjadi kesalahan saat mengambil data Pinterest." });
    }
};
