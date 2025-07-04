// AI Chat Assistant JavaScript Module
// NotebookLM 風格的聊天介面功能 + iOS 26 Liquid Glass 效果

console.log("🤖 AI Chat Assistant 模組載入中...");

// 全域變數
let currentChatId = "current";
let messageHistory = [];
let isTyping = false;

// DOM 元素
let chatInput;
let sendBtn;
let messagesContainer;
let chatContent;
let loadingOverlay;
let charCounter;

// 導覽列狀態監聽
function initSidebarListener() {
    // 監聽導覽列狀態變化
    const sidebar = document.getElementById('sidebarNav');
    if (sidebar) {
        // 創建 MutationObserver 來監聽 class 變化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateLayoutForSidebar();
                }
            });
        });
        
        observer.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // 初始檢查
        updateLayoutForSidebar();
    }
}

// 根據導覽列狀態更新佈局
function updateLayoutForSidebar() {
    const sidebar = document.getElementById('sidebarNav');
    const chatContainer = document.querySelector('.ai-chat-container');
    
    if (sidebar && chatContainer) {
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        // 添加/移除 body class 來觸發 CSS 變化
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
        
        console.log(`導覽列狀態: ${isCollapsed ? '收合' : '展開'}`);
    }
}

// 初始化聊天功能
function initAIChat() {
    console.log("✅ 初始化 AI 聊天功能");

    // 獲取 DOM 元素
    chatInput = document.getElementById("chatInput");
    sendBtn = document.getElementById("sendBtn");
    messagesContainer = document.getElementById("messagesContainer");
    chatContent = document.getElementById("chatContent");
    loadingOverlay = document.getElementById("loadingOverlay");
    charCounter = document.getElementById("charCounter");

    // 檢查關鍵元素是否存在
    if (!messagesContainer) {
        console.error("❌ messagesContainer 未找到！");
        return;
    }
    if (!chatInput) {
        console.error("❌ chatInput 未找到！");
        return;
    }
    if (!sendBtn) {
        console.error("❌ sendBtn 未找到！");
        return;
    }

    console.log("✅ 關鍵 DOM 元素已找到");

    // 初始化導覽列監聽
    initSidebarListener();

    // 綁定事件
    bindEvents();

    // 初始化界面
    initInterface();

    console.log("✅ AI 聊天功能初始化完成");
}

// 綁定事件處理器
function bindEvents() {
    // 發送按鈕點擊
    if (sendBtn) {
        sendBtn.addEventListener("click", handleSendMessage);
    }

    // 輸入框事件
    if (chatInput) {
        chatInput.addEventListener("keydown", handleInputKeydown);
        chatInput.addEventListener("input", handleInputChange);
        chatInput.addEventListener("paste", handleInputPaste);
    }

    // 快速功能卡片點擊
    const actionCards = document.querySelectorAll(".action-card");
    actionCards.forEach((card) => {
        card.addEventListener("click", () => {
            const action = card.dataset.action;
            handleQuickAction(action);
        });
    });

    // 工具按鈕點擊
    const toolBtns = document.querySelectorAll(".tool-btn");
    toolBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tool = btn.dataset.tool;
            handleToolAction(tool);
        });
    });

    // 新對話按鈕
    const newChatBtn = document.getElementById("newChatBtn");
    if (newChatBtn) {
        newChatBtn.addEventListener("click", handleNewChat);
    }

    // 設定按鈕
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
        settingsBtn.addEventListener("click", handleSettings);
    }

    // 刷新數據按鈕 - 移除因為沒有右側面板了
    // const refreshDataBtn = document.getElementById("refreshDataBtn");
    // if (refreshDataBtn) {
    //     refreshDataBtn.addEventListener("click", handleRefreshData);
    // }

    // 清除所有對話按鈕
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", handleClearAll);
    }
}

// 初始化界面
function initInterface() {
    updateCharCounter();
    loadChatHistory();
    // 移除 updateDataCards 因為沒有數據卡片了
    // updateDataCards();
}

// 處理發送訊息
function handleSendMessage() {
    if (!chatInput || isTyping) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // 顯示用戶訊息
    addMessage(message, "user");

    // 清空輸入框
    chatInput.value = "";
    updateCharCounter();

    // 顯示 AI 正在輸入
    showTypingIndicator();

    // 模擬 AI 回應
    setTimeout(() => {
        hideTypingIndicator();
        handleAIResponse(message);
    }, 1500);
}

// 處理輸入框按鍵
function handleInputKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

// 處理輸入變化
function handleInputChange() {
    updateCharCounter();
    autoResizeTextarea();
}

// 處理貼上事件
function handleInputPaste(event) {
    setTimeout(() => {
        updateCharCounter();
        autoResizeTextarea();
    }, 0);
}

// 自動調整輸入框高度
function autoResizeTextarea() {
    if (!chatInput) return;

    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
}

// 更新字數計數器
function updateCharCounter() {
    if (!chatInput || !charCounter) return;

    const length = chatInput.value.length;
    charCounter.textContent = `${length} / 2000`;

    if (length > 1800) {
        charCounter.style.color = "#c62828";
    } else if (length > 1500) {
        charCounter.style.color = "#ef6c00";
    } else {
        charCounter.style.color = "#5f6368";
    }
}

