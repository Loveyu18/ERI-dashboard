/**
 * 常數配置模組
 * 集中管理所有應用程式的常數設定
 */

export const CONFIG = {
    // API 設定
    SHEET_ID: "1gDt_ht6s0_LvBM8UeiTTXoDGaDx_RdA01HL_WfDt96k",
    SHEET_NAME: "data",
    WRITE_URL: "https://script.google.com/macros/s/AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK/exec",
    
    // 刷新設定
    REFRESH_INTERVAL: 10000, // 10秒
    COUNTDOWN_INTERVAL: 1000, // 1秒
    
    // CO2 閾值標準
    CO2_THRESHOLDS: {
        GOOD: 800,
        WARNING: 1000,
        DANGER: 1200,
        CRITICAL: 1500
    },
    
    // 辦公室配置
    OFFICES: {
        A: { 
            name: "中華辦7樓", 
            id: "roomA", 
            color: "blue",
            element: null 
        },
        B: { 
            name: "中華辦8樓", 
            id: "roomB", 
            color: "purple",
            element: null 
        },
        C: { 
            name: "衡陽辦", 
            id: "roomC", 
            color: "red",
            element: null 
        }
    },
    
    // 顯示模式
    MODES: {
        TODAY: 'today',
        HISTORY: 'history',
        COMPARE: 'compare',
        INPUT: 'input'
    },
    
    // 本地儲存鍵值
    STORAGE_KEYS: {
        SETTINGS: 'eri_dashboard_settings',
        CACHE: 'eri_dashboard_cache',
        USER_PREFERENCES: 'eri_dashboard_preferences'
    },
    
    // 錯誤訊息
    ERROR_MESSAGES: {
        NETWORK_ERROR: '網路連線錯誤，請檢查您的網路連線',
        DATA_FETCH_ERROR: '無法獲取數據，請稍後再試',
        DATA_SUBMIT_ERROR: '數據提交失敗，請稍後再試',
        VALIDATION_ERROR: '輸入的數據格式不正確',
        UNKNOWN_ERROR: '發生未知錯誤，請重新整理頁面'
    },
    
    // 成功訊息
    SUCCESS_MESSAGES: {
        DATA_UPDATED: '數據更新成功',
        DATA_SUBMITTED: '數據提交成功',
        SETTINGS_SAVED: '設定已儲存'
    },
    
    // 動畫設定
    ANIMATION: {
        DURATION_FAST: 200,
        DURATION_NORMAL: 300,
        DURATION_SLOW: 500,
        EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    // 圖表預設配置
    CHART_DEFAULTS: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
    }
};

// 凍結配置物件防止意外修改
Object.freeze(CONFIG);
Object.freeze(CONFIG.CO2_THRESHOLDS);
Object.freeze(CONFIG.OFFICES);
Object.freeze(CONFIG.MODES);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ERROR_MESSAGES);
Object.freeze(CONFIG.SUCCESS_MESSAGES);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.CHART_DEFAULTS);
