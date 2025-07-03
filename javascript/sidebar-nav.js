/* 側邊導覽列 JavaScript 模組 */
class SidebarNav {
    constructor() {
        this.sidebar = null;
        this.sidebarContent = null;
        this.sidebarToggle = null;
        this.sidebarOverlay = null;
        this.currentPage = null;
        this.init();
    }

    init() {
        this.loadSidebarHTML();
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

            // 設置當前頁面活動狀態
            this.setActivePage();

            // 綁定事件
            this.bindEvents();

    
        } catch (error) {
            console.error("載入側邊導覽列失敗:", error);
        }
    }



    bindEvents() {
        // 內部開關按鈕事件
        this.sidebarToggle.addEventListener("click", () => {
            this.toggleSidebar();
        });

        // 外部開關按鈕事件
        this.sidebarToggleExternal.addEventListener("click", () => {
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
                }
            });
        });

        // 響應式處理
        window.addEventListener("resize", () => {
            if (window.innerWidth <= 768) {
                // 小螢幕時自動收合側邊欄
                this.closeSidebar();
            }
        });

        // 初始化時檢查螢幕尺寸
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }

    toggleSidebar() {
        this.sidebar.classList.toggle("collapsed");
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

        // 設置當前頁面活動狀態
        const pageMapping = {
            "index.html": "dashboard",
            "air-quality.html": "air-quality",
            "temperature.html": "temperature",
            "data-export.html": "data-export",
            "reports.html": "reports",
            "analytics.html": "analytics",
            "settings.html": "settings",
            "users.html": "users",
            "help.html": "help",
        };

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
}

// 自動初始化側邊導覽列
document.addEventListener("DOMContentLoaded", () => {
    window.sidebarNav = new SidebarNav();
});

// 導出模組（如果需要）
if (typeof module !== "undefined" && module.exports) {
    module.exports = SidebarNav;
}
