/* 側邊導覽列 JavaScript 模組 */
class SidebarNav {
    constructor() {
        this.sidebar = null;
        this.sidebarContent = null;
        this.sidebarToggle = null;
        this.sidebarOverlay = null;
        this.currentPage = null;
        this.pageLoadingOverlay = null;
        this.loadingText = null;
        this.loadingSubtext = null;
        this.init();
    }

    init() {
        // 檢查是否已經存在側邊導覽列
        this.sidebar = document.getElementById("sidebarNav");

        if (this.sidebar) {
            // 如果已經存在，直接初始化
            this.initExistingSidebar();
        } else {
            // 如果不存在，從組件檔案載入
            this.loadSidebarHTML();
        }
    }

    initExistingSidebar() {
        console.log("初始化已存在的側邊導覽列");

        // 初始化已存在的側邊導覽列元素
        this.sidebarContent = document.getElementById("sidebarContent");
        this.sidebarToggle = document.getElementById("sidebarToggle");
        this.sidebarToggleExternal = document.getElementById("sidebarToggleExternal");
        this.sidebarOverlay = document.getElementById("sidebarOverlay");
        this.pageLoadingOverlay = document.getElementById("pageLoadingOverlay");
        this.loadingText = document.getElementById("loadingText");
        this.loadingSubtext = document.getElementById("loadingSubtext");

        console.log("元素檢查:", {
            sidebarContent: !!this.sidebarContent,
            sidebarToggle: !!this.sidebarToggle,
            sidebarToggleExternal: !!this.sidebarToggleExternal,
            sidebarOverlay: !!this.sidebarOverlay,
        });

        // 設置當前頁面活動狀態
        this.setActivePage();

        // 綁定事件
        this.bindEvents();

        // 確保頁面載入後隱藏 Loading
        this.hidePageLoading();

        console.log("側邊導覽列初始化完成");
    }

    async loadSidebarHTML() {
        try {
            const response = await fetch("./components/sidebar-nav.html");
            const html = await response.text();

            // 將側邊導覽列插入到 body 的開頭
            document.body.insertAdjacentHTML("afterbegin", html);
            // 初始化元素引用
            this.sidebar = document.getElementById("sidebarNav");
            this.sidebarContent = document.getElementById("sidebarContent");
            this.sidebarToggle = document.getElementById("sidebarToggle");
            this.sidebarToggleExternal = document.getElementById("sidebarToggleExternal");
            this.sidebarOverlay = document.getElementById("sidebarOverlay");
            this.pageLoadingOverlay = document.getElementById("pageLoadingOverlay");
            this.loadingText = document.getElementById("loadingText");
            this.loadingSubtext = document.getElementById("loadingSubtext");

            // 設置當前頁面活動狀態
            this.setActivePage();

            // 綁定事件
            this.bindEvents();

            // 確保頁面載入後隱藏 Loading
            this.hidePageLoading();
        } catch (error) {
            console.error("載入側邊導覽列失敗:", error);
        }
    }

