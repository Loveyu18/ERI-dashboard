// 處理最新數據記錄功能

// 狀態指示器閾值
const CO2_THRESHOLDS = {
    NORMAL: 800, // 800 ppm 以下為正常
    WARNING: 1000, // 800-1000 ppm 為警告
    // 超過 1000 ppm 為危險
};

// 儲存前一次的數據用於比較
let previousDataCache = [];

// 格式化日期時間
function formatDateTime(dateStr, timeStr = null) {
    // 如果日期字符串不存在或不是字符串類型
    if (!dateStr || typeof dateStr !== "string") return "--";

    // 如果日期字符串是空字符串
    if (dateStr.trim() === "") return "--";

    try {
        // 處理可能的各種日期格式
        let dateObj;

        // 處理帶斜線的格式 (如 "2025/7/2")
        if (dateStr.includes("/")) {
            const parts = dateStr.split("/");
            // 確保我們至少有年、月、日三部分
            if (parts.length >= 3) {
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
                throw new Error("日期格式不正確: " + dateStr);
            }
        }
        // 處理帶破折號的格式 (如 "2025-07-02")
        else if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts.length >= 3) {
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
                throw new Error("日期格式不正確: " + dateStr);
            }
        }
        // 處理其他格式
        else {
            dateObj = new Date(dateStr);
        }

        // 檢查日期對象是否有效
        if (isNaN(dateObj.getTime())) {
            throw new Error("無效的日期: " + dateStr);
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");

        // 如果有提供時間
        if (timeStr && typeof timeStr === "string" && timeStr.trim() !== "") {
            return `${year}/${month}/${day} ${timeStr}`;
        }

        return `${year}/${month}/${day}`;
    } catch (e) {
        console.error("日期格式化錯誤:", e, "原始日期:", dateStr);
        // 返回一個更友好的顯示，而不是可能導致混淆的原始字符串
        return dateStr !== "--" ? `${dateStr}` : "--";
    }
}

// 根據 CO2 值判斷狀態級別
function getCO2StatusClass(value) {
    if (!value || value === "") return "";
    const co2Value = parseInt(value);

    if (co2Value <= CO2_THRESHOLDS.NORMAL) {
        return "data-normal";
    } else if (co2Value <= CO2_THRESHOLDS.WARNING) {
        return "data-warning";
    } else {
        return "data-danger";
    }
}

// 格式化 CO2 數值顯示
function formatCO2Value(value) {
    if (!value || value === "") return "--";
    return `${value}`;
}

