/**
 * 歷史數據管理器
 * 負責歷史數據的載入、處理和顯示
 */

import { CONFIG } from '../config/constants.js';
import { HELPERS } from '../utils/helpers.js';

export class HistoryManager {
    constructor(options = {}) {
        this.dataService = options.dataService;
        this.isInitialized = false;
        this.currentDate = null;
        this.historyData = null;
        this.availableDates = [];
        this.elements = {};
    }

    /**
     * 初始化歷史管理器
     */
    async init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ 歷史管理器初始化完成');
            
        } catch (error) {
            console.error('❌ 歷史管理器初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 快取 DOM 元素
     */
    cacheElements() {
        this.elements = {
            datePicker: document.getElementById('date-picker'),
            historyModeBtn: document.getElementById('history-mode-btn'),
            historyStats: document.getElementById('history-stats'),
            dateNavigation: document.getElementById('date-navigation')
        };
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 日期選擇器變更
        if (this.elements.datePicker) {
            this.elements.datePicker.addEventListener('change', (e) => {
                this.loadHistoryData(e.target.value);
            });
        }

        // 建立導航按鈕
        this.createNavigationButtons();
    }

    /**
     * 建立日期導航按鈕
     */
    createNavigationButtons() {
        if (!this.elements.datePicker) return;

        const container = this.elements.datePicker.parentElement;
        if (!container) return;

        // 建立導航容器
        const navContainer = document.createElement('div');
        navContainer.className = 'date-navigation';
        navContainer.innerHTML = `
            <button class="nav-btn" id="prev-date-btn" title="前一天">
                <span>◀</span>
            </button>
            <button class="nav-btn" id="next-date-btn" title="後一天">
                <span>▶</span>
            </button>
            <button class="nav-btn" id="today-date-btn" title="今天">
                <span>今天</span>
            </button>
        `;

        container.appendChild(navContainer);

        // 添加事件監聽器
        document.getElementById('prev-date-btn').addEventListener('click', () => {
            this.navigateDate(-1);
        });

        document.getElementById('next-date-btn').addEventListener('click', () => {
            this.navigateDate(1);
        });

        document.getElementById('today-date-btn').addEventListener('click', () => {
            this.goToToday();
        });
    }

    /**
     * 載入歷史數據
     */
    async loadHistoryData(dateString) {
        try {
            if (!dateString) {
                console.warn('⚠️ 沒有提供日期');
                return;
            }

            console.log(`📅 載入歷史數據: ${dateString}`);
            
            // 更新目前日期
            this.currentDate = dateString;
            
            // 從數據服務獲取歷史數據
            const allData = await this.dataService.getAllData();
            this.historyData = this.dataService.getDataForDate(allData, dateString);
            
            // 更新 UI
            this.updateHistoryDisplay();
            
            // 更新統計資訊
            this.updateHistoryStats();
            
            // 觸發歷史數據載入事件
            this.emit('history:loaded', {
                date: dateString,
                data: this.historyData
            });
            
            console.log(`✅ 歷史數據載入完成: ${this.historyData.length} 筆記錄`);
            
        } catch (error) {
            console.error('❌ 載入歷史數據失敗:', error);
            this.showError('載入歷史數據失敗');
        }
    }

    /**
     * 更新歷史顯示
     */
    updateHistoryDisplay() {
        if (!this.historyData) return;

        // 如果沒有數據，顯示提示
        if (this.historyData.length === 0) {
            this.showNoDataMessage();
            return;
        }

        // 更新日期選擇器
        this.updateDatePicker();
        
        // 更新導航按鈕狀態
        this.updateNavigationButtons();
    }

    /**
     * 更新統計資訊
     */
    updateHistoryStats() {
        if (!this.historyData || this.historyData.length === 0) {
            this.hideStats();
            return;
        }

        const stats = this.calculateStats(this.historyData);
        this.showStats(stats);
    }

    /**
     * 計算統計資訊
     */
    calculateStats(data) {
        if (!data || data.length === 0) {
            return null;
        }

        const co2Values = data.map(item => item.co2).filter(val => val != null);
        
        if (co2Values.length === 0) {
            return null;
        }

        const stats = {
            totalPoints: data.length,
            avgCO2: Math.round(co2Values.reduce((sum, val) => sum + val, 0) / co2Values.length),
            maxCO2: Math.max(...co2Values),
            minCO2: Math.min(...co2Values),
            date: this.currentDate,
            timeRange: this.getTimeRange(data),
            roomCount: [...new Set(data.map(item => item.room))].length
        };

        return stats;
    }

    /**
     * 獲取時間範圍
     */
    getTimeRange(data) {
        if (!data || data.length === 0) return null;

        const times = data.map(item => new Date(item.timestamp)).sort((a, b) => a - b);
        const start = times[0];
        const end = times[times.length - 1];

        return {
            start: HELPERS.formatTime(start),
            end: HELPERS.formatTime(end),
            duration: HELPERS.formatDuration(end - start)
        };
    }

    /**
     * 顯示統計資訊
     */
    showStats(stats) {
        if (!stats) return;

        // 建立統計容器
        if (!this.elements.historyStats) {
            this.elements.historyStats = this.createStatsContainer();
        }

        const container = this.elements.historyStats;
        container.innerHTML = `
            <h3>歷史數據統計 (${stats.date})</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">記錄數量</div>
                    <div class="stat-value">${stats.totalPoints}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">房間數量</div>
                    <div class="stat-value">${stats.roomCount}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均 CO2</div>
                    <div class="stat-value">${stats.avgCO2} ppm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最高 CO2</div>
                    <div class="stat-value">${stats.maxCO2} ppm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最低 CO2</div>
                    <div class="stat-value">${stats.minCO2} ppm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">時間範圍</div>
                    <div class="stat-value">${stats.timeRange ? `${stats.timeRange.start} - ${stats.timeRange.end}` : 'N/A'}</div>
                </div>
            </div>
        `;

        container.style.display = 'block';
    }

    /**
     * 建立統計容器
     */
    createStatsContainer() {
        const container = document.createElement('div');
        container.id = 'history-stats';
        container.className = 'history-stats';
        container.style.display = 'none';

        // 添加到適當位置
        const targetElement = document.querySelector('.mode-controls') || 
                             document.querySelector('.control-panel') || 
                             document.body;
        
        targetElement.appendChild(container);
        
        return container;
    }

    /**
     * 隱藏統計資訊
     */
    hideStats() {
        if (this.elements.historyStats) {
            this.elements.historyStats.style.display = 'none';
        }
    }

    /**
     * 顯示無數據訊息
     */
    showNoDataMessage() {
        const message = document.createElement('div');
        message.className = 'no-data-message';
        message.innerHTML = `
            <div class="no-data-icon">📅</div>
            <div class="no-data-text">所選日期沒有可用的數據</div>
            <div class="no-data-subtitle">請選擇其他日期或檢查數據來源</div>
        `;

        // 清除現有內容並顯示訊息
        const statsContainer = this.elements.historyStats;
        if (statsContainer) {
            statsContainer.innerHTML = '';
            statsContainer.appendChild(message);
            statsContainer.style.display = 'block';
        }
    }

    /**
     * 日期導航
     */
    navigateDate(direction) {
        if (!this.currentDate) return;

        const currentDateObj = new Date(this.currentDate);
        const newDateObj = new Date(currentDateObj);
        newDateObj.setDate(currentDateObj.getDate() + direction);

        const newDateString = HELPERS.formatDate(newDateObj);
        
        // 更新日期選擇器
        if (this.elements.datePicker) {
            this.elements.datePicker.value = newDateString;
        }

        // 載入新日期的數據
        this.loadHistoryData(newDateString);
    }

    /**
     * 回到今天
     */
    goToToday() {
        const today = HELPERS.formatDate(new Date());
        
        if (this.elements.datePicker) {
            this.elements.datePicker.value = today;
        }

        this.loadHistoryData(today);
    }

    /**
     * 更新日期選擇器
     */
    updateDatePicker() {
        if (!this.elements.datePicker) return;

        // 設置日期範圍
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() - 30); // 30天前

        this.elements.datePicker.min = HELPERS.formatDate(minDate);
        this.elements.datePicker.max = HELPERS.formatDate(today);
    }

    /**
     * 更新導航按鈕狀態
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-date-btn');
        const nextBtn = document.getElementById('next-date-btn');
        const todayBtn = document.getElementById('today-date-btn');

        if (!this.currentDate) return;

        const currentDateObj = new Date(this.currentDate);
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() - 30);

        // 更新前一天按鈕
        if (prevBtn) {
            prevBtn.disabled = currentDateObj <= minDate;
        }

        // 更新後一天按鈕
        if (nextBtn) {
            nextBtn.disabled = currentDateObj >= today;
        }

        // 更新今天按鈕
        if (todayBtn) {
            const isToday = HELPERS.formatDate(currentDateObj) === HELPERS.formatDate(today);
            todayBtn.disabled = isToday;
        }
    }

    /**
     * 獲取可用日期列表
     */
    async getAvailableDates() {
        try {
            const allData = await this.dataService.getAllData();
            const dates = [...new Set(allData.map(item => {
                const date = new Date(item.timestamp);
                return HELPERS.formatDate(date);
            }))].sort().reverse();

            this.availableDates = dates;
            return dates;
            
        } catch (error) {
            console.error('❌ 獲取可用日期失敗:', error);
            return [];
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        this.emit('error', message);
    }

    /**
     * 獲取當前歷史數據
     */
    getCurrentHistoryData() {
        return {
            date: this.currentDate,
            data: this.historyData
        };
    }

    /**
     * 重置歷史模式
     */
    reset() {
        this.currentDate = null;
        this.historyData = null;
        this.hideStats();
        
        if (this.elements.datePicker) {
            this.elements.datePicker.value = '';
        }
    }

    /**
     * 事件系統
     */
    on(event, callback) {
        if (!this.events) {
            this.events = {};
        }
        
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        this.events[event].push(callback);
    }

    emit(event, ...args) {
        if (this.events && this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`❌ 歷史管理器事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        this.reset();
        this.events = {};
        
        if (this.elements.historyStats && this.elements.historyStats.parentElement) {
            this.elements.historyStats.remove();
        }
    }
}
