// 診斷工具函數 - 用於檢查 Google Sheet 連接問題

// 測試 OpenSheet API 連接
async function testOpenSheetConnection(sheetId, sheetName) {
    try {
        const testUrl = `https://opensheet.vercel.app/${sheetId}/${sheetName}`;
        console.log(`正在測試 OpenSheet 連接: ${testUrl}`);

        const startTime = performance.now();
        const response = await fetch(testUrl, {
            method: "GET",
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
        });
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        if (!response.ok) {
            return {
                status: "error",
                message: `OpenSheet API 返回錯誤: ${response.status} ${response.statusText}`,
                details: `測試 URL: ${testUrl}`,
            };
        }

        try {
            const data = await response.json();
            if (!data || !Array.isArray(data)) {
                return {
                    status: "warning",
                    message: "成功連接 OpenSheet API，但返回的數據不是有效的數組格式",
                    details: `測試 URL: ${testUrl}\n響應時間: ${responseTime}ms`,
                };
            }

            return {
                status: "success",
                message: `成功連接 OpenSheet API，返回 ${data.length} 條記錄`,
                details: `測試 URL: ${testUrl}\n響應時間: ${responseTime}ms`,
                data: data.slice(0, 2), // 只返回前2條記錄用於示例
            };
        } catch (jsonErr) {
            return {
                status: "error",
                message: "連接成功，但返回的數據不是有效的 JSON 格式",
                details: `測試 URL: ${testUrl}\n響應時間: ${responseTime}ms\n錯誤: ${jsonErr.message}`,
            };
        }
    } catch (err) {
        return {
            status: "error",
            message: `無法連接 OpenSheet API: ${err.message}`,
            details: `測試 URL: https://opensheet.vercel.app/${sheetId}/${sheetName}`,
        };
    }
}

// 檢查是否可以直接訪問 Google Sheet
async function testDirectGoogleSheetAccess(sheetId) {
    try {
        // 測試是否可以訪問 Google Sheet 公開頁面
        const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/pubhtml`, {
            method: "GET",
            mode: "no-cors", // 只測試能否連接，不檢查內容
        });

        return {
            status: "info",
            message: "已嘗試連接 Google Sheet 頁面 (但無法確認是否成功)",
            details:
                `Google Sheet URL: ${googleSheetUrl}\n` +
                "注意: 由於瀏覽器的安全限制，無法確認是否能直接訪問 Google Sheet，" +
                "您可以手動嘗試打開上述網址來檢查權限設置。",
        };
    } catch (err) {
        return {
            status: "warning",
            message: "嘗試直接訪問 Google Sheet 時出錯",
            details: `Google Sheet ID: ${sheetId}\n錯誤: ${err.message}`,
        };
    }
}

// 檢查網路連接
async function testNetworkConnection() {
    try {
        const startTime = performance.now();
        const response = await fetch("https://www.google.com", {
            method: "GET",
            mode: "no-cors",
            cache: "no-store",
        });
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        return {
            status: "success",
            message: "網路連接正常",
            details: `測試 URL: https://www.google.com\n響應時間: ${responseTime}ms`,
        };
    } catch (err) {
        return {
            status: "error",
            message: "網路連接有問題",
            details: `錯誤: ${err.message}`,
        };
    }
}

// 主診斷函數
async function runDiagnostics(sheetId, sheetName) {
    const results = {
        networkTest: await testNetworkConnection(),
        openSheetTest: await testOpenSheetConnection(sheetId, sheetName),
        googleSheetTest: await testDirectGoogleSheetAccess(sheetId),
    };

    return results;
}

// 顯示診斷結果
function displayDiagnosticResults(results, targetElement) {
    if (!targetElement) return;

    const networkStatusClass =
        results.networkTest.status === "success" ? "test-success" : "test-error";
    const openSheetStatusClass =
        results.openSheetTest.status === "success"
            ? "test-success"
            : results.openSheetTest.status === "warning"
            ? "test-warning"
            : "test-error";

    let html = `
    <div class="diagnostic-results">
        <p class="${networkStatusClass}">✓ 網路連接測試: ${results.networkTest.message}</p>
        <p class="${openSheetStatusClass}">✓ OpenSheet API 測試: ${
        results.openSheetTest.message
    }</p>
        <p>✓ Google Sheet 信息: 使用 ID ${sheetId}</p>
        
        <p><strong>診斷詳情:</strong></p>
        <p>${results.networkTest.details}</p>
        <p>${results.openSheetTest.details}</p>
        
        ${
            results.openSheetTest.data
                ? `<p><strong>樣本數據:</strong> ${JSON.stringify(results.openSheetTest.data)}</p>`
                : ""
        }
    </div>
    `;

    targetElement.innerHTML = html;
}

// 添加診斷工具按鈕
function addDiagnosticTool(adviceElement, sheetId, sheetName) {
    if (!adviceElement) return;

    const diagnosticToolDiv = document.createElement("div");
    diagnosticToolDiv.className = "diagnostic-tool";
    diagnosticToolDiv.innerHTML = `
        <button id="runDiagnosticBtn" class="diagnostic-btn">
            <span>🔍</span> 運行連接診斷
        </button>
        <div id="diagnosticResults"></div>
    `;

    adviceElement.appendChild(diagnosticToolDiv);

    // 添加按鈕事件
    setTimeout(() => {
        const diagnosticBtn = document.getElementById("runDiagnosticBtn");
        if (diagnosticBtn) {
            diagnosticBtn.addEventListener("click", async function () {
                this.textContent = "診斷中...";
                this.disabled = true;

                const resultsDiv = document.getElementById("diagnosticResults");
                resultsDiv.textContent = "正在檢查連接問題，請稍候...";

                try {
                    const results = await runDiagnostics(sheetId, sheetName);
                    displayDiagnosticResults(results, resultsDiv);
                } catch (err) {
                    resultsDiv.innerHTML = `<div class="diagnostic-results test-error">診斷過程中出錯: ${err.message}</div>`;
                }

                this.innerHTML = "<span>🔍</span> 重新診斷";
                this.disabled = false;
            });
        }
    }, 100);
}

// 導出模塊
window.diagnosticTools = {
    runDiagnostics,
    addDiagnosticTool,
};
