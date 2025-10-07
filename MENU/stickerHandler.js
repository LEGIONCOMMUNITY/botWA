const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class StickerMaker {
    constructor() {
        this.tempDir = path.resolve('./temp');

        // Buat folder temp kalau belum ada
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Jalankan command shell (FFmpeg)
    runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) return reject(stderr || error);
                resolve(stdout);
            });
        });
    }

    // Download media dari URL ke file lokal
    async downloadMedia(mediaUrl, filename) {
        const filePath = path.join(this.tempDir, filename);

        // Gunakan curl supaya stabil untuk URL langsung dari WhatsApp
        const command = `curl -L -o "${filePath}" "${mediaUrl}"`;

        try {
            await this.runCommand(command);
            return filePath;
        } catch (err) {
            throw new Error(`Gagal download media: ${err}`);
        }
    }

    // Convert gambar → WebP
    async imageToSticker(inputPath, outputPath) {
        const command = `
            ffmpeg -i "${inputPath}" \
            -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,\
            format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" \
            -y "${outputPath}"
        `;
        await this.runCommand(command);
        return outputPath;
    }

    // Convert video → WebP (max 7 detik)
    async videoToSticker(inputPath, outputPath) {
        const command = `
            ffmpeg -i "${inputPath}" -t 7 \
            -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,\
            format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" \
            -loop 0 -an -vsync 0 -y "${outputPath}"
        `;
        await this.runCommand(command);
        return outputPath;
    }

    // Buat stiker dari media WhatsApp
    async createSticker(media, mediaType) {
        let inputPath, outputPath;
        try {
            const timestamp = Date.now();
            const inputExt = mediaType === 'image' ? 'jpg' : 'mp4';
            const inputFilename = `input_${timestamp}.${inputExt}`;
            const outputFilename = `sticker_${timestamp}.webp`;

            inputPath = path.join(this.tempDir, inputFilename);
            outputPath = path.join(this.tempDir, outputFilename);

            console.log('📥 Downloading media...');
            await this.downloadMedia(media.url, inputFilename);

            console.log('🎨 Converting to sticker...');
            if (mediaType === 'image') {
                await this.imageToSticker(inputPath, outputPath);
            } else {
                await this.videoToSticker(inputPath, outputPath);
            }

            const stickerBuffer = fs.readFileSync(outputPath);
            this.cleanupFiles([inputPath, outputPath]);
            return stickerBuffer;
        } catch (err) {
            this.cleanupFiles([inputPath, outputPath]);
            throw new Error(`❌ Gagal membuat stiker: ${err.message}`);
        }
    }

    // Buat stiker dari teks
    async textToSticker(text) {
        const outputPath = path.join(this.tempDir, `text_${Date.now()}.webp`);
        const safeText = text.replace(/['"]/g, ''); // hindari error FFmpeg
        const command = `
            ffmpeg -f lavfi -i color=size=512x512:rate=25:color=black \
            -vf "drawtext=text='${safeText}':fontcolor=white:fontsize=48:\
            x=(w-text_w)/2:y=(h-text_h)/2" \
            -frames:v 1 -y "${outputPath}"
        `;
        await this.runCommand(command);

        const stickerBuffer = fs.readFileSync(outputPath);
        this.cleanupFiles([outputPath]);
        return stickerBuffer;
    }

    // Bersihkan file sementara
    cleanupFiles(files) {
        for (const file of files) {
            if (file && fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (err) {
                    console.warn(`⚠️ Gagal hapus file ${file}:`, err.message);
                }
            }
        }
    }
}

module.exports = StickerMaker;
