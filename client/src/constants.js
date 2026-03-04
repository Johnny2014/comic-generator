// ==========================================
// Constants
// ==========================================

export const LAYOUTS = {
    GRID_2X2: '2x2',
    GRID_1X4: '1x4',
    GRID_4X1: '4x1',
    CUSTOM: 'custom'
};

export const LAYOUT_CONFIGS = {
    [LAYOUTS.GRID_2X2]: {
        name: '2×2 网格',
        cols: 2,
        rows: 2,
        cells: [
            { x: 0, y: 0, w: 1, h: 1 },
            { x: 1, y: 0, w: 1, h: 1 },
            { x: 0, y: 1, w: 1, h: 1 },
            { x: 1, y: 1, w: 1, h: 1 }
        ]
    },
    [LAYOUTS.GRID_1X4]: {
        name: '竖排 1×4',
        cols: 1,
        rows: 4,
        cells: [
            { x: 0, y: 0, w: 1, h: 1 },
            { x: 0, y: 1, w: 1, h: 1 },
            { x: 0, y: 2, w: 1, h: 1 },
            { x: 0, y: 3, w: 1, h: 1 }
        ]
    },
    [LAYOUTS.GRID_4X1]: {
        name: '横排 4×1',
        cols: 4,
        rows: 1,
        cells: [
            { x: 0, y: 0, w: 1, h: 1 },
            { x: 1, y: 0, w: 1, h: 1 },
            { x: 2, y: 0, w: 1, h: 1 },
            { x: 3, y: 0, w: 1, h: 1 }
        ]
    },
    [LAYOUTS.CUSTOM]: {
        name: '自定义',
        cols: 2,
        rows: 2,
        cells: [
            { x: 0, y: 0, w: 2, h: 1 },
            { x: 0, y: 1, w: 1, h: 1 },
            { x: 1, y: 1, w: 1, h: 1 },
            { x: 0, y: 2, w: 2, h: 0.5 }
        ]
    }
};

export const BORDER_STYLES = [
    { id: 'bold', name: '粗黑线条', width: 6, color: '#000000', radius: 0 },
    { id: 'rounded', name: '圆角', width: 3, color: '#333333', radius: 16 },
    { id: 'white', name: '白边', width: 12, color: '#ffffff', radius: 4 },
    { id: 'none', name: '无边框', width: 0, color: 'transparent', radius: 0 }
];

export const FILTERS = [
    { id: 'none', name: '原图', css: 'none' },
    { id: 'grayscale', name: '黑白', css: 'grayscale(100%)' },
    { id: 'vintage', name: '复古', css: 'sepia(60%) contrast(110%) brightness(90%)' },
    { id: 'comic', name: '漫画风', css: 'contrast(150%) saturate(130%) brightness(105%)' }
];

export const BUBBLE_TYPES = {
    speech: { name: '对话', tail: 'triangle' },
    thought: { name: '思考', tail: 'dots' },
    shout: { name: '呐喊', tail: 'burst' }
};

export const CANVAS_SIZE = {
    width: 1200,
    height: 1200
};

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_PER_PANEL = 60; // seconds
