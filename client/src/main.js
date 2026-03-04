import './styles/index.css';
import './styles/upload.css';
import './styles/canvas.css';
import './styles/toolbar.css';
import './styles/modal.css';

import { EventBus } from './utils/helpers';
import { ImageUploader } from './components/ImageUploader';
import { CanvasRenderer } from './components/CanvasRenderer';
import { LayoutSelector } from './components/LayoutSelector';
import { StyleToolbar } from './components/StyleToolbar';
import { FilterPanel } from './components/FilterPanel';
import { SpeechBubble } from './components/SpeechBubble';
import { VideoGenerator } from './components/VideoGenerator';

class App {
    constructor() {
        this.bus = new EventBus();
        this.init();
    }

    init() {
        console.log('🚀 Comic Generator Initializing...');

        // 1. Initialize Components
        this.uploader = new ImageUploader('upload-grid', this.bus);
        this.renderer = new CanvasRenderer('comic-canvas', this.bus);
        this.layoutSelector = new LayoutSelector('layout-options', this.bus);
        this.styleToolbar = new StyleToolbar('border-options', this.bus);
        this.filterPanel = new FilterPanel('filter-options', this.bus);
        this.bubbleModule = new SpeechBubble('canvas-container', this.bus);
        this.videoModule = new VideoGenerator(this.renderer, this.bus);

        // 2. Setup Global Actions
        this.setupActions();

        console.log('✅ Initialization Complete.');
    }

    setupActions() {
        // Download image
        document.getElementById('btn-download-image').onclick = () => {
            const canvas = this.renderer.getCanvas();
            const empty = this.renderer.images.every(img => img === null);
            if (empty) {
                alert('请先上传图片再导出');
                return;
            }

            const link = document.createElement('a');
            link.download = `comic-strip-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        // Mobile specific: Prevent scroll when modal is open
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const modals = document.querySelectorAll('.modal-overlay');
                    const isOpen = Array.from(modals).some(m => m.style.display === 'flex');
                    document.body.style.overflow = isOpen ? 'hidden' : '';
                }
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    }
}

// Start the app
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
