// =============== AI 聊天機器人獨立模組 ===============
// 版本: 1.0
// 最後更新: 2025-07-01

// ============================================
// AI 聊天機器人功能
// ============================================

// QA 知識庫 - 靜態教學內容
const qaDatabase = {
    "basic-usage": {
        question: "如何查看即時 CO₂ 數據？",
        answer: `<div class="answer-content">
        <h4>🔍 查看即時數據很簡單：</h4>
            <ol>
                <li><strong>自動更新：</strong>系統每 10 秒自動從 Google Sheet 更新數據</li>
                <li><strong>卡片顯示：</strong>三個辦公室的即時 CO₂ 濃度會顯示在主頁卡片上</li>
                <li><strong>狀態指示：</strong>卡片會根據數值顯示不同顏色（綠色=良好，黃色=普通，紅色=警示）</li>
                <li><strong>手動重新整理：</strong>點擊更新資訊區域的倒數計時可立即更新</li>
            </ol>
            <p><strong>💡 小提示：</strong>確保網路連線正常，系統會自動抓取最新的監測數據！</p>
        </div>`,
    },
    "understanding-data": {
        question: "如何理解數據和狀態指示？",
        answer: `<div class="answer-content">
            <h4>📊 數據解讀指南：</h4>
            <div class="status-guide">
                <div class="status-item good">
                    <span class="status-color"></span>
                    <strong>良好 (< 800 ppm)</strong> - 空氣品質優良，適合長時間工作
                </div>
                <div class="status-item warning">
                    <span class="status-color"></span>
                    <strong>注意 (800-1200 ppm)</strong> - 建議增加通風或休息
                </div>
                <div class="status-item danger">
                    <span class="status-color"></span>
                    <strong>警示 (> 1200 ppm)</strong> - 空氣品質不佳，需立即改善通風
                </div>
            </div>
            <p><strong>🏢 辦公室資訊：</strong></p>
            <ul>
                <li><strong>中華辦7樓：</strong>主要辦公區域</li>
                <li><strong>中華辦8樓：</strong>會議室及其他辦公空間</li>
                <li><strong>衡陽辦：</strong>分部辦公室</li>
            </ul>
        </div>`,
    },
    "refresh-data": {
        question: "如何更新數據？",
        answer: `<div class="answer-content">
            <h4>🔄 數據更新方式：</h4>
            <ol>
                <li><strong>自動更新：</strong>系統預設每 10 秒自動更新一次</li>
                <li><strong>手動更新：</strong>點擊頁面上方的倒數計時數字可立即更新</li>
                <li><strong>更新狀態：</strong>更新資訊會顯示最後更新時間</li>
                <li><strong>錯誤處理：</strong>如果更新失敗，會顯示錯誤訊息</li>
            </ol>
            <p><strong>⚠️ 注意事項：</strong></p>
            <ul>
                <li>確保網路連線穩定</li>
                <li>如果長時間無法更新，請檢查 Google Sheet 的存取權限</li>
                <li>歷史模式和對比模式下不會自動更新，需手動操作</li>
            </ul>
        </div>`,
    },
    "history-mode": {
        question: "如何查看歷史數據？",
        answer: `<div class="answer-content">
            <h4>📅 歷史數據查看步驟：</h4>
            <ol>
                <li><strong>切換模式：</strong>點擊頂部的「📅 歷史查看」按鈕</li>
                <li><strong>選擇日期：</strong>使用日期選擇器選擇要查看的歷史日期</li>
                <li><strong>查看數據：</strong>卡片和圖表會顯示該日期的歷史數據</li>
                <li><strong>回到今日：</strong>點擊「🏠 回到今日」按鈕返回本日數據模式</li>
            </ol>
            <p><strong>📈 圖表功能：</strong></p>
            <ul>
                <li>顯示選定日期的完整時間軸數據</li>
                <li>可以清楚看到一整天的 CO₂ 變化趨勢</li>
                <li>支援多辦公室數據同時顯示</li>
            </ul>
            <p><strong>💡 小提示：</strong>歷史模式下不會自動更新數據，切換日期後需等待載入完成。</p>
        </div>`,
    },
    "compare-mode": {
        question: "如何使用對比模式？",
        answer: `<div class="answer-content">
            <h4>⚖️ 對比模式使用指南：</h4>
            <ol>
                <li><strong>啟動對比：</strong>點擊頂部的「⚖️ 對比模式」按鈕</li>
                <li><strong>選擇對比日期：</strong>使用對比日期選擇器選擇要對比的歷史日期</li>
                <li><strong>查看對比：</strong>卡片會同時顯示今日與選定日期的平均值</li>
                <li><strong>圖表對比：</strong>圖表會同時顯示兩條曲線進行對比</li>
            </ol>
            <p><strong>📊 對比資訊說明：</strong></p>
            <ul>
                <li><strong>平均值：</strong>顯示當日所有數據的平均 CO₂ 濃度</li>
                <li><strong>數據筆數：</strong>顯示該日有多少筆有效數據</li>
                <li><strong>差異指示：</strong>會顯示今日相比對比日期的數值差異</li>
                <li><strong>狀態對比：</strong>同時顯示兩個日期的空氣品質狀態</li>
            </ul>
            <p><strong>🔄 重設對比：</strong>點擊「🔄 重設對比」可清除對比數據回到本日數據模式。</p>
        </div>`,
    },
    "chart-analysis": {
        question: "如何分析趨勢圖表？",
        answer: `<div class="answer-content">
            <h4>📈 圖表分析技巧：</h4>
            <p><strong>🎨 視覺元素：</strong></p>
            <ul>
                <li><strong>藍色線：</strong>中華辦7樓數據</li>
                <li><strong>紫色線：</strong>中華辦8樓數據</li>
                <li><strong>粉色線：</strong>衡陽辦數據</li>
                <li><strong>平滑曲線：</strong>使用 tension 效果讓趨勢更清晰</li>
            </ul>
            <p><strong>📊 分析要點：</strong></p>
            <ol>
                <li><strong>上升趨勢：</strong>可能表示通風不足或人員增加</li>
                <li><strong>下降趨勢：</strong>通風改善或人員減少的表現</li>
                <li><strong>波動幅度：</strong>大幅波動可能反映活動變化</li>
                <li><strong>基線水平：</strong>長期平均值反映空間的基本狀況</li>
            </ol>
            <p><strong>⚖️ 對比模式特色：</strong></p>
            <ul>
                <li>兩條曲線同時顯示，方便直接對比</li>
                <li>不同的線條樣式區分今日與歷史數據</li>
                <li>Y軸自動調整到合適範圍</li>
            </ul>
        </div>`,
    },
    "safety-levels": {
        question: "CO₂ 安全標準是什麼？",
        answer: `<div class="answer-content">
            <h4>🛡️ CO₂ 安全標準參考：</h4>
            <div class="safety-levels">
                <div class="level-item excellent">
                    <strong>🌟 優秀 (< 400 ppm)</strong>
                    <p>戶外新鮮空氣水平，最佳的室內空氣品質</p>
                </div>
                <div class="level-item good">
                    <strong>✅ 良好 (400-800 ppm)</strong>
                    <p>可接受的室內空氣品質，適合長時間工作</p>
                </div>
                <div class="level-item acceptable">
                    <strong>⚠️ 可接受 (800-1000 ppm)</strong>
                    <p>尚可接受，但建議增加通風</p>
                </div>
                <div class="level-item warning">
                    <strong>🔶 注意 (1000-1200 ppm)</strong>
                    <p>空氣品質不佳，建議改善通風或適度休息</p>
                </div>
                <div class="level-item danger">
                    <strong>🚨 警示 (> 1200 ppm)</strong>
                    <p>空氣品質差，可能影響工作效率，需立即改善</p>
                </div>
            </div>
            <p><strong>📚 參考標準：</strong></p>
            <ul>
                <li>ASHRAE 建議室內 CO₂ 濃度應低於 1000 ppm</li>
                <li>台灣 IAQ 標準建議值為 1000 ppm 以下</li>
                <li>WHO 建議長期暴露不應超過 1000 ppm</li>
            </ul>
        </div>`,
    },
    "improvement-tips": {
        question: "如何改善室內空氣品質？",
        answer: `<div class="answer-content">
            <h4>💨 改善空氣品質的方法：</h4>
            <p><strong>🚪 增加通風：</strong></p>
            <ul>
                <li>打開窗戶讓新鮮空氣流通</li>
                <li>使用排風扇或空氣清淨機</li>
                <li>定期檢查並清潔通風系統</li>
                <li>調整空調系統的新風比例</li>
            </ul>
            <p><strong>👥 管理人員密度：</strong></p>
            <ul>
                <li>避免空間過度擁擠</li>
                <li>適當安排會議室使用時間</li>
                <li>鼓勵適度的戶外休息</li>
            </ul>
            <p><strong>🌱 其他改善措施：</strong></p>
            <ul>
                <li>擺放一些室內植物（如黃金葛、虎尾蘭）</li>
                <li>定期維護空調設備</li>
                <li>監控並記錄 CO₂ 變化趨勢</li>
                <li>建立空氣品質管理制度</li>
            </ul>
            <p><strong>⏰ 最佳實踐時機：</strong></p>
            <ul>
                <li>上班前提前開啟通風設備</li>
                <li>午休時間開窗通風</li>
                <li>下班後保持適度通風</li>
            </ul>
        </div>`,
    },
    alerts: {
        question: "什麼時候需要注意警示？",
        answer: `<div class="answer-content">
            <h4>🚨 警示情況與應對：</h4>
            <p><strong>🔴 立即注意情況：</strong></p>
            <ul>
                <li><strong>CO₂ > 1200 ppm：</strong>卡片顯示紅色警示狀態</li>
                <li><strong>持續上升：</strong>圖表顯示明顯上升趨勢</li>
                <li><strong>數據異常：</strong>突然大幅變化或長時間無數據</li>
            </ul>
            <p><strong>⚡ 即時應對措施：</strong></p>
            <ol>
                <li><strong>立即通風：</strong>開窗或啟動通風設備</li>
                <li><strong>減少人員：</strong>如果可能，暫時減少該空間人員</li>
                <li><strong>檢查設備：</strong>確認監測設備是否正常運作</li>
                <li><strong>持續監控：</strong>密切關注數值變化</li>
            </ol>
            <p><strong>📋 建議與提醒區域：</strong></p>
            <ul>
                <li>系統會自動根據數據狀況提供改善建議</li>
                <li>只要留意儀表板右下角的智能助理提醒</li>
                <li>定期檢視歷史趨勢，建立預防性措施</li>
            </ul>
        </div>`,
    },
    "manual-input": {
        question: "如何使用手動輸入模式？",
        answer: `<div class="answer-content">
            <h4>📝 手動輸入模式使用指南：</h4>
            <ol>
                <li><strong>啟動模式：</strong>點擊頂部的「📝 手動輸入」按鈕</li>
                <li><strong>填寫表單：</strong>輸入日期、時間和各辦公室的 CO₂ 數值</li>
                <li><strong>數據驗證：</strong>系統會自動檢查數值範圍（300-5000 ppm）</li>
                <li><strong>提交數據：</strong>點擊「📤 提交數據」按鈕將數據寫入 Google Sheet</li>
            </ol>
            <p><strong>📊 表單欄位說明：</strong></p>
            <ul>
                <li><strong>日期：</strong>選擇數據記錄的日期</li>
                <li><strong>時間：</strong>選擇數據記錄的時間點</li>
                <li><strong>中華辦7樓：</strong>輸入該辦公室的 CO₂ 濃度</li>
                <li><strong>中華辦8樓：</strong>輸入該辦公室的 CO₂ 濃度</li>
                <li><strong>衡陽辦：</strong>輸入該辦公室的 CO₂ 濃度</li>
            </ul>
            <p><strong>🔧 實用功能：</strong></p>
            <ul>
                <li><strong>🔗 測試連接：</strong>檢查與 Google Sheet 的連接狀態</li>
                <li><strong>🗑️ 清空：</strong>快速清空所有輸入欄位</li>
                <li><strong>自動填充：</strong>日期和時間會自動設為當前時間</li>
                <li><strong>進度顯示：</strong>提交時會顯示詳細的處理進度</li>
            </ul>
            <p><strong>⚠️ 注意事項：</strong></p>
            <ul>
                <li>手動輸入模式下會暫停自動更新，避免干擾操作</li>
                <li>至少需要輸入一個辦公室的數據才能提交</li>
                <li>CO₂ 數值必須在 300-5000 ppm 範圍內</li>
                <li>提交成功後數據會立即反映在儀表板上</li>
            </ul>
        </div>`,
    },
};

