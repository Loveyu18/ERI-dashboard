/**
 * ===============================================
 * JavaScript 重構示例 - 模組化架構
 * ===============================================
 */

// ========== 1. 常數定義模組 ==========
// config/constants.js
const CONFIG = {
    // API 設定
    SHEET_ID: "1gDt_ht6s0_LvBM8UeiTTXoDGaDx_RdA01HL_WfDt96k",
    SHEET_NAME: "data",
    WRITE_URL: "https://script.google.com/macros/s/AKfycbydqUsKWXbKcsjvLtbaW1uySjHypWYlf4FSLXcSSBHlNm_A8I94eRdTUidG5jCzgHWK/exec",
    
    // 刷新設定
    REFRESH_INTERVAL: 10000, // 10秒
    COUNTDOWN_INTERVAL: 1000, // 1秒
    
    // CO2 閾值
    CO2_THRESHOLDS: {
        GOOD: 800,
        WARNING: 1000,
        DANGER: 1200
    },
    
    // 辦公室配置
    OFFICES: {
        A: { name: "中華辦7樓", id: "roomA", color: "blue" },
        B: { name: "中華辦8樓", id: "roomB", color: "purple" },
        C: { name: "衡陽辦", id: "roomC", color: "red" }
    },
    
    // 圖表配置
    CHART_CONFIG: {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1d1d1f',
                bodyColor: '#1d1d1f',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 11,
                        family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 11,
                        family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                    }
                }
            }
        }
    }
};

// ========== 2. 工具函數模組 ==========
// utils/helpers.js
class Helpers {
    /**
     * 格式化時間戳
     * @param {string} timestamp - 時間戳
     * @returns {string} 格式化後的時間
     */
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    /**
     * 取得 CO2 狀態
     * @param {number} value - CO2 數值
     * @returns {Object} 狀態物件
     */
    static getCO2Status(value) {
        const { GOOD, WARNING, DANGER } = CONFIG.CO2_THRESHOLDS;
        
        if (value <= GOOD) {
            return { level: 'good', text: '良好', color: '#22c55e' };
        } else if (value <= WARNING) {
            return { level: 'warning', text: '注意', color: '#f59e0b' };
        } else {
            return { level: 'danger', text: '警告', color: '#ef4444' };
        }
    }

