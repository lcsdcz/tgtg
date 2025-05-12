/**
 * 天宫空间站虚拟漫游 - 主要功能实现
 * 这个文件包含了整个虚拟漫游系统的核心功能实现 
 */


const launchScreen = document.getElementById('launchScreen'); 
const startBtn = document.getElementById('startBtn'); 
const tourView = document.getElementById('tourView'); 
const infoPopup = document.getElementById('infoPopup'); 
const popupTitle = document.getElementById('popupTitle'); 
const popupContent = document.getElementById('popupContent'); 
const closePopup = document.getElementById('closePopup'); 
const prevBtn = document.getElementById('prevBtn'); 
const nextBtn = document.getElementById('nextBtn'); 
const panoramaNav = document.getElementById('panoramaNav'); 
const moduleBtns = document.querySelectorAll('.module-btn'); 
const currentLocation = document.getElementById('currentLocation'); 
const locationDescription = document.getElementById('locationDescription'); 

// 漫游状态 - 存储当前漫游的状态信息
let currentModule = 'tianhe'; 
let currentPanoramaIndex = 0; 
let isRotating = false; 
let rotationInterval; 

/**
 * 初始化虚拟漫游
 * 这个函数在页面加载完成后调用，设置整个虚拟漫游系统
 */
function initTour() {
    // 更新视图 - 显示初始全景图
    updateView();
    
    // 创建全景导航点 - 根据当前模块创建导航点
    createPanoramaNav();
    
    // 隐藏现有热点 - 清除可能存在的旧热点
    hideHotspots();
    
    // 创建热点 - 在当前全景图上添加交互热点
    createHotspots();
    
    // 添加控制面板 - 创建用户界面控制按钮
    createTourControls();
    
    // 添加键盘导航 - 设置键盘快捷键
    setupKeyboardNavigation();
    
    // 显示欢迎信息 - 设置启动屏幕和欢迎弹窗
    setupWelcomeMessage();
    
    // 记录访问 - 记录用户访问信息（仅控制台输出）
    logVisit();
}

/**
 * 更新漫游视图
 * 根据当前选择的模块和全景图索引更新显示内容
 */
function updateView() {
    const module = tourData[currentModule]; // 获取当前模块数据
    const panorama = module.panoramas[currentPanoramaIndex]; // 获取当前全景图数据
    
    // 更新背景图片 - 设置全景图为背景
    tourView.style.backgroundImage = `url(${panorama.image})`;
    tourView.style.backgroundSize = 'cover'; // 确保图片覆盖整个视图区域
    tourView.style.backgroundPosition = 'center'; // 图片居中显示
    
    // 更新信息面板 - 显示当前位置和描述
    currentLocation.textContent = `当前位置: ${module.name} - ${panorama.name}`;
    locationDescription.textContent = panorama.description;
    
    // 更新导航点 - 高亮当前全景图对应的导航点
    updatePanoramaNav();
    
    // 更新热点 - 移除旧热点并创建新热点
    hideHotspots();
    createHotspots();
    
    // 添加过渡动画 - 使场景切换更平滑
    tourView.classList.add('transitioning');
    setTimeout(() => {
        tourView.classList.remove('transitioning');
    }, 1000); // 1秒后移除过渡效果
}

/**
 * 创建全景导航点
 * 根据当前模块的全景图数量创建导航点
 */
function createPanoramaNav() {
    panoramaNav.innerHTML = ''; // 清空现有导航点
    const module = tourData[currentModule]; // 获取当前模块数据
    
    // 为每个全景图创建一个导航点
    module.panoramas.forEach((panorama, index) => {
        const dot = document.createElement('div'); // 创建导航点元素
        dot.className = 'pano-dot'; // 设置基本样式类
        if (index === currentPanoramaIndex) {
            dot.classList.add('active'); // 当前全景图的导航点添加活动状态
        }
        
        // 添加提示文本 - 鼠标悬停时显示全景图名称
        dot.title = panorama.name;
        
        // 添加点击事件 - 点击导航点切换到对应全景图
        dot.addEventListener('click', () => {
            currentPanoramaIndex = index;
            updateView();
        });
        
        panoramaNav.appendChild(dot); // 将导航点添加到容器中
    });
}

