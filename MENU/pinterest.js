const axios = require("axios");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan link Pinterest atau kata kunci!\n\nContoh:\n• .pinterest https://pin.it/xxxx\n• .pinterest mobil sport" });
            return;
        }

        // === Jika input adalah URL Pinterest ===
        if (query.startsWith("http") && query.includes("pinterest")) {
            await varz.sendMessage(from, { text: "⏳ Sedang mendownload media dari Pinterest..." });
            const apiUrl = `https://api.sirherobrine23.xyz/api/pinterestdl?url=${encodeURIComponent(query)}`;
            const res = await axios.get(apiUrl);

            if (!res.data || !res.data.status) {
                await varz.sendMessage(from, { text: "❌ Gagal mengambil media dari link Pinterest." });
                return;
            }

            const mediaUrl = res.data.result?.url || res.data.result?.image || res.data.result?.video;
            if (!mediaUrl) {
                await varz.sendMessage(from, { text: "⚠️ Tidak ditemukan media pada link ini." });
                return;
            }

            if (mediaUrl.endsWith(".mp4")) {
                const vid = await axios.get(mediaUrl, { responseType: "arraybuffer" });
                await varz.sendMessage(from, { video: vid.data, mimetype: "video/mp4", caption: "🎬 Video dari Pinterest" });
            } else {
                const img = await axios.get(mediaUrl, { responseType: "arraybuffer" });
                await varz.sendMessage(from, { image: img.data, caption: "🖼️ Gambar dari Pinterest" });
            }
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest dengan kata kunci: *${query}*...` });

        const searchUrl = `https://api.siputzx.my.id/api/pinterest?query=${encodeURIComponent(query)}`;
        const res = await axios.get(searchUrl);

        if (!res.data || !Array.isArray(res.data.result) || res.data.result.length === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak ada hasil ditemukan di Pinterest." });
            return;
        }

        const randomImage = res.data.result[Math.floor(Math.random() * res.data.result.length)];

        const img = await axios.get(randomImage, { responseType: "arraybuffer" });
        await varz.sendMessage(from, {
            image: img.data,
            caption: `🖼️ Hasil random dari Pinterest\n🔎 Kata kunci: *${query}*`
        });
    } catch (err) {
        console.error("Error Pinterest:", err);
        await varz.sendMessage(from, { text: "❌ Gagal mengambil data dari Pinterest." });
    }
};