    /**
     * 防抖函數
     * @param {Function} func - 要防抖的函數
     * @param {number} delay - 延遲時間
     * @returns {Function} 防抖後的函數
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * 節流函數
     * @param {Function} func - 要節流的函數
     * @param {number} delay - 延遲時間
     * @returns {Function} 節流後的函數
     */
    static throttle(func, delay) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, delay);
            }
        };
    }

    /**
     * 深拷貝物件
     * @param {Object} obj - 要拷貝的物件
     * @returns {Object} 拷貝後的物件
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * 生成唯一 ID
     * @returns {string} 唯一 ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 安全的 JSON 解析
     * @param {string} jsonString - JSON 字串
     * @param {*} defaultValue - 預設值
     * @returns {*} 解析後的值或預設值
     */
    static safeJsonParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON 解析失敗:', error);
            return defaultValue;
        }
    }

    /**
     * 本地儲存操作
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn('本地儲存設定失敗:', error);
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('本地儲存讀取失敗:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn('本地儲存移除失敗:', error);
            }
        }
    };
}

// ========== 3. 事件發射器模組 ==========
// utils/EventEmitter.js
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * 註冊事件監聽器
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * 移除事件監聽器
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index !== -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * 觸發事件
     * @param {string} event - 事件名稱
     * @param {...*} args - 參數
     */
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`事件處理器錯誤 (${event}):`, error);
            }
        });
    }

    /**
     * 註冊一次性事件監聽器
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// ========== 4. 數據服務模組 ==========
// services/DataService.js
class DataService extends EventEmitter {
    constructor() {
        super();
        this.cache = new Map();
        this.lastFetchTime = 0;
        this.cacheTimeout = 5 * 60 * 1000; // 5分鐘快取
    }

    /**
     * 獲取 Google Sheets 數據
     * @param {boolean} useCache - 是否使用快取
     * @returns {Promise<Array>} 數據陣列
     */
    async fetchData(useCache = true) {
        const cacheKey = 'sheetData';
        const now = Date.now();
        
        // 檢查快取
        if (useCache && this.cache.has(cacheKey) && (now - this.lastFetchTime) < this.cacheTimeout) {
            return this.cache.get(cacheKey);
        }

        try {
            this.emit('dataFetchStart');
            
            const url = `https://opensheet.vercel.app/${CONFIG.SHEET_ID}/${CONFIG.SHEET_NAME}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 數據驗證
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            // 更新快取
            this.cache.set(cacheKey, data);
            this.lastFetchTime = now;
            
            this.emit('dataFetchSuccess', data);
            return data;
            
        } catch (error) {
            console.error('數據獲取失敗:', error);
            this.emit('dataFetchError', error);
            throw error;
        }
    }

    /**
     * 提交數據到 Google Sheets
     * @param {Object} data - 要提交的數據
     * @returns {Promise<Object>} 提交結果
     */
    async submitData(data) {
        try {
            this.emit('dataSubmitStart');
            
            const response = await fetch(CONFIG.WRITE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // 清除快取以確保下次獲取最新數據
            this.clearCache();
            
            this.emit('dataSubmitSuccess', result);
            return result;
            
        } catch (error) {
            console.error('數據提交失敗:', error);
            this.emit('dataSubmitError', error);
            throw error;
        }
    }

    /**
     * 清除快取
     */
    clearCache() {
        this.cache.clear();
        this.lastFetchTime = 0;
    }

    /**
     * 獲取今日數據
     * @returns {Promise<Array>} 今日數據
     */
    async getTodayData() {
        const allData = await this.fetchData();
        const today = new Date().toISOString().split('T')[0];
        
        return allData.filter(row => {
            const rowDate = new Date(row.timestamp).toISOString().split('T')[0];
            return rowDate === today;
        });
    }

    /**
     * 獲取指定日期的數據
     * @param {string} date - 日期 (YYYY-MM-DD)
     * @returns {Promise<Array>} 指定日期的數據
     */
    async getDataByDate(date) {
        const allData = await this.fetchData();
        
        return allData.filter(row => {
            const rowDate = new Date(row.timestamp).toISOString().split('T')[0];
            return rowDate === date;
        });
    }

    /**
     * 獲取最新的 N 筆數據
     * @param {number} limit - 數據筆數
     * @returns {Promise<Array>} 最新數據
     */
    async getLatestData(limit = 10) {
        const allData = await this.fetchData();
        
        return allData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
}

// ========== 5. 使用示例 ==========
/*
// 初始化服務
const dataService = new DataService();

// 監聽數據事件
dataService.on('dataFetchStart', () => {
    console.log('開始獲取數據...');
});

dataService.on('dataFetchSuccess', (data) => {
    console.log('數據獲取成功:', data.length, '筆');
});

dataService.on('dataFetchError', (error) => {
    console.error('數據獲取失敗:', error);
});

// 使用服務
async function updateDashboard() {
    try {
        const todayData = await dataService.getTodayData();
        const latestData = await dataService.getLatestData(10);
        
        // 更新 UI
        updateRoomCards(todayData);
        updateChart(todayData);
        updateRecentDataTable(latestData);
        
    } catch (error) {
        console.error('更新儀表板失敗:', error);
    }
}

// 定期更新
setInterval(updateDashboard, CONFIG.REFRESH_INTERVAL);
*/

// ========== 6. 重構的優勢 ==========
/*
1. 模組化：每個模組都有單一職責
2. 可測試性：每個模組都可以獨立測試
3. 可維護性：代碼結構清晰，易於修改
4. 可重用性：模組可以在其他項目中重用
5. 錯誤處理：統一的錯誤處理機制
6. 事件驅動：松耦合的事件系統
7. 效能優化：快取機制減少不必要的 API 調用
8. 型別安全：JSDoc 註釋提供型別資訊
*/