/**
 * 更新全景导航点状态
 * 根据当前选中的全景图更新导航点的活动状态
 */
function updatePanoramaNav() {
    const dots = panoramaNav.querySelectorAll('.pano-dot'); // 获取所有导航点
    dots.forEach((dot, index) => {
        if (index === currentPanoramaIndex) {
            dot.classList.add('active'); // 当前索引的导航点添加活动状态
        } else {
            dot.classList.remove('active'); // 其他导航点移除活动状态
        }
    });
}

/**
 * 隐藏所有热点
 * 移除当前视图中的所有交互热点
 */
function hideHotspots() {
    const hotspots = document.querySelectorAll('.hotspot'); // 获取所有热点
    hotspots.forEach(spot => {
        spot.remove(); // 从DOM中移除每个热点
    });
}

/**
 * 创建热点
 * 根据当前全景图数据创建交互热点
 */
function createHotspots() {
    const module = tourData[currentModule]; // 获取当前模块数据
    const panorama = module.panoramas[currentPanoramaIndex]; // 获取当前全景图数据
    
    // 为每个热点数据创建一个热点元素
    panorama.hotspots.forEach((spot, index) => {
        const hotspot = document.createElement('div'); // 创建热点元素
        hotspot.className = 'hotspot'; // 设置基本样式类
        hotspot.innerHTML = '+'; // 热点显示为加号
        hotspot.style.top = `${spot.y}%`; // 设置垂直位置
        hotspot.style.left = `${spot.x}%`; // 设置水平位置
        
        // 添加延迟出现动画 - 热点依次显示
        hotspot.style.animationDelay = `${index * 0.2}s`;
        
        // 添加点击事件 - 点击热点显示信息弹窗
        hotspot.addEventListener('click', () => {
            showInfoPopup(spot.title, spot.content);
        });
        
        // 添加提示文本 - 鼠标悬停时显示热点标题
        hotspot.title = spot.title;
        
        tourView.appendChild(hotspot); // 将热点添加到视图中
    });
}

/**
 * 显示信息弹窗
 * 显示包含标题和内容的信息弹窗
 * @param {string} title - 弹窗标题
 * @param {string} content - 弹窗内容
 */
function showInfoPopup(title, content) {
    popupTitle.textContent = title; // 设置弹窗标题
    popupContent.innerHTML = `<p>${content}</p>`; // 设置弹窗内容
    infoPopup.classList.add('active'); // 显示弹窗
    
    // 添加关闭按钮事件 - 点击关闭按钮隐藏弹窗
    document.getElementById('closePopup').addEventListener('click', () => {
        infoPopup.classList.remove('active');
    });
}

/**
 * 切换到下一个全景图
 * 在当前模块中前进到下一个全景图
 */
function nextPanorama() {
    const module = tourData[currentModule]; // 获取当前模块数据
    // 计算下一个索引，到达末尾时循环回第一个
    currentPanoramaIndex = (currentPanoramaIndex + 1) % module.panoramas.length;
    updateView(); // 更新视图
}

/**
 * 切换到上一个全景图
 * 在当前模块中后退到上一个全景图
 */
function prevPanorama() {
    const module = tourData[currentModule]; // 获取当前模块数据
    // 计算上一个索引，到达开头时循环到最后一个
    currentPanoramaIndex = (currentPanoramaIndex - 1 + module.panoramas.length) % module.panoramas.length;
    updateView(); // 更新视图
}

/**
 * 切换模块
 * 切换到指定的空间站模块
 * @param {string} moduleName - 模块名称（如'tianhe', 'wentian'等）
 */
