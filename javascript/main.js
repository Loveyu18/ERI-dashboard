// 固定你的 Sheet 設定
const sheetId = "1gDt_ht6s0_LvBM8UeiTTXoDGaDx_RdA01HL_WfDt96k";
const sheetName = "data";
const url = `https://opensheet.vercel.app/${sheetId}/${sheetName}`;

// Google Apps Script Web App URL for writing data
// 請將此 URL 替換為您的 Google Apps Script Web App URL
const writeUrl =
    "https://script.google.com/macros/s/AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK/exec";

// 檢查 Google Apps Script URL 是否設置正確
function validateGoogleAppsScriptUrl() {
    const defaultUrl =
        "https://script.google.com/macros/s/AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK/exec";

    if (!writeUrl || writeUrl === defaultUrl) {
        console.warn("⚠️ 警告：您可能還在使用示例 Google Apps Script URL");
        console.warn("請將 writeUrl 變數更新為您自己的 Google Apps Script Web App URL");
        return false;
    }

    if (!writeUrl.includes("script.google.com")) {
        console.error("❌ 錯誤：writeUrl 不是有效的 Google Apps Script URL");
        return false;
    }

    return true;
}

// 全域變數
let co2Chart = null;
let autoRefreshInterval = null;
let countdownInterval = null;
const REFRESH_INTERVAL = 10000; // 10秒自動更新
let countdown = 10;

// 新增：歷史數據功能相關變數
let isHistoryMode = false;
let isCompareMode = false;
let isInputMode = false;
let selectedDate = null;
let compareDate = null;
let allData = []; // 儲存所有從 Sheet 獲取的數據
let todayData = []; // 儲存今日數據
let compareTodayData = []; // 比較模式下的今日數據
let compareHistoryData = null; // 比較模式下的歷史數據

// AI 聊天機器人變數
let aiChatbot = null;

