# ERI Dashboard - Clean Code 重構實施計劃

## 🎯 **重構實施步驟**

### **第一階段：基礎設施重構 (1-2 天)**

#### 1.1 引入 CSS 變數系統
```bash
# 將 variables.css 加入到 HTML
# 在 index.html 的 <head> 中添加：
<link rel="stylesheet" href="./styles/variables.css" />
```

#### 1.2 重新組織 CSS 文件結構
```
styles/
├── variables.css      ✅ 已創建
├── base.css          # 從 style.css 提取基礎樣式
├── layout.css        # 從 style.css 提取佈局樣式
├── components.css    # 從 style.css 提取組件樣式
└── utilities.css     # 工具類樣式
```

#### 1.3 建立 JavaScript 模組基礎
```
javascript/
├── utils/
│   ├── helpers.js    ✅ 示例已提供
│   ├── EventEmitter.js  ✅ 示例已提供
│   └── constants.js  # 常數定義
├── services/
│   └── DataService.js   ✅ 示例已提供
└── components/
    └── (待創建)
```

### **第二階段：CSS 重構 (2-3 天)**

#### 2.1 提取基礎樣式 (base.css)
```css
/* base.css */
/* 從 style.css 移出以下內容： */
body { ... }
h1, h2, h3, h4, h5, h6 { ... }
*, *::before, *::after {
    box-sizing: border-box;
}

/* 重置樣式 */
* {
    margin: 0;
    padding: 0;
}

/* 字體設定 */
body {
    font-family: var(--font-family-primary);
    color: var(--text-primary);
    line-height: 1.6;
}
```

#### 2.2 提取佈局樣式 (layout.css)
```css
/* layout.css */
.container { ... }
.main-content { ... }
.sidebar-nav { ... }

/* 網格系統 */
.grid {
    display: grid;
}

.grid--3-cols {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
}

/* Flexbox 工具 */
.flex {
    display: flex;
}

.flex--center {
    align-items: center;
    justify-content: center;
}

.flex--column {
    flex-direction: column;
}
```

#### 2.3 提取組件樣式 (components.css)
```css
/* components.css */

/* 卡片組件 */
.card {
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-strong);
    backdrop-filter: var(--glass-strong);
    box-shadow: var(--shadow-card);
    transition: var(--transition-all);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
}

/* 按鈕組件 */
.btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-all);
}

.btn--primary {
    background: var(--primary-blue);
    color: var(--text-white);
}

.btn--secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

/* 表單組件 */
.form-group {
    margin-bottom: var(--spacing-lg);
}

.form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    color: var(--text-primary);
}

.form-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    backdrop-filter: var(--glass-light);
}
```

### **第三階段：JavaScript 重構 (3-4 天)**

#### 3.1 分離主要模組
```javascript
// modules/Dashboard.js
class Dashboard {
    constructor() {
        this.dataService = new DataService();
        this.chart = null;
        this.refreshTimer = null;
    }

    async init() {
        await this.setupEventListeners();
        await this.loadInitialData();
        this.startAutoRefresh();
    }

    async loadInitialData() {
        const data = await this.dataService.getTodayData();
        this.updateUI(data);
    }

    updateUI(data) {
        this.updateRoomCards(data);
        this.updateChart(data);
        this.updateRecentDataTable(data);
    }
}

// modules/Sidebar.js
class Sidebar {
    constructor() {
        this.isCollapsed = false;
        this.element = null;
    }

    init() {
        this.element = document.getElementById('sidebar');
        this.setupEventListeners();
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;
        this.element.classList.toggle('collapsed', this.isCollapsed);
    }
}

// modules/Chatbot.js
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
    }

    init() {
        this.setupEventListeners();
        this.loadQuickQuestions();
    }

    addMessage(message, isUser = false) {
        this.messages.push({ message, isUser, timestamp: new Date() });
        this.renderMessages();
    }
}
```

#### 3.2 建立服務層
```javascript
// services/ChartService.js
class ChartService {
    constructor() {
        this.chart = null;
        this.config = CONFIG.CHART_CONFIG;
    }

    createChart(canvasId, data) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = new Chart(ctx, {
            ...this.config,
            data: this.formatData(data)
        });
    }

    updateChart(data) {
        if (this.chart) {
            this.chart.data = this.formatData(data);
            this.chart.update();
        }
    }

    formatData(data) {
        // 數據格式化邏輯
    }
}

// services/NotificationService.js
class NotificationService {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }
}
```

