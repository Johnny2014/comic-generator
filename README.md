# 4格 (4-Panel) Comic Generator

一个基于 Node.js 后端与原生 JS 前端构建的创意短视频生成工具。它核心围绕中国叙事哲学“起承转合”展开，通过 4 个动态渲染面板生成电影级的创意故事短片。

## 🚀 快速开始

### 1. 环境准备
确保您的系统中已安装 Node.js。

### 2. 安装与运行
在项目根目录下执行：
```bash
# 安装所有依赖 (根目录、client、server)
npm run install:all

# 启动开发服务器 (前后端同步)
npm run dev
```

### 3. 使用体验
- **加载示例**: 在上传页面点击 "✨ 加载示例图片" 一键生成 Manga 面板。
- **自定义建议**: 悬停图片可进行旋转和比例缩放，点击图片可添加文字气泡。
- **导出视频**: 点击底部的“生成视频”按钮，导出 4 分钟的 WebM 故事短片。

## 📄 项目文档

本项目包含完整的策划与说明文档：
- **[产品策划文档 (DOCS/PRODUCT)](./docs/PRODUCT.md)**: 深入了解“起承转合”的设计理念。
- **[技术说明文档 (DOCS/WALKTHROUGH)](./docs/WALKTHROUGH.md)**: 了解 Ken Burns 录制算法与项目架构细节。

## 🛠️ 技术栈
- **后端**: Node.js + Express + Multer (图片持久化)
- **前端**: Vanilla JS + CSS3 + HTML5 Canvas
- **视频**: MediaRecorder API + Ken Burns 动画逻辑

---

> “4格”——让每一个瞬间，都能通过‘起承转合’，变成一段不平凡的故事。
