/**
 * 比較管理器
 * 負責比較模式的數據載入、處理和顯示
 */

import { CONFIG } from '../config/constants.js';
import { HELPERS } from '../utils/helpers.js';

export class CompareManager {
    constructor(options = {}) {
        this.dataService = options.dataService;
        this.chartManager = options.chartManager;
        this.isInitialized = false;
        this.todayData = null;
        this.compareData = null;
        this.compareDate = null;
        this.elements = {};
    }

    /**
     * 初始化比較管理器
     */
    async init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.createCompareDisplay();
            this.isInitialized = true;
            
            console.log('✅ 比較管理器初始化完成');
            
        } catch (error) {
            console.error('❌ 比較管理器初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 快取 DOM 元素
     */
    cacheElements() {
        this.elements = {
            compareDatePicker: document.getElementById('compare-date-picker'),
            compareModeBtn: document.getElementById('compare-mode-btn'),
            resetCompareBtn: document.getElementById('reset-compare-btn'),
            compareDisplay: document.getElementById('compare-display'),
            compareStats: document.getElementById('compare-stats')
        };
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 比較日期選擇器
        if (this.elements.compareDatePicker) {
            this.elements.compareDatePicker.addEventListener('change', (e) => {
                this.loadCompareData(e.target.value);
            });
        }

        // 重置比較按鈕
        if (this.elements.resetCompareBtn) {
            this.elements.resetCompareBtn.addEventListener('click', () => {
                this.resetCompare();
            });
        }
    }

    /**
     * 建立比較顯示容器
     */
    createCompareDisplay() {
        if (this.elements.compareDisplay) return;

        const container = document.createElement('div');
        container.id = 'compare-display';
        container.className = 'compare-display';
        container.style.display = 'none';
        container.innerHTML = `
            <h3>數據比較</h3>
            <div class="compare-content">
                <div class="compare-section today-section">
                    <h4>今日數據</h4>
                    <div class="compare-rooms" id="today-rooms"></div>
                </div>
                <div class="compare-section compare-section-data">
                    <h4>比較日期數據</h4>
                    <div class="compare-date-info" id="compare-date-info"></div>
                    <div class="compare-rooms" id="compare-rooms"></div>
                </div>
            </div>
            <div class="compare-summary" id="compare-summary"></div>
        `;

        // 添加到適當位置
        const targetElement = document.querySelector('.dashboard-content') || 
                             document.querySelector('.main-content') || 
                             document.body;
        
        targetElement.appendChild(container);
        this.elements.compareDisplay = container;
    }

    /**
     * 載入比較數據
     */
    async loadCompareData(dateString) {
        try {
            if (!dateString) {
                console.warn('⚠️ 沒有提供比較日期');
                return;
            }

            console.log(`📊 載入比較數據: ${dateString}`);
            
            // 更新比較日期
            this.compareDate = dateString;
            
            // 載入今日數據
            await this.loadTodayData();
            
            // 載入比較日期數據
            const allData = await this.dataService.getAllData();
            this.compareData = this.dataService.getDataForDate(allData, dateString);
            
            // 更新顯示
            this.updateDisplay();
            
            // 更新圖表
            if (this.chartManager) {
                this.chartManager.updateCompareChart(this.todayData, this.compareData);
            }
            
            // 觸發比較數據載入事件
            this.emit('compare:loaded', {
                today: this.todayData,
                compare: this.compareData,
                compareDate: dateString
            });
            
            console.log(`✅ 比較數據載入完成`);
            
        } catch (error) {
            console.error('❌ 載入比較數據失敗:', error);
            this.showError('載入比較數據失敗');
        }
    }

    /**
     * 載入今日數據
     */
    async loadTodayData() {
        const allData = await this.dataService.getAllData();
        this.todayData = this.dataService.getTodayData(allData);
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        if (!this.elements.compareDisplay) return;

        // 顯示比較容器
        this.elements.compareDisplay.style.display = 'block';
        
        // 更新今日房間數據
        this.updateTodayRooms();
        
        // 更新比較房間數據
        this.updateCompareRooms();
        
        // 更新比較摘要
        this.updateCompareSummary();
        
        // 更新比較日期資訊
        this.updateCompareDateInfo();
    }

    /**
     * 更新今日房間數據
     */
    updateTodayRooms() {
        const container = document.getElementById('today-rooms');
        if (!container) return;

        if (!this.todayData || this.todayData.length === 0) {
            container.innerHTML = '<div class="no-data">今日暫無數據</div>';
            return;
        }

        const latestData = this.dataService.getLatestDataForEachRoom(this.todayData);
        container.innerHTML = this.generateRoomsHTML(latestData, 'today');
    }

    /**
     * 更新比較房間數據
     */
    updateCompareRooms() {
        const container = document.getElementById('compare-rooms');
        if (!container) return;

        if (!this.compareData || this.compareData.length === 0) {
            container.innerHTML = '<div class="no-data">比較日期暫無數據</div>';
            return;
        }

        const latestData = this.dataService.getLatestDataForEachRoom(this.compareData);
        container.innerHTML = this.generateRoomsHTML(latestData, 'compare');
    }

    /**
     * 生成房間 HTML
     */
    generateRoomsHTML(roomData, type) {
        if (!roomData || typeof roomData !== 'object') {
            return '<div class="no-data">無可用數據</div>';
        }

        const rooms = Object.entries(roomData).map(([roomKey, data]) => {
            const displayName = CONFIG.ROOM_NAMES[roomKey] || roomKey;
            const level = this.getCO2Level(data.co2);
            
            return `
                <div class="room-card ${type}-room ${level.class}">
                    <div class="room-header">
                        <h5 class="room-name">${displayName}</h5>
                        <div class="room-status ${level.class}">${level.text}</div>
                    </div>
                    <div class="room-data">
                        <div class="co2-value">${data.co2} <span class="unit">ppm</span></div>
                        <div class="timestamp">${HELPERS.formatTime(data.timestamp)}</div>
                    </div>
                </div>
            `;
        }).join('');

        return rooms;
    }

    /**
     * 更新比較摘要
     */
    updateCompareSummary() {
        const container = document.getElementById('compare-summary');
        if (!container) return;

        if (!this.todayData || !this.compareData || 
            this.todayData.length === 0 || this.compareData.length === 0) {
            container.innerHTML = '<div class="no-data">無法生成比較摘要</div>';
            return;
        }

        const todayStats = this.calculateStats(this.todayData);
        const compareStats = this.calculateStats(this.compareData);
        
        if (!todayStats || !compareStats) {
            container.innerHTML = '<div class="no-data">統計數據不足</div>';
            return;
        }

        const comparison = this.generateComparison(todayStats, compareStats);
        
        container.innerHTML = `
            <h4>比較摘要</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">平均 CO2 變化</div>
                    <div class="summary-value ${comparison.avgChange.class}">
                        ${comparison.avgChange.text}
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">最高 CO2 變化</div>
                    <div class="summary-value ${comparison.maxChange.class}">
                        ${comparison.maxChange.text}
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">整體趨勢</div>
                    <div class="summary-value ${comparison.trend.class}">
                        ${comparison.trend.text}
                    </div>
                </div>
            </div>
            <div class="summary-details">
                <div class="detail-section">
                    <h5>今日 (${HELPERS.formatDate(new Date())})</h5>
                    <div class="detail-stats">
                        <span>平均: ${todayStats.avg} ppm</span>
                        <span>最高: ${todayStats.max} ppm</span>
                        <span>記錄: ${todayStats.count} 筆</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h5>比較日期 (${this.compareDate})</h5>
                    <div class="detail-stats">
                        <span>平均: ${compareStats.avg} ppm</span>
                        <span>最高: ${compareStats.max} ppm</span>
                        <span>記錄: ${compareStats.count} 筆</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 更新比較日期資訊
     */
    updateCompareDateInfo() {
        const container = document.getElementById('compare-date-info');
        if (!container) return;

        if (!this.compareDate) {
            container.innerHTML = '<div class="date-info">請選擇比較日期</div>';
            return;
        }

        const dateObj = new Date(this.compareDate);
        const dayOfWeek = dateObj.toLocaleDateString('zh-TW', { weekday: 'long' });
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        
        container.innerHTML = `
            <div class="date-info">
                <div class="date-text">${this.compareDate}</div>
                <div class="date-meta">
                    <span class="day-of-week ${isWeekend ? 'weekend' : 'weekday'}">${dayOfWeek}</span>
                    <span class="date-type">${isWeekend ? '週末' : '工作日'}</span>
                </div>
            </div>
        `;
    }

    /**
     * 計算統計資訊
     */
    calculateStats(data) {
        if (!data || data.length === 0) return null;

        const co2Values = data.map(item => item.co2).filter(val => val != null);
        if (co2Values.length === 0) return null;

        return {
            avg: Math.round(co2Values.reduce((sum, val) => sum + val, 0) / co2Values.length),
            max: Math.max(...co2Values),
            min: Math.min(...co2Values),
            count: data.length
        };
    }

    /**
     * 生成比較結果
     */
    generateComparison(todayStats, compareStats) {
        const avgDiff = todayStats.avg - compareStats.avg;
        const maxDiff = todayStats.max - compareStats.max;
        
        return {
            avgChange: {
                text: avgDiff > 0 ? `+${avgDiff} ppm` : `${avgDiff} ppm`,
                class: avgDiff > 0 ? 'increase' : avgDiff < 0 ? 'decrease' : 'neutral'
            },
            maxChange: {
                text: maxDiff > 0 ? `+${maxDiff} ppm` : `${maxDiff} ppm`,
                class: maxDiff > 0 ? 'increase' : maxDiff < 0 ? 'decrease' : 'neutral'
            },
            trend: {
                text: avgDiff > 50 ? '明顯上升' : avgDiff > 10 ? '略有上升' : 
                      avgDiff < -50 ? '明顯下降' : avgDiff < -10 ? '略有下降' : '基本持平',
                class: avgDiff > 50 ? 'significant-increase' : avgDiff > 10 ? 'increase' :
                       avgDiff < -50 ? 'significant-decrease' : avgDiff < -10 ? 'decrease' : 'neutral'
            }
        };
    }

    /**
     * 獲取 CO2 濃度等級
     */
    getCO2Level(value) {
        if (value < 600) {
            return { class: 'excellent', text: '優良' };
        } else if (value < 800) {
            return { class: 'good', text: '良好' };
        } else if (value < 1000) {
            return { class: 'fair', text: '普通' };
        } else {
            return { class: 'poor', text: '不佳' };
        }
    }

    /**
     * 重置比較
     */
    resetCompare() {
        this.compareData = null;
        this.compareDate = null;
        
        // 清空比較日期選擇器
        if (this.elements.compareDatePicker) {
            this.elements.compareDatePicker.value = '';
        }
        
        // 隱藏比較顯示
        if (this.elements.compareDisplay) {
            this.elements.compareDisplay.style.display = 'none';
        }
        
        // 重置圖表
        if (this.chartManager && this.todayData) {
            this.chartManager.updateChart(this.todayData);
        }
        
        console.log('🔄 比較模式已重置');
    }

    /**
     * 隱藏比較顯示
     */
    hideDisplay() {
        if (this.elements.compareDisplay) {
            this.elements.compareDisplay.style.display = 'none';
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        this.emit('error', message);
    }

    /**
     * 獲取比較數據
     */
    getCompareData() {
        return {
            today: this.todayData,
            compare: this.compareData,
            compareDate: this.compareDate
        };
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
                    console.error(`❌ 比較管理器事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        this.resetCompare();
        this.events = {};
        
        if (this.elements.compareDisplay && this.elements.compareDisplay.parentElement) {
            this.elements.compareDisplay.remove();
        }
    }
}
