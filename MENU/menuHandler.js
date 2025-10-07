const os = require('os');
const { performance } = require('perf_hooks');
const { makeTextDraw } = require('./textDraw');

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

function getIntroInfo() {
    // Simulasi data status bot
    const start = performance.now();
    const end = performance.now();
    const speed = (end - start).toFixed(2);

    const uptime = formatUptime(process.uptime());
    const aiStatus = "✅ Aktif";
    const date = new Date().toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return [
        `📅 Tanggal: ${date}`,
        `⚡ Speed: ${speed} ms`,
        `🕒 Uptime: ${uptime}`,
        `🤖 AI Status: ${aiStatus}`,
        `💻 Platform: ${os.platform()}`
    ];
}

function createMenu() {
    const introInfo = getIntroInfo();

    const menuSections = [
        {
            title: "🎨 STICKER MENU",
            items: [
                "!stiker - Buat stiker dari gambar",
                "!s - Shortcut !stiker",
                "!sticker - Buat stiker dari video"
            ]
        },
        {
            title: "🌟 BOT INFO",
            items: [
                "!ping - Cek status bot",
                "!runtime - Lihat waktu aktif",
                "!speedtest - Test kecepatan",
                "!owner - Info pembuat bot"
            ]
        },
        {
            title: "🔍 SEARCH MENU", 
            items: [
                "!ytsearch - Cari di YouTube",
                "!pinterest - Cari gambar",
                "!wallpaper - Wallpaper HD",
                "!playstore - Cari app"
            ]
        },
        {
            title: "📥 DOWNLOAD MENU",
            items: [
                "!ytaudio - Download audio YouTube",
                "!ytvideo - Download video YouTube", 
                "!tiktok - Download TikTok",
                "!instagram - Download IG"
            ]
        },
        {
            title: "🛠️ CONVERTER/TOOLS",
            items: [
                "!toimage - Stiker ke gambar",
                "!toaudio - Video ke audio",
                "!tourl - Media ke URL",
                "!ssweb - Screenshot web"
            ]
        },
        {
            title: "🎮 GAME MENU",
            items: [
                "!tebakgambar - Game tebak gambar",
                "!tebakkata - Game tebak kata",
                "!suit - Game suit",
                "!tebakbendera - Tebak bendera"
            ]
        },
        {
            title: "😄 FUN MENU",
            items: [
                "!joke - Cerita lucu",
                "!faktaunik - Fakta menarik",
                "!quotes - Kutipan inspirasi",
                "!rate - Rate sesuatu"
            ]
        },
        {
            title: "🤖 AI MENU",
            items: [
                "!gpt - Chat dengan AI",
                "!gemini - AI Google",
                "!dalle - Generate gambar AI",
                "!ai - AI assistant"
            ]
        },
        {
            title: "📊 GROUP MENU",
            items: [
                "!groupinfo - Info grup",
                "!linkgc - Link grup", 
                "!tagall - Tag semua member",
                "!hidetag - Tag diam-diam"
            ]
        },
        {
            title: "⚙️ OTHERS MENU",
            items: [
                "!menu - Tampilkan menu ini",
                "!help - Bantuan",
                "!infobot - Info bot",
                "!donasi - Support bot"
            ]
        }
    ];

    let fullMenu = "";

    // Tambahkan intro di bagian paling atas
    const introBox = makeTextDraw("🤖 BOT STATUS", introInfo, { padding: 1, maxWidth: 45 });
    fullMenu += introBox + "\n\n";

    // Tambahkan menu utama
    menuSections.forEach(section => {
        const sectionBox = makeTextDraw(section.title, section.items, { padding: 1, maxWidth: 45 });
        fullMenu += sectionBox + "\n\n";
    });

    const footer = `✨ *Semoga harimu menyenangkan!* 🥰`;

    return "```" + fullMenu.trim() + "```" + "\n" + footer;
}

function createSimpleMenu() {
    const simpleItems = [
        "!menu - Tampilkan menu lengkap",
        "!stiker - Buat stiker dari gambar/video", 
        "!s - Shortcut !stiker",
        "!ping - Cek status bot",
        "!owner - Info pembuat",
        "!help - Bantuan"
    ];

    const box = makeTextDraw("🎯 QUICK MENU", simpleItems, { padding: 1, maxWidth: 40 });
    return "```" + box + "```";
}

module.exports = { createMenu, createSimpleMenu };