// =============== 聊天機器人互動功能 ===============

// 初始化快速問題面板展開/收合功能
function initQuickQuestionsPanel() {
    const toggle = document.getElementById("quickQuestionsToggle");
    const content = document.getElementById("quickQuestionsContent");
    const arrow = toggle?.querySelector(".toggle-arrow");

    if (!toggle || !content) {
        console.error("快速問題面板元素缺失");
        return;
    }

    // 預設狀態：收合
    let isExpanded = false;
    content.classList.remove("expanded");
    toggle.classList.remove("expanded");

    // 綁定展開/收合事件
    toggle.addEventListener("click", function () {
        isExpanded = !isExpanded;

        if (isExpanded) {
            // 展開
            content.classList.add("expanded");
            toggle.classList.add("expanded");
        } else {
            // 收合
            content.classList.remove("expanded");
            toggle.classList.remove("expanded");
        }
    });
}

// 初始化問題分類展開/收合功能
function initQuestionCategories() {
    const categories = document.querySelectorAll(".quick-questions-content .question-category");

    categories.forEach((category, index) => {
        const header = category.querySelector(".category-header");
        const expandIcon = category.querySelector(".expand-icon");
        const container = category.querySelector(".question-cards-container");

        if (!header || !expandIcon || !container) {
            console.error("分類元素缺失:", category);
            return;
        }

        // 預設第一個分類展開
        if (index === 0) {
            category.classList.add("expanded");
            expandIcon.textContent = "▲";
        }

        // 綁定點擊事件
        header.addEventListener("click", function () {
            const isExpanded = category.classList.contains("expanded");

            if (isExpanded) {
                // 收合
                category.classList.remove("expanded");
                expandIcon.textContent = "▼";
            } else {
                // 展開
                category.classList.add("expanded");
                expandIcon.textContent = "▲";
            }
        });
    });
}

