import { VIDEO_FPS } from '../constants';

export class VideoEncoder {
    constructor(canvas) {
        this.canvas = canvas;
        this.stream = canvas.captureStream(VIDEO_FPS);
        this.recorder = null;
        this.chunks = [];
    }

    start() {
        this.chunks = [];
        const mimeType = this.getSupportedMimeType();
        this.recorder = new MediaRecorder(this.stream, {
            mimeType,
            videoBitsPerSecond: 2500000 // 2.5 Mbps
        });

        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.chunks.push(e.data);
        };

        this.recorder.start();
    }

    stop() {
        return new Promise((resolve) => {
            this.recorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: this.chunks[0].type });
                resolve(blob);
            };
            this.recorder.stop();
        });
    }

    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return '';
    }
}

/**
 * Ken Burns Effect Frame Generator
 */
export function generateKenBurnsFrame(ctx, img, time, duration, cw, ch) {
    const progress = time / duration;

    // Start and end scale: 1.0 to 1.15
    const scale = 1.0 + Math.sin(progress * Math.PI) * 0.15;

    // Drift slightly
    const driftX = Math.cos(progress * Math.PI * 2) * 20;
    const driftY = Math.sin(progress * Math.PI * 2) * 20;

    const imgRatio = img.width / img.height;
    const containerRatio = cw / ch;

    let sw, sh, sx, sy;
    if (imgRatio > containerRatio) {
        sh = img.height / scale;
        sw = sh * containerRatio;
    } else {
        sw = img.width / scale;
        sh = sw / containerRatio;
    }

    sx = (img.width - sw) / 2 + driftX;
    sy = (img.height - sh) / 2 + driftY;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}
