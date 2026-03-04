// ==========================================
// Helpers
// ==========================================

/**
 * Create a DOM element with attributes and children
 */
export function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
        if (key === 'className') {
            el.className = val;
        } else if (key === 'style' && typeof val === 'object') {
            Object.assign(el.style, val);
        } else if (key.startsWith('on') && typeof val === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), val);
        } else if (key === 'dataset' && typeof val === 'object') {
            for (const [dk, dv] of Object.entries(val)) {
                el.dataset[dk] = dv;
            }
        } else {
            el.setAttribute(key, val);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    }
    return el;
}

/**
 * Simple pub/sub event bus
 */
export class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(cb => cb(data));
    }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
