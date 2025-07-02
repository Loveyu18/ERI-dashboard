# 🚀 快速解決：Google Apps Script 安全警告

## 問題現象

部署 Web App 後訪問時出現：

```
Google hasn't verified this app
The app is requesting access to sensitive info in your Google Account.
Until the developer (your-email@gmail.com) verifies this app with Google, you shouldn't use it.
```

## ✅ 立即解決方案

### 方法一：繞過警告（推薦）

1. **點擊「Advanced」（進階）**
2. **點擊「Go to [project-name] (unsafe)」**
3. **在權限頁面點擊「Allow」（允許）**
4. **完成！Web App 可以正常使用**

### 方法二：修改部署設定

如果方法一不行，嘗試重新部署：

1. 回到 Google Apps Script 編輯器
2. 點擊「部署」>「管理部署」
3. 點擊編輯（鉛筆圖示）
4. 將「具有存取權的使用者」改為：**「具有 Google 帳戶的任何人」**
5. 點擊「部署」
6. 重新測試新的 URL

### 方法三：使用測試部署

如果還是有問題：

1. 在 Google Apps Script 編輯器
2. 點擊「部署」旁邊的下拉箭頭
3. 選擇「測試部署」
4. 複製測試 URL 來使用

## 🔒 安全性說明

**這個警告是正常的！**

-   您是應用程式的**開發者和擁有者**
-   應用程式只存取**您指定的 Google Sheet**
-   不會洩露或濫用您的資料
-   Google 的警告是針對**未知第三方應用程式**的保護機制

## ✨ 驗證 Web App 正常運行

成功設置後，訪問 Web App URL 應該看到：

```json
{
    "success": true,
    "message": "CO2 監測數據寫入服務運行正常",
    "timestamp": "2025-01-19T...",
    "sheetId": "your-sheet-id",
    "sheetName": "data"
}
```

## 🆘 還是不行？

### 檢查清單：

-   [ ] 確認 Google Sheet ID 正確
-   [ ] 確認工作表名稱為 "data"
-   [ ] 確認您有 Google Sheet 的編輯權限
-   [ ] 嘗試在無痕模式下測試
-   [ ] 檢查瀏覽器是否阻擋了彈出視窗

### 最後手段：

如果真的無法解決，網頁仍然可以在**模擬模式**下正常運行，所有功能都正常，只是不會真正寫入 Google Sheet。

---

💡 **提示**：大多數情況下，方法一就可以解決問題！

## 🔧 錯誤 2：Apps Script 執行錯誤

### 問題現象

在 Google Apps Script 執行記錄中看到：

```
處理請求錯誤: [TypeError: Cannot read properties of undefined (reading 'postData')]
```

### 🚀 解決方案

#### 方法一：不要直接訪問 Web App URL

-   **問題原因**：直接在瀏覽器中打開 Web App URL 會觸發 GET 請求
-   **解決**：只能通過網頁表單或測試工具來測試

#### 方法二：使用測試工具

1. 打開 `test-apps-script.html`
2. 輸入您的 Web App URL
3. 點擊「執行 POST 測試」
4. 檢查結果是否正常

#### 方法三：檢查前端配置

確保 `script.js` 中的 `writeUrl` 已正確設置：

```javascript
const writeUrl = "您的實際Web App URL";
```

### ✅ 驗證方法

如果修正後的 Google Apps Script 正常工作，您應該看到：

-   GET 請求：返回服務狀態信息
-   POST 請求：成功寫入數據並返回確認信息
