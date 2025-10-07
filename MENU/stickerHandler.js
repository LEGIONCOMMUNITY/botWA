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

    runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) return reject(new Error(stderr || stdout || error.message));
                resolve(stdout);
            });
        });
    }

    async getFileType(filePath) {
        try {
            const stdout = await this.runCommand(`file -b "${filePath}"`);
            return stdout.trim();
        } catch {
            return "unknown";
        }
    }

    async downloadMedia(mediaUrl, filename) {
        const filePath = path.join(this.tempDir, filename);
        const command = `curl -L -s -o "${filePath}" "${mediaUrl}"`;

        await this.runCommand(command);

        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
            throw new Error("File download kosong / tidak valid");
        }

        const type = await this.getFileType(filePath);
        if (!/(image|video)/i.test(type)) {
            throw new Error(`File bukan gambar/video valid (${type})`);
        }

        return filePath;
    }

    async imageToSticker(inputPath, outputPath) {
        const command = `ffmpeg -y -hide_banner -loglevel error -i "${inputPath}" -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputPath}"`;
        await this.runCommand(command);
        if (!fs.existsSync(outputPath)) throw new Error("Gagal konversi gambar ke WebP");
        return outputPath;
    }

    async videoToSticker(inputPath, outputPath) {
        const command = `ffmpeg -y -hide_banner -loglevel error -i "${inputPath}" -t 7 -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -loop 0 -an -vsync 0 "${outputPath}"`;
        await this.runCommand(command);
        if (!fs.existsSync(outputPath)) throw new Error("Gagal konversi video ke WebP");
        return outputPath;
    }

    async createSticker(media, mediaType) {
        let inputPath, outputPath;
        try {
            if (!media || !media.url) throw new Error("Media URL tidak valid");
            if (!['image', 'video'].includes(mediaType))
                throw new Error(`Tipe media tidak dikenal: ${mediaType}`);

            const timestamp = Date.now();
            const inputExt = mediaType === 'image' ? 'jpg' : 'mp4';
            inputPath = path.join(this.tempDir, `input_${timestamp}.${inputExt}`);
            outputPath = path.join(this.tempDir, `sticker_${timestamp}.webp`);

            console.log("📥 Mengunduh media...");
            await this.downloadMedia(media.url, path.basename(inputPath));

            console.log("🎨 Mengonversi ke stiker...");
            if (mediaType === 'image') {
                await this.imageToSticker(inputPath, outputPath);
            } else {
                await this.videoToSticker(inputPath, outputPath);
            }

            console.log("✅ Stiker berhasil dibuat!");
            const stickerBuffer = fs.readFileSync(outputPath);
            this.cleanupFiles([inputPath, outputPath]);
            return stickerBuffer;
        } catch (err) {
            this.cleanupFiles([inputPath, outputPath]);
            throw new Error(`❌ Gagal membuat stiker: ${err.message}`);
        }
    }

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