// 初始化卡片橫向拖移功能
function initCardScrolling() {
    const containers = document.querySelectorAll(
        ".quick-questions-content .question-cards-container"
    );

    containers.forEach((container) => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasMoved = false; // 追蹤是否有拖移行為

        container.addEventListener("mousedown", (e) => {
            // 如果點擊的是卡片，不啟動拖移
            if (e.target.closest(".question-card")) {
                return;
            }

            isDown = true;
            hasMoved = false;
            container.classList.add("dragging");
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            container.style.cursor = "grabbing";
        });

        container.addEventListener("mouseleave", () => {
            isDown = false;
            hasMoved = false;
            container.classList.remove("dragging");
            container.style.cursor = "grab";
        });

        container.addEventListener("mouseup", () => {
            isDown = false;
            hasMoved = false;
            container.classList.remove("dragging");
            container.style.cursor = "grab";
        });

        container.addEventListener("mousemove", (e) => {
            if (!isDown) return;

            hasMoved = true;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        // 設置初始游標樣式
        container.style.cursor = "grab";
    });
}

// 初始化問題卡片點擊事件
function initQuestionCards() {
    // 首先清除所有可能的 dragging 狀態
    const containers = document.querySelectorAll(".question-cards-container");
    containers.forEach((container) => {
        container.classList.remove("dragging");
    });

    const cards = document.querySelectorAll(".question-card");

    if (cards.length === 0) {
        console.error("❌ 沒有找到任何問題卡片");
        return;
    }

    cards.forEach((card) => {
        card.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const questionKey = this.dataset.question;

            if (questionKey) {
                handleCardClick(questionKey, this);
            }
        });
    });
}