function switchModule(moduleName) {
    // 如果正在自动旋转，先停止
    if (isRotating) {
        toggleRotation();
    }
    
    currentModule = moduleName; // 更新当前模块
    currentPanoramaIndex = 0; // 重置全景图索引到第一个
    
    // 更新活动模块按钮 - 高亮当前选中的模块按钮
    moduleBtns.forEach(btn => {
        if (btn.dataset.module === moduleName) {
            btn.classList.add('active'); // 当前模块按钮添加活动状态
        } else {
            btn.classList.remove('active'); // 其他模块按钮移除活动状态
        }
    });
    
    // 隐藏所有模块内容
    hideAllModuleContents();
    
    // 显示当前选中的模块内容
    showModuleContent(moduleName);
    
    updateView(); // 更新视图
    createPanoramaNav(); // 重新创建导航点
}

/**
 * 隐藏所有模块内容
 * 在切换模块前隐藏所有模块的内容区域
 */
function hideAllModuleContents() {
    // 获取所有模块内容区域
    const moduleContents = document.querySelectorAll('[id^="tianhe"], [id^="wentian"], [id^="mengtian"], [id^="shenzhou"], [id^="tianzhou"]');
    moduleContents.forEach(content => {
        content.style.display = 'none'; // 隐藏所有模块内容
    });
}

/**
 * 显示指定模块的内容
 * @param {string} moduleName - 模块名称
 */
function showModuleContent(moduleName) {
    // 获取对应模块的内容区域
    const moduleContent = document.getElementById(moduleName);
    if (moduleContent) {
        moduleContent.style.display = 'block'; // 显示当前模块内容
    }
}

/**
 * 创建漫游控制面板
 * 创建包含各种控制按钮的面板
 */
function createTourControls() {
    const tourControls = document.createElement('div'); // 创建控制面板容器
    tourControls.className = 'overlay-element tour-controls'; // 设置样式类
    

    // 全屏按钮 - 切换全屏模式
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'nav-btn';
    fullscreenBtn.textContent = '全屏模式';
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // 帮助按钮 - 显示使用说明
    const helpBtn = document.createElement('button');
    helpBtn.className = 'nav-btn';
    helpBtn.textContent = '帮助';
    helpBtn.addEventListener('click', showTourHelp);
    
    // 添加按钮到控制面板
    tourControls.appendChild(guidedTourBtn);
    tourControls.appendChild(rotateBtn);
    tourControls.appendChild(fullscreenBtn);
    tourControls.appendChild(helpBtn);
    
    // 添加控制面板到界面
    document.querySelector('.interface-overlay').appendChild(tourControls);
}

/**
 * 设置键盘导航
 * 添加键盘快捷键支持
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextPanorama(); // 右箭头键 - 下一个全景图
            setTimeout(() => {
                // 0.1秒后允许再次按键
            }, 100); // 设置为0.1秒延迟
        } else if (e.key === 'ArrowLeft') {
            prevPanorama(); // 左箭头键 - 上一个全景图
            setTimeout(() => {
                // 0.1秒后允许再次按键
            }, 100); // 设置为0.1秒延迟
        } else if (e.key === 'Escape') {
            infoPopup.classList.remove('active'); // ESC键 - 关闭弹窗
        } else if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen(); // F键 - 切换全屏
        } else if (e.key === 'r' || e.key === 'R') {
            toggleRotation(); // R键 - 切换自动旋转
        } else if (e.key === 'h' || e.key === 'H') {
            showTourHelp(); // H键 - 显示帮助
        } else if (e.key === 'g' || e.key === 'G') {
            startGuidedTour(); // G键 - 开始导览
        } else if (e.key >= '1' && e.key <= '5') {
            // 数字键1-5切换不同模块
            const moduleKeys = ['tianhe', 'wentian', 'mengtian', 'shenzhou', 'tianzhou'];
            const moduleIndex = parseInt(e.key) - 1;
            if (moduleIndex < moduleKeys.length) {
                switchModule(moduleKeys[moduleIndex]);
            }
        }
    });
}

/**
 * 设置鼠标点击功能，绑定"上一个"和"下一个"按钮的点击事件
 */
function setupClickNavigation() {
    // 上一个全景图按钮点击事件
    prevBtn.addEventListener('click', () => {
        prevPanorama(); // 切换到上一个全景图
    });

    // 下一个全景图按钮点击事件
    nextBtn.addEventListener('click', () => {
        nextPanorama(); // 切换到下一个全景图
    });
}