### **第四階段：HTML 重構 (1-2 天)**

#### 4.1 語義化 HTML 結構
```html
<!-- 重構前 -->
<div class="room" id="roomA">
    <div class="room-header">
        <div class="room-icon">🏢</div>
        <h3 class="name">辦公室 A</h3>
    </div>
</div>

<!-- 重構後 -->
<article class="room room--theme-blue" id="roomA" role="region" aria-labelledby="roomA-title">
    <header class="room__header">
        <div class="room__icon" aria-hidden="true">🏢</div>
        <h3 class="room__title" id="roomA-title">辦公室 A</h3>
    </header>
    <div class="room__content">
        <div class="room__co2-reading">
            <span class="room__value" aria-label="CO2 濃度">載入中...</span>
            <span class="room__unit" aria-hidden="true">ppm</span>
        </div>
        <div class="room__status-indicator">
            <span class="room__status" role="status" aria-live="polite">載入中...</span>
        </div>
    </div>
    <footer class="room__footer">
        <time class="room__last-update" datetime="">🕒 載入中...</time>
    </footer>
</article>
```

#### 4.2 可訪問性改進
```html
<!-- 添加適當的 ARIA 標籤 -->
<nav role="navigation" aria-label="主要導航">
<main role="main" aria-label="儀表板主要內容">
<section role="region" aria-labelledby="co2-status-title">
<button aria-expanded="false" aria-controls="sidebar">選單</button>
<form role="form" aria-labelledby="manual-input-title">
```

### **第五階段：效能優化 (1-2 天)**

#### 5.1 CSS 優化
```css
/* 使用 CSS 變數減少重複 */
/* 合併相似的選擇器 */
/* 移除未使用的樣式 */

/* 優化動畫效果 */
.room {
    will-change: transform; /* 只在需要時添加 */
}

.room:hover {
    will-change: auto; /* 動畫結束後移除 */
}

/* 使用 CSS Grid 和 Flexbox 替代 float */
.status-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-lg);
}
```

#### 5.2 JavaScript 優化
```javascript
// 使用防抖和節流
const debouncedSearch = Helpers.debounce(searchFunction, 300);
const throttledScroll = Helpers.throttle(scrollHandler, 100);

// 延遲載入非關鍵模組
async function loadChatbot() {
    const { Chatbot } = await import('./modules/Chatbot.js');
    return new Chatbot();
}

// 使用 Web Workers 處理大量數據
const worker = new Worker('./workers/dataProcessor.js');
worker.postMessage(largeDataSet);
```

### **第六階段：測試和驗證 (1-2 天)**

#### 6.1 功能測試
- [ ] 所有現有功能正常運作
- [ ] 響應式設計在各種裝置上正確顯示
- [ ] 瀏覽器相容性測試

#### 6.2 效能測試
- [ ] 頁面載入時間改善
- [ ] CSS 檔案大小減少
- [ ] JavaScript 執行效率提升

#### 6.3 可訪問性測試
- [ ] 鍵盤導航功能
- [ ] 螢幕閱讀器相容性
- [ ] 色彩對比度檢查

## 📊 **預期改善指標**

### **代碼品質**
- ✅ CSS 檔案大小減少 30-40%
- ✅ JavaScript 模組化，提高可維護性
- ✅ 減少重複代碼 60-70%
- ✅ 提高代碼可讀性和一致性

### **效能提升**
- ✅ 頁面載入速度提升 20-30%
- ✅ 記憶體使用量減少
- ✅ 更流暢的動畫效果

### **開發體驗**
- ✅ 新功能開發速度提升 40-50%
- ✅ Bug 修復時間減少
- ✅ 團隊協作效率提升

## 🚀 **立即可以開始的改進**

1. **引入 CSS 變數檔案**
2. **統一命名規範**
3. **提取共用函數**
4. **建立基本的模組結構**
5. **改善錯誤處理**

這個重構計劃將讓您的代碼更加整潔、可維護，並且更容易擴展新功能！
