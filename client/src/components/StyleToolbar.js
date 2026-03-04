import { createElement } from '../utils/helpers';
import { BORDER_STYLES } from '../constants';

export class StyleToolbar {
    constructor(containerId, bus) {
        this.container = document.getElementById(containerId);
        this.bus = bus;
        this.currentStyleId = BORDER_STYLES[0].id;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        BORDER_STYLES.forEach(style => {
            const isActive = style.id === this.currentStyleId;
            const btn = createElement('button', {
                className: `border-option ${isActive ? 'active' : ''}`,
                onClick: () => this.selectStyle(style)
            }, style.name);

            this.container.appendChild(btn);
        });
    }

    selectStyle(style) {
        this.currentStyleId = style.id;
        this.render();
        this.bus.emit('border-changed', style);
    }
}