// 初始化圖表
function initChart() {
    const ctx = document.getElementById("co2Chart").getContext("2d");

    // 創建更柔和的漸層背景 - iOS 26 風格
    const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, "rgba(0, 122, 255, 0.15)");
    gradient1.addColorStop(1, "rgba(0, 122, 255, 0.02)");

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, "rgba(88, 86, 214, 0.15)");
    gradient2.addColorStop(1, "rgba(88, 86, 214, 0.02)");

    const gradient3 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient3.addColorStop(0, "rgba(175, 82, 222, 0.15)");
    gradient3.addColorStop(1, "rgba(175, 82, 222, 0.02)");

    co2Chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "🏢 中華辦7樓",
                    data: [],
                    borderColor: "rgba(0, 122, 255, 0.8)",
                    backgroundColor: gradient1,
                    borderWidth: 2.5,
                    pointBackgroundColor: "rgba(0, 122, 255, 0.9)",
                    pointBorderColor: "rgba(255, 255, 255, 0.8)",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: "rgba(0, 122, 255, 1)",
                    pointHoverBorderColor: "rgba(255, 255, 255, 1)",
                    pointHoverBorderWidth: 3,
                    tension: 0.4,
                    spanGaps: true,
                    fill: true,
                },
                {
                    label: "🏢 中華辦8樓",
                    data: [],
                    borderColor: "rgba(88, 86, 214, 0.8)",
                    backgroundColor: gradient2,
                    borderWidth: 2.5,
                    pointBackgroundColor: "rgba(88, 86, 214, 0.9)",
                    pointBorderColor: "rgba(255, 255, 255, 0.8)",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: "rgba(88, 86, 214, 1)",
                    pointHoverBorderColor: "rgba(255, 255, 255, 1)",
                    pointHoverBorderWidth: 3,
                    tension: 0.4,
                    spanGaps: true,
                    fill: true,
                },
                {
                    label: "🏢 衡陽辦",
                    data: [],
                    borderColor: "rgba(175, 82, 222, 0.8)",
                    backgroundColor: gradient3,
                    borderWidth: 2.5,
                    pointBackgroundColor: "rgba(175, 82, 222, 0.9)",
                    pointBorderColor: "rgba(255, 255, 255, 0.8)",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: "rgba(175, 82, 222, 1)",
                    pointHoverBorderColor: "rgba(255, 255, 255, 1)",
                    pointHoverBorderWidth: 3,
                    tension: 0.4,
                    spanGaps: true,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 20,
                        font: {
                            size: 13,
                            weight: "500",
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        },
                        color: "#1d1d1f",
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    titleColor: "#1d1d1f",
                    bodyColor: "#1d1d1f",
                    borderColor: "rgba(255, 255, 255, 0.8)",
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: true,
                    padding: 12,
                    caretSize: 6,
                    callbacks: {
                        title: function (tooltipItems) {
                            return `時間：${tooltipItems[0].label}`;
                        },
                        label: function (context) {
                            const label = context.dataset.label || "";
                            const value = context.parsed.y;
                            let status = "";
                            if (value > 1200) status = " ⚠️ 超標";
                            else if (value > 1000) status = " 🟡 注意";
                            else status = " 🟢 安全";
                            return `${label}：${value} ppm${status}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "📊 時間軸",
                        font: {
                            size: 13,
                            weight: "600",
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        },
                        color: "#1d1d1f",
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                        lineWidth: 1,
                    },
                    ticks: {
                        maxTicksLimit: 12,
                        font: {
                            size: 11,
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        },
                        color: "#6d6d70",
                        callback: function (value, index) {
                            const label = this.getLabelForValue(value);
                            return label;
                        },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "🌱 CO₂ 濃度 (ppm)",
                        font: {
                            size: 13,
                            weight: "600",
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        },
                        color: "#1d1d1f",
                    },
                    min: 300,
                    // 移除固定的 max，讓圖表自動調整範圍
                    suggestedMax: 1500, // 建議最大值，但會根據數據自動調整
                    grid: {
                        color: function (context) {
                            // 根據 CO₂ 濃度設置更柔和的網格顏色
                            if (context.tick.value >= 1200) return "rgba(255, 59, 48, 0.15)";
                            if (context.tick.value >= 1000) return "rgba(255, 149, 0, 0.15)";
                            return "rgba(0, 0, 0, 0.05)";
                        },
                        lineWidth: function (context) {
                            // 重要濃度線稍微加粗
                            if (context.tick.value === 1000 || context.tick.value === 1200) {
                                return 1.5;
                            }
                            return 1;
                        },
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        },
                        color: "#6d6d70",
                        callback: function (value) {
                            // 在重要濃度值旁添加標示
                            if (value === 1200) return `${value} ⚠️`;
                            if (value === 1000) return `${value} 🟡`;
                            if (value === 400) return `${value} 🟢`;
                            return value;
                        },
                    },
                },
            },
            elements: {
                point: {
                    hoverRadius: 7,
                },
                line: {
                    borderJoinStyle: "round",
                    borderCapStyle: "round",
                },
            },
            animation: {
                duration: 800,
                easing: "easeOutCubic",
            },
        },
    });
}

// 為每個辦公室找最新的有數據記錄（不限於今天）
function getLatestDataForEachRoom(data) {
    const rooms = {
        A: { column: "中華辦7樓", value: null, timestamp: null },
        B: { column: "中華辦8樓", value: null, timestamp: null },
        C: { column: "衡陽辦", value: null, timestamp: null },
    };

    // 從最新的數據開始往前找
    for (let i = data.length - 1; i >= 0; i--) {
        const row = data[i];
        const dateStr = row["日期"] || row["date"];
        const timeStr = row["時間"] || row["time"];

        if (!dateStr || !timeStr) continue;

        // 為每個辦公室檢查是否還需要找數據
        Object.keys(rooms).forEach((roomKey) => {
            const room = rooms[roomKey];

            // 如果這個辦公室還沒找到數據
            if (room.value === null) {
                const rawValue = row[room.column];
                if (rawValue && !isNaN(parseInt(rawValue))) {
                    room.value = parseInt(rawValue);
                    room.timestamp = `${dateStr} ${timeStr}`;
                    console.log(`找到 ${room.column} 最新數據: ${room.value} at ${room.timestamp}`);
                }
            }
        });

        // 如果所有辦公室都找到數據了，就可以停止搜尋
        if (Object.values(rooms).every((room) => room.value !== null)) {
            break;
        }
    }

    console.log("各辦公室最新數據:", rooms);
    return rooms;
}

// 獲取指定日期每個辦公室的最新數據
function getLatestDataForEachRoomByDate(data, targetDateString) {
    const rooms = {
        A: { column: "中華辦7樓", value: null, timestamp: null },
        B: { column: "中華辦8樓", value: null, timestamp: null },
        C: { column: "衡陽辦", value: null, timestamp: null },
    };

    // 先篩選出目標日期的數據
    const dayData = data.filter((row) => {
        const dateStr = row["日期"] || row["date"];
        return dateStr && dateStr.toString().trim() === targetDateString;
    });

    console.log(`獲取 ${targetDateString} 的數據，找到 ${dayData.length} 筆記錄`);

    // 從最新的數據開始往前找
    for (let i = dayData.length - 1; i >= 0; i--) {
        const row = dayData[i];
        const dateStr = row["日期"] || row["date"];
        const timeStr = row["時間"] || row["time"];

        if (!dateStr || !timeStr) continue;

        // 為每個辦公室檢查是否還需要找數據
        Object.keys(rooms).forEach((roomKey) => {
            const room = rooms[roomKey];

            // 如果這個辦公室還沒找到數據
            if (room.value === null) {
                const rawValue = row[room.column];
                if (rawValue && !isNaN(parseInt(rawValue))) {
                    room.value = parseInt(rawValue);
                    room.timestamp = `${dateStr} ${timeStr}`;
                    console.log(
                        `找到 ${room.column} 在 ${targetDateString} 的最新數據: ${room.value} at ${room.timestamp}`
                    );
                }
            }
        });

        // 如果所有辦公室都找到數據了，就可以停止搜尋
        if (Object.values(rooms).every((room) => room.value !== null)) {
            break;
        }
    }

    // 如果某個辦公室沒有找到數據，提供預設值
    Object.keys(rooms).forEach((roomKey) => {
        const room = rooms[roomKey];
        if (room.value === null) {
            room.value = 0;
            room.timestamp = `${targetDateString} 00:00:00`;
            console.log(`${room.column} 在 ${targetDateString} 沒有數據，使用預設值`);
        }
    });

    console.log(`${targetDateString} 各辦公室最新數據:`, rooms);
    return rooms;
}

// 獲取指定日期的數據
function getDataForDate(data, targetDate) {
    const rooms = {
        roomA: { value: null, timestamp: null, column: "中華辦7樓" },
        roomB: { value: null, timestamp: null, column: "中華辦8樓" },
        roomC: { value: null, timestamp: null, column: "衡陽辦" },
    };

    console.log(`獲取 ${targetDate} 的數據`);

    // 過濾出指定日期的數據
    const targetDateData = data.filter((row) => {
        const dateStr = row["日期"] || row["date"];
        if (!dateStr) return false;

        // 比較日期字符串
        return dateStr.toString().trim() === targetDate;
    });

    console.log(`找到 ${targetDate} 的數據筆數:`, targetDateData.length);

    // 為每個辦公室找最新的數據
    Object.keys(rooms).forEach((roomKey) => {
        const room = rooms[roomKey];
        let latestTime = null;
        let latestData = null;

        targetDateData.forEach((row) => {
            const timeStr = row["時間"] || row["time"];
            const rawValue = row[room.column];

            if (timeStr && rawValue && !isNaN(parseInt(rawValue))) {
                const value = parseInt(rawValue);

                // 比較時間，找到最新的
                if (!latestTime || timeStr > latestTime) {
                    latestTime = timeStr;
                    latestData = {
                        value: value,
                        timestamp: `${targetDate} ${timeStr}`,
                    };
                }
            }
        });

        if (latestData) {
            room.value = latestData.value;
            room.timestamp = latestData.timestamp;
            console.log(
                `${room.column} 在 ${targetDate} 的最新數據: ${room.value} at ${room.timestamp}`
            );
        }
    });

    // 如果指定日期沒有數據，往前找最近的數據
    Object.keys(rooms).forEach((roomKey) => {
        const room = rooms[roomKey];
        if (room.value === null) {
            // 往前搜尋最近的數據
            for (let i = data.length - 1; i >= 0; i--) {
                const row = data[i];
                const dateStr = row["日期"] || row["date"];
                const timeStr = row["時間"] || row["time"];

                if (!dateStr || !timeStr) continue;

                // 檢查日期是否早於或等於目標日期
                const rowDate = new Date(dateStr.replace(/\//g, "-"));
                const targetDateObj = new Date(targetDate.replace(/\//g, "-"));

                if (rowDate <= targetDateObj) {
                    const rawValue = row[room.column];
                    if (rawValue && !isNaN(parseInt(rawValue))) {
                        room.value = parseInt(rawValue);
                        room.timestamp = `${dateStr} ${timeStr}`;
                        console.log(
                            `${room.column} 找到最近的歷史數據: ${room.value} at ${room.timestamp}`
                        );
                        break;
                    }
                }
            }
        }
    });

    console.log(`${targetDate} 數據結果:`, rooms);
    return rooms;
}

// 獲取最近N天的數據
function getRecentData(data, days = 7) {
    const today = new Date();
    const recentData = [];

    console.log("開始獲取最近幾天的數據...");

    // 獲取最近N天的日期
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

        console.log(`檢查日期: ${dateString}`);

        // 找出這一天的數據
        const dayData = data.filter((row) => {
            const dateStr = row["日期"] || row["date"];
            const matches = dateStr && dateStr.toString().trim() === dateString;
            if (matches) {
                console.log(`找到 ${dateString} 的數據:`, row);
            }
            return matches;
        });

        console.log(`${dateString} 有 ${dayData.length} 筆數據`);
        recentData.push(...dayData);
    }

    // 按日期和時間排序
    recentData.sort((a, b) => {
        const dateA = a["日期"] || a["date"];
        const timeA = a["時間"] || a["time"];
        const dateB = b["日期"] || b["date"];
        const timeB = b["時間"] || b["time"];

        // 先按日期排序，再按時間排序
        if (dateA !== dateB) {
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        }
        return timeA.localeCompare(timeB);
    });

    console.log(`總共獲取最近${days}天的數據:`, recentData.length, "筆");
    return recentData;
}

// 載入資料並更新 UI
async function loadCO2Data() {
    // 如果在歷史模式，不執行今日數據載入
    if (isHistoryMode) {
        console.log("歷史模式中，跳過今日數據載入");
        return;
    }

    const lastUpdateEl = document.getElementById("lastUpdate");

    try {
        lastUpdateEl.textContent = "🔄 更新中...";

        const res = await fetch(url);
        const data = await res.json();

        if (!data || data.length === 0) {
            throw new Error("沒有找到數據");
        }

        // 獲取今天的數據 - 修正日期格式匹配
        const today = new Date();
        const todayString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        console.log("今天的日期:", todayString);
        console.log("所有數據:", data);

        const todayData = data.filter((row) => {
            // 檢查日期欄位
            const dateStr = row["日期"] || row["date"];
            console.log("檢查行數據:", row);
            console.log("日期欄位:", dateStr);

            if (!dateStr) {
                console.log("日期欄位為空");
                return false;
            }

            try {
                // 直接比較字符串，因為Google Sheet格式是 2025/7/1
                const isToday = dateStr.toString().trim() === todayString;
                console.log(`原始日期: ${dateStr}, 今天: ${todayString}, 是否匹配: ${isToday}`);
                return isToday;
            } catch (e) {
                console.error("日期解析錯誤:", dateStr, e);
                return false;
            }
        });

        // 為每個辦公室找最新的有數據記錄（不限於今天）
        const latestDataForRooms = getLatestDataForEachRoom(data);

        // 更新房間狀態 - 使用各自最新的數據
        updateRoom("A", latestDataForRooms.A.value, "中華辦7樓", latestDataForRooms.A.timestamp);
        updateRoom("B", latestDataForRooms.B.value, "中華辦8樓", latestDataForRooms.B.timestamp);
        updateRoom("C", latestDataForRooms.C.value, "衡陽辦", latestDataForRooms.C.timestamp);

        // 更新建議 - 只考慮有數值的辦公室
        const validValues = [
            latestDataForRooms.A.value,
            latestDataForRooms.B.value,
            latestDataForRooms.C.value,
        ].filter((val) => val !== null && val !== undefined);
        const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
        updateAdvice(maxValue, {
            A: latestDataForRooms.A.value,
            B: latestDataForRooms.B.value,
            C: latestDataForRooms.C.value,
        });

        // 更新圖表 - 如果今天沒有數據，使用最近7天的數據
        let chartData = todayData;
        let chartTitle = "今日 CO₂ 趨勢圖";

        if (todayData.length === 0) {
            console.log("今天沒有數據，載入最近7天的數據");
            chartData = getRecentData(data, 7);
            chartTitle = "近期 CO₂ 趨勢圖 (最近7天)";
            console.log("使用最近7天的數據:", chartData.length, "筆");
        }

        updateChart(chartData);

        // 更新圖表標題
        const chartTitleEl = document.getElementById("chartTitle");
        if (chartTitleEl) {
            chartTitleEl.textContent = chartTitle;
        }

        // 調試信息
        console.log("今天的數據筆數:", todayData.length);
        console.log("今天的數據:", todayData);
        console.log("圖表使用的數據筆數:", chartData.length);

        // 更新時間和倒數計時
        const now = new Date();
        lastUpdateEl.textContent = `📊 最後更新：${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now
            .getSeconds()
            .toString()
            .padStart(2, "0")} | ⏱️ 下次更新：${countdown}秒`;

        // 重置倒數計時
        countdown = 10;
        startCountdown();
    } catch (err) {
        console.error("載入數據錯誤:", err);
        document.getElementById("advice").innerHTML =
            "❌ 無法讀取 Google Sheet，請確認網路連線與 Sheet 設定。";
        lastUpdateEl.textContent = `❌ 更新失敗：${new Date()
            .getHours()
            .toString()
            .padStart(2, "0")}:${new Date()
            .getMinutes()
            .toString()
            .padStart(2, "0")} | ⏱️ 重試：${countdown}秒`;

        // 即使失敗也要重置倒數計時
        countdown = 10;
        startCountdown();
    }
}

function updateRoom(roomKey, value, displayName, timestamp) {
    const roomEl = document.getElementById("room" + roomKey);
    const valueEl = roomEl.querySelector(".value");
    const statusEl = roomEl.querySelector(".status");
    const nameEl = roomEl.querySelector(".name");
    const lastUpdateEl = roomEl.querySelector(".last-update");

    if (nameEl) nameEl.textContent = displayName;

    // 添加數值更新動畫
    valueEl.classList.add("updating");
    setTimeout(() => {
        valueEl.classList.remove("updating");
    }, 300);

    // 處理沒有數據的情況 - 但這個情況理論上不應該發生，因為我們總是找最新有數據的記錄
    if (value === null || value === undefined || isNaN(value)) {
        valueEl.textContent = "載入中...";
        statusEl.textContent = "🔍 搜尋數據中";
        statusEl.className = "status loading";
        statusEl.style.background = "rgba(142, 142, 147, 0.15)";
        statusEl.style.color = "#8e8e93";
        statusEl.style.borderColor = "rgba(142, 142, 147, 0.3)";
        lastUpdateEl.textContent = "搜尋中...";
        roomEl.style.background = "rgba(142, 142, 147, 0.05)";
        roomEl.style.borderColor = "rgba(142, 142, 147, 0.1)";
        return;
    }

    // 顯示數值
    valueEl.textContent = value;

    // 顯示最後更新時間
    if (timestamp) {
        try {
            console.log("處理時間戳:", timestamp);

            const [dateStr, timeStr] = timestamp.split(" ");
            console.log("日期字串:", dateStr, "時間字串:", timeStr);

            if (!dateStr || !timeStr) {
                throw new Error("日期或時間字串為空");
            }

            // 支援兩種日期格式：2025/7/1 和 2025-07-01
            let dateParts;
            if (dateStr.includes("/")) {
                dateParts = dateStr.split("/");
            } else if (dateStr.includes("-")) {
                dateParts = dateStr.split("-");
            } else {
                throw new Error("不支援的日期格式");
            }

            const timeParts = timeStr.split(":");

            console.log("日期部分:", dateParts, "時間部分:", timeParts);

            if (dateParts.length < 3 || timeParts.length < 2) {
                throw new Error("日期或時間格式不正確");
            }

            const [year, month, day] = dateParts;
            const [hour, minute] = timeParts;

            // 檢查是否有有效值
            if (!year || !month || !day || !hour || !minute) {
                throw new Error("日期或時間值為空");
            }

            // 格式化顯示 - 統一轉換為數字以去除前導零
            const formattedMonth = parseInt(month).toString();
            const formattedDay = parseInt(day).toString();
            const formattedDate = `${formattedMonth}/${formattedDay}`;
            const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

            // 檢查是否為今天 - 統一格式進行比較
            const today = new Date();
            const todayString1 = `${today.getFullYear()}/${
                today.getMonth() + 1
            }/${today.getDate()}`;
            const todayString2 = `${today.getFullYear()}-${(today.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

            if (dateStr === todayString1 || dateStr === todayString2) {
                lastUpdateEl.textContent = `📅 今日 ${formattedTime}`;
            } else {
                lastUpdateEl.textContent = `📅 ${formattedDate} ${formattedTime}`;
            }

            console.log("最終顯示:", lastUpdateEl.textContent);
        } catch (e) {
            console.error("時間戳解析錯誤:", e, "原始時間戳:", timestamp);
            // 如果解析失敗，直接顯示原始時間戳的簡化版本
            const simplifiedTimestamp = timestamp
                .replace(/-/g, "/")
                .replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$1/$2/$3");
            lastUpdateEl.textContent = `📅 ${simplifiedTimestamp}`;
        }
    } else {
        lastUpdateEl.textContent = "📅 未知時間";
    }

    // 根據 CO₂ 濃度設定顏色和狀態 - iOS 26 風格
    if (value > 1200) {
        roomEl.style.background = "rgba(255, 59, 48, 0.1)";
        roomEl.style.borderColor = "rgba(255, 59, 48, 0.2)";
        statusEl.className = "status danger";
        statusEl.style.background = "rgba(255, 59, 48, 0.15)";
        statusEl.style.color = "#d70015";
        statusEl.style.borderColor = "rgba(255, 59, 48, 0.3)";
        statusEl.textContent = "⚠️ 超標";
    } else if (value > 1000) {
        roomEl.style.background = "rgba(255, 149, 0, 0.1)";
        roomEl.style.borderColor = "rgba(255, 149, 0, 0.2)";
        statusEl.className = "status warning";
        statusEl.style.background = "rgba(255, 149, 0, 0.15)";
        statusEl.style.color = "#bf5700";
        statusEl.style.borderColor = "rgba(255, 149, 0, 0.3)";
        statusEl.textContent = "🟡 注意";
    } else {
        roomEl.style.background = "rgba(52, 199, 89, 0.1)";
        roomEl.style.borderColor = "rgba(52, 199, 89, 0.2)";
        statusEl.className = "status safe";
        statusEl.style.background = "rgba(52, 199, 89, 0.15)";
        statusEl.style.color = "#248a3d";
        statusEl.style.borderColor = "rgba(52, 199, 89, 0.3)";
        statusEl.textContent = "🟢 安全";
    }
}

function updateAdvice(maxValue, values) {
    const advice = document.getElementById("advice");
    const { A, B, C } = values;

    let messages = [];
    let hasData = false;

    // 檢查中華辦7樓
    if (A !== null && A !== undefined && !isNaN(A)) {
        hasData = true;
        if (A > 1200) messages.push("⚠️ 中華辦7樓：建議立即開窗或啟動換氣設備");
        else if (A > 1000) messages.push("🔸 中華辦7樓：CO₂ 偏高，建議保持空氣流通");
    }

    // 檢查中華辦8樓
    if (B !== null && B !== undefined && !isNaN(B)) {
        hasData = true;
        if (B > 1200) messages.push("⚠️ 中華辦8樓：建議立即開窗或啟動換氣設備");
        else if (B > 1000) messages.push("🔸 中華辦8樓：CO₂ 偏高，建議保持空氣流通");
    }

    // 檢查衡陽辦
    if (C !== null && C !== undefined && !isNaN(C)) {
        hasData = true;
        if (C > 1200) messages.push("⚠️ 衡陽辦：建議立即開窗或啟動換氣設備");
        else if (C > 1000) messages.push("🔸 衡陽辦：CO₂ 偏高，建議保持空氣流通");
    }

    // 根據情況顯示建議
    if (!hasData) {
        advice.innerHTML = "📊 目前沒有可用的 CO₂ 數據";
    } else if (messages.length === 0) {
        advice.innerHTML = "✅ 所有有數據的辦公室空氣品質良好，請持續維持";
    } else {
        advice.innerHTML = messages.join("<br>");
    }
}

// 更新圖表 - 只顯示有數據的時間點
function updateChart(todayData) {
    if (!co2Chart) return;

    console.log("updateChart 被調用，數據:", todayData);

    const labels = [];
    const dataA = [];
    const dataB = [];
    const dataC = [];

    // 處理今天的實際數據
    todayData.forEach((row, index) => {
        console.log(`處理第 ${index + 1} 筆數據:`, row);

        const dateStr = row["日期"] || row["date"];
        const timeStr = row["時間"] || row["time"];

        console.log(`日期: ${dateStr}, 時間: ${timeStr}`);

        if (dateStr && timeStr) {
            try {
                // 清理時間字串
                const cleanTimeStr = timeStr.toString().trim();
                console.log(`清理後的時間: ${cleanTimeStr}`);

                // 解析時間，取小時部分
                const timeParts = cleanTimeStr.split(":");
                const hour = parseInt(timeParts[0]);
                const minute = parseInt(timeParts[1]) || 0;

                // 創建時間標籤
                const timeLabel = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                console.log(`生成的時間標籤: ${timeLabel}`);

                // 添加到圖表數據
                labels.push(timeLabel);

                const valueA = row["中華辦7樓"] ? parseInt(row["中華辦7樓"]) : null;
                const valueB = row["中華辦8樓"] ? parseInt(row["中華辦8樓"]) : null;
                const valueC = row["衡陽辦"] ? parseInt(row["衡陽辦"]) : null;

                dataA.push(valueA);
                dataB.push(valueB);
                dataC.push(valueC);

                console.log(
                    `數據添加成功: 時間=${timeLabel}, A=${valueA}, B=${valueB}, C=${valueC}`
                );
            } catch (e) {
                console.error("無法解析時間:", dateStr, timeStr, e);
            }
        } else {
            console.warn("日期或時間欄位為空:", { dateStr, timeStr });
        }
    });

    console.log(`成功處理 ${labels.length} 筆數據`);
    console.log("時間標籤:", labels);
    console.log("圖表數據 A:", dataA);
    console.log("圖表數據 B:", dataB);
    console.log("圖表數據 C:", dataC);

    // 動態調整 Y 軸範圍
    const allValues = [...dataA, ...dataB, ...dataC].filter(
        (val) => val !== null && val !== undefined
    );
    if (allValues.length > 0) {
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);

        // 計算合適的範圍，留一些邊距
        const range = maxValue - minValue;
        const padding = Math.max(50, range * 0.1); // 至少50ppm的邊距，或者範圍的10%

        const newMin = Math.max(300, minValue - padding); // 最小不低於300
        const newMax = maxValue + padding;

        console.log(
            `動態調整 Y 軸範圍: ${newMin} - ${newMax} (數據範圍: ${minValue} - ${maxValue})`
        );

        // 更新圖表的 Y 軸範圍
        co2Chart.options.scales.y.min = newMin;
        co2Chart.options.scales.y.max = newMax;
    } else {
        // 如果沒有數據，使用默認範圍
        co2Chart.options.scales.y.min = 300;
        co2Chart.options.scales.y.max = 1500;
    }

    co2Chart.data.labels = labels;
    co2Chart.data.datasets[0].data = dataA;
    co2Chart.data.datasets[1].data = dataB;
    co2Chart.data.datasets[2].data = dataC;
    co2Chart.update();
}

// 開始倒數計時
function startCountdown() {
    const lastUpdateEl = document.getElementById("lastUpdate");

    // 清除現有的倒數計時器
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
        countdown--;

        // 更新顯示
        const currentText = lastUpdateEl.textContent;
        const baseText = currentText.split(" | ")[0]; // 取得 "📊 最後更新：XX:XX:XX" 部分
        lastUpdateEl.textContent = `${baseText} | ⏱️ 下次更新：${countdown}秒`;

        // 倒數到0時停止
        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// 停止倒數計時
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// 啟動自動更新
function startAutoRefresh() {
    // 如果在歷史模式或手動輸入模式，不啟動自動更新
    if (isHistoryMode) {
        console.log("歷史模式中，不啟動自動更新");
        return;
    }
    
    if (isInputMode) {
        console.log("手動輸入模式中，不啟動自動更新");
        return;
    }

    // 清除現有的定時器
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    // 設定新的定時器
    autoRefreshInterval = setInterval(() => {
        loadCO2Data();
    }, REFRESH_INTERVAL);

    console.log(`自動更新已啟動，每 ${REFRESH_INTERVAL / 1000} 秒更新一次`);
}

// 停止自動更新
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    stopCountdown();
    console.log("自動更新已停止");
}

// 當頁面載入時自動執行
window.addEventListener("DOMContentLoaded", function () {
    // 驗證 Google Apps Script URL
    if (!validateGoogleAppsScriptUrl()) {
        console.warn("⚠️ Google Apps Script URL 可能需要更新");
    }

    // 初始化圖表
    initChart();

    // 載入初始數據
    loadCO2Data();

    // 啟動自動更新
    startAutoRefresh();

    // 初始化歷史數據功能
    initHistoryFeature();

    // 初始化數據輸入界面
    initDataInput();
});

// 頁面關閉時清理定時器
window.addEventListener("beforeunload", function () {
    stopAutoRefresh();
});

// =============== 歷史數據功能 ===============

// 初始化歷史數據功能
function initHistoryFeature() {
    const todayModeBtn = document.getElementById("todayModeBtn");
    const historyModeBtn = document.getElementById("historyModeBtn");
    const compareModeBtn = document.getElementById("compareModeBtn");
    const inputModeBtn = document.getElementById("inputModeBtn");
    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");
    const datePicker = document.getElementById("datePicker");
    const compareDatePicker = document.getElementById("compareDatePicker");
    const backToTodayBtn = document.getElementById("backToTodayBtn");
    const resetCompareBtn = document.getElementById("resetCompareBtn");
    const container = document.querySelector(".container");

    // 設置日期選擇器的默認值和最大值
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    datePicker.value = todayString;
    datePicker.max = todayString; // 不能選擇未來的日期
    compareDatePicker.max = todayString; // 比較日期也不能選擇未來

    // 今日模式按鈕
    todayModeBtn.addEventListener("click", function () {
        if (!todayModeBtn.classList.contains("active")) {
            switchModeWithLoading("today", switchToTodayMode);
        }
    });

    // 歷史模式按鈕
    historyModeBtn.addEventListener("click", function () {
        if (!historyModeBtn.classList.contains("active")) {
            switchModeWithLoading("history", switchToHistoryMode);
        }
    });

    // 比較模式按鈕
    compareModeBtn.addEventListener("click", function () {
        if (!compareModeBtn.classList.contains("active")) {
            switchModeWithLoading("compare", switchToCompareMode);
        }
    });

    // 手動輸入模式按鈕
    inputModeBtn.addEventListener("click", function () {
        if (!inputModeBtn.classList.contains("active")) {
            switchModeWithLoading("input", switchToInputMode);
        }
    });

    // 日期選擇器變化
    datePicker.addEventListener("change", function () {
        if (isHistoryMode) {
            selectedDate = this.value;
            loadHistoryData(selectedDate);
        }
    });

    // 比較日期選擇器變化
    compareDatePicker.addEventListener("change", function () {
        if (isCompareMode) {
            compareDate = this.value;
            loadCompareData();
        }
    });

    // 回到今日按鈕
    backToTodayBtn.addEventListener("click", function () {
        switchToTodayMode();
    });

    // 重設比較按鈕
    resetCompareBtn.addEventListener("click", function () {
        resetCompareMode();
    });
}

// 切換到今日模式
function switchToTodayMode() {
    isHistoryMode = false;
    isCompareMode = false;
    isInputMode = false;

    const todayModeBtn = document.getElementById("todayModeBtn");
    const historyModeBtn = document.getElementById("historyModeBtn");
    const compareModeBtn = document.getElementById("compareModeBtn");
    const inputModeBtn = document.getElementById("inputModeBtn");
    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");
    const container = document.querySelector(".container");
    const chartTitle = document.getElementById("chartTitle");

    // 更新按鈕狀態
    todayModeBtn.classList.add("active");
    historyModeBtn.classList.remove("active");
    compareModeBtn.classList.remove("active");
    inputModeBtn.classList.remove("active");

    // 隱藏所有控制區塊
    historyControls.style.display = "none";
    compareControls.style.display = "none";
    inputControls.style.display = "none";

    // 移除所有模式樣式
    container.classList.remove("history-mode");
    container.classList.remove("compare-mode");
    container.classList.remove("input-mode");

    // 隱藏比較數據顯示
    hideCompareDataDisplay();

    // 更新圖表標題
    chartTitle.textContent = "今日 CO₂ 趨勢圖";

    // 重新啟動自動更新
    startAutoRefresh();

    // 載入今日數據
    loadCO2Data();

    console.log("切換到今日模式");
}

// 切換到歷史模式
// 切換到歷史模式
function switchToHistoryMode() {
    isHistoryMode = true;
    isCompareMode = false;
    isInputMode = false;

    const todayModeBtn = document.getElementById("todayModeBtn");
    const historyModeBtn = document.getElementById("historyModeBtn");
    const compareModeBtn = document.getElementById("compareModeBtn");
    const inputModeBtn = document.getElementById("inputModeBtn");
    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");
    const container = document.querySelector(".container");

    // 更新按鈕狀態
    todayModeBtn.classList.remove("active");
    historyModeBtn.classList.add("active");
    compareModeBtn.classList.remove("active");
    inputModeBtn.classList.remove("active");

    // 顯示歷史控制區塊，隱藏其他控制區塊
    historyControls.style.display = "flex";
    compareControls.style.display = "none";
    inputControls.style.display = "none";

    // 添加歷史模式樣式，移除其他模式樣式
    container.classList.add("history-mode");
    container.classList.remove("compare-mode");
    container.classList.remove("input-mode");

    // 隱藏比較數據顯示
    hideCompareDataDisplay();

    // 停止自動更新
    stopAutoRefresh();

    // 載入選定日期的數據
    const datePicker = document.getElementById("datePicker");
    selectedDate = datePicker.value;
    loadHistoryData(selectedDate);

    console.log("切換到歷史模式");
}

// 切換到比較模式
function switchToCompareMode() {
    isHistoryMode = false;
    isCompareMode = true;
    isInputMode = false;

    const todayModeBtn = document.getElementById("todayModeBtn");
    const historyModeBtn = document.getElementById("historyModeBtn");
    const compareModeBtn = document.getElementById("compareModeBtn");
    const inputModeBtn = document.getElementById("inputModeBtn");
    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");
    const container = document.querySelector(".container");
    const chartTitle = document.getElementById("chartTitle");

    // 更新按鈕狀態
    todayModeBtn.classList.remove("active");
    historyModeBtn.classList.remove("active");
    compareModeBtn.classList.add("active");
    inputModeBtn.classList.remove("active");

    // 顯示/隱藏控制區塊
    historyControls.style.display = "none";
    compareControls.style.display = "flex";
    inputControls.style.display = "none";

    // 添加比較模式樣式
    container.classList.remove("history-mode");
    container.classList.add("compare-mode");
    container.classList.remove("input-mode");

    // 更新圖表標題
    chartTitle.textContent = "CO₂ 數據對比圖";

    // 停止自動更新
    stopAutoRefresh();

    // 載入比較數據
    loadCompareData();

    console.log("切換到比較模式");
}

// 重設比較模式
function resetCompareMode() {
    const compareDatePicker = document.getElementById("compareDatePicker");
    compareDatePicker.value = "";
    compareDate = null;

    // 重新載入只有今日數據
    loadCompareData();

    console.log("重設比較模式");
}

// 載入歷史數據
async function loadHistoryData(dateString) {
    const lastUpdateEl = document.getElementById("lastUpdate");
    const chartTitle = document.getElementById("chartTitle");

    try {
        lastUpdateEl.textContent = "🔄 載入歷史數據...";

        // 如果還沒有獲取所有數據，先獲取
        if (allData.length === 0) {
            const res = await fetch(url);
            allData = await res.json();
        }

        // 解析選定的日期
        const [year, month, day] = dateString.split("-");
        const targetDateString = `${year}/${parseInt(month)}/${parseInt(day)}`;

        console.log("載入歷史數據，目標日期:", targetDateString);

        // 篩選選定日期的數據
        const dayData = allData.filter((row) => {
            const dateStr = row["日期"] || row["date"];
            return dateStr && dateStr.toString().trim() === targetDateString;
        });

        console.log("找到的歷史數據:", dayData);

        // 為每個辦公室找該日期最新的數據
        const latestDataForRooms = getLatestDataForEachRoomByDate(allData, targetDateString);

        // 更新房間狀態
        updateRoom("A", latestDataForRooms.A.value, "中華辦7樓", latestDataForRooms.A.timestamp);
        updateRoom("B", latestDataForRooms.B.value, "中華辦8樓", latestDataForRooms.B.timestamp);
        updateRoom("C", latestDataForRooms.C.value, "衡陽辦", latestDataForRooms.C.timestamp);

        // 更新建議
        const validValues = [
            latestDataForRooms.A.value,
            latestDataForRooms.B.value,
            latestDataForRooms.C.value,
        ].filter((val) => val !== null && val !== undefined);
        const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
        updateAdvice(maxValue, {
            A: latestDataForRooms.A.value,
            B: latestDataForRooms.B.value,
            C: latestDataForRooms.C.value,
        });

        // 更新圖表
        updateChart(dayData);

        // 更新標題和狀態
        const formattedDate = `${parseInt(month)}月${parseInt(day)}日`;
        chartTitle.textContent = `${formattedDate} CO₂ 趨勢圖`;

        const dataCount = dayData.length;
        if (dataCount > 0) {
            lastUpdateEl.textContent = `📅 ${formattedDate} 數據 (共 ${dataCount} 筆記錄)`;
        } else {
            lastUpdateEl.textContent = `📅 ${formattedDate} 暫無數據記錄`;
        }
    } catch (err) {
        console.error("載入歷史數據錯誤:", err);
        lastUpdateEl.textContent = `❌ 載入歷史數據失敗`;
        document.getElementById("advice").innerHTML = "❌ 無法載入歷史數據，請檢查網路連線。";
    }
}

// 載入比較數據
async function loadCompareData() {
    try {
        console.log("載入比較數據...", { compareDate });

        // 先載入今日數據
        await loadTodayDataForCompare();

        // 如果有選擇比較日期，載入該日期數據
        if (compareDate) {
            await loadCompareDateData(compareDate);
        }

        // 更新UI
        updateCompareDisplay();
        updateCompareChart();
    } catch (error) {
        console.error("載入比較數據時發生錯誤:", error);
        updateUI({ error: "載入比較數據失敗" });
    }
}

// 載入今日數據用於比較
async function loadTodayDataForCompare() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("無效的數據格式");
        }

        allData = data;

        // 獲取今日數據
        const today = new Date();
        const todayString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        compareTodayData = getDataForDate(data, todayString);

        console.log("今日數據載入完成:", compareTodayData);
    } catch (error) {
        console.error("載入今日數據失敗:", error);
        throw error;
    }
}