// 處理卡片點擊
function handleCardClick(questionKey, cardElement) {
    // 添加點擊動畫效果
    cardElement.classList.add("clicked");
    setTimeout(() => {
        cardElement.classList.remove("clicked");
    }, 200);

    // 根據問題鍵值找到對應的 QA
    const qaKeys = {
        "basic-usage": "basic-usage",
        "understanding-data": "understanding-data",
        "refresh-data": "refresh-data",
        "history-mode": "history-mode",
        "compare-mode": "compare-mode",
        "chart-analysis": "chart-analysis",
        "safety-levels": "safety-levels",
        "improvement-tips": "improvement-tips",
        alerts: "alerts",
        "manual-input": "manual-input",
    };

    const qaKey = qaKeys[questionKey];

    if (qaKey && qaDatabase[qaKey]) {
        // 先添加用戶問題到對話中
        addUserMessage(qaDatabase[qaKey].question);

        // 然後添加機器人回應
        setTimeout(() => {
            addBotMessage(qaDatabase[qaKey].answer);
        }, 300);

        // 自動收合快速問題面板
        setTimeout(() => {
            autoCollapseQuickQuestionsPanel();
        }, 800);
    } else {
        // 先添加用戶問題（使用卡片標題）
        const cardTitle = cardElement.querySelector(".card-title");
        const userQuestion = cardTitle ? cardTitle.textContent : "相關問題";
        addUserMessage(userQuestion);

        // 提供通用回應
        setTimeout(() => {
            addBotMessage(
                "抱歉，這個問題的詳細說明正在準備中 🚧 請嘗試其他問題或直接輸入您想了解的內容！"
            );
        }, 300);

        // 自動收合快速問題面板
        setTimeout(() => {
            autoCollapseQuickQuestionsPanel();
        }, 800);
    }
}

