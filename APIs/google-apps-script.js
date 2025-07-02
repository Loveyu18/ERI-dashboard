/**
 * Google Apps Script for CO2 Monitoring Dashboard
 * 這個腳本用於接收來自網頁的 CO2 數據並寫入 Google Sheets
 *
 * 設置步驟：
 * 1. 前往 https://script.google.com/
 * 2. 創建新專案
 * 3. 將此代碼貼到 Code.gs 檔案中
 * 4. 點擊「部署」> 「新增部署」
 * 5. 類型選擇「網頁應用程式」
 * 6. 執行身分：「我」
 * 7. 具有存取權的使用者：「任何人」
 * 8. 點擊「部署」並複製 Web App URL
 * 9. 將 URL 貼到 script.js 中的 writeUrl 變數
 */

// Google Sheet 設定 - 請修改為您的 Sheet ID
const SHEET_ID = "1gDt_ht6s0_LvBM8UeiTTXoDGaDx_RdA01HL_WfDt96k";
const SHEET_NAME = "data";

/**
 * 處理表單提交的 POST 請求
 */
function doPost(e) {
    try {
        console.log("收到 POST 請求");

        // 檢查事件對象是否存在（防止直接執行時的錯誤）
        if (!e) {
            console.log("警告：沒有事件對象，這可能是直接執行函數導致的");
            return createJsonResponse({
                success: false,
                message: "請通過 Web App URL 調用此函數，不要直接執行",
            });
        }

        console.log("請求參數:", e.parameters || {});
        console.log("POST 數據:", e.postData || {});

        let data;

        // 檢查是否為表單提交
        if (e.parameters && e.parameters.data) {
            console.log("處理表單提交數據");
            data = JSON.parse(e.parameters.data[0]);
        }
        // 檢查是否為 JSON 請求
        else if (e.postData && e.postData.contents) {
            console.log("處理 JSON 請求數據");
            data = JSON.parse(e.postData.contents);
        } else {
            console.log("沒有接收到有效的數據");
            return createHtmlResponse("沒有接收到有效的數據");
        }

        console.log("解析後的數據:", data);

        // 根據動作類型處理請求
        let result;
        switch (data.action) {
            case "addRow":
                result = addRowToSheet(data.data);
                break;
            default:
                result = { success: false, message: "不支援的動作類型" };
        }

        // 如果是表單提交，返回 HTML 回應
        if (e.parameters && e.parameters.data) {
            return createHtmlResponse("數據提交成功！");
        }
        // 否則返回 JSON 回應
        else {
            return createJsonResponse(result);
        }
    } catch (error) {
        console.error("處理 POST 請求錯誤:", error);

        const errorResult = {
            success: false,
            message: "服務器錯誤: " + error.toString(),
            timestamp: new Date().toISOString(),
        };

        // 根據請求類型返回適當的回應
        if (e && e.parameters) {
            return createHtmlResponse("提交失敗：" + error.toString());
        } else {
            return createJsonResponse(errorResult);
        }
    }
}

/**
 * 創建 HTML 回應（用於表單提交）
 */
function createHtmlResponse(message) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>提交結果</title>
        </head>
        <body>
            <h2>CO₂ 數據提交結果</h2>
            <p>${message}</p>
            <script>
                // 通知父視窗提交完成
                if (window.parent) {
                    window.parent.postMessage('submitComplete', '*');
                }
            </script>
        </body>
        </html>
    `;

    return HtmlService.createHtmlOutput(html);
}

/**
 * 處理 GET 請求（可選，用於測試）
 */
function doGet(e) {
    try {
        const testResult = {
            success: true,
            message: "CO2 監測數據寫入服務運行正常",
            timestamp: new Date().toISOString(),
            sheetId: SHEET_ID,
            sheetName: SHEET_NAME,
            info: "如果您看到這個訊息，表示 Web App 已經成功部署並可以接收請求",
        };

        const output = ContentService.createTextOutput();
        output.setMimeType(ContentService.MimeType.JSON);
        output.setContent(JSON.stringify(testResult, null, 2));
        return output;
    } catch (error) {
        const errorResult = {
            success: false,
            message: "服務測試失敗: " + error.toString(),
            timestamp: new Date().toISOString(),
        };

        const output = ContentService.createTextOutput();
        output.setMimeType(ContentService.MimeType.JSON);
        output.setContent(JSON.stringify(errorResult, null, 2));
        return output;
    }
}

/**
 * 添加新行到 Google Sheet
 */
function addRowToSheet(data) {
    try {
        // 打開 Google Sheet
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        const sheet = spreadsheet.getSheetByName(SHEET_NAME);

        if (!sheet) {
            throw new Error(`找不到工作表: ${SHEET_NAME}`);
        }

        // 準備要添加的行數據
        // 假設 Sheet 的列順序是：日期, 時間, 中華辦7樓, 中華辦8樓, 衡陽辦
        const rowData = [
            data.date || "",
            data.time || "",
            data.office_a || "",
            data.office_b || "",
            data.office_c || "",
        ];

        console.log("準備添加行數據:", rowData);

        // 在最後一行之後添加新行
        sheet.appendRow(rowData);

        // 獲取新添加行的行號
        const lastRow = sheet.getLastRow();

        console.log("成功添加數據到第", lastRow, "行");

        return {
            success: true,
            message: "數據已成功添加到 Google Sheet",
            rowNumber: lastRow,
            data: rowData,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("添加行到 Sheet 錯誤:", error);
        return {
            success: false,
            message: "添加數據失敗: " + error.toString(),
        };
    }
}

/**
 * 驗證數據格式
 */
function validateData(data) {
    const errors = [];

    if (!data.date) {
        errors.push("日期不能為空");
    }

    if (!data.time) {
        errors.push("時間不能為空");
    }

    // 檢查是否至少有一個辦公室數據
    if (!data.office_a && !data.office_b && !data.office_c) {
        errors.push("至少需要輸入一個辦公室的 CO2 數據");
    }

    // 驗證 CO2 值範圍
    [data.office_a, data.office_b, data.office_c].forEach((value, index) => {
        if (value && (isNaN(value) || value < 300 || value > 5000)) {
            const offices = ["中華辦7樓", "中華辦8樓", "衡陽辦"];
            errors.push(`${offices[index]} 的 CO2 值必須在 300-5000 ppm 範圍內`);
        }
    });

    return errors;
}

/**
 * 獲取 Sheet 資訊（用於調試）
 */
function getSheetInfo() {
    try {
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        const sheet = spreadsheet.getSheetByName(SHEET_NAME);

        return {
            sheetId: SHEET_ID,
            sheetName: SHEET_NAME,
            exists: !!sheet,
            lastRow: sheet ? sheet.getLastRow() : 0,
            lastColumn: sheet ? sheet.getLastColumn() : 0,
            headers: sheet ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [],
        };
    } catch (error) {
        return {
            error: error.toString(),
        };
    }
}

/**
 * 創建 JSON 回應並設定 CORS 標頭
 */
function createJsonResponse(data) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(data, null, 2));

    // 設定 CORS 標頭以允許跨域請求
    return output;
}

/**
 * 測試函數（可在 Apps Script 編輯器中運行）
 */
function testAddRow() {
    const testData = {
        date: "2025/1/19",
        time: "14:30",
        office_a: "650",
        office_b: "720",
        office_c: "580",
    };

    const result = addRowToSheet(testData);
    console.log("測試結果:", result);
    return result;
}
