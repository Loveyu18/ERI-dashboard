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
 * 處理GET請求（用於解決CORS問題）
 */
function doGet(e) {
    const startTime = new Date().toISOString();
    console.log("=== 收到 GET 請求 ===");
    console.log("請求時間:", startTime);

    try {
        // 詳細記錄請求資訊
        console.log("事件對象存在:", !!e);
        console.log("參數對象存在:", !!(e && e.parameter));
        console.log("完整事件對象:", JSON.stringify(e, null, 2));

        if (e && e.parameter) {
            console.log("GET 參數詳情:");
            Object.keys(e.parameter).forEach((key) => {
                console.log(`  - ${key}: ${e.parameter[key]}`);
            });
        }

        // 檢查事件對象是否存在
        if (!e || !e.parameter) {
            console.log("❌ 沒有參數");
            return createJsonResponse({
                success: false,
                message: "缺少請求參數",
                timestamp: startTime,
                debug: {
                    eventExists: !!e,
                    parameterExists: !!(e && e.parameter),
                },
            });
        }

        const data = e.parameter;

        // 驗證必要欄位
        if (!data.date || !data.time) {
            console.log("❌ 缺少必要欄位");
            console.log("  - date:", data.date);
            console.log("  - time:", data.time);
            return createJsonResponse({
                success: false,
                message: "缺少必要的日期或時間參數",
                timestamp: startTime,
                receivedData: data,
            });
        }

        console.log("✅ 基本驗證通過，調用處理函數");
        // 調用共用的處理函數
        return processData(data);
    } catch (error) {
        console.error("處理 GET 請求時發生錯誤:", error);
        return createJsonResponse({
            success: false,
            message: "伺服器錯誤: " + error.toString(),
        });
    }
}

/**
 * 共用的數據處理函數
 */