// 自動收合快速問題面板
function autoCollapseQuickQuestionsPanel() {
    const toggle = document.getElementById("quickQuestionsToggle");
    const content = document.getElementById("quickQuestionsContent");

    if (!toggle || !content) {
        return;
    }

    // 如果面板是展開的，則收合它
    if (content.classList.contains("expanded")) {
        content.classList.remove("expanded");
        toggle.classList.remove("expanded");
    }
}

// =============== 聊天輸入功能 ===============

// 聊天輸入功能初始化
function initChatInput() {
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");

    if (!chatInput || !sendButton) {
        console.error("❌ 聊天輸入元素未找到");
        return;
    }

    // 綁定發送按鈕點擊事件
    sendButton.addEventListener("click", function () {
        handleUserInput();
    });

    // 綁定 Enter 鍵發送
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });

    // 輸入時動態控制發送按鈕狀態
    chatInput.addEventListener("input", function () {
        const hasText = this.value.trim().length > 0;
        sendButton.style.opacity = hasText ? "1" : "0.5";
        sendButton.disabled = !hasText;
    });

    // 初始化發送按鈕狀態
    sendButton.style.opacity = "0.5";
    sendButton.disabled = true;
}

// 處理用戶輸入
function handleUserInput() {
    const chatInput = document.getElementById("chatInput");
    const userMessage = chatInput.value.trim();

    if (!userMessage) return;

    // 添加用戶訊息到對話區
    addUserMessage(userMessage);

    // 清空輸入框
    chatInput.value = "";

    // 重置發送按鈕狀態
    const sendButton = document.getElementById("sendButton");
    sendButton.style.opacity = "0.5";
    sendButton.disabled = true;

    // 檢測關鍵字並回應
    setTimeout(() => {
        detectKeywordAndRespond(userMessage);
    }, 500); // 稍微延遲，模擬思考時間
}

