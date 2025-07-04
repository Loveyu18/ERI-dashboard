# CO₂ 監測儀表板 - 文檔資料夾結構

## 📁 資料夾說明

### `/docs` - 主要文檔目錄

所有與專案相關的文檔、報告、分析和展示文件都存放在此目錄下。

```
docs/
├── analysis/           # 分析報告
├── reports/           # 實施報告
├── showcase/          # 展示頁面
├── testing/           # 測試文件
└── README.md          # 本說明文件
```

---

## 📊 各子資料夾詳細說明

### `/analysis` - 分析報告

存放各種技術分析、設計分析、效能分析等文件。

**現有文件：**

-   `container-removal-analysis.html` - 主容器移除方案分析報告

**未來可能新增：**

-   效能分析報告
-   使用者體驗分析
-   響應式設計分析
-   瀏覽器相容性分析

### `/reports` - 實施報告

存放各階段開發完成後的實施報告和總結。

**現有文件：**

-   `plan-a-completion-report.html` - 方案 A 實施完成報告

**未來可能新增：**

-   階段性開發報告
-   功能完成報告
-   問題解決報告
-   版本發布報告

### `/showcase` - 展示頁面

存放各種功能展示、設計展示、風格指南等展示性文件。

**現有文件：**

-   `ios26-showcase.html` - iOS 26 液態玻璃風格展示頁

**未來可能新增：**

-   組件庫展示
-   主題切換展示
-   動畫效果展示
-   響應式設計展示
-   色彩方案展示

### `/testing` - 測試文件

存放各種測試文件、測試報告、測試計劃等。

**未來可能新增：**

-   單元測試報告
-   整合測試文件
-   使用者測試報告
-   效能測試結果
-   自動化測試腳本
-   瀏覽器測試報告
-   行動裝置測試
-   可訪問性測試

---

## 🎯 檔案命名規範

### 建議的命名格式：

-   **分析文件：** `{主題}-analysis-{日期}.html`
    -   例：`performance-analysis-20240704.html`
-   **報告文件：** `{階段/功能}-{類型}-report-{日期}.html`
    -   例：`phase2-completion-report-20240704.html`
-   **展示文件：** `{主題}-showcase-{版本}.html`
    -   例：`dark-theme-showcase-v1.html`
-   **測試文件：** `{類型}-test-{日期}.html`
    -   例：`responsive-test-20240704.html`

### 日期格式：

使用 `YYYYMMDD` 格式，例如：`20240704`

---

## 🔗 相對路徑參考

從主專案目錄存取文檔：

```html
<!-- 從 index.html 連結到文檔 -->
<a href="docs/showcase/ios26-showcase.html">查看 iOS26 展示</a>
<a href="docs/reports/plan-a-completion-report.html">查看方案A報告</a>
```

從文檔目錄存取主專案：

```html
<!-- 從文檔連結回主專案 -->
<a href="../../index.html">返回主頁</a>
<a href="../../styles/style.css">查看樣式</a>
```

---

## 📝 維護說明

1. **定期整理：** 每個月檢查並整理過期或不需要的測試文件
2. **版本控制：** 重要的分析和報告文件應該保留版本記錄
3. **索引更新：** 新增重要文件時，更新此 README.md
4. **連結檢查：** 定期檢查文檔間的內部連結是否正常

---

## 🚀 快速存取

### 重要文件直達：

-   [iOS26 風格展示](showcase/ios26-showcase.html)
-   [方案 A 完成報告](reports/plan-a-completion-report.html)
-   [容器分析報告](analysis/container-removal-analysis.html)

### 主專案文件：

-   [主頁面](../index.html)
-   [樣式檔案](../styles/)
-   [JavaScript 檔案](../javascript/)

---

_最後更新：2024 年 7 月 4 日_
