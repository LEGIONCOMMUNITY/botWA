const { makeTextDraw } = require('./textDraw');

function createMenu() {
    const menuSections = [
        {
            title: "🎨 STICKER MENU",
            items: [
                "!stiker - Buat stiker dari gambar",
                "!s - Shortcut !stiker", 
                "!sticker - Buat stiker dari video",
                "!stikertxt [teks] - Stiker dari teks",
                "!take - Steal stiker (reply)"
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
    
    menuSections.forEach((section) => {
        const sectionBox = makeTextDraw(section.title, section.items, { padding: 1, maxWidth: 45 });
        fullMenu += sectionBox + "\n\n";
    });

    const footer = `✨ *Semoga harimu menyenangkan* 🥰`;
    
    return "```" + fullMenu + "```" + "\n" + footer;
}

function createSimpleMenu() {
    const simpleItems = [
        "!menu - Tampilkan menu lengkap",
        "!stiker - Buat stiker dari gambar/video", 
        "!s - Shortcut !stiker",
        "!stikertxt - Stiker dari teks",
        "!ping - Cek status bot",
        "!owner - Info pembuat",
        "!help - Bantuan"
    ];
    
    const box = makeTextDraw("🎯 QUICK MENU", simpleItems, { padding: 1, maxWidth: 40 });
    return "```" + box + "```";
}

module.exports = { createMenu, createSimpleMenu };