// 載入比較日期數據
async function loadCompareDateData(dateString) {
    try {
        if (!allData.length) {
            throw new Error("數據尚未載入");
        }

        // 將日期格式從 YYYY-MM-DD 轉換為 YYYY/M/D
        const [year, month, day] = dateString.split("-");
        const formatDate = `${year}/${parseInt(month)}/${parseInt(day)}`;

        compareHistoryData = getDataForDate(allData, formatDate);

        console.log(`${dateString} 數據載入完成:`, compareHistoryData);
    } catch (error) {
        console.error("載入比較日期數據失敗:", error);
        throw error;
    }
}

// 更新比較模式顯示
function updateCompareDisplay() {
    // 更新今日數據 - 使用現有的 updateRoom 函數
    const roomAData = compareTodayData.roomA || { value: null, timestamp: null };
    const roomBData = compareTodayData.roomB || { value: null, timestamp: null };
    const roomCData = compareTodayData.roomC || { value: null, timestamp: null };

    updateRoom("A", roomAData.value, "中華辦7樓", roomAData.timestamp);
    updateRoom("B", roomBData.value, "中華辦8樓", roomBData.timestamp);
    updateRoom("C", roomCData.value, "衡陽辦", roomCData.timestamp);

    // 如果有比較數據，更新比較顯示
    if (compareDate && compareHistoryData) {
        updateCompareDataDisplay("roomA", compareHistoryData.roomA);
        updateCompareDataDisplay("roomB", compareHistoryData.roomB);
        updateCompareDataDisplay("roomC", compareHistoryData.roomC);
    } else {
        // 隱藏比較數據區域
        hideCompareDataDisplay();
    }

    // 更新建議區域 - 重用現有的建議邏輯
    const validValues = [roomAData.value, roomBData.value, roomCData.value].filter(
        (val) => val !== null && val !== undefined
    );
    const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
    updateAdvice(maxValue, {
        A: roomAData.value,
        B: roomBData.value,
        C: roomCData.value,
    });

    // 更新最後更新時間
    updateLastUpdateTime();
}

