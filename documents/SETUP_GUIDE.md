# Google Sheets 數據寫入功能設置指南

## 功能說明

這個功能允許用戶從網頁表單手動輸入 CO₂ 數據，並直接寫入到 Google Sheets 中。

## 設置步驟

### 1. 創建 Google Apps Script

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點擊「新專案」
3. 將 `google-apps-script.js` 文件中的代碼複製到 `Code.gs` 中
4. 修改代碼中的 `SHEET_ID` 為您的 Google Sheet ID

### 2. 部署 Web App

1. 在 Google Apps Script 編輯器中，點擊「部署」> 「新增部署」
2. 選擇類型：「網頁應用程式」
3. 說明：輸入「CO2 數據寫入服務」
4. 執行身分：選擇「我」
5. 具有存取權的使用者：選擇「任何人」
6. 點擊「部署」

#### ⚠️ 重要：處理「Google hasn't verified this app」警告

當您首次訪問 Web App URL 時，可能會看到安全警告：

-   點擊「Advanced」（進階）
-   點擊「Go to [your-project-name] (unsafe)」（前往 [專案名稱]（不安全））
-   這是正常的，因為這是您自己創建的私人應用程式

7. 複製生成的 Web App URL
8. 在新的瀏覽器分頁中測試 URL，通過安全驗證

### 3. 配置前端

1. 在 `script.js` 中找到這一行：
    ```javascript
    const writeUrl = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
    ```
2. 將 `YOUR_SCRIPT_ID` 替換為步驟 2 中獲得的實際 Web App URL
    <!-- AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK -->
    <!-- https://script.google.com/macros/s/AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK/exec -->

### 4. 測試功能

1. 在瀏覽器中打開 `index.html`
2. 點擊「手動輸入數據」
3. 填寫表單並提交
4. 檢查 Google Sheet 是否有新數據

## Google Sheet 格式要求

確保您的 Google Sheet 有以下欄位（第一行）：

-   日期
-   時間
-   中華辦 7 樓
-   中華辦 8 樓
-   衡陽辦

## 故障排除

### 錯誤：「Google hasn't verified this app」

**這是正常現象！** 因為這是您的私人應用程式，Google 會顯示安全警告。

**解決步驟：**

1. 在警告頁面點擊「Advanced」（進階）
2. 點擊「Go to [your-project-name] (unsafe)」
3. 如果看到權限請求頁面，點擊「Allow」（允許）
4. 完成授權後，Web App 就可以正常使用了

**為什麼會出現這個警告？**

-   Google 要求公開應用程式必須經過驗證
-   私人使用的 Apps Script 不需要驗證
-   這個警告是 Google 的安全機制，保護用戶免受惡意應用程式影響

### 錯誤：「找不到工作表」

-   檢查 Google Apps Script 中的 `SHEET_ID` 是否正確
-   檢查工作表名稱是否為 "data"

### 錯誤：「權限被拒絕」

-   確保在部署時選擇了「任何人」可以存取
-   檢查 Google Apps Script 的執行權限

### 數據寫入失敗

-   檢查網路連線
-   打開瀏覽器開發者工具查看錯誤訊息
-   在 Google Apps Script 中查看執行記錄

## 常見錯誤和解決方案

### 錯誤：`Cannot read properties of undefined (reading 'postData')`

**原因：** 這個錯誤通常發生在以下情況：

1. 直接在瀏覽器中訪問 Web App URL（這會觸發 GET 請求而不是 POST）
2. 前端沒有正確發送 POST 數據

**解決方案：**

1. **不要直接在瀏覽器中訪問 Web App URL** - 這是正常現象
2. 使用我們提供的測試工具：打開 `test-apps-script.html` 進行測試
3. 確保前端代碼中的 `writeUrl` 設置正確

### 使用測試工具

我們為您創建了一個專用的測試工具 `test-apps-script.html`：

1. **打開測試工具**：在瀏覽器中打開 `test-apps-script.html`
2. **輸入 Web App URL**：貼上您的 Google Apps Script Web App URL
3. **執行 GET 測試**：檢查基本連接
4. **執行 POST 測試**：測試實際的數據寫入功能

### 測試結果解讀

#### ✅ 正常情況

-   GET 測試：應該返回服務狀態信息
-   POST 測試：應該返回 `success: true` 和寫入結果

#### ⚠️ 常見問題

-   **CORS 錯誤**：這是正常的，瀏覽器安全機制
-   **權限錯誤**：需要重新授權 Apps Script
-   **找不到工作表**：檢查 SHEET_ID 和工作表名稱

## 詳細的授權流程說明

### 第一次訪問 Web App 時的完整流程：

#### 步驟 1：初始警告頁面

當您首次點擊 Web App URL 時，會看到：

```
Google hasn't verified this app
The app is requesting access to sensitive info in your Google Account.
Until the developer (your-email@gmail.com) verifies this app with Google, you shouldn't use it.
```

#### 步驟 2：繞過警告

1. 點擊左下角的「Advanced」（進階）連結
2. 會出現更多選項
3. 點擊「Go to [your-project-name] (unsafe)」

#### 步驟 3：授權應用程式

您可能會看到權限請求頁面：

```
[Your Project] wants to access your Google Account
This will allow [Your Project] to:
- See, edit, create, and delete all your Google Sheets spreadsheets
```

1. 點擊「Allow」（允許）
2. 完成授權

#### 步驟 4：確認 Web App 正常運行