/**
 * 更新漫游视图
 * 根据当前选择的模块和全景图索引更新显示内容
 */
function updateView() {
    const module = tourData[currentModule]; // 获取当前模块数据
    const panorama = module.panoramas[currentPanoramaIndex]; // 获取当前全景图数据
    
    // 更新背景图片 - 设置全景图为背景
    tourView.style.backgroundImage = `url(${panorama.image})`;
    tourView.style.backgroundSize = 'cover'; // 确保图片覆盖整个视图区域
    tourView.style.backgroundPosition = 'center'; // 图片居中显示
    tourView.style.backgroundRepeat = 'no-repeat'; // 防止图片重复
    tourView.style.width = '100%'; // 设置宽度为100%
    tourView.style.height = '100vh'; // 设置高度为视口高度
    tourView.style.objectFit = 'contain'; // 确保图片完整显示
    
    // 更新信息面板 - 显示当前位置和描述
    currentLocation.textContent = `当前位置: ${module.name} - ${panorama.name}`;
    locationDescription.textContent = panorama.description;
    
    // 更新导航点 - 高亮当前全景图对应的导航点
    updatePanoramaNav();
    
    // 更新热点 - 移除旧热点并创建新热点
    hideHotspots();
    createHotspots();
    
    // 添加过渡动画 - 使场景切换更平滑
    tourView.classList.add('transitioning');
    setTimeout(() => {
        tourView.classList.remove('transitioning');
    }, 1000); // 1秒后移除过渡效果
}

/**
 * 页面加载完成后初始化漫游
 */
window.addEventListener('load', () => {
    initTour();
    createModuleSelection(); // 初始化模块选择功能
    setupClickNavigation(); // 设置点击事件实现导航功能
});

/**
 * 切换自动旋转
 * 开启或关闭自动切换全景图功能
 */
function toggleRotation() {
    const rotateBtn = document.getElementById('rotateBtn'); // 获取旋转按钮
    
    if (isRotating) {
        // 如果正在旋转，停止旋转
        clearInterval(rotationInterval); // 清除定时器
        isRotating = false; // 更新状态
        rotateBtn.textContent = '自动旋转'; // 更新按钮文本
        rotateBtn.classList.remove('active'); // 移除活动状态
    } else {
        // 如果未旋转，开始旋转
        rotationInterval = setInterval(() => {
            nextPanorama(); // 定时切换到下一个全景图
        }, 5000); // 每5秒旋转一次
        isRotating = true; // 更新状态
        rotateBtn.textContent = '停止旋转'; // 更新按钮文本
        rotateBtn.classList.add('active'); // 添加活动状态
    }
}

/**
 * 切换全屏模式
 * 进入或退出全屏显示
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // 如果不是全屏，进入全屏
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`全屏模式错误: ${err.message}`); // 记录错误
        });
    } else {
        // 如果是全屏，退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

/**
 * 显示漫游帮助信息
 * 显示包含使用说明的弹窗
 */
function showTourHelp() {
    popupTitle.textContent = "虚拟导览使用说明"; // 设置弹窗标题
    // 设置弹窗内容 - 详细的使用说明
    popupContent.innerHTML = `
        <p><strong>欢迎使用天宫空间站360°虚拟漫游！</strong></p>
        <p>使用说明：</p>
        <ul>
            <li>点击右上角的模块按钮可以切换不同舱段</li>
            <li>"上一个"和"下一个"按钮可以在当前舱段的不同场景间切换</li>
            <li>点击场景中的"+"热点图标可以查看详细信息</li>
            <li>使用键盘的左右箭头键也可以切换场景</li>
            <li>"开始导览"按钮将开始一次有引导的空间站参观</li>
            <li>"自动旋转"按钮将自动切换不同场景</li>
            <li>"全屏模式"按钮可以进入全屏浏览体验</li>
            <li>键盘快捷键：左右箭头切换场景，ESC关闭弹窗，F全屏，R自动旋转，H帮助，G开始导览，1-5切换模块</li>
        </ul>
        <p>享受您的太空之旅！</p>
    `;
    infoPopup.classList.add('active'); // 显示弹窗
}