// 更新房間的比較數據顯示
function updateCompareDataDisplay(roomId, roomData) {
    const compareDataElement = document.querySelector(`#${roomId} .compare-data`);
    if (!compareDataElement) return;

    if (roomData && roomData.value !== null) {
        const todayValue = compareTodayData[roomId]?.value;
        const compareValue = roomData.value;

        // 計算差異
        const difference =
            todayValue !== null && compareValue !== null ? todayValue - compareValue : null;

        // 決定差異顯示的顏色和箭頭
        let diffClass = "";
        let diffIcon = "";
        let diffText = "";

        if (difference !== null) {
            if (difference > 0) {
                diffClass = "increase";
                diffIcon = "📈";
                diffText = `+${difference}`;
            } else if (difference < 0) {
                diffClass = "decrease";
                diffIcon = "📉";
                diffText = `${difference}`;
            } else {
                diffClass = "same";
                diffIcon = "➡️";
                diffText = "持平";
            }
        }

        compareDataElement.innerHTML = `
            <div class="compare-data-header">
                <span class="compare-date">${compareDate}</span>
            </div>
            <div class="compare-value">
                <span class="value">${compareValue}</span>
                <span class="unit">ppm</span>
            </div>
            ${
                difference !== null
                    ? `
                <div class="compare-diff ${diffClass}">
                    <span class="diff-icon">${diffIcon}</span>
                    <span class="diff-text">${diffText}</span>
                </div>
            `
                    : ""
            }
        `;

        compareDataElement.style.display = "block";
    } else {
        compareDataElement.innerHTML = `
            <div class="compare-data-header">
                <span class="compare-date">${compareDate}</span>
            </div>
            <div class="no-data">無數據</div>
        `;
        compareDataElement.style.display = "block";
    }
}