// 添加訊息到對話區域
function addMessage(content, type = "user", timestamp = null) {
    if (!messagesContainer) {
        console.error("messagesContainer 未找到");
        return;
    }

    console.log(`添加訊息: ${type} - ${content}`);

    // 隱藏歡迎區域
    const welcomeSection = document.querySelector(".welcome-section");
    if (welcomeSection) {
        welcomeSection.style.display = "none";
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;

    const time =
        timestamp ||
        new Date().toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
        });

    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">
                ${type === "user" ? "👤" : "🤖"}
            </div>
            <div class="message-body">
                <div class="message-text">${content}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;

    // 確保 messagesContainer 存在且可見
    messagesContainer.style.display = "block";
    messagesContainer.appendChild(messageDiv);

    console.log(`訊息已添加，當前訊息數量: ${messagesContainer.children.length}`);

    // 滾動到底部
    scrollToBottom();

    // 保存到歷史記錄
    messageHistory.push({
        content,
        type,
        timestamp: time,
    });
}

// 顯示正在輸入指示器
function showTypingIndicator() {
    if (!messagesContainer) return;

    isTyping = true;

    const typingDiv = document.createElement("div");
    typingDiv.className = "message ai typing-indicator";
    typingDiv.id = "typingIndicator";

    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">🤖</div>
            <div class="message-body">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// 隱藏正在輸入指示器
function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

// 處理 AI 回應
function handleAIResponse(userMessage) {
    // 這裡可以整合實際的 AI API
    let response = generateMockResponse(userMessage);

    addMessage(response, "ai");
}

// 生成模擬回應
function generateMockResponse(message) {
    const responses = [
        "根據目前的 CO₂ 監測數據，我建議您注意以下幾點...",
        "我正在分析您的數據，從趨勢來看...",
        "這是一個很好的問題！關於 CO₂ 濃度...",
        "讓我為您提供詳細的分析報告...",
        "根據WHO的建議，室內 CO₂ 濃度應該...",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// 滾動到底部
function scrollToBottom() {
    if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}

// 處理快速功能
function handleQuickAction(action) {
    console.log(`執行快速功能: ${action}`);

    const actionMessages = {
        "analyze-current": "請分析當前的 CO₂ 數據",
        "trend-analysis": "請提供趨勢分析報告",
        "health-advice": "請給我健康改善建議",
        "export-report": "請生成詳細的分析報告",
    };

    const message = actionMessages[action];
    if (message) {
        chatInput.value = message;
        handleSendMessage();
    }
}

// 處理工具動作
function handleToolAction(tool) {
    console.log(`使用工具: ${tool}`);

    switch (tool) {
        case "dashboard":
            window.location.href = "co2-monitor.html";
            break;
        case "history":
            // 開啟歷史數據頁面
            break;
        case "export":
            // 匯出功能
            break;
        case "settings":
            handleSettings();
            break;
    }
}

// 新對話
function handleNewChat() {
    console.log("開始新對話");

    // 確認用戶真的想要清空對話
    if (messageHistory.length > 0) {
        if (!confirm("確定要開始新對話嗎？這將清除當前的對話記錄。")) {
            return;
        }
    }

    // 清空對話區域
    if (messagesContainer) {
        messagesContainer.innerHTML = "";
    }

    // 顯示歡迎區域
    const welcomeSection = document.querySelector(".welcome-section");
    if (welcomeSection) {
        welcomeSection.style.display = "block";
    }

    // 清空訊息歷史
    messageHistory = [];

    // 更新對話 ID
    currentChatId = "chat_" + Date.now();

    console.log("新對話已開始");
}

// 設定
function handleSettings() {
    console.log("開啟設定");
    // 這裡可以添加設定面板
}

// 刷新數據 - 已移除右側面板，此函數不再需要
function handleRefreshData() {
    console.log("數據刷新功能已移除");
    // 此函數已不再需要，因為沒有數據面板了
}

// 清除所有對話
function handleClearAll() {
    if (confirm("確定要清除所有對話記錄嗎？")) {
        console.log("清除所有對話");
        handleNewChat();
    }
}

// 載入對話歷史
function loadChatHistory() {
    // 這裡可以從本地存儲或伺服器載入歷史記錄
    console.log("載入對話歷史");
}

// 更新數據卡片 - 已移除右側面板，此函數不再需要
function updateDataCards() {
    console.log("數據卡片功能已移除");
    // 此函數已不再需要，因為沒有數據卡片了
}

// 自動初始化
document.addEventListener("DOMContentLoaded", function () {
    // 延遲初始化確保其他腳本已載入
    setTimeout(() => {
        initAIChat();
        initSidebarListener();
    }, 100);
});

// 匯出函數供其他模組使用
window.AIChat = {
    init: initAIChat,
    addMessage: addMessage,
    handleQuickAction: handleQuickAction,
};

console.log("✅ AI Chat Assistant 模組載入完成");