成功授權後，您應該會看到類似以下的 JSON 回應：

```json
{
    "success": true,
    "message": "CO2 監測數據寫入服務運行正常",
    "timestamp": "2025-01-19T...",
    "sheetId": "your-sheet-id",
    "sheetName": "data"
}
```

### 安全說明

-   這個警告是正常的，因為 Google Apps Script 應用程式需要特殊驗證才能去除警告
-   由於這是您自己創建的私人應用程式，您可以安全地繞過這個警告
-   應用程式只會存取您指定的 Google Sheet，不會存取其他資料
-   所有操作都在您的 Google 帳戶權限範圍內進行

## 功能特色

### 🎯 智能回退機制

-   優先嘗試真實的 Google Sheets 寫入
-   如果失敗，自動回退到模擬模式
-   確保用戶體驗不會中斷

### 📱 美觀的通知系統

-   iOS 風格的通知彈窗
-   自動分類顯示成功/錯誤/警告訊息
-   支援深色模式
-   響應式設計

### ✅ 數據驗證

-   前端驗證確保數據完整性
-   後端二次驗證防止無效數據
-   CO₂ 數值範圍檢查（300-5000 ppm）

### 🔄 自動同步

-   數據提交成功後自動刷新圖表
-   即時顯示新添加的數據
-   無縫整合到現有的數據流

## 維護建議

1. **定期檢查 Apps Script 執行記錄**
2. **監控 Google Sheets API 配額使用情況**
3. **備份重要數據**
4. **定期測試寫入功能**

## 安全考量

-   Google Apps Script 提供安全的執行環境
-   所有數據傳輸都經過 HTTPS 加密
-   可以設置 IP 白名單限制存取
-   支援 OAuth 2.0 驗證機制

---

如有問題，請檢查瀏覽器控制台的錯誤訊息，或聯繫技術支援。

## 🚨 緊急故障排除：提交按鈕沒有反應

### 快速診斷步驟

#### 1. 打開瀏覽器開發者工具
- **Chrome/Edge**: 按 `F12` 或右鍵 > 檢查
- **Firefox**: 按 `F12` 或右鍵 > 檢查元素
- 點擊「Console」(控制台) 分頁

#### 2. 檢查是否有 JavaScript 錯誤
查看控制台是否有紅色錯誤訊息，常見錯誤：
- `Uncaught TypeError: Cannot read properties of null`
- `Uncaught ReferenceError: function is not defined`
- `Failed to load resource`

#### 3. 使用診斷工具
1. **打開診斷頁面**: `debug-form.html`
2. **執行所有診斷測試**:
   - 測試元素存取
   - 測試事件綁定
   - 測試表單提交
   - 測試網路連接
3. **查看詳細日誌**，找出問題所在

#### 4. 檢查 JavaScript 是否正確載入
在控制台輸入以下命令檢查：
```javascript
// 檢查函數是否存在
console.log(typeof submitCO2Data);
console.log(typeof initDataInput);

// 檢查元素是否存在
console.log(document.getElementById('submitDataBtn'));
console.log(document.getElementById('co2InputForm'));
```

### 常見問題和解決方案

#### 問題 1: 找不到 submitDataBtn 元素
**症狀**: 控制台顯示 `❌ 找不到 submitDataBtn`
**解決方案**:
1. 檢查 HTML 中按鈕 ID 是否正確
2. 確認 JavaScript 在 HTML 載入後執行
3. 檢查是否有 CSS 隱藏了按鈕

#### 問題 2: 事件監聽器沒有綁定
**症狀**: 點擊按鈕沒有任何控制台輸出
**解決方案**:
1. 確認 `initDataInput()` 函數已執行
2. 檢查函數執行順序
3. 重新載入頁面

#### 問題 3: JavaScript 執行錯誤
**症狀**: 控制台有紅色錯誤訊息
**解決方案**:
1. 修正語法錯誤
2. 檢查變數名稱拼寫
3. 確認所有必要的函數都已定義

#### 問題 4: 網路連接問題
**症狀**: 請求發送失敗
**解決方案**:
1. 檢查網路連線
2. 確認 Google Apps Script URL 正確
3. 檢查 CORS 設置

### 立即修復步驟

#### 步驟 1: 重新載入頁面
1. 按 `Ctrl+F5` 強制刷新
2. 確保載入最新的 JavaScript 代碼

#### 步驟 2: 檢查初始化
在控制台執行：
```javascript
// 手動初始化
initDataInput();
```

#### 步驟 3: 手動測試提交
在控制台執行：
```javascript
// 手動測試提交函數
submitCO2Data();
```

#### 步驟 4: 檢查表單結構
在控制台執行：
```javascript
// 檢查表單元素
console.log("表單:", document.getElementById('co2InputForm'));
console.log("按鈕:", document.getElementById('submitDataBtn'));
console.log("日期:", document.getElementById('inputDate'));
```

### 臨時解決方案

如果問題仍然存在，可以使用診斷工具：
1. **打開 `debug-form.html`**
2. **填寫測試數據**
3. **點擊「測試提交」**
4. **確認功能是否正常**

### 獲取技術支援

如果以上步驟都無法解決問題，請提供：
1. **瀏覽器控制台的完整錯誤訊息**
2. **使用的瀏覽器和版本**
3. **診斷工具的測試結果**
4. **網路環境資訊**

---

💡 **提示**: 90% 的「沒有反應」問題都是由於 JavaScript 錯誤或元素載入順序問題造成的。
