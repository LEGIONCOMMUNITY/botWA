const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class StickerMaker {
    constructor() {
        this.tempDir = path.resolve('./temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Jalankan command shell dengan logging aman
    runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    return reject(
                        new Error(stderr.trim() || error.message || 'Command gagal dijalankan')
                    );
                }
                resolve(stdout.trim());
            });
        });
    }

    // Download media dengan curl
    async downloadMedia(mediaUrl, filename) {
        const filePath = path.join(this.tempDir, filename);
        const command = `curl -L -s -o "${filePath}" "${mediaUrl}"`;

        try {
            await this.runCommand(command);
            if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
                throw new Error('File hasil download kosong');
            }
            return filePath;
        } catch (err) {
            throw new Error(`Gagal download media: ${err.message}`);
        }
    }

    // Convert gambar ke WebP
    async imageToSticker(inputPath, outputPath) {
        const command = `ffmpeg -i "${inputPath}" -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -y "${outputPath}"`;
        await this.runCommand(command);
        if (!fs.existsSync(outputPath)) throw new Error('Gagal membuat file WebP dari gambar');
        return outputPath;
    }

    // Convert video ke WebP (max 7 detik)
    async videoToSticker(inputPath, outputPath) {
        const command = `ffmpeg -i "${inputPath}" -t 7 -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -loop 0 -an -vsync 0 -y "${outputPath}"`;
        await this.runCommand(command);
        if (!fs.existsSync(outputPath)) throw new Error('Gagal membuat file WebP dari video');
        return outputPath;
    }

    // Fungsi utama bikin stiker
    async createSticker(media, mediaType) {
        let inputPath, outputPath;
        try {
            if (!media || !media.url) throw new Error('Media URL tidak valid');
            if (!['image', 'video'].includes(mediaType))
                throw new Error(`Tipe media tidak dikenal: ${mediaType}`);

            const timestamp = Date.now();
            const inputExt = mediaType === 'image' ? 'jpg' : 'mp4';
            const inputFilename = `input_${timestamp}.${inputExt}`;
            const outputFilename = `sticker_${timestamp}.webp`;

            inputPath = path.join(this.tempDir, inputFilename);
            outputPath = path.join(this.tempDir, outputFilename);

            console.log('📥 Mengunduh media...');
            await this.downloadMedia(media.url, inputFilename);

            console.log('🎨 Mengonversi ke stiker...');
            if (mediaType === 'image') {
                await this.imageToSticker(inputPath, outputPath);
            } else {
                await this.videoToSticker(inputPath, outputPath);
            }

            console.log('✅ Stiker berhasil dibuat!');
            const stickerBuffer = fs.readFileSync(outputPath);
            this.cleanupFiles([inputPath, outputPath]);
            return stickerBuffer;
        } catch (err) {
            this.cleanupFiles([inputPath, outputPath]);
            throw new Error(`❌ Gagal membuat stiker: ${err?.message || err}`);
        }
    }

    // Buat stiker dari teks
    async textToSticker(text) {
        const outputPath = path.join(this.tempDir, `text_${Date.now()}.webp`);
        const safeText = (text || '').replace(/['"]/g, '');
        const command = `ffmpeg -f lavfi -i color=size=512x512:rate=25:color=black -vf "drawtext=text='${safeText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 -y "${outputPath}"`;
        await this.runCommand(command);
        if (!fs.existsSync(outputPath)) throw new Error('Gagal membuat stiker teks');
        const stickerBuffer = fs.readFileSync(outputPath);
        this.cleanupFiles([outputPath]);
        return stickerBuffer;
    }

    // Hapus file sementara
    cleanupFiles(files) {
        for (const file of files) {
            if (file && fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (err) {
                    console.warn(`⚠️ Gagal hapus file ${file}: ${err.message}`);
                }
            }
        }
    }
}

module.exports = StickerMaker;
