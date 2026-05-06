/**
 * 运营工具箱网页模板 - 交互脚本
 * 版本: 3.0 (亮蓝强调风格)
 * 描述: 用户登录系统 + 前端交互逻辑
 */

// ==================== 常量定义 ====================
const ALERT_MESSAGE = '该功能将在后端集成后实现。';
const STORAGE_KEY_USER = 'operator_toolkit_user';

// ==================== DOM 加载完成后初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initAuth();          // 初始化认证状态
    initButtonHandlers(); // 按钮点击事件
    initUploadZones();   // 上传区域交互
    initNavSidebar();    // 侧边导航切换
    initTeleprompter();  // 题词器控制
    initSceneCount();    // 分镜数量滑块
    initColorPicker();   // 背景色选择
});

// ==================== 用户认证系统 ====================
/**
 * 初始化认证状态
 */
function initAuth() {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);

    if (storedUser) {
        showMainPage(JSON.parse(storedUser));
    } else {
        showLoginPage();
    }

    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 退出按钮
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * 处理登录
 * @param {Event} e 提交事件
 */
function handleLogin(e) {
    e.preventDefault();

    const account = document.getElementById('login-account').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!account || !password) {
        alert('请输入账号和密码');
        return;
    }

    // 简单验证（实际项目中应调用后端API）
    // 默认账号: admin, 密码: admin
    if (account === 'admin' && password === 'admin') {
        const userData = {
            account: account,
            username: account,
            loginTime: new Date().toISOString()
        };

        // 保存到 localStorage（永久存储）
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));

        showMainPage(userData);
    } else {
        alert('账号或密码错误');
    }
}

/**
 * 处理退出登录
 */
function handleLogout() {
    localStorage.removeItem(STORAGE_KEY_USER);
    showLoginPage();
}

/**
 * 显示登录页面
 */
function showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('main-page').style.display = 'none';

    // 清空登录表单
    document.getElementById('login-account').value = '';
    document.getElementById('login-password').value = '';
}

/**
 * 显示主页面
 * @param {Object} userData 用户数据
 */
function showMainPage(userData) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';

    // 更新用户显示
    document.getElementById('display-username').textContent = userData.username;

    // 默认显示第一个模块
    showSection('review');
}

// ==================== 侧边导航切换 ====================
/**
 * 初始化侧边导航
 */
function initNavSidebar() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item) => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });
}

/**
 * 显示指定模块
 * @param {string} sectionId 模块ID
 */
function showSection(sectionId) {
    // 更新导航项激活状态
    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // 更新模块显示
    document.querySelectorAll('.module-section').forEach((section) => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });

    // 更新页面标题
    const activeSection = document.getElementById(`section-${sectionId}`);
    if (activeSection) {
        const title = activeSection.dataset.title;
        document.getElementById('current-page-title').textContent = title || '';
    }
}

// ==================== 按钮点击事件处理 ====================
/**
 * 为所有带 data-action 属性的按钮添加点击事件
 */
function initButtonHandlers() {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();

        alert(ALERT_MESSAGE);
    });
}

// ==================== 上传区域交互 ====================
/**
 * 初始化上传区域
 */
function initUploadZones() {
    const uploadZones = document.querySelectorAll('.upload-zone');

    uploadZones.forEach((zone) => {
        const fileInput = zone.querySelector('input[type="file"]');
        const placeholder = zone.querySelector('.upload-placeholder');
        const preview = zone.querySelector('.upload-preview');
        const removeBtn = zone.querySelector('.btn-remove');
        const isVideoUpload = zone.closest('.module-section')?.querySelector('video');

        if (!fileInput) return;

        // 点击触发文件选择
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove')) return;
            fileInput.click();
        });

        // 文件选择处理
        fileInput.addEventListener('change', () => {
            handleFileSelect(fileInput.files[0], zone);
        });

        // 拖拽效果
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0], zone);
            }
        });

        // 移除按钮
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetUploadZone(zone);
            });
        }
    });
}

/**
 * 处理文件选择
 * @param {File} file 文件对象
 * @param {HTMLElement} zone 上传区域
 */
function handleFileSelect(file, zone) {
    if (!file) return;

    const placeholder = zone.querySelector('.upload-placeholder');
    const preview = zone.querySelector('.upload-preview');
    const fileNameSpan = zone.querySelector('.upload-file-name');
    const previewImg = zone.querySelector('img');
    const moduleSection = zone.closest('.module-section');

    // 检查是否为视频上传
    const videoPreview = moduleSection?.querySelector('video');
    const watermarkPreview = document.getElementById('watermark-preview-video');
    const extractPreview = document.getElementById('extract-preview-video');

    if (videoPreview || watermarkPreview || extractPreview) {
        const videoEl = videoPreview || watermarkPreview || extractPreview;
        const previewZone = document.getElementById(`${zone.id.replace('-upload-zone', '')}-preview-zone`);

        if (videoEl && previewZone) {
            const url = URL.createObjectURL(file);
            videoEl.src = url;
            videoEl.style.display = 'block';
            previewZone.querySelector('.preview-empty')?.remove();

            videoEl.onloadedmetadata = () => {
                updateVideoInfo(videoEl, moduleSection);
            };
        }

        if (fileNameSpan) {
            fileNameSpan.textContent = file.name;
        }
    } else if (previewImg) {
        // 图片预览
        const url = URL.createObjectURL(file);
        previewImg.src = url;
    }

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'flex';
}

