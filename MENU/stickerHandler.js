const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

class StickerMaker {
    constructor() {
        this.tempDir = path.resolve('./temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) return reject(stderr || error);
                resolve(stdout);
            });
        });
    }

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

    async createSticker(message, mediaType, sock, downloadMediaMessage) {
        let inputPath, outputPath;
        try {
            const timestamp = Date.now();
            const inputExt = mediaType === 'image' ? 'jpg' : 'mp4';
            const inputFilename = `input_${timestamp}.${inputExt}`;
            const outputFilename = `sticker_${timestamp}.webp`;

            inputPath = path.join(this.tempDir, inputFilename);
            outputPath = path.join(this.tempDir, outputFilename);

            console.log('📥 Mengunduh media dari WhatsApp...');
            const mediaBuffer = await downloadMediaMessage(message, 'buffer', {}, { reuploadRequest: sock });
            fs.writeFileSync(inputPath, mediaBuffer);

            console.log('🎨 Mengonversi ke stiker...');
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
