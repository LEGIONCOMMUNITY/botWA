const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (varz, m, from, query) => {
    try {
        if (!query) {
            await varz.sendMessage(from, { text: "❌ Masukkan kata kunci pencarian Pinterest!" });
            return;
        }

        await varz.sendMessage(from, { text: `🔍 Mencari gambar Pinterest untuk *${query}* ...` });

        const url = `https://www.pinterest.com/resource/BaseSearchResource/get/`;
        
        const params = {
            source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
            data: JSON.stringify({
                options: {
                    query: query,
                    scope: "pins",
                    bookmarks: [""]
                }
            })
        };

        const res = await axios.get(url, {
            params: params,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
            }
        });

        const imageUrls = new Set();
        
        // Parse JSON response dari API Pinterest
        if (res.data && res.data.resource_response && res.data.resource_response.data) {
            const pins = res.data.resource_response.data.results || [];
            
            pins.forEach(pin => {
                if (pin.images && pin.images.orig) {
                    imageUrls.add(pin.images.orig.url);
                }
            });
        }

        // Fallback ke scraping HTML jika API tidak bekerja
        if (imageUrls.size === 0) {
            const htmlUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const htmlRes = await axios.get(htmlUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });

            const $ = cheerio.load(htmlRes.data);
            
            // Mencari gambar dalam data JSON yang tersembunyi di HTML
            $('script').each((i, el) => {
                const scriptContent = $(el).html();
                if (scriptContent && scriptContent.includes("__PWS_DATA__")) {
                    try {
                        const jsonMatch = scriptContent.match(/window\.__PWS_DATA__\s*=\s*({.*?});/);
                        if (jsonMatch) {
                            const jsonData = JSON.parse(jsonMatch[1]);
                            const pins = jsonData?.props?.initialReduxState?.pins || {};
                            
                            Object.values(pins).forEach(pin => {
                                if (pin.images && pin.images.orig) {
                                    imageUrls.add(pin.images.orig.url);
                                }
                            });
                        }
                    } catch (e) {
                        console.log("Error parsing JSON:", e.message);
                    }
                }
            });

            // Fallback ke selector gambar biasa
            if (imageUrls.size === 0) {
                $('img[src*="i.pinimg.com"]').each((i, el) => {
                    let src = $(el).attr("src");
                    if (src && src.includes("i.pinimg.com")) {
                        // Hilangkan parameter ukuran untuk mendapatkan gambar asli
                        const cleanUrl = src.split('?')[0];
                        imageUrls.add(cleanUrl);
                    }
                });
            }
        }

        if (imageUrls.size === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak menemukan gambar dari Pinterest. Coba kata kunci lain!" });
            return;
        }

        const urls = Array.from(imageUrls).filter(url => 
            url && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))
        );

        if (urls.length === 0) {
            await varz.sendMessage(from, { text: "❌ Tidak ada gambar valid yang ditemukan." });
            return;
        }

        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        
        console.log(`Downloading image from: ${randomUrl}`);

        const img = await axios.get(randomUrl, { 
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://www.pinterest.com/"
            }
        });

        await varz.sendMessage(from, {
            image: img.data,
            caption: `📷 Hasil random Pinterest untuk: *${query}*\n🔗 ${randomUrl}`
        });

    } catch (err) {
        console.error("Pinterest Scraper Error:", err.message);
        
        let errorMessage = "❌ Terjadi kesalahan saat mengambil data dari Pinterest.";
        if (err.code === 'ECONNABORTED') {
            errorMessage = "❌ Timeout: Koneksi ke Pinterest terlalu lama.";
        } else if (err.response && err.response.status === 403) {
            errorMessage = "❌ Akses ditolak: Pinterest memblokir permintaan. Coba lagi nanti.";
        }
        
        await varz.sendMessage(from, { text: errorMessage });
    }
};