/**
 * 自動更新管理器
 * 負責定時更新數據和倒數計時器
 */

import { CONFIG } from '../config/constants.js';

export class AutoRefreshManager {
    constructor(options = {}) {
        this.interval = options.interval || CONFIG.AUTO_REFRESH.INTERVAL;
        this.onRefresh = options.onRefresh || (() => {});
        this.refreshTimer = null;
        this.countdownTimer = null;
        this.countdown = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.countdownElement = null;
    }

    /**
     * 初始化自動更新管理器
     */
    init() {
        // 尋找倒數計時器元素
        this.countdownElement = document.getElementById('countdown') || 
                               document.querySelector('.countdown');
        
        if (!this.countdownElement) {
            this.createCountdownElement();
        }

        console.log('✅ 自動更新管理器初始化完成');
    }

    /**
     * 建立倒數計時器元素
     */
    createCountdownElement() {
        this.countdownElement = document.createElement('div');
        this.countdownElement.id = 'countdown';
        this.countdownElement.className = 'countdown';
        this.countdownElement.innerHTML = `
            <span class="countdown-label">下次更新:</span>
            <span class="countdown-value">--</span>
            <span class="countdown-unit">秒</span>
        `;
        
        // 添加到頁面適當位置
        const targetContainer = document.querySelector('.status-bar') ||
                               document.querySelector('.control-panel') ||
                               document.body;
        
        targetContainer.appendChild(this.countdownElement);
    }

    /**
     * 開始自動更新
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ 自動更新已經在運行');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.countdown = Math.ceil(this.interval / 1000);
        
        // 立即執行一次更新
        this.executeRefresh();
        
        // 開始倒數計時
        this.startCountdown();
        
        console.log('▶️ 自動更新已啟動');
    }

    /**
     * 停止自動更新
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        
        this.updateCountdownDisplay('--');
        console.log('⏹️ 自動更新已停止');
    }

    /**
     * 暫停自動更新
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        
        this.updateCountdownDisplay('暫停');
        console.log('⏸️ 自動更新已暫停');
    }

    /**
     * 恢復自動更新
     */
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.startCountdown();
        
        console.log('▶️ 自動更新已恢復');
    }

    /**
     * 重新啟動自動更新
     */
    restart() {
        this.stop();
        this.start();
    }

    /**
     * 立即更新
     */
    async refreshNow() {
        if (this.isRunning) {
            // 重置計時器
            this.restart();
        } else {
            // 手動執行更新
            await this.executeRefresh();
        }
    }

    /**
     * 執行更新
     */
    async executeRefresh() {
        try {
            console.log('🔄 執行自動更新...');
            
            // 顯示更新中狀態
            this.updateCountdownDisplay('更新中...');
            
            // 執行更新回調
            await this.onRefresh();
            
            // 排程下次更新
            if (this.isRunning && !this.isPaused) {
                this.scheduleNextRefresh();
            }
            
        } catch (error) {
            console.error('❌ 自動更新失敗:', error);
            
            // 錯誤時也要繼續排程
            if (this.isRunning && !this.isPaused) {
                this.scheduleNextRefresh();
            }
        }
    }

    /**
     * 排程下次更新
     */
    scheduleNextRefresh() {
        this.refreshTimer = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.executeRefresh();
            }
        }, this.interval);
        
        // 重置倒數計時
        this.countdown = Math.ceil(this.interval / 1000);
        this.startCountdown();
    }

    /**
     * 開始倒數計時
     */
    startCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        this.countdownTimer = setInterval(() => {
            if (this.isPaused) return;
            
            this.countdown--;
            this.updateCountdownDisplay(this.countdown);
            
            if (this.countdown <= 0) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
            }
        }, 1000);
    }

    /**
     * 更新倒數計時顯示
     */
    updateCountdownDisplay(value) {
        if (!this.countdownElement) return;
        
        const valueElement = this.countdownElement.querySelector('.countdown-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
        
        // 根據剩餘時間改變顏色
        if (typeof value === 'number') {
            this.countdownElement.className = 'countdown';
            if (value <= 3) {
                this.countdownElement.classList.add('warning');
            } else if (value <= 10) {
                this.countdownElement.classList.add('notice');
            }
        }
    }

    /**
     * 設置更新間隔
     */
    setInterval(newInterval) {
        this.interval = newInterval;
        
        if (this.isRunning) {
            this.restart();
        }
        
        console.log(`⏰ 更新間隔已設置為 ${newInterval}ms`);
    }

    /**
     * 獲取狀態
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            interval: this.interval,
            countdown: this.countdown,
            nextRefreshTime: this.countdown > 0 ? 
                new Date(Date.now() + this.countdown * 1000) : null
        };
    }

    /**
     * 設置更新回調
     */
    setOnRefresh(callback) {
        if (typeof callback === 'function') {
            this.onRefresh = callback;
        }
    }

    /**
     * 添加事件監聽器
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

    /**
     * 觸發事件
     */
    emit(event, ...args) {
        if (this.events && this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`❌ 自動更新事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        this.stop();
        
        if (this.countdownElement && this.countdownElement.parentElement) {
            this.countdownElement.remove();
        }
        
        this.events = {};
        console.log('🧹 自動更新管理器已清理');
    }
}

/**
 * 自動更新管理器的靜態工廠方法
 */
export function createAutoRefreshManager(options = {}) {
    return new AutoRefreshManager(options);
}