// 添加用戶訊息
function addUserMessage(message) {
    const chatMessages = document.getElementById("chatMessages");

    if (!chatMessages) {
        console.error("❌ 找不到 chatMessages 元素");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "message user-message";
    messageElement.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    chatMessages.appendChild(messageElement);

    // 添加顯示動畫
    setTimeout(() => {
        messageElement.classList.add("show");
    }, 50);

    scrollToBottom();
}

// 添加機器人訊息
function addBotMessage(message) {
    const chatMessages = document.getElementById("chatMessages");

    if (!chatMessages) {
        console.error("❌ 找不到 chatMessages 元素");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "message bot-message";
    messageElement.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div>${message}</div>
        </div>
    `;

    chatMessages.appendChild(messageElement);

    // 添加顯示動畫
    setTimeout(() => {
        messageElement.classList.add("show");
    }, 50);

    scrollToBottom();
}

// 轉義HTML特殊字符
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}

// 滾動到對話底部
function scrollToBottom() {
    const chatMessages = document.getElementById("chatMessages");
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// 關鍵字檢測和回應
function detectKeywordAndRespond(userMessage) {
    const message = userMessage.toLowerCase();

    // 關鍵字對應QA的映射表
    const keywordToQA = {
        // 基本操作相關
        操作: "basic-usage",
        使用: "basic-usage",
        怎麼: "basic-usage",
        如何: "basic-usage",
        開始: "basic-usage",
        功能: "basic-usage",

        顏色: "understanding-data",
        紅色: "understanding-data",
        綠色: "understanding-data",
        黃色: "understanding-data",
        橙色: "understanding-data",
        狀態: "understanding-data",
        意思: "understanding-data",

        圖表: "chart-analysis",
        歷史: "history-mode",
        趨勢: "chart-analysis",
        比較: "compare-mode",
        查看: "chart-analysis",

        // 手動輸入相關
        手動: "manual-input",
        輸入: "manual-input",
        填寫: "manual-input",
        表單: "manual-input",
        提交: "manual-input",
        新增: "manual-input",
        添加: "manual-input",

        // 空氣品質相關
        co2: "safety-levels",
        "co₂": "safety-levels",
        二氧化碳: "safety-levels",
        標準: "safety-levels",
        正常: "safety-levels",
        安全: "safety-levels",
        數值: "safety-levels",

        改善: "improvement-tips",
        通風: "improvement-tips",
        降低: "improvement-tips",
        減少: "improvement-tips",
        方法: "improvement-tips",
        措施: "improvement-tips",
        建議: "improvement-tips",

        警示: "alerts",
        警告: "alerts",
        注意: "alerts",
        危險: "alerts",
        超標: "alerts",
        異常: "alerts",

        // 手動輸入模式相關
        手動: "manual-input",
        輸入: "manual-input",
        模式: "manual-input",
        數據: "manual-input",
        提交: "manual-input",
        表單: "manual-input",
    };

    // 檢查是否有匹配的關鍵字
    let matchedQA = null;
    for (const [keyword, qaKey] of Object.entries(keywordToQA)) {
        if (message.includes(keyword)) {
            matchedQA = qaKey;
            break;
        }
    }

    if (matchedQA && qaDatabase[matchedQA]) {
        // 找到匹配的QA，直接回應答案
        addBotMessage(qaDatabase[matchedQA].answer);
    } else {
        // 沒有找到匹配的關鍵字，進行閒聊或提供建議
        const chatResponse = generateChatResponse(userMessage);
        addBotMessage(chatResponse);
    }
}

// 生成閒聊回應
function generateChatResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // 問候語回應
    if (message.includes("你好") || message.includes("嗨") || message.includes("哈囉")) {
        return "你好！我是CO₂監測助手 🤖 很高興為您服務！您可以問我任何關於 CO₂ 監測的問題喔～";
    }

    // 感謝語回應
    if (message.includes("謝謝") || message.includes("感謝")) {
        return "不客氣！很高興能幫助您 😊 如果還有其他問題，隨時都可以問我喔！";
    }

    // 系統相關但不精確的問題
    if (message.includes("系統") || message.includes("平台") || message.includes("網站")) {
        return `這是一個 CO₂ 即時監測儀表板 📊<br><br>
                主要功能包括：<br>
                • 📈 即時顯示 CO₂ 濃度<br>
                • 🎯 智能警示提醒<br>
                • 📅 歷史數據查詢<br>
                • 💡 空氣品質改善建議<br><br>
                您想了解哪個功能呢？`;
    }

    // 處理不明確的問題，提供引導
    const suggestions = [
        "我可以幫您了解以下主題：<br><br>" +
            "🔹 <strong>基本操作：</strong>如何使用監測儀表板<br>" +
            "🔹 <strong>數值解讀：</strong>CO₂ 濃度標準與顏色意義<br>" +
            "🔹 <strong>空氣改善：</strong>如何降低 CO₂ 濃度<br>" +
            "🔹 <strong>警示處理：</strong>出現警告時的應對方法<br><br>" +
            "您想了解哪個主題呢？",

        "看起來您想了解更多資訊 🤔<br><br>" +
            "您可以試試問我：<br>" +
            '• "CO₂ 正常值是多少？"<br>' +
            '• "紅色警示代表什麼？"<br>' +
            '• "如何改善空氣品質？"<br>' +
            '• "怎麼使用歷史功能？"<br><br>' +
            "或者點擊上方的問題卡片，我會立即為您解答！",

        "很抱歉，我沒有完全理解您的問題 😅<br><br>" +
            "我是專門的 CO₂ 監測助手，最擅長回答：<br>" +
            "📊 儀表板操作問題<br>" +
            "🌪️ 空氣品質相關問題<br>" +
            "⚠️ 警示處理建議<br>" +
            "📈 數據分析說明<br><br>" +
            "可以換個方式問我嗎？",
    ];

    // 隨機選擇一個建議回應
    return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// =============== 聊天機器人初始化 ===============

// 初始化聊天機器人所有功能
function initChatbot() {
    // 檢查必要的 DOM 元素
    const chatbotButton = document.querySelector(".chatbot-button");
    const chatbotWindow = document.querySelector(".chatbot-window");

    if (!chatbotButton || !chatbotWindow) {
        console.error("❌ 聊天機器人 DOM 元素缺失");
        return false;
    }

    // 初始化聊天機器人基本功能
    let isExpanded = false;

    chatbotButton.addEventListener("click", function () {
        isExpanded = !isExpanded;

        if (isExpanded) {
            chatbotWindow.classList.add("expanded");
        } else {
            chatbotWindow.classList.remove("expanded");
        }
    });

    // 關閉按鈕事件
    const closeButton = document.querySelector("#closeChatbot");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            isExpanded = false;
            chatbotWindow.classList.remove("expanded");
        });
    }

    // 點擊外部關閉
    document.addEventListener("click", function (e) {
        if (isExpanded && !e.target.closest(".chatbot-container")) {
            isExpanded = false;
            chatbotWindow.classList.remove("expanded");
        }
    });

    // ESC 鍵關閉
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && isExpanded) {
            isExpanded = false;
            chatbotWindow.classList.remove("expanded");
        }
    });

    // 初始化各個功能模組
    try {
        // 初始化快速問題面板功能
        initQuickQuestionsPanel();

        // 初始化主題收合功能
        initQuestionCategories();

        // 確保等待一段時間，讓 DOM 完全加載
        setTimeout(() => {
            // 先初始化卡片橫向拖移功能
            initCardScrolling();
        }, 200);

        // 後綁定問題卡片點擊事件，確保優先級
        setTimeout(() => {
            initQuestionCards();
        }, 600);

        // 初始化聊天輸入功能
        setTimeout(() => {
            initChatInput();
        }, 800);

        console.log("✅ 聊天機器人初始化完成");
        return true;
    } catch (error) {
        console.error("❌ 聊天機器人初始化失敗:", error);
        return false;
    }
}

// 自動初始化（當DOM準備就緒時）
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        // 延遲一點時間確保其他腳本已載入
        setTimeout(initChatbot, 100);
    });
} else {
    // DOM 已經準備就緒
    setTimeout(initChatbot, 100);
}