/**
 * 开始引导式导览
 * 按预设顺序自动导览空间站的主要区域
 */
function startGuidedTour() {
    // 如果正在自动旋转，先停止
    if (isRotating) {
        toggleRotation();
    }
    
    // 重置到开始位置
    currentModule = 'tianhe'; // 从天和核心舱开始
    currentPanoramaIndex = 0; // 从第一个全景图开始
    updateView(); // 更新视图
    
    // 创建导览序列 - 定义导览路径和每个点的说明
    const tourSequence = [
        {module: 'tianhe', panorama: 0, hotspot: 0, description: "欢迎来到天和核心舱，中国空间站的中枢部分。这里是航天员的主要工作和生活区域。"},
        {module: 'tianhe', panorama: 1, hotspot: 1, description: "这是核心舱的工作区，航天员在这里进行日常操作和实验控制。"},
        {module: 'tianhe', panorama: 2, hotspot: 0, description: "这是航天员的生活区，提供睡眠、用餐和健身的空间，确保长期太空任务中的身心健康。"},
        {module: 'wentian', panorama: 0, hotspot: 0, description: "我们现在来到问天实验舱，这是主要的科研平台，支持多种科学实验。"},
        {module: 'wentian', panorama: 1, hotspot: 0, description: "这是生物实验区，研究微重力环境下的生物生长和适应机制。"},
        {module: 'mengtian', panorama: 0, hotspot: 1, description: "这是梦天实验舱，专注于高精度科学实验和舱外操作。"},
        {module: 'shenzhou', panorama: 0, hotspot: 0, description: "最后我们参观神舟飞船，这是航天员往返空间站的交通工具，也是紧急返回地球的生命保障。"},
        {module: 'tianzhou', panorama: 0, hotspot: 0, description: "现在我们参观天舟货运飞船，它负责将物资、设备以及补给送往中国空间站，支持航天员的长期工作和生活。"},
        {module: 'tianzhou', panorama: 1, hotspot: 0, description: "这是天舟货运飞船的货舱，装载着空间站所需的物资和实验设备。"},
        {module: 'tianzhou', panorama: 2, hotspot: 1, description: "这是天舟货运飞船的推进舱，装载推进剂，可以为空间站提供轨道维持和姿态控制所需的动力。"}
    ];
    
    // 运行引导式导览
    let currentStep = 0; // 当前导览步骤
    
    // 显示当前导览步骤
    function showGuidedTourStep() {
        if (currentStep >= tourSequence.length) {
            // 导览结束，显示结束信息
            popupTitle.textContent = "导览结束";
            popupContent.innerHTML = `
                <p>感谢您参加天宫空间站的导览！希望这次虚拟之旅让您对中国空间站有了更深入的了解。</p>
                <p>您现在可以继续自由探索各个舱段，或者使用其他功能体验更多内容。</p>
                <button id="endTourBtn" class="nav-btn">结束导览</button>
            `;
            infoPopup.classList.add('active'); // 显示结束弹窗
            
            // 添加结束按钮事件
            document.getElementById('endTourBtn').addEventListener('click', () => {
                infoPopup.classList.remove('active'); // 关闭弹窗
            });
            
            return; // 结束函数执行
        }
        
        const step = tourSequence[currentStep]; // 获取当前步骤数据
        
        // 切换到相应模块和全景图
        switchModule(step.module); // 切换到指定模块
        currentPanoramaIndex = step.panorama; // 设置全景图索引
        updateView(); // 更新视图
        
        // 短暂延迟后显示信息，让场景先加载完成
        setTimeout(() => {
            // 显示导览信息
            popupTitle.textContent = "导览信息";
            popupContent.innerHTML = `
                <p>${step.description}</p>
                <button id="nextTourStep" class="nav-btn">继续导览</button>
            `;
            infoPopup.classList.add('active'); // 显示导览信息弹窗
            
            // 添加继续按钮事件
            document.getElementById('nextTourStep').addEventListener('click', () => {
                currentStep++; // 前进到下一步
                infoPopup.classList.remove('active'); // 关闭弹窗
                setTimeout(showGuidedTourStep, 1000); // 延迟后显示下一步
            });
            
            // 高亮当前热点 - 使特定热点闪烁以引起注意
            const hotspots = document.querySelectorAll('.hotspot');
            if (hotspots.length > step.hotspot) {
                hotspots[step.hotspot].style.animation = 'pulse 1s infinite'; // 添加脉冲动画
                hotspots[step.hotspot].style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // 改变颜色
            }
        }, 1000); // 延迟1秒
    }
    
    // 开始导览
    showGuidedTourStep();
}

