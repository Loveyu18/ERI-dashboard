/**
 * 工具函數模組
 * 提供通用的工具函數和輔助方法
 */

import { CONFIG } from '../config/constants.js';

export class Helpers {
    /**
     * 格式化時間戳為可讀格式
     * @param {string|Date} timestamp - 時間戳
     * @param {Object} options - 格式化選項
     * @returns {string} 格式化後的時間字串
     */
    static formatTimestamp(timestamp, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const formatOptions = { ...defaultOptions, ...options };
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp:', timestamp);
            return '無效時間';
        }

        return date.toLocaleString('zh-TW', formatOptions);
    }

    /**
     * 格式化相對時間 (例: 5分鐘前)
     * @param {string|Date} timestamp - 時間戳
     * @returns {string} 相對時間字串
     */
    static formatRelativeTime(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}秒前`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}分鐘前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}小時前`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}天前`;
        }
    }

    /**
     * 根據 CO2 數值獲取狀態資訊
     * @param {number} value - CO2 數值
     * @returns {Object} 包含等級、文字、顏色和建議的物件
     */
    static getCO2Status(value) {
        const { GOOD, WARNING, DANGER, CRITICAL } = CONFIG.CO2_THRESHOLDS;
        
        if (value <= GOOD) {
            return {
                level: 'good',
                text: '良好',
                color: '#22c55e',
                bgColor: 'rgba(34, 197, 94, 0.1)',
                icon: '😊',
                advice: '空氣品質良好，請保持'
            };
        } else if (value <= WARNING) {
            return {
                level: 'warning',
                text: '注意',
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                icon: '😐',
                advice: '建議開窗通風或開啟空氣清淨機'
            };
        } else if (value <= DANGER) {
            return {
                level: 'danger',
                text: '警告',
                color: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                icon: '😰',
                advice: '請立即開窗通風，考慮減少室內人員'
            };
        } else {
            return {
                level: 'critical',
                text: '嚴重',
                color: '#dc2626',
                bgColor: 'rgba(220, 38, 38, 0.1)',
                icon: '🚨',
                advice: '緊急通風！建議暫時離開該區域'
            };
        }
    }

    /**
     * 防抖函數 - 防止函數被頻繁呼叫
     * @param {Function} func - 要防抖的函數
     * @param {number} delay - 延遲時間（毫秒）
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
     * 節流函數 - 限制函數執行頻率
     * @param {Function} func - 要節流的函數
     * @param {number} delay - 間隔時間（毫秒）
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
     * 深度複製物件
     * @param {*} obj - 要複製的物件
     * @returns {*} 複製後的物件
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
     * 生成唯一識別碼
     * @param {string} prefix - 前綴字串
     * @returns {string} 唯一 ID
     */
    static generateId(prefix = 'id') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * 安全的 JSON 解析
     * @param {string} jsonString - JSON 字串
     * @param {*} defaultValue - 預設值
     * @returns {*} 解析結果或預設值
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
     * 格式化數字為千分位格式
     * @param {number} num - 數字
     * @param {number} decimals - 小數位數
     * @returns {string} 格式化後的數字字串
     */
    static formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * 檢查元素是否在視窗內
     * @param {HTMLElement} element - DOM 元素
     * @returns {boolean} 是否在視窗內
     */
    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * 平滑滾動到指定元素
     * @param {HTMLElement|string} target - 目標元素或選擇器
     * @param {number} offset - 偏移量
     */
    static scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * 載入圖片並返回 Promise
     * @param {string} src - 圖片路徑
     * @returns {Promise<HTMLImageElement>} 載入的圖片元素
     */
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * 複製文字到剪貼簿
     * @param {string} text - 要複製的文字
     * @returns {Promise<boolean>} 是否成功
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降級方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.error('複製失敗:', error);
            return false;
        }
    }

    /**
     * 驗證電子郵件格式
     * @param {string} email - 電子郵件
     * @returns {boolean} 是否有效
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 驗證 CO2 數值是否有效
     * @param {number} value - CO2 數值
     * @returns {boolean} 是否有效
     */
    static isValidCO2Value(value) {
        return !isNaN(value) && value >= 300 && value <= 5000;
    }

    /**
     * 本地儲存工具
     */
    static storage = {
        /**
         * 設定本地儲存值
         * @param {string} key - 鍵值
         * @param {*} value - 值
         * @returns {boolean} 是否成功
         */
        set(key, value) {
            try {
                const serializedValue = JSON.stringify({
                    value,
                    timestamp: Date.now()
                });
                localStorage.setItem(key, serializedValue);
                return true;
            } catch (error) {
                console.warn('本地儲存設定失敗:', error);
                return false;
            }
        },

        /**
         * 獲取本地儲存值
         * @param {string} key - 鍵值
         * @param {*} defaultValue - 預設值
         * @param {number} maxAge - 最大存活時間（毫秒）
         * @returns {*} 儲存的值或預設值
         */
        get(key, defaultValue = null, maxAge = Infinity) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return defaultValue;

                const { value, timestamp } = JSON.parse(item);
                const age = Date.now() - timestamp;
                
                if (age > maxAge) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }

                return value;
            } catch (error) {
                console.warn('本地儲存讀取失敗:', error);
                return defaultValue;
            }
        },

        /**
         * 移除本地儲存值
         * @param {string} key - 鍵值
         * @returns {boolean} 是否成功
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('本地儲存移除失敗:', error);
                return false;
            }
        },

        /**
         * 清空所有本地儲存
         * @returns {boolean} 是否成功
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('本地儲存清空失敗:', error);
                return false;
            }
        }
    };
}
