const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Buat folder temp jika belum ada
if (!fs.existsSync('./temp')) {
    fs.existsSync('./temp');
}

class StickerMaker {
    constructor() {
        this.tempDir = './temp';
    }

    // Download media dari URL WhatsApp
    async downloadMedia(mediaUrl, filename) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.tempDir, filename);
            
            const ffmpegCommand = `ffmpeg -i "${mediaUrl}" -y ${outputPath}`;
            
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(outputPath);
            });
        });
    }

    // Convert gambar ke stiker WebP
    async imageToSticker(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -y ${outputPath}`;
            
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(outputPath);
            });
        });
    }

    // Convert video ke stiker WebP
    async videoToSticker(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            const ffmpegCommand = `ffmpeg -i "${inputPath}" -t 7 -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -y ${outputPath}`;
            
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(outputPath);
            });
        });
    }

    // Buat stiker dari media WhatsApp
    async createSticker(media, mediaType) {
        try {
            const mediaUrl = media.url;
            const timestamp = Date.now();
            const inputFilename = `input_${timestamp}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
            const outputFilename = `sticker_${timestamp}.webp`;
            
            const inputPath = path.join(this.tempDir, inputFilename);
            const outputPath = path.join(this.tempDir, outputFilename);

            // Download media
            console.log('Downloading media...');
            await this.downloadMedia(mediaUrl, inputFilename);

            // Convert ke stiker
            console.log('Converting to sticker...');
            if (mediaType === 'image') {
                await this.imageToSticker(inputPath, outputPath);
            } else {
                await this.videoToSticker(inputPath, outputPath);
            }

            // Baca file stiker
            const stickerBuffer = fs.readFileSync(outputPath);

            // Bersihkan file temp
            this.cleanupFiles([inputPath, outputPath]);

            return stickerBuffer;

        } catch (error) {
            // Pastikan cleanup meski error
            this.cleanupFiles([inputPath, outputPath].filter(fs.existsSync));
            throw error;
        }
    }

    // Hapus file temporary
    cleanupFiles(filePaths) {
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.log('Error deleting temp file:', err);
                }
            }
        });
    }

    // Buat stiker dari teks (bonus feature)
    async textToSticker(text) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.tempDir, `text_sticker_${Date.now()}.webp`);
            
            const ffmpegCommand = `ffmpeg -f lavfi -i color=size=512x512:rate=25:color=random -vf "drawtext=text='${text}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2" -t 3 -y ${outputPath}`;
            
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                const stickerBuffer = fs.readFileSync(outputPath);
                this.cleanupFiles([outputPath]);
                resolve(stickerBuffer);
            });
        });
    }
}

module.exports = StickerMaker;