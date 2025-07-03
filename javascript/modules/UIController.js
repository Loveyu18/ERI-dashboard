/**
 * UI 控制器模組
 * 負責用戶界面的更新和交互控制
 */

import { CONFIG } from '../config/constants.js';
import { HELPERS } from '../utils/helpers.js';

export class UIController {
    constructor(options = {}) {
        this.config = { ...CONFIG.UI, ...options.config };
        this.elements = {};
        this.isInitialized = false;
    }

    /**
     * 初始化 UI 控制器
     */
    async init() {
        try {
            // 快取重要的 DOM 元素
            this.cacheElements();
            
            // 設置事件監聽器
            this.setupEventListeners();
            
            // 初始化載入指示器
            this.initLoadingIndicator();
            
            // 初始化錯誤處理
            this.initErrorHandling();
            
            this.isInitialized = true;
            console.log('✅ UI 控制器初始化完成');
            
        } catch (error) {
            console.error('❌ UI 控制器初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 快取 DOM 元素
     */
    cacheElements() {
        const elementIds = [
            'loading-indicator',
            'error-container',
            'room-status',
            'advice-section',
            'mode-controls',
            'today-mode-btn',
            'history-mode-btn',
            'compare-mode-btn',
            'input-mode-btn',
            'date-picker',
            'compare-date-picker',
            'back-to-today-btn',
            'reset-compare-btn'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });

        // 快取房間狀態元素
        this.elements.rooms = {};
        Object.keys(CONFIG.ROOM_NAMES).forEach(room => {
            this.elements.rooms[room] = document.getElementById(room);
        });
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 模式切換按鈕
        if (this.elements['today-mode-btn']) {
            this.elements['today-mode-btn'].addEventListener('click', () => {
                this.emit('mode:change', 'today');
            });
        }

        if (this.elements['history-mode-btn']) {
            this.elements['history-mode-btn'].addEventListener('click', () => {
                this.emit('mode:change', 'history');
            });
        }

        if (this.elements['compare-mode-btn']) {
            this.elements['compare-mode-btn'].addEventListener('click', () => {
                this.emit('mode:change', 'compare');
            });
        }

        if (this.elements['input-mode-btn']) {
            this.elements['input-mode-btn'].addEventListener('click', () => {
                this.emit('mode:change', 'input');
            });
        }

        // 日期選擇器
        if (this.elements['date-picker']) {
            this.elements['date-picker'].addEventListener('change', (e) => {
                this.emit('date:change', e.target.value);
            });
        }

        if (this.elements['compare-date-picker']) {
            this.elements['compare-date-picker'].addEventListener('change', (e) => {
                this.emit('compare-date:change', e.target.value);
            });
        }

        // 控制按鈕
        if (this.elements['back-to-today-btn']) {
            this.elements['back-to-today-btn'].addEventListener('click', () => {
                this.emit('mode:change', 'today');
            });
        }

        if (this.elements['reset-compare-btn']) {
            this.elements['reset-compare-btn'].addEventListener('click', () => {
                this.emit('compare:reset');
            });
        }
    }

    /**
     * 初始化載入指示器
     */
    initLoadingIndicator() {
        if (!this.elements['loading-indicator']) {
            // 如果沒有載入指示器，建立一個
            this.elements['loading-indicator'] = this.createLoadingIndicator();
        }
    }

    /**
     * 建立載入指示器
     */
    createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.className = 'loading-indicator';
        indicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">載入中...</div>
        `;
        indicator.style.display = 'none';
        
        // 添加到頁面
        document.body.appendChild(indicator);
        
        return indicator;
    }

    /**
     * 初始化錯誤處理
     */
    initErrorHandling() {
        if (!this.elements['error-container']) {
            // 如果沒有錯誤容器，建立一個
            this.elements['error-container'] = this.createErrorContainer();
        }
    }

    /**
     * 建立錯誤容器
     */
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        container.className = 'error-container';
        container.style.display = 'none';
        
        // 添加到頁面
        document.body.appendChild(container);
        
        return container;
    }

    /**
     * 顯示載入指示器
     */
    showLoading(message = '載入中...') {
        if (this.elements['loading-indicator']) {
            const textElement = this.elements['loading-indicator'].querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = message;
            }
            this.elements['loading-indicator'].style.display = 'flex';
        }
    }

    /**
     * 隱藏載入指示器
     */
    hideLoading() {
        if (this.elements['loading-indicator']) {
            this.elements['loading-indicator'].style.display = 'none';
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message, duration = 5000) {
        if (!this.elements['error-container']) return;

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        this.elements['error-container'].appendChild(errorElement);
        this.elements['error-container'].style.display = 'block';

        // 自動隱藏
        if (duration > 0) {
            setTimeout(() => {
                if (errorElement.parentElement) {
                    errorElement.remove();
                    if (this.elements['error-container'].children.length === 0) {
                        this.elements['error-container'].style.display = 'none';
                    }
                }
            }, duration);
        }
    }

    /**
     * 更新房間狀態
     */
    updateRoomStatus(roomData) {
        if (!roomData || typeof roomData !== 'object') {
            console.warn('⚠️ 無效的房間數據');
            return;
        }

        Object.entries(roomData).forEach(([roomKey, data]) => {
            if (this.elements.rooms[roomKey]) {
                this.updateSingleRoom(roomKey, data);
            }
        });
    }

    /**
     * 更新單個房間
     */
    updateSingleRoom(roomKey, data) {
        const roomElement = this.elements.rooms[roomKey];
        if (!roomElement) return;

        const { co2, timestamp } = data;
        const displayName = CONFIG.ROOM_NAMES[roomKey] || roomKey;
        
        // 更新 CO2 數值
        const valueElement = roomElement.querySelector('.co2-value');
        if (valueElement) {
            valueElement.textContent = co2;
        }

        // 更新時間戳
        const timestampElement = roomElement.querySelector('.timestamp');
        if (timestampElement) {
            timestampElement.textContent = HELPERS.formatTime(timestamp);
        }

        // 更新狀態級別
        const level = this.getCO2Level(co2);
        roomElement.className = `room-card ${level.class}`;
        
        // 更新狀態文字
        const statusElement = roomElement.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = level.text;
        }

        // 更新進度條
        const progressElement = roomElement.querySelector('.progress-fill');
        if (progressElement) {
            const percentage = Math.min((co2 / 1500) * 100, 100);
            progressElement.style.width = `${percentage}%`;
        }
    }

    /**
     * 更新建議區域
     */
    updateAdvice(roomData) {
        if (!this.elements['advice-section']) return;

        const maxValue = Math.max(...Object.values(roomData).map(d => d.co2));
        const avgValue = Object.values(roomData).reduce((sum, d) => sum + d.co2, 0) / Object.values(roomData).length;
        
        const advice = this.generateAdvice(maxValue, avgValue);
        
        this.elements['advice-section'].innerHTML = `
            <h3>環境建議</h3>
            <div class="advice-content">
                <div class="advice-item">
                    <span class="advice-label">最高濃度:</span>
                    <span class="advice-value ${this.getCO2Level(maxValue).class}">${maxValue} ppm</span>
                </div>
                <div class="advice-item">
                    <span class="advice-label">平均濃度:</span>
                    <span class="advice-value ${this.getCO2Level(avgValue).class}">${Math.round(avgValue)} ppm</span>
                </div>
                <div class="advice-text">${advice}</div>
            </div>
        `;
    }

    /**
     * 生成建議文字
     */
    generateAdvice(maxValue, avgValue) {
        if (maxValue > 1000) {
            return '⚠️ 部分區域 CO2 濃度過高，建議立即增加通風或減少人員密度';
        } else if (maxValue > 800) {
            return '⚡ 部分區域 CO2 濃度偏高，建議適度增加通風';
        } else if (avgValue > 600) {
            return '✅ 整體空氣品質良好，建議維持現有通風狀態';
        } else {
            return '🌟 空氣品質優良，環境舒適';
        }
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
     * 切換模式 UI 狀態
     */
    switchMode(mode) {
        // 更新按鈕狀態
        const modeButtons = [
            'today-mode-btn',
            'history-mode-btn',
            'compare-mode-btn',
            'input-mode-btn'
        ];

        modeButtons.forEach(btnId => {
            const btn = this.elements[btnId];
            if (btn) {
                btn.classList.remove('active');
                if (btnId === `${mode}-mode-btn`) {
                    btn.classList.add('active');
                }
            }
        });

        // 顯示/隱藏相關控制項
        this.toggleControls(mode);
    }

    /**
     * 切換控制項顯示
     */
    toggleControls(mode) {
        const controlElements = {
            'date-picker': mode === 'history',
            'compare-date-picker': mode === 'compare',
            'back-to-today-btn': mode !== 'today',
            'reset-compare-btn': mode === 'compare'
        };

        Object.entries(controlElements).forEach(([elementId, shouldShow]) => {
            const element = this.elements[elementId];
            if (element) {
                element.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    /**
     * 設置日期範圍
     */
    setDateRange(startDate, endDate) {
        if (this.elements['date-picker']) {
            this.elements['date-picker'].min = startDate;
            this.elements['date-picker'].max = endDate;
        }

        if (this.elements['compare-date-picker']) {
            this.elements['compare-date-picker'].min = startDate;
            this.elements['compare-date-picker'].max = endDate;
        }
    }

    /**
     * 顯示統計資訊
     */
    showStatistics(stats) {
        // 如果沒有統計容器，建立一個
        if (!this.elements['statistics-container']) {
            this.elements['statistics-container'] = this.createStatisticsContainer();
        }

        const container = this.elements['statistics-container'];
        container.innerHTML = `
            <h3>統計資訊</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">數據點數</div>
                    <div class="stat-value">${stats.totalPoints}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">平均濃度</div>
                    <div class="stat-value">${stats.avgCO2} ppm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最高濃度</div>
                    <div class="stat-value">${stats.maxCO2} ppm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">最低濃度</div>
                    <div class="stat-value">${stats.minCO2} ppm</div>
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }

    /**
     * 建立統計容器
     */
    createStatisticsContainer() {
        const container = document.createElement('div');
        container.id = 'statistics-container';
        container.className = 'statistics-container';
        container.style.display = 'none';
        
        // 添加到適當位置
        const adviceSection = this.elements['advice-section'];
        if (adviceSection && adviceSection.parentElement) {
            adviceSection.parentElement.insertBefore(container, adviceSection.nextSibling);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }

    /**
     * 簡單的事件系統
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
                    console.error(`❌ UI 事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        // 移除事件監聽器
        this.events = {};
        
        // 清理建立的元素
        if (this.elements['loading-indicator'] && this.elements['loading-indicator'].parentElement) {
            this.elements['loading-indicator'].remove();
        }
        
        if (this.elements['error-container'] && this.elements['error-container'].parentElement) {
            this.elements['error-container'].remove();
        }
        
        this.isInitialized = false;
    }
}