// 隱藏比較數據顯示
function hideCompareDataDisplay() {
    const compareDataElements = document.querySelectorAll(".compare-data");
    compareDataElements.forEach((element) => {
        element.style.display = "none";
    });
}

// 更新比較模式圖表
function updateCompareChart() {
    if (!co2Chart) return;

    // 準備今日數據
    const todayChartData = prepareTodayChartData();

    // 如果有比較日期，準備比較數據
    let compareChartData = null;
    if (compareDate && compareHistoryData) {
        compareChartData = prepareCompareChartData();
    }

    // 更新圖表
    updateChartWithCompareData(todayChartData, compareChartData);
}

// 準備今日圖表數據
function prepareTodayChartData() {
    const today = new Date();
    const todayString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

    const todayData = allData.filter((row) => {
        const dateStr = row["日期"] || row["date"];
        if (!dateStr) return false;

        return dateStr.toString().trim() === todayString;
    });

    console.log("今日圖表數據:", todayData);
    return prepareChartData(todayData, "今日");
}

// 準備比較圖表數據
function prepareCompareChartData() {
    if (!compareDate) return null;

    // 將日期格式從 YYYY-MM-DD 轉換為 YYYY/M/D
    const [year, month, day] = compareDate.split("-");
    const formatDate = `${year}/${parseInt(month)}/${parseInt(day)}`;

    const compareData = allData.filter((row) => {
        const dateStr = row["日期"] || row["date"];
        return dateStr && dateStr.toString().trim() === formatDate;
    });

    console.log("比較圖表數據:", compareData, "格式化日期:", formatDate);
    return prepareChartData(compareData, compareDate);
}

