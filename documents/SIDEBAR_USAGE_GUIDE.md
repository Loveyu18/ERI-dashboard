# 側邊導覽列使用指南

## 概述

這是一個模組化的側邊導覽列組件，設計用於環資國際的所有網頁系統。它包含了品牌標識、導覽菜單和響應式設計。

## 檔案結構

```
components/
├── sidebar-nav.html        # 側邊導覽列 HTML 模板
styles/
├── sidebar-nav.css         # 側邊導覽列樣式
javascript/
├── sidebar-nav.js          # 側邊導覽列 JavaScript 功能
image/
├── eri-logo.png           # 環資國際 LOGO
```

## 如何在新頁面中使用

### 1. 引入必要的檔案

在您的 HTML 文件中加入以下引用：

```html
<head>
    <!-- 其他 CSS 檔案 -->
    <link rel="stylesheet" href="./styles/sidebar-nav.css" />
</head>

<body>
    <!-- 頁面內容 -->
    <div class="container main-content">
        <!-- 您的頁面內容 -->
    </div>

    <!-- 在 body 結束前引入 JavaScript -->
    <script src="./javascript/sidebar-nav.js"></script>
    <!-- 其他 JavaScript 檔案 -->
</body>
```

### 2. 添加 main-content 類別

確保您的主要內容容器有 `main-content` 類別，這樣可以確保在大螢幕上側邊欄打開時內容會適當調整位置。

### 3. 調整 CSS 層級

如果您的頁面有其他懸浮元素，請確保 z-index 值不會與側邊導覽列衝突：

-   側邊導覽列：z-index: 2000
-   遮罩層：z-index: 999
-   其他元素請使用低於 2000 的值

## 自訂化選項

### 1. 修改導覽項目

在 `components/sidebar-nav.html` 中修改導覽項目：

```html
<li class="nav-item">
    <a href="your-page.html" class="nav-link" data-page="your-page">
        <span class="nav-icon">🔧</span>
        <span class="nav-text">您的頁面</span>
    </a>
</li>
```

### 2. 透過 JavaScript 動態添加項目

```javascript
// 等待側邊導覽列載入完成
document.addEventListener("DOMContentLoaded", () => {
    if (window.sidebarNav) {
        // 添加新的導覽項目
        window.sidebarNav.addNavItem(".nav-section:first-child", {
            href: "new-page.html",
            page: "new-page",
            icon: "🆕",
            text: "新頁面",
        });
    }
});
```

### 3. 設定當前頁面活動狀態

側邊導覽列會自動根據當前頁面 URL 設定活動狀態，但您也可以手動設定：

```javascript
// 手動設定活動頁面
window.sidebarNav.updateNavigation("your-page-key");
```

## 響應式設計與使用行為

-   **大螢幕 (≥769px)**：
    -   側邊欄預設展開
    -   主要內容自動調整左邊距
    -   無遮罩層，使用者可正常操作頁面
    -   只能透過按鈕或 ESC 鍵手動收合
-   **小螢幕 (≤768px)**：
    -   側邊欄預設收合
    -   以覆蓋模式顯示，有遮罩層
    -   點擊遮罩層或導覽項目會自動收合
    -   節省空間，優化觸控體驗

## 頁面映射配置

目前支援的頁面映射：

-   `index.html` → `dashboard` (CO₂ 儀表板)
-   `air-quality.html` → `air-quality` (空氣品質)
-   `temperature.html` → `temperature` (溫濕度監測)
-   `data-export.html` → `data-export` (數據匯出)
-   `reports.html` → `reports` (報告生成)
-   `analytics.html` → `analytics` (數據分析)
-   `settings.html` → `settings` (系統設定)
-   `users.html` → `users` (使用者管理)
-   `help.html` → `help` (說明文件)

## 注意事項

1. 確保 `components/sidebar-nav.html` 和相關的 CSS、JS 檔案在正確的路徑
2. LOGO 檔案 `eri-logo.png` 應放在 `image/` 目錄下
3. 如果您的頁面在子目錄中，請相應調整檔案路徑

## 示例頁面模板

```html
<!DOCTYPE html>
<html lang="zh-Hant">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>您的頁面標題 - 環資國際</title>
        <link rel="stylesheet" href="./styles/sidebar-nav.css" />
        <!-- 您的其他 CSS 檔案 -->
    </head>
    <body>
        <div class="container main-content">
            <h1>您的頁面標題</h1>
            <!-- 您的頁面內容 -->
        </div>

        <script src="./javascript/sidebar-nav.js"></script>
        <!-- 您的其他 JavaScript 檔案 -->
    </body>
</html>
```

這樣您就可以在任何頁面中使用這個統一的側邊導覽列了！
