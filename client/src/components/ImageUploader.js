import { createElement } from '../utils/helpers';
import { processImageFile } from '../utils/imageProcessor';

export class ImageUploader {
    constructor(containerId, eventBus) {
        this.container = document.getElementById(containerId);
        this.bus = eventBus;
        this.slots = [null, null, null, null]; // Stores { img, name, type, size, width, height, scale, rotation, offsetX, offsetY }
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const slot = this.createSlot(i);
            this.container.appendChild(slot);
        }

        // Add Load Demo button if container is empty or just has 4 slots
        const demoBtn = createElement('button', {
            className: 'btn btn-secondary btn-sm load-demo-btn',
            style: { marginTop: '16px', gridColumn: 'span 2' },
            onClick: () => this.loadDemo()
        }, '✨ 加载示例图片');
        this.container.appendChild(demoBtn);
    }

    createSlot(index) {
        const slotData = this.slots[index];
        const hasImage = !!slotData;

        const input = createElement('input', {
            type: 'file',
            accept: 'image/jpeg,image/png,image/webp,image/heic,image/heif',
            onChange: (e) => this.handleFileSelect(e, index)
        });

        const slot = createElement('div', {
            className: `upload-slot ${hasImage ? 'has-image' : ''}`,
            onDragOver: (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            },
            onDragLeave: () => slot.classList.remove('drag-over'),
            onDrop: (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                if (e.dataTransfer.files.length) {
                    this.handleFile(e.dataTransfer.files[0], index);
                }
            },
            onClick: (e) => {
                // Only trigger input if not clicking action buttons
                if (!e.target.closest('.slot-action-btn')) {
                    input.click();
                }
            }
        },
            createElement('span', { className: 'slot-label' }, (index + 1).toString()),
            input
        );

        if (hasImage) {
            const preview = createElement('img', {
                className: 'preview-img',
                src: slotData.blobUrl
            });

            const actions = createElement('div', { className: 'slot-actions' },
                createElement('button', {
                    className: 'slot-action-btn replace-btn',
                    title: '替换',
                    onClick: (e) => {
                        e.stopPropagation();
                        input.click();
                    }
                }, '🔄'),
                createElement('button', {
                    className: 'slot-action-btn delete-btn',
                    title: '删除',
                    onClick: (e) => {
                        e.stopPropagation();
                        this.removeImage(index);
                    }
                }, '🗑️')
            );

            const adjustments = createElement('div', { className: 'slot-adjustments' },
                createElement('div', { className: 'adj-row' },
                    createElement('span', {}, '缩放'),
                    createElement('input', {
                        type: 'range', min: '0.1', max: '3', step: '0.1',
                        value: slotData.scale || 1,
                        onInput: (e) => this.handleAdjustment(index, 'scale', parseFloat(e.target.value))
                    })
                ),
                createElement('div', { className: 'adj-row' },
                    createElement('span', {}, '旋转'),
                    createElement('input', {
                        type: 'range', min: '0', max: '360', step: '90',
                        value: slotData.rotation || 0,
                        onInput: (e) => this.handleAdjustment(index, 'rotation', parseInt(e.target.value))
                    })
                )
            );

            slot.appendChild(preview);
            slot.appendChild(actions);
            slot.appendChild(adjustments);
        } else {
            const placeholder = createElement('div', { className: 'slot-placeholder' },
                createElement('div', { className: 'plus-icon' }, '+'),
                createElement('div', { className: 'slot-text' }, '点击或拖拽上传')
            );
            slot.appendChild(placeholder);
        }

        return slot;
    }

    async handleFileSelect(e, index) {
        if (e.target.files.length) {
            await this.handleFile(e.target.files[0], index);
        }
    }

    async handleFile(file, index) {
        const slotEl = this.container.children[index];

        // Revoke old URL if replacing
        if (this.slots[index] && this.slots[index].blobUrl) {
            URL.revokeObjectURL(this.slots[index].blobUrl);
        }

        // Show loading state
        const loader = createElement('div', { className: 'loading-spinner' });
        slotEl.appendChild(loader);

        try {
            const result = await processImageFile(file);

            // Upload to backend
            const formData = new FormData();
            formData.append('image', file); // Use original file for upload
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadResult = await response.json();

            this.slots[index] = {
                ...result,
                serverUrl: uploadResult.url,
                scale: 1,
                rotation: 0,
                offsetX: 0,
                offsetY: 0
            };
            this.bus.emit('image-updated', { index, data: this.slots[index], allSlots: this.slots });
            this.render(); // Re-render this part to show preview
        } catch (err) {
            alert(err.message);
        } finally {
            loader.remove();
        }
    }

    removeImage(index) {
        if (this.slots[index] && this.slots[index].blobUrl) {
            URL.revokeObjectURL(this.slots[index].blobUrl);
        }
        this.slots[index] = null;
        this.bus.emit('image-updated', { index, data: null, allSlots: this.slots });
        this.render();
    }

    getImages() {
        return this.slots;
    }

    handleAdjustment(index, key, value) {
        if (this.slots[index]) {
            this.slots[index][key] = value;
            this.bus.emit('image-updated', { index, data: this.slots[index], allSlots: this.slots });
        }
    }

    async loadDemo() {
        const demoPaths = [
            '/demo/panel1.png',
            '/demo/panel2.png',
            '/demo/panel3.png',
            '/demo/panel4.png'
        ];

        for (let i = 0; i < 4; i++) {
            try {
                const response = await fetch(demoPaths[i]);
                const blob = await response.blob();
                const file = new File([blob], `panel${i + 1}.png`, { type: 'image/png' });
                await this.handleFile(file, i);
            } catch (err) {
                console.error('Failed to load demo image:', err);
            }
        }
    }
}