/**
 * 重置上传区域
 * @param {HTMLElement} zone 上传区域
 */
function resetUploadZone(zone) {
    const placeholder = zone.querySelector('.upload-placeholder');
    const preview = zone.querySelector('.upload-preview');
    const fileInput = zone.querySelector('input[type="file"]');
    const moduleSection = zone.closest('.module-section');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';

    // 重置视频预览
    const videoPreview = moduleSection?.querySelector('video');
    if (videoPreview) {
        videoPreview.src = '';
        videoPreview.style.display = 'none';
    }

    // 隐藏视频信息
    const videoInfo = moduleSection?.querySelector('.video-info');
    if (videoInfo) videoInfo.style.display = 'none';
}

/**
 * 更新视频信息
 * @param {HTMLVideoElement} video 视频元素
 * @param {HTMLElement} moduleSection 模块区域
 */
function updateVideoInfo(video, moduleSection) {
    if (!moduleSection) return;

    const videoInfo = moduleSection.querySelector('.video-info');
    const durationEl = moduleSection.querySelector('#video-duration');
    const resolutionEl = moduleSection.querySelector('#video-resolution');

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

// ==================== 题词器控制 ====================
/**
 * 初始化题词器
 */
function initTeleprompter() {
    const fontSizeControl = document.getElementById('font-size-control');
    const fontSizeValue = document.getElementById('font-size-value');
    const speedControl = document.getElementById('speed-control');
    const speedValue = document.getElementById('speed-value');
    const teleprompterText = document.querySelector('.teleprompter-text');
    const teleprompterZone = document.querySelector('.teleprompter-zone');
    const scriptInput = document.getElementById('teleprompter-script');

    // 字体大小控制
    if (fontSizeControl && fontSizeValue && teleprompterText) {
        fontSizeControl.addEventListener('input', () => {
            const size = fontSizeControl.value;
            teleprompterText.style.fontSize = `${size}px`;
            fontSizeValue.textContent = `${size}px`;
        });
    }

    // 滚动速度控制
    if (speedControl && speedValue && teleprompterText) {
        speedControl.addEventListener('input', () => {
            const speed = speedControl.value;
            speedValue.textContent = speed;
            const duration = 20 - (speed - 1) * 1.8;
            teleprompterText.style.animationDuration = `${duration}s`;
        });
    }

    // 脚本输入更新预览
    if (scriptInput && teleprompterText) {
        scriptInput.addEventListener('input', () => {
            teleprompterText.textContent = scriptInput.value || '提词内容将在此滚动显示';
        });
    }

    // 题词器控制按钮
    const playBtn = document.querySelector('[data-action="teleprompter-play"]');
    const pauseBtn = document.querySelector('[data-action="teleprompter-pause"]');
    const resetBtn = document.querySelector('[data-action="teleprompter-reset"]');
    const fullscreenBtn = document.querySelector('[data-action="teleprompter-fullscreen"]');

    if (playBtn && teleprompterZone && teleprompterText) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teleprompterZone.classList.remove('paused');
            teleprompterText.style.animation = 'none';
            teleprompterText.offsetHeight;
            teleprompterText.style.animation = `teleprompter-scroll ${getAnimationDuration()}s linear infinite`;
        });
    }

    if (pauseBtn && teleprompterZone) {
        pauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teleprompterZone.classList.add('paused');
        });
    }

    if (resetBtn && teleprompterText && teleprompterZone) {
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            teleprompterText.style.animation = 'none';
            teleprompterText.offsetHeight;
            teleprompterText.style.animation = 'teleprompter-scroll 15s linear infinite';
            teleprompterZone.classList.remove('paused');
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const screen = document.getElementById('teleprompter-screen');
            if (screen) {
                if (screen.requestFullscreen) {
                    screen.requestFullscreen();
                } else if (screen.webkitRequestFullscreen) {
                    screen.webkitRequestFullscreen();
                }
            }
        });
    }
}

/**
 * 获取动画时长
 * @returns {number}
 */
function getAnimationDuration() {
    const speedControl = document.getElementById('speed-control');
    if (speedControl) {
        const speed = parseInt(speedControl.value);
        return 20 - (speed - 1) * 1.8;
    }
    return 15;
}

// ==================== 分镜数量滑块 ====================
/**
 * 初始化分镜数量滑块
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

// ==================== 背景色选择 ====================
/**
 * 初始化颜色选择器
 */
function initColorPicker() {
    const colorBtns = document.querySelectorAll('.color-btn');

    colorBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            colorBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const screen = document.getElementById('teleprompter-screen');
            if (!screen) return;

            screen.classList.remove('bg-black', 'bg-white', 'bg-green', 'bg-blue');

            const color = btn.dataset.color;
            switch (color) {
                case 'black': screen.classList.add('bg-black'); break;
                case 'white': screen.classList.add('bg-white'); break;
                case 'green': screen.classList.add('bg-green'); break;
                case 'blue': screen.classList.add('bg-blue'); break;
            }
        });
    });
}