// 顯示最新數據記錄
function displayRecentData(data) {
    console.log("嘗試顯示最新數據記錄...");

    // 檢查表格元素是否存在
    const tableBody = document.getElementById("recentDataBody");
    if (!tableBody) {
        console.error("找不到最新數據表格元素 (#recentDataBody)");
        return;
    }

    // 日誌記錄收到的數據
    console.log("收到的數據類型:", typeof data);
    if (data === null) {
        console.error("收到 null 數據");
        tableBody.innerHTML = `<tr><td colspan="5" class="loading-data">收到無效數據: null</td></tr>`;
        return;
    }

    if (typeof data === "undefined") {
        console.error("收到 undefined 數據");
        tableBody.innerHTML = `<tr><td colspan="5" class="loading-data">收到無效數據: undefined</td></tr>`;
        return;
    }

    // 確保數據是數組且不為空
    if (!Array.isArray(data)) {
        console.error("數據不是數組:", data);
        tableBody.innerHTML = `<tr><td colspan="5" class="loading-data">收到的數據不是有效的數組格式</td></tr>`;
        return;
    }

    if (data.length === 0) {
        console.log("數據數組為空");
        tableBody.innerHTML = `<tr><td colspan="5" class="loading-data">沒有可用的數據記錄</td></tr>`;
        return;
    }

    // 日誌記錄第一條數據的結構
    console.log("數據樣本 (第一條記錄):", data[0]);

    let sortedData = [];
    let tableContent = "";

    try {
        // 創建數據的安全副本，過濾掉 null 和 undefined 值
        const dataCopy = data.filter((item) => item != null);

        // 按日期時間排序（最新的在前）
        sortedData = dataCopy.sort((a, b) => {
            try {
                // 安全地獲取日期和時間值，避免 undefined 錯誤
                const dateStrA = a ? a.date || a["日期"] || "" : "";
                const dateStrB = b ? b.date || b["日期"] || "" : "";
                const timeStrA = a ? a.time || a["時間"] || "00:00" : "00:00";
                const timeStrB = b ? b.time || b["時間"] || "00:00" : "00:00";

                // 安全地處理日期字符串，確保不在 undefined/null 上調用方法
                const formattedDateA =
                    typeof dateStrA === "string" && dateStrA ? dateStrA.replace(/\//g, "-") : "";
                const formattedDateB =
                    typeof dateStrB === "string" && dateStrB ? dateStrB.replace(/\//g, "-") : "";

                // 創建日期對象，如果日期無效則使用當前時間減去索引值（保證順序）
                let dateA, dateB;

                try {
                    dateA = formattedDateA
                        ? new Date(formattedDateA + " " + timeStrA)
                        : new Date(Date.now() - dataCopy.indexOf(a));
                    if (isNaN(dateA.getTime())) {
                        dateA = new Date(Date.now() - dataCopy.indexOf(a));
                    }
                } catch (e) {
                    console.log("無法解析日期 A:", formattedDateA, e);
                    dateA = new Date(Date.now() - dataCopy.indexOf(a));
                }

                try {
                    dateB = formattedDateB
                        ? new Date(formattedDateB + " " + timeStrB)
                        : new Date(Date.now() - dataCopy.indexOf(b));
                    if (isNaN(dateB.getTime())) {
                        dateB = new Date(Date.now() - dataCopy.indexOf(b));
                    }
                } catch (e) {
                    console.log("無法解析日期 B:", formattedDateB, e);
                    dateB = new Date(Date.now() - dataCopy.indexOf(b));
                }

                return dateB - dateA; // 降序排列
            } catch (sortError) {
                console.error("排序過程中出錯:", sortError);
                return 0; // 維持原順序
            }
        });

        // 取最新的 10 筆數據
        const recentData = sortedData.slice(0, 10);

        // 生成表格內容
        let tableContent = "";
        
        recentData.forEach((record, index) => {
            if (!record) {
                console.warn("遇到無效記錄");
                return;
            }

            try {
                // 安全地獲取字段，處理不同可能的列名
                const dateStr = record.date || record["日期"] || "--";
                const timeStr = record.time || record["時間"] || "--";

                // 處理可能的不同欄位名稱格式
                const co2A =
                    record.office_a ||
                    record["辦公室 A"] ||
                    record["中華辦7樓"] ||
                    record["office_a"] ||
                    "--";
                const co2B =
                    record.office_b ||
                    record["辦公室 B"] ||
                    record["中華辦8樓"] ||
                    record["office_b"] ||
                    "--";
                const co2C =
                    record.office_c ||
                    record["辦公室 C"] ||
                    record["衡陽辦"] ||
                    record["office_c"] ||
                    "--";

                const formattedDate = formatDateTime(dateStr, null);

                // 檢查是否為新數據
                const isNewData = index === 0 && previousDataCache.length > 0;
                const rowClass = isNewData ? 'new-data' : '';

                tableContent += `
                <tr class="${rowClass}" data-row-index="${index}">
                    <td>${formattedDate}</td>
                    <td>${timeStr}</td>
                    <td class="${getCO2StatusClass(co2A)}" data-value="${co2A}">${formatCO2Value(co2A)}</td>
                    <td class="${getCO2StatusClass(co2B)}" data-value="${co2B}">${formatCO2Value(co2B)}</td>
                    <td class="${getCO2StatusClass(co2C)}" data-value="${co2C}">${formatCO2Value(co2C)}</td>
                </tr>`;
            } catch (recordError) {
                console.error("處理記錄時出錯:", recordError, record);
            }
        });

        if (tableContent === "") {
            tableContent = `<tr><td colspan="5" class="loading-data">處理數據時發生錯誤，無法顯示記錄</td></tr>`;
        }

        // 添加表格更新動畫
        if (typeof animateTableData === 'function') {
            animateTableData(previousDataCache, recentData);
        }

        tableBody.innerHTML = tableContent;
        
        // 為數值變化添加動畫效果
        addNumberAnimations(tableBody, previousDataCache, recentData);
        
        // 保存當前數據用於下次比較
        previousDataCache = [...recentData];
    } catch (mainError) {
        console.error("處理數據時發生主要錯誤:", mainError);
        tableBody.innerHTML = `<tr><td colspan="5" class="loading-data">處理數據時發生錯誤: ${mainError.message}</td></tr>`;
    }
}

// 為數值變化添加動畫效果
function addNumberAnimations(tableBody, oldData, newData) {
    if (!tableBody || !newData || newData.length === 0) return;
    
    // 為每個數值單元格添加動畫
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index >= newData.length) return;
        
        const newRecord = newData[index];
        const oldRecord = oldData[index] || null;
        
        // 獲取數值單元格（跳過日期和時間列）
        const valueCells = row.querySelectorAll('td:nth-child(n+3)');
        valueCells.forEach((cell, cellIndex) => {
            const newValue = cell.dataset.value;
            const oldValue = oldRecord ? getValueByIndex(oldRecord, cellIndex) : null;
            
            if (newValue && newValue !== '--' && typeof animateNumber === 'function') {
                // 添加脈衝動畫效果
                if (typeof addPulseEffect === 'function') {
                    setTimeout(() => {
                        addPulseEffect(cell);
                    }, index * 100);
                }
                
                // 如果值發生變化，添加變化指示器
                if (oldValue && oldValue !== newValue && typeof addValueChangeEffect === 'function') {
                    addValueChangeEffect(cell, parseFloat(oldValue), parseFloat(newValue));
                }
            }
        });
        
        // 為新數據行添加高亮效果
        if (index === 0 && oldData.length > 0 && typeof highlightNewData === 'function') {
            setTimeout(() => {
                highlightNewData(row);
            }, 200);
        }
    });
}

// 根據索引獲取記錄中的數值
function getValueByIndex(record, index) {
    const values = [
        record.office_a || record["辦公室 A"] || record["中華辦7樓"] || record["office_a"],
        record.office_b || record["辦公室 B"] || record["中華辦8樓"] || record["office_b"],
        record.office_c || record["辦公室 C"] || record["衡陽辦"] || record["office_c"]
    ];
    return values[index];
}

// 導出函數，使其可以被其他 JS 文件調用
window.recentDataModule = {
    displayRecentData,
};