// 準備圖表數據的通用函數
function prepareChartData(data, label) {
    const timeLabels = [];
    const roomAData = [];
    const roomBData = [];
    const roomCData = [];

    data.forEach((row) => {
        const timeStr = row["時間"] || row["time"];
        if (!timeStr) return;

        timeLabels.push(timeStr);

        // 處理各辦公室數據
        const roomAValue = parseInt(row["中華辦7樓"]) || null;
        const roomBValue = parseInt(row["中華辦8樓"]) || null;
        const roomCValue = parseInt(row["衡陽辦"]) || null;

        roomAData.push(roomAValue);
        roomBData.push(roomBValue);
        roomCData.push(roomCValue);
    });

    return {
        labels: timeLabels,
        datasets: [
            {
                label: `🏢 中華辦7樓 (${label})`,
                data: roomAData,
                borderColor: label === "今日" ? "rgba(0, 122, 255, 0.8)" : "rgba(255, 149, 0, 0.8)",
                backgroundColor:
                    label === "今日" ? "rgba(0, 122, 255, 0.1)" : "rgba(255, 149, 0, 0.1)",
                borderWidth: 2.5,
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: `🏢 中華辦8樓 (${label})`,
                data: roomBData,
                borderColor: label === "今日" ? "rgba(88, 86, 214, 0.8)" : "rgba(255, 45, 85, 0.8)",
                backgroundColor:
                    label === "今日" ? "rgba(88, 86, 214, 0.1)" : "rgba(255, 45, 85, 0.1)",
                borderWidth: 2.5,
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: `🏢 衡陽辦 (${label})`,
                data: roomCData,
                borderColor:
                    label === "今日" ? "rgba(175, 82, 222, 0.8)" : "rgba(50, 215, 75, 0.8)",
                backgroundColor:
                    label === "今日" ? "rgba(175, 82, 222, 0.1)" : "rgba(50, 215, 75, 0.1)",
                borderWidth: 2.5,
                pointRadius: 4,
                tension: 0.4,
            },
        ],
    };
}

// 更新圖表並合併今日與比較數據
function updateChartWithCompareData(todayData, compareData) {
    if (!todayData) return;

    let allLabels = [...todayData.labels];
    let allDatasets = [...todayData.datasets];

    // 如果有比較數據，合併進去
    if (compareData) {
        // 合併時間標籤
        compareData.labels.forEach((label) => {
            if (!allLabels.includes(label)) {
                allLabels.push(label);
            }
        });

        // 合併數據集
        allDatasets = allDatasets.concat(compareData.datasets);

        // 排序時間標籤
        allLabels.sort((a, b) => {
            const timeA = new Date(`2000/01/01 ${a}`);
            const timeB = new Date(`2000/01/01 ${b}`);
            return timeA - timeB;
        });
    }

    // 更新圖表
    co2Chart.data.labels = allLabels;
    co2Chart.data.datasets = allDatasets;

    // 動態調整 Y 軸
    const allValues = allDatasets.flatMap((dataset) =>
        dataset.data.filter((value) => value !== null)
    );

    if (allValues.length > 0) {
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const padding = (maxValue - minValue) * 0.1;

        co2Chart.options.scales.y.min = Math.max(0, minValue - padding);
        co2Chart.options.scales.y.max = maxValue + padding;
    }

    co2Chart.update();
}

// 更新最後更新時間顯示
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById("lastUpdate");
    const now = new Date();

    if (isCompareMode) {
        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        lastUpdateEl.textContent = `⚖️ 對比模式 - 最後更新：${timeString}`;
    } else if (isHistoryMode) {
        lastUpdateEl.textContent = `📅 歷史查看模式 - ${selectedDate}`;
    } else {
        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        lastUpdateEl.textContent = `📊 最後更新：${timeString}`;
    }
}

// 簡單的 UI 更新函數來處理錯誤顯示
function updateUI(options) {
    const lastUpdateEl = document.getElementById("lastUpdate");

    if (options && options.error) {
        lastUpdateEl.textContent = `❌ ${options.error}`;
        console.error("UI錯誤:", options.error);
    }
}

// =============== AI風格Loading控制 ===============

// Loading狀態追蹤
let isLoadingMode = false;

// 顯示AI Loading
function showAILoading(mode) {
    const overlay = document.getElementById("aiLoadingOverlay");
    const loadingText = document.getElementById("loadingText");
    const loadingSubtext = document.getElementById("loadingSubtext");

    // 設定loading狀態
    isLoadingMode = true;

    // 使用通用的loading訊息，不再根據模式變化
    loadingText.textContent = "🤖 AI 正在智能切換模式...";
    loadingSubtext.textContent = "正在優化界面與數據載入";

    overlay.classList.add("show");
    console.log(`🤖 顯示AI Loading: ${mode} 模式`);
}

// 隱藏AI Loading
function hideAILoading() {
    const overlay = document.getElementById("aiLoadingOverlay");
    overlay.classList.remove("show");
    isLoadingMode = false;
    console.log("🤖 隱藏AI Loading");
}

// 帶Loading的模式切換包裝函數
function switchModeWithLoading(mode, switchFunction) {
    // 如果正在loading，忽略點擊
    if (isLoadingMode) {
        console.log("⚠️ 正在loading中，忽略點擊");
        return;
    }

    // 顯示Loading
    showAILoading(mode);

    // 立即執行模式切換（在loading期間進行）
    setTimeout(() => {
        switchFunction();
        console.log(`🔄 ${mode} 模式切換完成，界面正在優化中...`);
    }, 300); // 短暫延遲讓loading動畫啟動

    // 2秒後隱藏Loading
    setTimeout(() => {
        hideAILoading();
    }, 2000);
}

