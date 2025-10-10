const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan kata kunci pencarian Pinterest!" });
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest untuk *${query}* ...` });

        let imageUrls = new Set();

        // =============== METHOD 1: Pinterest GraphQL (kemungkinan gagal di 2025)
        try {
            const graphqlUrl = "https://www.pinterest.com/resource/BaseSearchResource/get/";
            const options = {
                method: "GET",
                url: graphqlUrl,
                params: {
                    source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
                    data: `{"options":{"query":"${query}","scope":"pins","page_size":25},"context":{}}`
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "application/json, text/plain, */*",
                    "Referer": `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
                },
                timeout: 8000
            };

            const response = await axios(options);
            if (response.data?.resource_response?.data?.results) {
                const results = response.data.resource_response.data.results;
                for (const r of results) {
                    const url = r.images?.orig?.url || r.images?.["736x"]?.url;
                    if (url) imageUrls.add(url);
                }
            }
        } catch {
            console.log("⚠️ GraphQL API gagal, lanjut fallback...");
        }

        // =============== METHOD 2: Google Image fallback (paling andal)
        if (imageUrls.size === 0) {
            try {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " site:pinterest.com")}&tbm=isch`;
                const googleRes = await axios.get(googleUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(googleRes.data);
                $("img").each((_, el) => {
                    const src =
                        $(el).attr("src") ||
                        $(el).attr("data-src") ||
                        $(el).attr("data-iurl") ||
                        $(el).attr("srcset");
                    if (src && src.includes("i.pinimg.com")) {
                        const cleanSrc = src.split(" ")[0].trim();
                        imageUrls.add(cleanSrc);
                    }
                });
            } catch (err) {
                console.log("Google fallback error:", err.message);
            }
        }

        // =============== METHOD 3: HTML scraping Pinterest langsung
        if (imageUrls.size === 0) {
            try {
                const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
                const htmlRes = await axios.get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(htmlRes.data);
                $("img").each((_, el) => {
                    let src =
                        $(el).attr("src") ||
                        $(el).attr("srcset") ||
                        $(el).attr("data-src") ||
                        $(el).attr("data-srcset");
                    if (src && src.includes("i.pinimg.com")) {
                        const match = src.match(/https:\/\/i\.pinimg\.com\/[^ ]+/);
                        if (match) imageUrls.add(match[0].split(" ")[0]);
                    }
                });
            } catch (err) {
                console.log("Pinterest HTML parse gagal:", err.message);
            }
        }

        // =============== CEK HASIL
        if (imageUrls.size === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak menemukan gambar dari Pinterest. Coba kata lain!" });
            return;
        }

        const urls = Array.from(imageUrls);
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        console.log(`✅ Found ${urls.length} images, sending: ${randomUrl}`);

        const imgResponse = await axios.get(randomUrl, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            timeout: 15000
        });

        await varz.sendMessage(from, {
            image: imgResponse.data,
            caption: `📷 Pinterest: *${query}*\n✅ ${urls.length} gambar ditemukan`
        });
    } catch (err) {
        console.error("Final Error:", err.message);
        await varz.sendMessage(from, {
            text: `❌ Gagal mengambil gambar. Error: ${err.message}`
        });
    }
};