function processData(data) {
    console.log("=== 開始處理數據 ===");
    console.log("輸入數據:", JSON.stringify(data, null, 2));

    try {
        // 開啟 Google Sheet
        console.log("嘗試開啟 Google Sheet...");
        console.log("Sheet ID:", SHEET_ID);
        console.log("Sheet Name:", SHEET_NAME);

        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        if (!sheet) {
            console.log("❌ 找不到指定的工作表");
            return createJsonResponse({
                success: false,
                message: "找不到指定的工作表",
                debug: {
                    sheetId: SHEET_ID,
                    sheetName: SHEET_NAME,
                },
            });
        }

        console.log("✅ 成功開啟工作表");
        console.log("工作表資訊:");
        console.log("  - 最後一行:", sheet.getLastRow());
        console.log("  - 最後一列:", sheet.getLastColumn());

        // 準備要插入的數據行
        const rowData = [
            data.date || "", // 日期
            data.time || "", // 時間
            data.office_a || data["中華辦7樓"] || "", // 中華辦7樓 (支援兩種參數名稱)
            data.office_b || data["中華辦8樓"] || "", // 中華辦8樓
            data.office_c || data["衡陽辦"] || "", // 衡陽辦
            data.submitted_by || "手動輸入", // 提交來源
            data.timestamp || new Date().toISOString(), // 時間戳
        ];

        console.log("準備插入的數據行:", rowData);
        console.log("數據行詳情:");
        rowData.forEach((value, index) => {
            console.log(`  - 第 ${index + 1} 列: ${value}`);
        });

        // 在工作表末尾添加新行
        console.log("執行 sheet.appendRow...");
        const beforeLastRow = sheet.getLastRow();
        sheet.appendRow(rowData);
        const afterLastRow = sheet.getLastRow();

        console.log("插入前最後一行:", beforeLastRow);
        console.log("插入後最後一行:", afterLastRow);

        if (afterLastRow > beforeLastRow) {
            console.log("✅ 數據已成功添加到 Google Sheets");
            console.log("新增的行號:", afterLastRow);
        } else {
            console.log("⚠️ 行數沒有增加，可能沒有成功插入");
        }

        // 返回成功響應
        return createJsonResponse({
            success: true,
            message: "數據已成功保存到 Google Sheets",
            data: {
                date: data.date,
                time: data.time,
                offices: {
                    中華辦7樓: data.office_a || data["中華辦7樓"] || "",
                    中華辦8樓: data.office_b || data["中華辦8樓"] || "",
                    衡陽辦: data.office_c || data["衡陽辦"] || "",
                },
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("處理數據時發生錯誤:", error);
        return createJsonResponse({
            success: false,
            message: "處理數據時發生錯誤: " + error.toString(),
        });
    }
}

/**
 * 處理表單提交的 POST 請求
 */
function doPost(e) {
    try {
        console.log("收到 POST 請求");

        // 檢查事件對象是否存在
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

        // 檢查是否為JSON請求
        if (e.postData && e.postData.contents) {
            console.log("處理 JSON 請求數據");
            data = JSON.parse(e.postData.contents);
        }
        // 檢查是否為表單提交
        else if (e.parameters && e.parameters.data) {
            console.log("處理表單提交數據");
            data = JSON.parse(e.parameters.data[0]);
        } else {
            console.log("沒有接收到有效的數據");
            return createJsonResponse({
                success: false,
                message: "沒有接收到有效的數據",
            });
        }

        console.log("解析後的數據:", data);

        // 如果是手動輸入的CO2數據，直接處理
        if (data.date && data.time) {
            return processData(data);
        }

        // 處理其他類型的請求（保持向後兼容）
        let result;
        switch (data.action) {
            case "addRow":
                result = addRowToSheet(data.data);
                break;
            default:
                result = { success: false, message: "不支援的動作類型" };
        }

        // 根據請求類型返回適當的回應
        if (e.parameters && e.parameters.data) {
            return createHtmlResponse("數據提交成功！");
        } else {
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

/**
 * 測試 processData 函數（模擬網頁請求）
 */
function testProcessData() {
    const testData = {
        date: "2025/7/3",
        time: "15:30",
        office_a: "680",
        office_b: "750",
        office_c: "620",
        submitted_by: "網頁測試",
        timestamp: new Date().toISOString(),
    };

    console.log("測試 processData，輸入數據:", testData);
    const result = processData(testData);
    console.log("processData 測試結果:", result);
    return result;
}

/**
 * 測試 doGet 函數（模擬GET請求）
 */
function testDoGet() {
    const mockEvent = {
        parameter: {
            date: "2025/7/3",
            time: "16:00",
            office_a: "700",
            office_b: "780",
            office_c: "650",
            submitted_by: "GET測試",
            timestamp: new Date().toISOString(),
        },
    };

    console.log("測試 doGet，模擬事件:", mockEvent);
    const result = doGet(mockEvent);
    console.log("doGet 測試結果:", result.getContent());
    return result;
}

/**
 * 檢查 Sheet 狀態和最近的資料
 */
function checkSheetStatus() {
    try {
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        const sheet = spreadsheet.getSheetByName(SHEET_NAME);

        if (!sheet) {
            console.log("❌ 找不到工作表:", SHEET_NAME);
            return {
                success: false,
                message: "找不到指定的工作表",
                sheetId: SHEET_ID,
                sheetName: SHEET_NAME,
            };
        }

        const lastRow = sheet.getLastRow();
        const lastColumn = sheet.getLastColumn();

        console.log("✅ 工作表狀態正常");
        console.log("工作表ID:", SHEET_ID);
        console.log("工作表名稱:", SHEET_NAME);
        console.log("總行數:", lastRow);
        console.log("總列數:", lastColumn);

        // 獲取標題行
        const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
        console.log("標題行:", headers);

        // 獲取最後5行資料
        if (lastRow > 1) {
            const startRow = Math.max(2, lastRow - 4);
            const dataRange = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastColumn);
            const recentData = dataRange.getValues();
            console.log("最後5行資料:", recentData);
        }

        return {
            success: true,
            sheetId: SHEET_ID,
            sheetName: SHEET_NAME,
            lastRow: lastRow,
            lastColumn: lastColumn,
            headers: headers,
            message: "工作表狀態正常",
        };
    } catch (error) {
        console.error("檢查 Sheet 狀態時發生錯誤:", error);
        return {
            success: false,
            message: "檢查 Sheet 狀態時發生錯誤: " + error.toString(),
            sheetId: SHEET_ID,
            sheetName: SHEET_NAME,
        };
    }
}

/**
 * 詳細的請求診斷函數
 */
function diagnosticDoGet(e) {
    console.log("=== 開始詳細診斷 doGet 請求 ===");

    try {
        // 記錄完整的事件對象
        console.log("完整事件對象:", JSON.stringify(e, null, 2));

        // 檢查事件對象結構
        if (!e) {
            console.log("❌ 事件對象不存在");
            return createJsonResponse({
                success: false,
                message: "事件對象不存在",
                diagnostic: "事件對象為 null 或 undefined",
            });
        }

        console.log("✅ 事件對象存在");

        // 檢查參數
        if (!e.parameter) {
            console.log("❌ 沒有參數");
            return createJsonResponse({
                success: false,
                message: "沒有參數",
                diagnostic: "e.parameter 為 null 或 undefined",
            });
        }

        console.log("✅ 有參數");
        console.log("參數內容:", JSON.stringify(e.parameter, null, 2));

        // 檢查必要欄位
        const requiredFields = ["date", "time"];
        const missingFields = [];

        for (const field of requiredFields) {
            if (!e.parameter[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            console.log("❌ 缺少必要欄位:", missingFields);
            return createJsonResponse({
                success: false,
                message: "缺少必要欄位: " + missingFields.join(", "),
                diagnostic: "必要欄位驗證失敗",
            });
        }

        console.log("✅ 必要欄位驗證通過");

        // 檢查 Sheet 狀態
        const sheetStatus = checkSheetStatus();
        if (!sheetStatus.success) {
            console.log("❌ Sheet 狀態檢查失敗:", sheetStatus.message);
            return createJsonResponse({
                success: false,
                message: "Sheet 狀態檢查失敗",
                diagnostic: sheetStatus.message,
            });
        }

        console.log("✅ Sheet 狀態檢查通過");

        // 嘗試寫入資料
        const result = processData(e.parameter);

        console.log("=== 診斷完成 ===");
        console.log("最終結果:", result);

        return result;
    } catch (error) {
        console.error("診斷過程中發生錯誤:", error);
        return createJsonResponse({
            success: false,
            message: "診斷過程中發生錯誤: " + error.toString(),
            diagnostic: "系統錯誤",
        });
    }
}

/**
 * 新的 doGet 函數，包含更詳細的日誌記錄
 */
function doGetWithLogging(e) {
    console.log("=== 收到新的 GET 請求 ===");
    console.log("時間:", new Date().toISOString());
    console.log("事件對象:", e);

    try {
        if (!e || !e.parameter) {
            console.log("警告：沒有參數");
            return createJsonResponse({
                success: false,
                message: "缺少請求參數",
                timestamp: new Date().toISOString(),
            });
        }

        const data = e.parameter;
        console.log("接收到的參數:", JSON.stringify(data, null, 2));

        // 驗證必要欄位
        if (!data.date || !data.time) {
            console.log("缺少必要欄位 - 日期:", data.date, "時間:", data.time);
            return createJsonResponse({
                success: false,
                message: "缺少必要的日期或時間參數",
                received: data,
                timestamp: new Date().toISOString(),
            });
        }

        console.log("✅ 基本驗證通過，開始處理資料");

        // 調用處理函數
        const result = processData(data);

        console.log("=== 請求處理完成 ===");
        console.log("處理結果:", result);

        return result;
    } catch (error) {
        console.error("處理 GET 請求時發生錯誤:", error);
        return createJsonResponse({
            success: false,
            message: "伺服器錯誤: " + error.toString(),
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * 測試完整的請求流程
 */
function testCompleteFlow() {
    console.log("=== 開始測試完整流程 ===");

    // 1. 檢查 Sheet 狀態
    console.log("1. 檢查 Sheet 狀態");
    const sheetStatus = checkSheetStatus();
    console.log("Sheet 狀態:", sheetStatus);

    if (!sheetStatus.success) {
        console.log("❌ Sheet 狀態檢查失敗，停止測試");
        return sheetStatus;
    }

    // 2. 測試 processData 函數
    console.log("2. 測試 processData 函數");
    const testData = {
        date: "2025/7/3",
        time: "17:00",
        office_a: "720",
        office_b: "800",
        office_c: "670",
        submitted_by: "完整流程測試",
        timestamp: new Date().toISOString(),
    };

    const processResult = processData(testData);
    console.log("processData 結果:", processResult);

    // 3. 測試 doGet 函數
    console.log("3. 測試 doGet 函數");
    const mockEvent = {
        parameter: {
            date: "2025/7/3",
            time: "17:30",
            office_a: "740",
            office_b: "820",
            office_c: "690",
            submitted_by: "doGet測試",
            timestamp: new Date().toISOString(),
        },
    };

    const doGetResult = doGet(mockEvent);
    console.log("doGet 結果:", doGetResult.getContent());

    // 4. 再次檢查 Sheet 狀態
    console.log("4. 再次檢查 Sheet 狀態");
    const finalSheetStatus = checkSheetStatus();
    console.log("最終 Sheet 狀態:", finalSheetStatus);

    console.log("=== 完整流程測試完成 ===");

    return {
        sheetStatus: sheetStatus,
        processResult: processResult,
        doGetResult: JSON.parse(doGetResult.getContent()),
        finalSheetStatus: finalSheetStatus,
    };
}
