import { LAYOUT_CONFIGS, CANVAS_SIZE, BORDER_STYLES, FILTERS } from '../constants';

export class CanvasRenderer {
    constructor(canvasId, bus) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bus = bus;

        // Internal state
        this.images = [null, null, null, null];
        this.layout = '2x2';
        this.borderStyle = BORDER_STYLES[0];
        this.filter = FILTERS[0];
        this.bubbles = []; // Array of { id, type, text, x, y, size }

        this.setupCanvas();
        this.init();
    }

    setupCanvas() {
        this.canvas.width = CANVAS_SIZE.width;
        this.canvas.height = CANVAS_SIZE.height;
    }

    init() {
        this.bus.on('image-updated', ({ index, data }) => {
            this.images[index] = data;
            this.render();
        });

        this.bus.on('layout-changed', (layout) => {
            this.layout = layout;
            this.render();
        });

        this.bus.on('border-changed', (style) => {
            this.borderStyle = style;
            this.render();
        });

        this.bus.on('filter-changed', (filter) => {
            this.filter = filter;
            this.render();
        });

        this.bus.on('bubble-added', (bubble) => {
            this.bubbles.push(bubble);
            this.render();
        });
    }

    render() {
        const { ctx, canvas, layout, images, borderStyle, filter } = this;
        const config = LAYOUT_CONFIGS[layout];

        // 1. Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = borderStyle.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Images for each cell
        config.cells.forEach((cell, i) => {
            const imageData = images[i];
            if (!imageData) return;

            const x = cell.x * (canvas.width / config.cols);
            const y = cell.y * (canvas.height / config.rows);
            const w = cell.w * (canvas.width / config.cols);
            const h = cell.h * (canvas.height / config.rows);

            // Apply Padding/Border
            const padding = borderStyle.width / 2;
            const drawX = x + padding;
            const drawY = y + padding;
            const drawW = w - borderStyle.width;
            const drawH = h - borderStyle.width;

            if (drawW <= 0 || drawH <= 0) return;

            ctx.save();

            // Round corners clip if needed
            if (borderStyle.radius > 0) {
                this.drawRoundedRect(ctx, drawX, drawY, drawW, drawH, borderStyle.radius);
                ctx.clip();
            }

            // Draw Image with adjustments
            this.drawImageAdjusted(ctx, imageData, drawX, drawY, drawW, drawH);

            // Apply Filter
            if (filter.id !== 'none') {
                ctx.globalCompositeOperation = 'overlay';
                ctx.filter = filter.css;
                this.drawImageAdjusted(ctx, imageData, drawX, drawY, drawW, drawH);
                ctx.filter = 'none';
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.restore();
        });

        // 3. Draw Speech Bubbles
        this.bubbles.forEach(bubble => this.drawBubble(ctx, bubble));
    }

    drawImageAdjusted(ctx, imageData, x, y, w, h) {
        const { img, scale = 1, rotation = 0, offsetX = 0, offsetY = 0 } = imageData;

        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        const imgRatio = img.width / img.height;
        const containerRatio = w / h;

        let drawW, drawH;
        if (imgRatio > containerRatio) {
            drawH = h;
            drawW = h * imgRatio;
        } else {
            drawW = w;
            drawH = w / imgRatio;
        }

        ctx.drawImage(img, -drawW / 2 + offsetX, -drawH / 2 + offsetY, drawW, drawH);
        ctx.restore();
    }

    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    drawBubble(ctx, bubble) {
        const { x, y, text, type, size } = bubble;
        ctx.save();
        ctx.translate(x, y);

        ctx.font = `bold ${size}px 'Noto Sans SC'`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = size;
        const padding = 20;
        const bw = textWidth + padding * 2;
        const bh = textHeight + padding * 2;

        // Draw bubble background
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;

        this.drawRoundedRect(ctx, -bw / 2, -bh / 2, bw, bh, 20);
        ctx.fill();
        ctx.stroke();

        // Draw tail
        ctx.beginPath();
        ctx.moveTo(-10, bh / 2 - 2);
        ctx.lineTo(10, bh / 2 - 2);
        ctx.lineTo(0, bh / 2 + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);

        ctx.restore();
    }

    getCanvas() {
        return this.canvas;
    }
}