    bindEvents() {
        // 確保所有元素都存在
        if (!this.sidebarToggle || !this.sidebarToggleExternal || !this.sidebarOverlay) {
            console.error("側邊導覽列元素未找到", {
                sidebarToggle: !!this.sidebarToggle,
                sidebarToggleExternal: !!this.sidebarToggleExternal,
                sidebarOverlay: !!this.sidebarOverlay,
            });
            return;
        }

        console.log("綁定側邊導覽列事件");

        // 內部開關按鈕事件
        this.sidebarToggle.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("內部按鈕被點擊");
            this.toggleSidebar();
        });

        // 外部開關按鈕事件
        this.sidebarToggleExternal.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("外部按鈕被點擊");
            this.toggleSidebar();
        });

        // 遮罩層點擊事件 - 只在小螢幕時生效
        this.sidebarOverlay.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                this.closeSidebar();
            }
        });

        // ESC 鍵關閉（保留快捷鍵功能）
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !this.sidebar.classList.contains("collapsed")) {
                this.closeSidebar();
            }
        });

        // 導覽連結點擊事件
        const navLinks = this.sidebar.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                // 如果是當前頁面，不進行跳轉
                if (link.classList.contains("active")) {
                    e.preventDefault();
                    // 只在小螢幕時自動收合
                    if (window.innerWidth <= 768) {
                        this.closeSidebar();
                    }
                } else {
                    // 切換到其他頁面時顯示 Loading
                    const targetPage = link.getAttribute('data-page');
                    this.showPageLoadingForTarget(targetPage);
                    
                    // 延遲跳轉，讓 Loading 動畫有時間顯示
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 300);
                    
                    e.preventDefault();
                }
            });
        });

        // 響應式處理
        window.addEventListener("resize", () => {
            if (window.innerWidth <= 768) {
                // 小螢幕時自動收合側邊欄
                this.closeSidebar();
            } else {
                // 大螢幕時自動展開側邊欄
                this.openSidebar();
            }
        });

        // 初始化時檢查螢幕尺寸
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    toggleSidebar() {
        console.log("切換側邊導覽列狀態");
        this.sidebar.classList.toggle("collapsed");
        console.log("當前狀態:", this.sidebar.classList.contains("collapsed") ? "收合" : "展開");
    }

    openSidebar() {
        this.sidebar.classList.remove("collapsed");
    }

    closeSidebar() {
        this.sidebar.classList.add("collapsed");
    }

    setActivePage() {
        // 根據當前頁面 URL 設置活動狀態
        const currentPath = window.location.pathname;
        const fileName = currentPath.split("/").pop() || "index.html";

        // 移除所有活動狀態
        const navLinks = this.sidebar.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.classList.remove("active");
        });

        // 設置當前頁面活動狀態 - 只保留實際存在的頁面
        const pageMapping = {
            "index.html": "home",
            "co2-monitor.html": "co2-monitor",
        };

        // 處理 docs 資料夾中的檔案
        if (currentPath.includes("/docs/")) {
            const activeLink = this.sidebar.querySelector(`[data-page="docs"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
            return;
        }

        const currentPageKey = pageMapping[fileName];
        if (currentPageKey) {
            const activeLink = this.sidebar.querySelector(`[data-page="${currentPageKey}"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    }

    // 公開方法：更新導覽列狀態
    updateNavigation(pageKey) {
        const navLinks = this.sidebar.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
            link.classList.remove("active");
        });

        const targetLink = this.sidebar.querySelector(`[data-page="${pageKey}"]`);
        if (targetLink) {
            targetLink.classList.add("active");
        }
    }

    // 公開方法：添加新的導覽項目
    addNavItem(sectionSelector, item) {
        const section = this.sidebar.querySelector(sectionSelector);
        if (section) {
            const navList = section.querySelector(".nav-list");
            const navItem = document.createElement("li");
            navItem.className = "nav-item";
            navItem.innerHTML = `
                <a href="${item.href}" class="nav-link" data-page="${item.page}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-text">${item.text}</span>
                </a>
            `;
            navList.appendChild(navItem);
        }
    }

    // 公開方法：移除導覽項目
    removeNavItem(pageKey) {
        const targetLink = this.sidebar.querySelector(`[data-page="${pageKey}"]`);
        if (targetLink) {
            const navItem = targetLink.closest(".nav-item");
            navItem.remove();
        }
    }

    // 頁面切換 Loading 控制方法
    showPageLoading() {
        console.log("顯示頁面切換 Loading");
        if (this.pageLoadingOverlay) {
            // 更新載入文字
            if (this.loadingText) {
                this.loadingText.textContent = "正在切換頁面...";
            }
            if (this.loadingSubtext) {
                this.loadingSubtext.textContent = "請稍候片刻";
            }
            
            this.pageLoadingOverlay.style.display = "flex";
        }
    }

    // 根據目標頁面顯示特定的 Loading 訊息
    showPageLoadingForTarget(targetPage) {
        console.log("顯示頁面切換 Loading:", targetPage);
        
        const loadingMessages = {
            'home': {
                main: '正在載入個人工作台...',
                sub: '準備您的專屬儀表板'
            },
            'co2-monitor': {
                main: '正在載入 CO₂ 監測...',
                sub: '連接感測器數據中'
            },
            'docs': {
                main: '正在載入文件資源...',
                sub: '準備使用指南'
            }
        };

        const message = loadingMessages[targetPage] || {
            main: '正在切換頁面...',
            sub: '請稍候片刻'
        };

        if (this.pageLoadingOverlay) {
            if (this.loadingText) {
                this.loadingText.textContent = message.main;
            }
            if (this.loadingSubtext) {
                this.loadingSubtext.textContent = message.sub;
            }
            
            this.pageLoadingOverlay.style.display = "flex";
        }
    }

    hidePageLoading() {
        console.log("隱藏頁面切換 Loading");
        if (this.pageLoadingOverlay) {
            this.pageLoadingOverlay.style.display = "none";
        }
    }

    // 設置自定義 Loading 訊息
    setLoadingMessage(mainText, subText) {
        if (this.loadingText) {
            this.loadingText.textContent = mainText;
        }
        if (this.loadingSubtext) {
            this.loadingSubtext.textContent = subText;
        }
    }
}

// 自動初始化側邊導覽列
document.addEventListener("DOMContentLoaded", () => {
    window.sidebarNav = new SidebarNav();
});

// 導出模組（如果需要）
if (typeof module !== "undefined" && module.exports) {
    module.exports = SidebarNav;
}
