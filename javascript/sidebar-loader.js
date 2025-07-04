/**
 * 側邊導覽列組件載入器
 * 自動載入 sidebar-nav.html 組件並處理相關功能
 */

class SidebarLoader {
    constructor() {
        this.currentPage = this.getCurrentPageId();
        this.init();
    }

    // 獲取當前頁面標識
    getCurrentPageId() {
        const path = window.location.pathname;
        const filename = path.split("/").pop().replace(".html", "");

        // 根據檔案名稱對應到導覽列的 data-page 值
        const pageMap = {
            index: "home",
            "co2-monitor": "co2-monitor",
            "air-quality": "air-quality",
            "test-sidebar": "test-sidebar",
        };

        return pageMap[filename] || filename;
    }

    // 初始化
    async init() {
        try {
            await this.loadSidebarComponent();
            this.setActiveNavItem();
            this.initSidebarFunctionality();
        } catch (error) {
            console.error("載入側邊導覽列失敗:", error);
            this.createFallbackSidebar();
        }
    }

    // 載入側邊導覽列組件
    async loadSidebarComponent() {
        const response = await fetch("./components/sidebar-nav.html");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const sidebarHTML = await response.text();

        // 查找 sidebar 容器或創建一個
        let sidebarContainer = document.getElementById("sidebarContainer");
        if (!sidebarContainer) {
            sidebarContainer = document.createElement("div");
            sidebarContainer.id = "sidebarContainer";
            document.body.insertBefore(sidebarContainer, document.body.firstChild);
        }

        sidebarContainer.innerHTML = sidebarHTML;
    }

    // 設定當前頁面的導覽項目為活動狀態
    setActiveNavItem() {
        // 移除所有現有的 active 狀態
        const allNavLinks = document.querySelectorAll(".nav-link");
        allNavLinks.forEach((link) => link.classList.remove("active"));

        // 為當前頁面添加 active 狀態
        const currentNavLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentNavLink) {
            currentNavLink.classList.add("active");
        }
    }

    // 初始化側邊導覽列功能
    initSidebarFunctionality() {
        // 等待 DOM 完全載入後再初始化
        setTimeout(() => {
            const sidebar = document.getElementById("sidebarNav");
            const toggleBtn = document.getElementById("sidebarToggle");
            const externalToggle = document.getElementById("sidebarToggleExternal");
            const overlay = document.getElementById("sidebarOverlay");

            if (!sidebar || !toggleBtn || !externalToggle) {
                console.warn("側邊導覽列元素未找到，使用備用方案");
                return;
            }

            // 綁定切換按鈕事件
            const toggleSidebar = (e) => {
                e.preventDefault();
                sidebar.classList.toggle("collapsed");
            };

            toggleBtn.addEventListener("click", toggleSidebar);
            externalToggle.addEventListener("click", toggleSidebar);

            // 點擊遮罩關閉側邊欄（移動版）
            if (overlay) {
                overlay.addEventListener("click", () => {
                    sidebar.classList.add("collapsed");
                });
            }

            // 響應式處理
            this.handleResponsive();

            console.log("側邊導覽列功能初始化完成");
        }, 100);
    }

    // 響應式處理
    handleResponsive() {
        const sidebar = document.getElementById("sidebarNav");
        if (!sidebar) return;

        const checkScreenSize = () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add("collapsed");
            }
        };

        // 初始檢查
        checkScreenSize();

        // 監聽視窗大小變化
        window.addEventListener("resize", checkScreenSize);
    }

    // 創建備用側邊導覽列（如果組件載入失敗）
    createFallbackSidebar() {
        console.log("創建備用側邊導覽列");

        const fallbackHTML = `
            <div class="sidebar-nav collapsed" id="sidebarNav">
                <button class="sidebar-toggle-external" id="sidebarToggleExternal">
                    <span class="toggle-icon">⟩</span>
                </button>
                <div class="sidebar-content" id="sidebarContent">
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <span class="toggle-icon">⟨</span>
                    </button>
                    <div class="brand-section">
                        <h2>環資國際</h2>
                    </div>
                    <nav class="nav-menu">
                        <div class="nav-section">
                            <h3>主要功能</h3>
                            <ul class="nav-list">
                                <li class="nav-item">
                                    <a href="index.html" class="nav-link">
                                        <span class="nav-icon">🏠</span>
                                        <span class="nav-text">個人工作台</span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a href="co2-monitor.html" class="nav-link">
                                        <span class="nav-icon">🌱</span>
                                        <span class="nav-text">CO₂ 監測</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>
        `;

        let sidebarContainer = document.getElementById("sidebarContainer");
        if (!sidebarContainer) {
            sidebarContainer = document.createElement("div");
            sidebarContainer.id = "sidebarContainer";
            document.body.insertBefore(sidebarContainer, document.body.firstChild);
        }

        sidebarContainer.innerHTML = fallbackHTML;
        this.initSidebarFunctionality();
    }
}

// 當 DOM 載入完成時自動初始化
document.addEventListener("DOMContentLoaded", () => {
    new SidebarLoader();
});

// 也提供全域存取
window.SidebarLoader = SidebarLoader;
