import { createElement } from '../utils/helpers';
import { LAYOUTS, LAYOUT_CONFIGS } from '../constants';

export class LayoutSelector {
    constructor(containerId, bus) {
        this.container = document.getElementById(containerId);
        this.bus = bus;
        this.currentLayout = LAYOUTS.GRID_2X2;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        Object.keys(LAYOUT_CONFIGS).forEach(id => {
            const config = LAYOUT_CONFIGS[id];
            const isActive = id === this.currentLayout;

            const item = createElement('div', {
                className: `layout-option ${isActive ? 'active' : ''}`,
                onClick: () => this.selectLayout(id)
            },
                createElement('div', { className: `layout-preview grid-${id}` },
                    ...config.cells.map(() => createElement('div', { className: 'cell' }))
                ),
                createElement('span', { className: 'layout-name' }, config.name)
            );

            this.container.appendChild(item);
        });
    }

    selectLayout(id) {
        this.currentLayout = id;
        this.render();
        this.bus.emit('layout-changed', id);
    }
}
