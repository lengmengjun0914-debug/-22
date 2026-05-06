/**
 * 运营工具箱网页模板 - 脚本文件
 * 版本: 1.0
 * 描述: 处理所有前端交互逻辑，按钮点击统一弹窗提示"功能待后端实现"
 */

// ==================== 常量定义 ====================
const ALERT_MESSAGE = '功能待后端实现';

// ==================== DOM 加载完成后初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initButtonHandlers();      // 按钮点击事件
    initUploadZones();         // 上传区域交互
    initPositionSelector();    // 水印位置选择器
    initTeleprompter();        // 题词器控制
    initSceneCount();          // 分镜数量滑块
    initColorPicker();         // 题词器背景色选择
});

// ==================== 按钮点击事件处理 ====================
/**
 * 为所有带 data-action 属性的按钮添加点击事件
 * 点击后统一弹出提示：功能待后端实现
 */
function initButtonHandlers() {
    // 使用事件委托处理所有按钮点击
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        e.preventDefault();
        alert(ALERT_MESSAGE);
    });
}

// ==================== 上传区域交互 ====================
/**
 * 初始化上传区域的拖拽和点击上传功能
 * 支持图片和视频上传，仅本地预览，不实际上传
 */
function initUploadZones() {
    // 获取所有上传区域
    const uploadZones = document.querySelectorAll('.upload-zone');

    uploadZones.forEach((zone) => {
        const fileInput = zone.querySelector('input[type="file"]');
        const placeholder = zone.querySelector('.upload-placeholder');
        const preview = zone.querySelector('.upload-preview');
        const removeBtn = zone.querySelector('.btn-remove');
        const isVideoUpload = zone.classList.contains('video-upload');

        if (!fileInput) return;

        // 点击上传区域触发文件选择
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove')) return;
            fileInput.click();
        });

        // 文件选择处理
        fileInput.addEventListener('change', () => {
            handleFileSelect(fileInput.files[0], zone, isVideoUpload);
        });

        // 拖拽悬停效果
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        // 拖拽放下处理
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0], zone, isVideoUpload);
            }
        });

        // 移除按钮
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetUploadZone(zone, isVideoUpload);
            });
        }
    });
}

/**
 * 处理选中的文件
 * @param {File} file - 选中的文件
 * @param {HTMLElement} zone - 上传区域元素
 * @param {boolean} isVideo - 是否为视频上传
 */
function handleFileSelect(file, zone, isVideo) {
    if (!file) return;

    const placeholder = zone.querySelector('.upload-placeholder');
    const preview = zone.querySelector('.upload-preview');
    const fileNameSpan = zone.querySelector('.upload-file-name');

    if (isVideo) {
        const video = zone.querySelector('video');
        if (video) {
            const url = URL.createObjectURL(file);
            video.src = url;
            video.onloadedmetadata = () => {
                // 更新视频信息
                updateVideoInfo(video);
            };
        }
    } else {
        const img = zone.querySelector('img');
        if (img) {
            const url = URL.createObjectURL(file);
            img.src = url;
        }
    }

    if (fileNameSpan) {
        fileNameSpan.textContent = file.name;
    }

    // 显示预览，隐藏占位符
    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'flex';
}

/**
 * 重置上传区域
 * @param {HTMLElement} zone - 上传区域元素
 * @param {boolean} isVideo - 是否为视频上传
 */
function resetUploadZone(zone, isVideo) {
    const placeholder = zone.querySelector('.upload-placeholder');
    const preview = zone.querySelector('.upload-preview');
    const fileInput = zone.querySelector('input[type="file"]');
    const videoInfo = zone.closest('.module-body')?.querySelector('.video-info');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';

    if (fileInput) fileInput.value = '';

    if (isVideo && videoInfo) {
        videoInfo.style.display = 'none';
    }
}

/**
 * 更新视频信息显示
 * @param {HTMLVideoElement} video - 视频元素
 */
function updateVideoInfo(video) {
    const moduleBody = video.closest('.module-body');
    if (!moduleBody) return;

    const videoInfo = moduleBody.querySelector('.video-info');
    const durationEl = moduleBody.querySelector('#video-duration');
    const resolutionEl = moduleBody.querySelector('#video-resolution');

    if (videoInfo) videoInfo.style.display = 'flex';

    if (durationEl) {
        const duration = Math.round(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        durationEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (resolutionEl) {
        resolutionEl.textContent = `${video.videoWidth} × ${video.videoHeight}`;
    }
}

// ==================== 水印位置选择器 ====================
/**
 * 初始化水印位置选择器
 * 支持预设位置和自定义坐标
 */
function initPositionSelector() {
    const positionBtns = document.querySelectorAll('.position-btn');

    positionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            // 移除所有 active 状态
            positionBtns.forEach((b) => b.classList.remove('active'));
            // 添加 active 状态到当前按钮
            btn.classList.add('active');

            // 获取模块body
            const moduleBody = btn.closest('.module-body');
            if (!moduleBody) return;

            // 显示/隐藏自定义坐标区域
            const customCoords = moduleBody.querySelector('.custom-coords');
            if (customCoords) {
                if (btn.dataset.position === 'custom') {
                    customCoords.style.display = 'block';
                } else {
                    customCoords.style.display = 'none';
                }
            }
        });
    });
}

