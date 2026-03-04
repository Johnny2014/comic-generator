import { createElement } from '../utils/helpers';
import { BUBBLE_TYPES } from '../constants';

export class SpeechBubble {
    constructor(canvasContainerId, bus) {
        this.container = document.getElementById(canvasContainerId);
        this.bus = bus;
        this.modal = document.getElementById('bubble-modal');
        this.closeBtn = document.getElementById('bubble-modal-close');
        this.cancelBtn = document.getElementById('bubble-cancel');
        this.confirmBtn = document.getElementById('bubble-confirm');
        this.textInput = document.getElementById('bubble-text');
        this.fontInput = document.getElementById('bubble-font-size');
        this.fontVal = document.getElementById('bubble-font-size-val');
        this.typeBtns = document.getElementById('bubble-type-options');

        this.pendingBubble = null;
        this.currentType = 'speech';

        this.init();
    }

    init() {
        // 1. Click on canvas to add bubble
        const canvas = this.container.querySelector('canvas');
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            this.showModal(x, y);
        });

        // 2. Modal interactions
        this.closeBtn.onclick = () => this.hideModal();
        this.cancelBtn.onclick = () => this.hideModal();
        this.confirmBtn.onclick = () => this.confirmBubble();

        this.fontInput.oninput = (e) => {
            this.fontVal.textContent = `${e.target.value}px`;
        };

        this.typeBtns.addEventListener('click', (e) => {
            const btn = e.target.closest('.bubble-type-btn');
            if (btn) {
                this.typeBtns.querySelectorAll('.bubble-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
            }
        });
    }

    showModal(x, y) {
        this.pendingBubble = { x, y };
        this.textInput.value = '';
        this.modal.style.display = 'flex';
        this.textInput.focus();
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.pendingBubble = null;
    }

    confirmBubble() {
        const text = this.textInput.value.trim();
        if (!text) {
            this.hideModal();
            return;
        }

        const bubble = {
            id: Date.now(),
            x: this.pendingBubble.x,
            y: this.pendingBubble.y,
            text: text,
            type: this.currentType,
            size: parseInt(this.fontInput.value)
        };

        this.bus.emit('bubble-added', bubble);
        this.hideModal();
    }
}