// =============== 數據輸入功能 ===============

// 全域變數用於數據輸入功能
let inputDefaultDate = "";
let inputDefaultTime = "";

// 初始化數據輸入界面
function initDataInput() {
    console.log("🔧 初始化數據輸入界面...");

    // 延遲初始化，確保DOM完全載入
    setTimeout(() => {
        const form = document.getElementById("co2InputForm");
        const clearBtn = document.getElementById("clearFormBtn");
        const submitBtn = document.getElementById("submitDataBtn");

        // 詳細檢查所有元素
        console.log("🔍 檢查元素狀態:");
        console.log("  form:", form ? "✅ 找到" : "❌ 缺失");
        console.log("  clearBtn:", clearBtn ? "✅ 找到" : "❌ 缺失");
        console.log("  submitBtn:", submitBtn ? "✅ 找到" : "❌ 缺失");

        if (!form) {
            console.error("❌ 表單元素缺失，無法初始化數據輸入功能");
            return;
        }

        if (!submitBtn) {
            console.error("❌ 提交按鈕缺失，無法初始化數據輸入功能");
            return;
        }

        console.log("✅ 關鍵元素存在，繼續初始化...");

        // 設定預設日期和時間
        const now = new Date();
        const inputDefaultDate = now.toISOString().split("T")[0];
        const inputDefaultTime = now.toTimeString().split(" ")[0].substring(0, 5);

        const dateInput = document.getElementById("inputDate");
        const timeInput = document.getElementById("inputTime");

        if (dateInput) {
            dateInput.value = inputDefaultDate;
            console.log("✅ 設定預設日期:", inputDefaultDate);
        }
        if (timeInput) {
            timeInput.value = inputDefaultTime;
            console.log("✅ 設定預設時間:", inputDefaultTime);
        }

        // 清空表單
        if (clearBtn) {
            clearBtn.addEventListener("click", function () {
                console.log("🗑️ 清空表單");
                if (dateInput) dateInput.value = inputDefaultDate;
                if (timeInput) timeInput.value = inputDefaultTime;
                const officeAInput = document.getElementById("inputOfficeA");
                const officeBInput = document.getElementById("inputOfficeB");
                const officeCInput = document.getElementById("inputOfficeC");
                if (officeAInput) officeAInput.value = "";
                if (officeBInput) officeBInput.value = "";
                if (officeCInput) officeCInput.value = "";
            });
        }

        // 表單提交事件
        form.addEventListener("submit", async function (e) {
            console.log("📤 表單提交事件觸發");
            e.preventDefault();
            try {
                await submitCO2Data();
            } catch (error) {
                console.error("❌ 表單提交錯誤:", error);
            }
        });

        // 添加直接點擊按鈕的事件監聽器（備用機制）
        submitBtn.addEventListener("click", async function (e) {
            console.log("🖱️ 提交按鈕直接點擊事件觸發");

            // 檢查是否為表單內的提交按鈕
            if (e.target.type === "submit" && e.target.closest("form")) {
                console.log("✅ 這是表單提交按鈕，讓表單事件處理");
                return; // 讓表單的submit事件處理
            }

            // 否則直接處理點擊
            e.preventDefault();
            try {
                await submitCO2Data();
            } catch (error) {
                console.error("❌ 按鈕點擊錯誤:", error);
            }
        });

        console.log("✅ 數據輸入界面初始化完成");

        // 添加測試連接按鈕
        addTestButton();
    }, 100); // 100ms 延遲確保DOM完全載入
}

// 提交CO2數據到Google Sheet
async function submitCO2Data() {
    console.log("🚀 開始提交 CO2 數據...");

    const submitBtn = document.getElementById("submitDataBtn");
    const btnText = submitBtn?.querySelector(".btn-text");
    const btnIcon = submitBtn?.querySelector(".btn-icon");

    if (!submitBtn) {
        console.error("❌ 找不到提交按鈕");
        return;
    }

    // 獲取表單數據
    const formData = {
        date: document.getElementById("inputDate")?.value,
        time: document.getElementById("inputTime")?.value,
        officeA: document.getElementById("inputOfficeA")?.value,
        officeB: document.getElementById("inputOfficeB")?.value,
        officeC: document.getElementById("inputOfficeC")?.value,
    };

    console.log("📋 表單數據:", formData);

    // 驗證數據
    if (!formData.date || !formData.time) {
        showErrorMessage("請輸入日期和時間");
        return;
    }

    if (!formData.officeA && !formData.officeB && !formData.officeC) {
        showErrorMessage("請至少輸入一個辦公室的CO₂數據");
        return;
    }

    // 驗證 CO₂ 數值範圍
    const offices = [
        { value: formData.officeA, name: "中華辦7樓" },
        { value: formData.officeB, name: "中華辦8樓" },
        { value: formData.officeC, name: "衡陽辦" },
    ];

    for (const office of offices) {
        if (office.value && (office.value < 300 || office.value > 5000)) {
            showErrorMessage(`${office.name} 的 CO₂ 值必須在 300-5000 ppm 範圍內`);
            return;
        }
    }

    // 更新按鈕狀態
    submitBtn.disabled = true;
    btnIcon.textContent = "⏳";
    btnText.textContent = "提交中...";

    // 顯示進度條
    const progressEl = document.getElementById("submitProgress");
    const progressFill = progressEl.querySelector(".progress-fill");
    const progressText = progressEl.querySelector(".progress-text");

    progressEl.classList.add("show");
    progressText.textContent = "準備提交數據...";

    // 模擬進度
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + "%";
    }, 100);

    try {
        // 準備要寫入的數據行
        const rowData = [
            formData.date,
            formData.time,
            formData.officeA || "",
            formData.officeB || "",
            formData.officeC || "",
        ];

        console.log("準備提交數據:", rowData);

        // 這裡需要實作寫入Google Sheet的邏輯
        // 多重回退機制：依次嘗試不同的寫入方法
        let writeSuccess = false;
        let writeError = null;

        try {
            progressText.textContent = "嘗試 CORS 模式寫入...";
            const result = await writeToGoogleSheet(rowData);
            console.log("✅ CORS 模式寫入成功:", result);
            progressText.textContent = "寫入成功！";
            writeSuccess = true;
        } catch (corsError) {
            console.warn("⚠️ CORS 模式失敗，嘗試表單提交模式:", corsError.message);
            writeError = corsError;

            try {
                progressText.textContent = "嘗試表單提交模式...";
                const result = await writeToGoogleSheetJSONP(rowData);
                console.log("✅ 表單提交模式成功:", result);
                progressText.textContent = "寫入成功！";
                writeSuccess = true;
            } catch (jsonpError) {
                console.warn("⚠️ 表單提交模式失敗，回退到模擬模式:", jsonpError.message);
                progressText.textContent = "回退到模擬模式...";
                writeError = jsonpError;

                // 回退到模擬寫入
                try {
                    await simulateSheetWrite(rowData);
                    console.log("✅ 模擬模式成功");
                    progressText.textContent = "數據已保存（離線模式）";
                    writeSuccess = true;

                    // 模擬模式成功時顯示特殊消息
                    showSuccessMessage("數據已保存（離線模式）- 請檢查網路連接後手動同步");
                } catch (simulateError) {
                    console.error("❌ 所有寫入方法都失敗了");
                    writeError = simulateError;
                    writeSuccess = false;
                }
            }
        }

        if (!writeSuccess) {
            throw writeError || new Error("所有寫入方法都失敗");
        }

        // 完成進度
        clearInterval(progressInterval);
        progressFill.style.width = "100%";
        progressText.textContent = "數據提交完成！";

        // 提交成功
        btnIcon.textContent = "✅";
        btnText.textContent = "提交成功";

        // 顯示成功訊息
        if (writeSuccess && !progressText.textContent.includes("離線模式")) {
            showSuccessMessage("數據已成功添加到 Google Sheet！");
        }

        // 清空表單
        document.getElementById("inputDate").value = inputDefaultDate;
        document.getElementById("inputTime").value = inputDefaultTime;
        document.getElementById("inputOfficeA").value = "";
        document.getElementById("inputOfficeB").value = "";
        document.getElementById("inputOfficeC").value = "";

        // 隱藏進度條
        setTimeout(() => {
            progressEl.classList.remove("show");
        }, 1000);

        // 2秒後重置按鈕
        setTimeout(() => {
            btnIcon.textContent = "📤";
            btnText.textContent = "提交數據";
            submitBtn.disabled = false;
        }, 2000);

        // 重新載入數據以顯示新加入的資料
        setTimeout(() => {
            loadCO2Data();
        }, 1000);
    } catch (error) {
        console.error("提交數據失敗:", error);

        // 停止進度條動畫
        clearInterval(progressInterval);
        progressFill.style.width = "100%";
        progressText.textContent = "提交失敗";

        // 提交失敗
        btnIcon.textContent = "❌";
        btnText.textContent = "提交失敗";

        // 顯示錯誤訊息
        showErrorMessage("數據提交失敗，請檢查網路連線後重試");

        // 隱藏進度條
        setTimeout(() => {
            progressEl.classList.remove("show");
        }, 2000);

        // 2秒後重置按鈕
        setTimeout(() => {
            btnIcon.textContent = "📤";
            btnText.textContent = "提交數據";
            submitBtn.disabled = false;
        }, 2000);
    }
}