// ==================== 题词器控制 ====================
/**
 * 初始化题词器交互控制
 * 包括播放/暂停、重置、全屏、字体大小、滚动速度
 */
function initTeleprompter() {
    // 字体大小控制
    const fontSizeControl = document.getElementById('font-size-control');
    const fontSizeValue = fontSizeControl?.parentElement.querySelector('.range-value');
    const teleprompterText = document.querySelector('.teleprompter-text');

    if (fontSizeControl && fontSizeValue && teleprompterText) {
        fontSizeControl.addEventListener('input', () => {
            const size = fontSizeControl.value;
            teleprompterText.style.fontSize = `${size}px`;
            fontSizeValue.textContent = `${size}px`;
        });
    }

    // 滚动速度控制
    const speedControl = document.getElementById('speed-control');
    const speedValue = speedControl?.parentElement.querySelector('.range-value');

    if (speedControl && speedValue && teleprompterText) {
        speedControl.addEventListener('input', () => {
            const speed = speedControl.value;
            speedValue.textContent = speed;
            // 根据速度调整动画时长（速度越大，时长越短）
            const duration = 20 - (speed - 1) * 1.8;
            teleprompterText.style.animationDuration = `${duration}s`;
        });
    }

    // 题词预览区
    const teleprompterPreview = document.querySelector('.teleprompter-preview');
    const scriptInput = document.getElementById('teleprompter-script');

    // 脚本输入时更新预览
    if (scriptInput && teleprompterText) {
        scriptInput.addEventListener('input', () => {
            teleprompterText.textContent = scriptInput.value || '提词内容将在此滚动显示';
        });
    }

    // 播放按钮
    const playBtn = document.querySelector('[data-action="teleprompter-play"]');
    if (playBtn && teleprompterPreview) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teleprompterPreview.classList.remove('paused');
            alert(ALERT_MESSAGE);
        });
    }

    // 暂停按钮
    const pauseBtn = document.querySelector('[data-action="teleprompter-pause"]');
    if (pauseBtn && teleprompterPreview) {
        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teleprompterPreview.classList.add('paused');
            alert(ALERT_MESSAGE);
        });
    }

    // 重置按钮
    const resetBtn = document.querySelector('[data-action="teleprompter-reset"]');
    if (resetBtn && teleprompterText) {
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // 重置动画
            teleprompterText.style.animation = 'none';
            teleprompterText.offsetHeight; // 触发重排
            teleprompterText.style.animation = 'teleprompter-scroll 10s linear infinite';
            // 恢复播放状态
            if (teleprompterPreview) {
                teleprompterPreview.classList.remove('paused');
            }
            alert(ALERT_MESSAGE);
        });
    }

    // 全屏按钮
    const fullscreenBtn = document.querySelector('[data-action="teleprompter-fullscreen"]');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (teleprompterPreview) {
                if (teleprompterPreview.requestFullscreen) {
                    teleprompterPreview.requestFullscreen();
                } else if (teleprompterPreview.webkitRequestFullscreen) {
                    teleprompterPreview.webkitRequestFullscreen();
                }
            }
            alert(ALERT_MESSAGE);
        });
    }
}

// ==================== 分镜数量滑块 ====================
/**
 * 初始化分镜数量滑块
 * 实时显示当前选择的分镜数量
 */
function initSceneCount() {
    const sceneCountInput = document.getElementById('scene-count');
    const sceneCountValue = document.getElementById('scene-count-value');

    if (sceneCountInput && sceneCountValue) {
        sceneCountInput.addEventListener('input', () => {
            sceneCountValue.textContent = sceneCountInput.value;
        });
    }
}

// ==================== 题词器背景色选择 ====================
/**
 * 初始化题词器背景色选择器
 */
function initColorPicker() {
    const colorBtns = document.querySelectorAll('.color-btn');

    colorBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            // 移除所有 active 状态
            colorBtns.forEach((b) => b.classList.remove('active'));
            // 添加 active 状态到当前按钮
            btn.classList.add('active');

            // 获取屏幕元素
            const screen = document.querySelector('.teleprompter-screen');
            if (!screen) return;

            // 移除所有背景色类
            screen.classList.remove('bg-black', 'bg-white', 'bg-green', 'bg-blue');

            // 添加新的背景色类
            const color = btn.dataset.color;
            switch (color) {
                case 'black':
                    screen.classList.add('bg-black');
                    break;
                case 'white':
                    screen.classList.add('bg-white');
                    break;
                case 'green':
                    screen.classList.add('bg-green');
                    break;
                case 'blue':
                    screen.classList.add('bg-blue');
                    break;
            }
        });
    });
}

// ==================== 工具函数 ====================
/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
