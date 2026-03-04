import { VideoEncoder, generateKenBurnsFrame } from '../utils/videoEncoder';
import { VIDEO_FPS, LAYOUT_CONFIGS, CANVAS_SIZE } from '../constants';
import { createElement } from '../utils/helpers';

export class VideoGenerator {
    constructor(renderer, bus) {
        this.renderer = renderer;
        this.bus = bus;
        this.modal = document.getElementById('video-modal');
        this.progressBar = document.getElementById('video-progress-bar');
        this.progressText = document.getElementById('video-progress-text');
        this.videoPreview = document.getElementById('video-preview');
        this.modalFooter = document.getElementById('video-modal-footer');
        this.closeBtn = document.getElementById('video-close');
        this.downloadBtn = document.getElementById('video-download');

        this.stitchModal = document.getElementById('stitch-modal');
        this.stitchGrid = document.getElementById('stitch-grid');
        this.stitchConfirm = document.getElementById('stitch-confirm');
        this.stitchCancel = document.getElementById('stitch-cancel');
        this.stitchClose = document.getElementById('stitch-modal-close');

        this.currentBlob = null;
        this.selectedStitchIdx = [];

        this.init();
    }

    init() {
        document.getElementById('btn-generate-video').onclick = () => this.generateFullVideo();
        document.getElementById('btn-stitch-video').onclick = () => this.showStitchModal();

        this.closeBtn.onclick = () => this.hideModal();
        this.downloadBtn.onclick = () => this.downloadVideo();

        this.stitchCancel.onclick = () => this.hideStitchModal();
        this.stitchClose.onclick = () => this.hideStitchModal();
        this.stitchConfirm.onclick = () => this.generateStitchedVideo();
    }

    showModal() {
        this.modal.style.display = 'flex';
        this.progressBar.style.width = '0%';
        this.progressText.innerText = '准备中...';
        this.videoPreview.style.display = 'none';
        this.modalFooter.style.display = 'none';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    showStitchModal() {
        const images = this.renderer.images;
        const hasEnough = images.filter(img => !!img).length >= 2;
        if (!hasEnough) {
            alert('至少需要 2 张图片才能拼接视频');
            return;
        }

        this.stitchGrid.innerHTML = '';
        this.selectedStitchIdx = [];

        images.forEach((img, i) => {
            if (!img) return;
            const item = createElement('div', {
                className: 'stitch-item',
                onClick: () => this.toggleStitchSelection(i, item)
            },
                createElement('img', { src: img.img.src }),
                createElement('span', { className: 'stitch-label' }, `第 ${i + 1} 格`)
            );
            this.stitchGrid.appendChild(item);
        });

        this.stitchModal.style.display = 'flex';
    }

    hideStitchModal() {
        this.stitchModal.style.display = 'none';
    }

    toggleStitchSelection(idx, el) {
        if (this.selectedStitchIdx.includes(idx)) {
            this.selectedStitchIdx = this.selectedStitchIdx.filter(i => i !== idx);
            el.classList.remove('selected');
        } else {
            if (this.selectedStitchIdx.length >= 2) {
                alert('最多只能选择 2 格进行拼接');
                return;
            }
            this.selectedStitchIdx.push(idx);
            el.classList.add('selected');
        }
    }

    async generateFullVideo() {
        const images = this.renderer.images.filter(img => !!img);
        if (images.length === 0) {
            alert('请先上传图片');
            return;
        }

        this.showModal();
        const encoder = new VideoEncoder(this.renderer.getCanvas());
        encoder.start();

        // Duration: 1 min per panel (as requested)
        // For demo purposes, we might want a shorter duration if it's too slow,
        // but the request specified 1 min per panel.
        // However, 4 minutes of 30fps video in browser might crash.
        // Let's use 5 seconds per panel for "real time" feel, but label it.
        // OR we can do the actual 60s if we use a low frame rate or simple logic.
        const durationPerPanel = 60;
        const totalDuration = images.length * durationPerPanel;

        await this.recordPanels(images, durationPerPanel);

        this.currentBlob = await encoder.stop();
        this.showFinishState();
    }

    async generateStitchedVideo() {
        if (this.selectedStitchIdx.length < 2) {
            alert('请选择 2 格进行拼接');
            return;
        }

        this.hideStitchModal();
        this.showModal();

        const images = this.selectedStitchIdx.map(idx => this.renderer.images[idx]);
        const encoder = new VideoEncoder(this.renderer.getCanvas());
        encoder.start();

        const durationPerPanel = 60;
        await this.recordPanels(images, durationPerPanel);

        this.currentBlob = await encoder.stop();
        this.showFinishState();
    }

    async recordPanels(images, durationPerPanel) {
        const canvas = this.renderer.getCanvas();
        const ctx = canvas.getContext('2d');
        const totalFrames = images.length * durationPerPanel * VIDEO_FPS;
        let frameCount = 0;

        for (let i = 0; i < images.length; i++) {
            const imgData = images[i];
            for (let f = 0; f < durationPerPanel * VIDEO_FPS; f++) {
                // Clear and draw single image with Ken Burns effect
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

                generateKenBurnsFrame(ctx, imgData.img, f / VIDEO_FPS, durationPerPanel, CANVAS_SIZE.width, CANVAS_SIZE.height);

                // Add overlay text
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '30px Noto Sans SC';
                ctx.textAlign = 'right';
                ctx.fillText(`正在生成第 ${i + 1}/${images.length} 格...`, CANVAS_SIZE.width - 40, CANVAS_SIZE.height - 40);

                frameCount++;
                if (frameCount % 10 === 0) {
                    const progress = (frameCount / totalFrames) * 100;
                    this.progressBar.style.width = `${progress}%`;
                    this.progressText.innerText = `生成中... ${Math.round(progress)}% (${Math.round(frameCount / (durationPerPanel * VIDEO_FPS))} / ${images.length} 分钟)`;
                }

                await new Promise(r => requestAnimationFrame(r));
            }
        }
    }

    showFinishState() {
        this.progressText.innerText = '生成完成！';
        this.progressBar.style.width = '100%';
        this.videoPreview.src = URL.createObjectURL(this.currentBlob);
        this.videoPreview.style.display = 'block';
        this.modalFooter.style.display = 'flex';
    }

    downloadVideo() {
        if (!this.currentBlob) return;
        const url = URL.createObjectURL(this.currentBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comic-video-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
