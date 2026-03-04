import { createElement } from '../utils/helpers';
import { FILTERS } from '../constants';

export class FilterPanel {
    constructor(containerId, bus) {
        this.container = document.getElementById(containerId);
        this.bus = bus;
        this.currentFilterId = FILTERS[0].id;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        FILTERS.forEach(filter => {
            const isActive = filter.id === this.currentFilterId;
            const btn = createElement('button', {
                className: `filter-option ${isActive ? 'active' : ''}`,
                onClick: () => this.selectFilter(filter)
            }, filter.name);

            this.container.appendChild(btn);
        });
    }

    selectFilter(filter) {
        this.currentFilterId = filter.id;
        this.render();
        this.bus.emit('filter-changed', filter);
    }
}