/**
 * 设置欢迎信息
 * 设置启动屏幕和初始欢迎弹窗
 */
function setupWelcomeMessage() {
    // 添加开始按钮点击事件
    startBtn.addEventListener('click', () => {
        // 启动屏幕淡出
        launchScreen.style.opacity = '0'; // 设置透明度为0
        setTimeout(() => {
            launchScreen.style.display = 'none'; // 隐藏启动屏幕
            
            // 短暂延迟后显示欢迎信息
            setTimeout(() => {
                popupTitle.textContent = "欢迎来到天宫空间站"; // 设置弹窗标题
                // 设置欢迎信息内容
                popupContent.innerHTML = `
                    <p>欢迎登上中国的天宫空间站！这个虚拟导览将带您探索中国航天员工作和生活的太空家园。</p>
                    <p>空间站由天和核心舱、问天实验舱和梦天实验舱组成，是中国自主研发和建造的国家级太空实验室。</p>
                    <p>点击场景中的热点标记（+）可以了解更多详细信息，使用导航按钮可以在不同区域间切换。</p>
                    <p>祝您在太空之旅中收获知识与乐趣！</p>
                    <button id="closeWelcome" class="nav-btn">开始探索</button>
                `;
                infoPopup.classList.add('active'); // 显示欢迎弹窗
                
                // 添加关闭按钮事件
                document.getElementById('closeWelcome').addEventListener('click', () => {
                    infoPopup.classList.remove('active'); // 关闭弹窗
                });
                 // 添加×按钮事件
                 document.getElementById('closePopup').addEventListener('click', () => {
                    infoPopup.classList.remove('active'); // 关闭弹窗
                });
            }, 1500); // 延迟1.5秒
        }, 1000); // 延迟1秒
    });
}
/**
 * 初始化虚拟漫游
 * 这个函数在页面加载完成后调用，设置整个虚拟漫游系统
 */
function initTour() {
    // 更新视图 - 显示初始全景图
    updateView();
    
    // 创建全景导航点 - 根据当前模块创建导航点
    createPanoramaNav();
    
    // 隐藏现有热点 - 清除可能存在的旧热点
    hideHotspots();
    
    // 创建热点 - 在当前全景图上添加交互热点
    createHotspots();
    
    // 添加控制面板 - 创建用户界面控制按钮
    createTourControls();
    
    // 添加键盘导航 - 设置键盘快捷键
    setupKeyboardNavigation();
    
    // 显示欢迎信息 - 设置启动屏幕和欢迎弹窗
    setupWelcomeMessage();
    
    // 记录访问 - 记录用户访问信息（仅控制台输出）
    logVisit();
}

/**
 * 创建模块选择按钮功能
 * 点击模块按钮后，开始自由探索
 */
function createModuleSelection() {
    const moduleBtns = document.querySelectorAll('.module-btn'); // 获取所有模块按钮
    
    // 为每个模块按钮添加点击事件
    moduleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleName = btn.dataset.module; // 获取模块名
            switchModule(moduleName); // 切换到对应模块的内容
        });
    });
}

/**
 * 切换模块
 * 切换到指定的空间站模块
 * @param {string} moduleName - 模块名称（如'tianhe', 'wentian'等）
 */