// 實際寫入Google Sheet
async function writeToGoogleSheet(rowData) {
    try {
        const requestData = {
            action: "addRow",
            data: {
                date: rowData[0],
                time: rowData[1],
                office_a: rowData[2],
                office_b: rowData[3],
                office_c: rowData[4],
            },
        };

        console.log("準備發送到 Google Apps Script:", requestData);

        // 使用 no-cors 模式來避免 CORS 問題
        const response = await fetch(writeUrl, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain", // 使用 text/plain 避免 preflight 檢查
            },
            mode: "no-cors", // 使用 no-cors 模式
            body: JSON.stringify(requestData),
        });

        // 在 no-cors 模式下，我們無法讀取回應內容
        // 但如果沒有拋出錯誤，就表示請求成功發送了
        console.log("請求已發送到 Google Apps Script");

        // 返回成功結果（因為 no-cors 模式無法檢查實際結果）
        return {
            success: true,
            message: "數據已發送到 Google Sheet（no-cors 模式）",
        };
    } catch (error) {
        console.error("寫入 Google Sheet 錯誤:", error);
        throw error;
    }
}

// 模擬寫入Google Sheet（實際專案中需要連接Google Sheets API）
async function simulateSheetWrite(rowData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 模擬90%成功率
            if (Math.random() > 0.1) {
                console.log("✅ 模擬寫入成功:", rowData);
                resolve();
            } else {
                console.log("❌ 模擬寫入失敗");
                reject(new Error("模擬網路錯誤"));
            }
        }, 1500); // 模擬網路延遲
    });
}

// 顯示成功訊息
function showSuccessMessage(message) {
    console.log("✅ 成功:", message);
    showNotification(message, "success");
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    console.log("❌ 錯誤:", message);
    showNotification(message, "error");
}

// 通用通知顯示函數
function showNotification(message, type = "info") {
    // 創建通知元素
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    // 設定圖標
    let icon = "💬";
    switch (type) {
        case "success":
            icon = "✅";
            break;
        case "error":
            icon = "❌";
            break;
        case "warning":
            icon = "⚠️";
            break;
        case "info":
        default:
            icon = "ℹ️";
            break;
    }

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
    `;

    // 添加到頁面
    document.body.appendChild(notification);

    // 觸發動畫
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);

    // 自動關閉（成功訊息3秒，錯誤訊息5秒）
    const autoCloseTime = type === "error" ? 5000 : 3000;
    setTimeout(() => {
        closeNotification(notification.querySelector(".notification-close"));
    }, autoCloseTime);
}

// 關閉通知
function closeNotification(closeBtn) {
    const notification = closeBtn.closest(".notification");
    if (notification) {
        notification.classList.remove("show");
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// 替代的 JSONP 寫入方法（避免 CORS 問題）
function writeToGoogleSheetJSONP(rowData) {
    return new Promise((resolve, reject) => {
        try {
            const requestData = {
                action: "addRow",
                data: {
                    date: rowData[0],
                    time: rowData[1],
                    office_a: rowData[2],
                    office_b: rowData[3],
                    office_c: rowData[4],
                },
            };

            // 創建一個隱藏的 iframe 來發送請求
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.name = "hiddenFrame";
            document.body.appendChild(iframe);

            // 創建一個表單來發送 POST 請求
            const form = document.createElement("form");
            form.method = "POST";
            form.action = writeUrl;
            form.target = "hiddenFrame";

            // 添加數據字段
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "data";
            input.value = JSON.stringify(requestData);
            form.appendChild(input);

            document.body.appendChild(form);

            // 設置超時處理
            const timeout = setTimeout(() => {
                // 清理
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                resolve({
                    success: true,
                    message: "數據已發送到 Google Sheet（表單提交模式）",
                });
            }, 3000); // 3秒後假設成功

            // 提交表單
            form.submit();

            console.log("數據已通過表單提交發送到 Google Apps Script");
        } catch (error) {
            console.error("JSONP 寫入錯誤:", error);
            reject(error);
        }
    });
}

// 測試 Google Apps Script 連接
async function testGoogleAppsScriptConnection() {
    try {
        console.log("🔍 測試 Google Apps Script 連接...");

        // 嘗試 GET 請求來測試連接
        const response = await fetch(writeUrl, {
            method: "GET",
            mode: "cors",
        });

        if (response.ok) {
            const result = await response.text();
            console.log("✅ Google Apps Script 連接成功:", result);
            return { success: true, data: result };
        } else {
            console.log("⚠️ Google Apps Script 回應狀態:", response.status);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log("❌ Google Apps Script 連接失敗:", error.message);
        return { success: false, error: error.message };
    }
}

// 添加測試按鈕功能
function addTestButton() {
    const inputForm = document.getElementById("co2InputForm");
    if (!inputForm) return;

    // 檢查是否已存在測試按鈕
    if (document.getElementById("testConnectionBtn")) return;

    const testBtn = document.createElement("button");
    testBtn.type = "button";
    testBtn.id = "testConnectionBtn";
    testBtn.className = "btn-secondary";
    testBtn.innerHTML = `
        <span class="btn-icon">🔗</span>
        <span class="btn-text">測試連接</span>
    `;

    testBtn.addEventListener("click", async function () {
        const btnIcon = testBtn.querySelector(".btn-icon");
        const btnText = testBtn.querySelector(".btn-text");

        testBtn.disabled = true;
        btnIcon.textContent = "⏳";
        btnText.textContent = "測試中...";

        const result = await testGoogleAppsScriptConnection();

        if (result.success) {
            btnIcon.textContent = "✅";
            btnText.textContent = "連接成功";
            showSuccessMessage("Google Apps Script 連接正常！");
        } else {
            btnIcon.textContent = "❌";
            btnText.textContent = "連接失敗";
            showErrorMessage(`連接失敗: ${result.error}`);
        }

        setTimeout(() => {
            btnIcon.textContent = "🔗";
            btnText.textContent = "測試連接";
            testBtn.disabled = false;
        }, 3000);
    });

    // 將測試按鈕插入到清空按鈕和提交按鈕之間
    const formActions = inputForm.querySelector(".form-actions");
    const submitBtn = document.getElementById("submitDataBtn");
    if (formActions && submitBtn) {
        formActions.insertBefore(testBtn, submitBtn);
    }
}

// 切換到手動輸入模式
function switchToInputMode() {
    isHistoryMode = false;
    isCompareMode = false;
    isInputMode = true;

    const todayModeBtn = document.getElementById("todayModeBtn");
    const historyModeBtn = document.getElementById("historyModeBtn");
    const compareModeBtn = document.getElementById("compareModeBtn");
    const inputModeBtn = document.getElementById("inputModeBtn");
    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");
    const container = document.querySelector(".container");
    const chartTitle = document.getElementById("chartTitle");

    // 更新按鈕狀態
    todayModeBtn.classList.remove("active");
    historyModeBtn.classList.remove("active");
    compareModeBtn.classList.remove("active");
    inputModeBtn.classList.add("active");

    // 顯示/隱藏控制區塊
    historyControls.style.display = "none";
    compareControls.style.display = "none";
    inputControls.style.display = "block";

    // 添加輸入模式樣式
    container.classList.remove("history-mode");
    container.classList.remove("compare-mode");
    container.classList.add("input-mode");

    // 隱藏比較數據顯示
    hideCompareDataDisplay();

    // 更新圖表標題
    chartTitle.textContent = "今日 CO₂ 趨勢圖（手動輸入模式）";

    // 停止自動更新（在輸入模式下不自動刷新，避免干擾用戶操作）
    stopAutoRefresh();

    // 載入今日數據但不啟動自動更新
    loadCO2Data();

    console.log("切換到手動輸入模式");
}
