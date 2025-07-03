/**
 * 數據服務模組
 * 負責所有與數據相關的操作，包括獲取、提交、快取管理
 */

import { CONFIG } from '../config/constants.js';
import { Helpers } from '../utils/helpers.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class DataService extends EventEmitter {
    constructor() {
        super();
        this.cache = new Map();
        this.lastFetchTime = 0;
        this.cacheTimeout = 5 * 60 * 1000; // 5分鐘快取
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
    }

    /**
     * 設定網路狀態監聽器
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.emit('networkStatusChange', true);
            console.log('網路已連線');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.emit('networkStatusChange', false);
            console.warn('網路已中斷');
        });
    }

    /**
     * 檢查網路連線狀態
     * @returns {boolean} 是否在線
     */
    isNetworkAvailable() {
        return this.isOnline;
    }

    /**
     * 驗證 Google Apps Script URL
     * @returns {boolean} URL 是否有效
     */
    validateGoogleAppsScriptUrl() {
        if (!CONFIG.WRITE_URL) {
            console.error('❌ 錯誤：writeUrl 未設置');
            return false;
        }

        if (!CONFIG.WRITE_URL.includes('script.google.com')) {
            console.error('❌ 錯誤：writeUrl 不是有效的 Google Apps Script URL');
            return false;
        }

        console.log('✅ Google Apps Script URL 驗證通過');
        return true;
    }

    /**
     * 獲取 Google Sheets 數據
     * @param {boolean} useCache - 是否使用快取
     * @param {boolean} forceRefresh - 是否強制刷新
     * @returns {Promise<Array>} 數據陣列
     */
    async fetchData(useCache = true, forceRefresh = false) {
        const cacheKey = 'sheetData';
        const now = Date.now();
        
        // 檢查網路狀態
        if (!this.isNetworkAvailable()) {
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                console.warn('網路中斷，使用快取數據');
                this.emit('dataFetchWarning', '網路中斷，顯示快取數據');
                return cachedData;
            } else {
                throw new Error(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
            }
        }

        // 檢查快取
        if (!forceRefresh && useCache && this.cache.has(cacheKey) && (now - this.lastFetchTime) < this.cacheTimeout) {
            const cachedData = this.cache.get(cacheKey);
            this.emit('dataFetchFromCache', cachedData);
            return cachedData;
        }

        try {
            this.emit('dataFetchStart');
            
            const url = `https://opensheet.vercel.app/${CONFIG.SHEET_ID}/${CONFIG.SHEET_NAME}`;
            
            // 添加請求超時
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': forceRefresh ? 'no-cache' : 'default'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 數據驗證
            this.validateData(data);
            
            // 數據處理和清理
            const processedData = this.processRawData(data);
            
            // 更新快取
            this.cache.set(cacheKey, processedData);
            this.lastFetchTime = now;
            
            // 保存到本地儲存作為備份
            Helpers.storage.set(CONFIG.STORAGE_KEYS.CACHE, {
                data: processedData,
                timestamp: now
            }, this.cacheTimeout);
            
            this.emit('dataFetchSuccess', processedData);
            return processedData;
            
        } catch (error) {
            console.error('數據獲取失敗:', error);
            
            // 嘗試從本地儲存獲取備份數據
            const backupData = Helpers.storage.get(CONFIG.STORAGE_KEYS.CACHE);
            if (backupData && backupData.data) {
                console.warn('使用本地備份數據');
                this.emit('dataFetchWarning', '無法獲取最新數據，使用備份數據');
                return backupData.data;
            }
            
            this.emit('dataFetchError', error);
            throw new Error(CONFIG.ERROR_MESSAGES.DATA_FETCH_ERROR);
        }
    }

    /**
     * 驗證從 API 獲取的數據
     * @param {*} data - 原始數據
     * @throws {Error} 如果數據無效
     */
    validateData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected array');
        }

        if (data.length === 0) {
            console.warn('接收到空數據陣列');
            return;
        }

        // 檢查數據結構
        const firstRow = data[0];
        const requiredFields = ['timestamp'];
        
        for (const field of requiredFields) {
            if (!(field in firstRow)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }

    /**
     * 處理原始數據
     * @param {Array} rawData - 原始數據
     * @returns {Array} 處理後的數據
     */
    processRawData(rawData) {
        return rawData
            .map(row => {
                // 數據清理和轉換
                const processedRow = {
                    ...row,
                    timestamp: new Date(row.timestamp).toISOString(),
                    officeA: this.parseNumericValue(row.officeA),
                    officeB: this.parseNumericValue(row.officeB),
                    officeC: this.parseNumericValue(row.officeC)
                };

                // 添加狀態資訊
                processedRow.statusA = Helpers.getCO2Status(processedRow.officeA);
                processedRow.statusB = Helpers.getCO2Status(processedRow.officeB);
                processedRow.statusC = Helpers.getCO2Status(processedRow.officeC);

                return processedRow;
            })
            .filter(row => {
                // 過濾無效數據
                const hasValidTimestamp = !isNaN(new Date(row.timestamp).getTime());
                const hasValidData = Helpers.isValidCO2Value(row.officeA) || 
                                   Helpers.isValidCO2Value(row.officeB) || 
                                   Helpers.isValidCO2Value(row.officeC);
                return hasValidTimestamp && hasValidData;
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 最新的在前
    }

    /**
     * 解析數值
     * @param {*} value - 原始值
     * @returns {number} 解析後的數值
     */
    parseNumericValue(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * 提交數據到 Google Sheets
     * @param {Object} data - 要提交的數據
     * @returns {Promise<Object>} 提交結果
     */
    async submitData(data) {
        // 驗證 URL
        if (!this.validateGoogleAppsScriptUrl()) {
            throw new Error('Google Apps Script URL 配置無效');
        }

        // 檢查網路狀態
        if (!this.isNetworkAvailable()) {
            throw new Error(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
        }

        try {
            this.emit('dataSubmitStart', data);
            
            // 數據驗證
            this.validateSubmitData(data);
            
            // 準備提交數據
            const submitData = {
                ...data,
                timestamp: new Date().toISOString(),
                source: 'dashboard_manual_input'
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超時
            
            const response = await fetch(CONFIG.WRITE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(submitData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            
            // 清除快取以確保下次獲取最新數據
            this.clearCache();
            
            this.emit('dataSubmitSuccess', result);
            return result;
            
        } catch (error) {
            console.error('數據提交失敗:', error);
            this.emit('dataSubmitError', error);
            
            if (error.name === 'AbortError') {
                throw new Error('請求超時，請檢查網路連線');
            }
            
            throw new Error(CONFIG.ERROR_MESSAGES.DATA_SUBMIT_ERROR);
        }
    }

    /**
     * 驗證提交數據
     * @param {Object} data - 要驗證的數據
     * @throws {Error} 如果數據無效
     */
    validateSubmitData(data) {
        const requiredFields = ['date', 'time'];
        const optionalFields = ['officeA', 'officeB', 'officeC'];
        
        // 檢查必填欄位
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`缺少必填欄位: ${field}`);
            }
        }

        // 檢查是否至少有一個辦公室數據
        const hasValidOfficeData = optionalFields.some(field => 
            data[field] && Helpers.isValidCO2Value(parseFloat(data[field]))
        );

        if (!hasValidOfficeData) {
            throw new Error('至少需要填寫一個辦公室的 CO₂ 數值');
        }

        // 驗證 CO₂ 數值範圍
        optionalFields.forEach(field => {
            if (data[field] && !Helpers.isValidCO2Value(parseFloat(data[field]))) {
                throw new Error(`${field} 的數值必須在 300-5000 ppm 之間`);
            }
        });
    }

    /**
     * 清除快取
     */
    clearCache() {
        this.cache.clear();
        this.lastFetchTime = 0;
        Helpers.storage.remove(CONFIG.STORAGE_KEYS.CACHE);
        this.emit('cacheCleared');
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
        return allData.slice(0, Math.max(1, Math.min(limit, 100))); // 限制在 1-100 之間
    }

    /**
     * 獲取數據統計資訊
     * @param {Array} data - 數據陣列
     * @returns {Object} 統計資訊
     */
    getDataStatistics(data) {
        if (!data || data.length === 0) {
            return {
                totalRecords: 0,
                dateRange: null,
                averages: { officeA: 0, officeB: 0, officeC: 0 },
                maxValues: { officeA: 0, officeB: 0, officeC: 0 },
                minValues: { officeA: 0, officeB: 0, officeC: 0 }
            };
        }

        const offices = ['officeA', 'officeB', 'officeC'];
        const stats = {
            totalRecords: data.length,
            dateRange: {
                start: data[data.length - 1].timestamp,
                end: data[0].timestamp
            },
            averages: {},
            maxValues: {},
            minValues: {}
        };

        offices.forEach(office => {
            const values = data
                .map(row => row[office])
                .filter(value => Helpers.isValidCO2Value(value));

            if (values.length > 0) {
                stats.averages[office] = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
                stats.maxValues[office] = Math.max(...values);
                stats.minValues[office] = Math.min(...values);
            } else {
                stats.averages[office] = 0;
                stats.maxValues[office] = 0;
                stats.minValues[office] = 0;
            }
        });

        return stats;
    }

    /**
     * 搜尋數據
     * @param {Array} data - 數據陣列
     * @param {Object} criteria - 搜尋條件
     * @returns {Array} 符合條件的數據
     */
    searchData(data, criteria) {
        return data.filter(row => {
            let matches = true;

            if (criteria.dateFrom) {
                matches = matches && new Date(row.timestamp) >= new Date(criteria.dateFrom);
            }

            if (criteria.dateTo) {
                matches = matches && new Date(row.timestamp) <= new Date(criteria.dateTo);
            }

            if (criteria.minCO2) {
                const maxOfficeValue = Math.max(row.officeA || 0, row.officeB || 0, row.officeC || 0);
                matches = matches && maxOfficeValue >= criteria.minCO2;
            }

            if (criteria.maxCO2) {
                const maxOfficeValue = Math.max(row.officeA || 0, row.officeB || 0, row.officeC || 0);
                matches = matches && maxOfficeValue <= criteria.maxCO2;
            }

            return matches;
        });
    }
}