function switchModule(moduleName) {
    // 如果正在自动旋转，先停止
    if (isRotating) {
        toggleRotation();
    }
    
    currentModule = moduleName; // 更新当前模块
    currentPanoramaIndex = 0; // 重置为模块的第一个全景图
    
    // 高亮当前选中的模块按钮
    const moduleBtns = document.querySelectorAll('.module-btn');
    moduleBtns.forEach(btn => {
        if (btn.dataset.module === moduleName) {
            btn.classList.add('active'); // 当前按钮添加活动状态
        } else {
            btn.classList.remove('active'); // 其他按钮移除活动状态
        }
    });
    
    // 更新视图和导航点
    updateView(); // 更新视图，展示模块的全景图
    createPanoramaNav(); // 创建该模块的导航点，便于切换全景图
}

/**
 * 设置欢迎信息
 * 设置启动屏幕和初始欢迎弹窗
 */
function setupWelcomeMessage() {
    // 添加开始按钮点击事件
    startBtn.addEventListener('click', () => {
        // 启动屏幕淡出
        launchScreen.style.opacity = '0'; // 设置透明度为0
        setTimeout(() => {
            launchScreen.style.display = 'none'; // 隐藏启动屏幕
            
            // 短暂延迟后显示欢迎信息
            setTimeout(() => {
                popupTitle.textContent = "欢迎来到天宫空间站"; // 设置弹窗标题
                // 设置欢迎信息内容
                popupContent.innerHTML = `
                    <p>欢迎登上中国的天宫空间站！这个虚拟导览将带您探索中国航天员工作和生活的太空家园。</p>
                    <p>空间站由天和核心舱、问天实验舱和梦天实验舱组成，是中国自主研发和建造的国家级太空实验室。</p>
                    <p>点击场景中的热点标记（+）可以了解更多详细信息，使用导航按钮可以在不同区域间切换。</p>
                    <p>祝您在太空之旅中收获知识与乐趣！</p>
                    <button id="closeWelcome" class="nav-btn">开始探索</button>
                `;
                infoPopup.classList.add('active'); // 显示欢迎弹窗
                
                // 添加关闭按钮事件
                document.getElementById('closeWelcome').addEventListener('click', () => {
                    infoPopup.classList.remove('active'); // 关闭弹窗
                });
                                 // 添加×按钮事件
                                 document.getElementById('closePopup').addEventListener('click', () => {
                                    infoPopup.classList.remove('active'); // 关闭弹窗
                                });
            }, 1500); // 延迟1.5秒
        }, 1000); // 延迟1秒
    });
}

/**
 * 记录访问信息
 * 在实际项目中可以连接到分析系统，这里仅在控制台输出
 */
function logVisit() {
    console.log('虚拟漫游已启动', {
        timestamp: new Date().toISOString(), // 记录时间戳
        startModule: currentModule // 记录起始模块
    });
}

/**
 * 页面加载完成后初始化漫游
 */
window.addEventListener('load', () => {
    initTour();
    createModuleSelection(); // 初始化模块选择功能
});

/**
 * 记录访问信息
 * 在实际项目中可以连接到分析系统，这里仅在控制台输出
 */
function logVisit() {
    console.log('虚拟漫游已启动', {
        timestamp: new Date().toISOString(), // 记录时间戳
        startModule: currentModule // 记录起始模块
    });
}

// 页面加载完成后初始化漫游
window.addEventListener('load', initTour);

// 添加页面可见性变化处理
// 当用户切换到其他标签页时暂停自动旋转
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRotating) {
        // 页面不可见且正在旋转，暂停旋转
        clearInterval(rotationInterval); // 清除定时器
    } else if (!document.hidden && isRotating) {
        // 页面可见且应该旋转，恢复旋转
        rotationInterval = setInterval(nextPanorama, 5000); // 重新设置定时器
    }
});

// 添加窗口大小变化处理
// 在小屏幕上优化布局
window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        // 针对移动设备的调整 - 缩小信息面板
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.style.width = '200px'; // 设置较小宽度
    } else {
        // 针对桌面设备的调整 - 恢复信息面板
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.style.width = '300px'; // 设置标准宽度
    }
});
