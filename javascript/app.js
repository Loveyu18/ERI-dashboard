/**
 * ERI Dashboard - 主應用程式入口點
 * 負責初始化應用程式，協調各模組間的通訊
 */

// 導入模組
import { CONFIG } from './config/constants.js';
import { HELPERS } from './utils/helpers.js';
import { DataService } from './services/DataService.js';
import { ChartManager } from './modules/ChartManager.js';
import { UIController } from './modules/UIController.js';
import { HistoryManager } from './modules/HistoryManager.js';
import { CompareManager } from './modules/CompareManager.js';
import { InputManager } from './modules/InputManager.js';
import { AutoRefreshManager } from './modules/AutoRefreshManager.js';

/**
 * 主應用程式類別
 */
class ERIDashboard {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.data = {
            all: [],
            today: [],
            history: null,
            compare: null
        };
        this.state = {
            mode: 'today', // 'today', 'history', 'compare', 'input'
            selectedDate: null,
            compareDate: null,
            isAutoRefreshEnabled: true
        };
    }

    /**
     * 初始化應用程式
     */
    async init() {
        try {
            console.log('🚀 正在初始化 ERI Dashboard...');
            
            // 檢查必要的 DOM 元素
            if (!this.checkRequiredElements()) {
                throw new Error('缺少必要的 DOM 元素');
            }

            // 初始化數據服務
            this.dataService = new DataService();
            
            // 初始化各模組
            await this.initializeModules();
            
            // 設置事件監聽器
            this.setupEventListeners();
            
            // 載入初始數據
            await this.loadInitialData();
            
            // 啟動自動更新
            if (this.state.isAutoRefreshEnabled) {
                this.modules.autoRefresh.start();
            }
            
            this.isInitialized = true;
            console.log('✅ ERI Dashboard 初始化完成');
            
            // 觸發初始化完成事件
            this.emit('initialized');
            
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            this.showError('應用程式初始化失敗，請重新整理頁面');
        }
    }

    /**
     * 檢查必要的 DOM 元素
     */
    checkRequiredElements() {
        const requiredElements = [
            'co2-chart',
            'room-status',
            'advice-section',
            'loading-indicator'
        ];
        
        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                console.error(`❌ 缺少必要元素: ${elementId}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * 初始化各功能模組
     */
    async initializeModules() {
        // 圖表管理器
        this.modules.chart = new ChartManager({
            containerId: 'co2-chart',
            config: CONFIG.CHART
        });

        // UI 控制器
        this.modules.ui = new UIController({
            config: CONFIG.UI
        });

        // 歷史數據管理器
        this.modules.history = new HistoryManager({
            dataService: this.dataService
        });

        // 比較模式管理器
        this.modules.compare = new CompareManager({
            dataService: this.dataService,
            chartManager: this.modules.chart
        });

        // 輸入模式管理器
        this.modules.input = new InputManager({
            dataService: this.dataService
        });

        // 自動更新管理器
        this.modules.autoRefresh = new AutoRefreshManager({
            interval: CONFIG.AUTO_REFRESH.INTERVAL,
            onRefresh: () => this.refresh()
        });

        // 初始化所有模組
        for (const [name, module] of Object.entries(this.modules)) {
            if (module.init) {
                await module.init();
                console.log(`✅ ${name} 模組初始化完成`);
            }
        }
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 模式切換事件
        this.on('mode:change', (newMode) => {
            this.handleModeChange(newMode);
        });

        // 數據更新事件
        this.dataService.on('data:updated', (data) => {
            this.handleDataUpdate(data);
        });

        // 錯誤處理事件
        this.dataService.on('error', (error) => {
            this.handleError(error);
        });

        // 視窗關閉前清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.modules.autoRefresh.pause();
            } else {
                this.modules.autoRefresh.resume();
            }
        });
    }

    /**
     * 載入初始數據
     */
    async loadInitialData() {
        try {
            console.log('📊 正在載入初始數據...');
            
            // 顯示載入指示器
            this.modules.ui.showLoading();
            
            // 載入數據
            const data = await this.dataService.fetchData();
            this.data.all = data;
            this.data.today = this.dataService.getTodayData(data);
            
            // 更新 UI
            this.updateDisplay();
            
            // 隱藏載入指示器
            this.modules.ui.hideLoading();
            
            console.log('✅ 初始數據載入完成');
            
        } catch (error) {
            console.error('❌ 載入初始數據失敗:', error);
            this.modules.ui.hideLoading();
            this.showError('載入數據失敗，請檢查網路連線');
        }
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        switch (this.state.mode) {
            case 'today':
                this.updateTodayDisplay();
                break;
            case 'history':
                this.updateHistoryDisplay();
                break;
            case 'compare':
                this.updateCompareDisplay();
                break;
            case 'input':
                this.updateInputDisplay();
                break;
        }
    }

    /**
     * 更新今日模式顯示
     */
    updateTodayDisplay() {
        const latestData = this.dataService.getLatestDataForEachRoom(this.data.today);
        
        // 更新房間狀態
        this.modules.ui.updateRoomStatus(latestData);
        
        // 更新建議
        this.modules.ui.updateAdvice(latestData);
        
        // 更新圖表
        this.modules.chart.updateChart(this.data.today);
    }

    /**
     * 更新歷史模式顯示
     */
    updateHistoryDisplay() {
        if (this.data.history) {
            const latestData = this.dataService.getLatestDataForEachRoom(this.data.history);
            this.modules.ui.updateRoomStatus(latestData);
            this.modules.chart.updateChart(this.data.history);
        }
    }

    /**
     * 更新比較模式顯示
     */
    updateCompareDisplay() {
        this.modules.compare.updateDisplay(this.data.today, this.data.compare);
    }

    /**
     * 更新輸入模式顯示
     */
    updateInputDisplay() {
        this.modules.input.updateDisplay();
    }

    /**
     * 處理模式變更
     */
    async handleModeChange(newMode) {
        try {
            this.state.mode = newMode;
            console.log(`🔄 切換到 ${newMode} 模式`);
            
            // 停止自動更新（除了今日模式）
            if (newMode !== 'today') {
                this.modules.autoRefresh.stop();
            } else {
                this.modules.autoRefresh.start();
            }
            
            // 根據模式載入對應數據
            switch (newMode) {
                case 'today':
                    await this.loadTodayData();
                    break;
                case 'history':
                    if (this.state.selectedDate) {
                        await this.loadHistoryData(this.state.selectedDate);
                    }
                    break;
                case 'compare':
                    await this.loadCompareData();
                    break;
                case 'input':
                    break;
            }
            
            this.updateDisplay();
            
        } catch (error) {
            console.error('❌ 模式切換失敗:', error);
            this.showError('模式切換失敗');
        }
    }

    /**
     * 處理數據更新
     */
    handleDataUpdate(data) {
        this.data.all = data;
        this.data.today = this.dataService.getTodayData(data);
        
        if (this.state.mode === 'today') {
            this.updateDisplay();
        }
    }

    /**
     * 處理錯誤
     */
    handleError(error) {
        console.error('❌ 應用程式錯誤:', error);
        this.showError(error.message || '發生未知錯誤');
    }

    /**
     * 載入今日數據
     */
    async loadTodayData() {
        const data = await this.dataService.fetchData();
        this.data.all = data;
        this.data.today = this.dataService.getTodayData(data);
    }

    /**
     * 載入歷史數據
     */
    async loadHistoryData(dateString) {
        this.data.history = this.dataService.getDataForDate(this.data.all, dateString);
        this.state.selectedDate = dateString;
    }

    /**
     * 載入比較數據
     */
    async loadCompareData() {
        if (this.state.compareDate) {
            this.data.compare = this.dataService.getDataForDate(this.data.all, this.state.compareDate);
        }
    }

    /**
     * 刷新數據
     */
    async refresh() {
        try {
            await this.loadTodayData();
            console.log('🔄 數據已更新');
        } catch (error) {
            console.error('❌ 刷新數據失敗:', error);
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        this.modules.ui.showError(message);
    }

    /**
     * 清理資源
     */
    cleanup() {
        // 停止自動更新
        this.modules.autoRefresh.stop();
        
        // 清理各模組
        Object.values(this.modules).forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            }
        });
        
        console.log('🧹 資源清理完成');
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
                    console.error(`❌ 事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }
}

// 全域實例
let dashboardApp = null;

/**
 * 初始化應用程式
 */
async function initApp() {
    if (dashboardApp) {
        console.warn('⚠️ 應用程式已經初始化');
        return dashboardApp;
    }
    
    dashboardApp = new ERIDashboard();
    await dashboardApp.init();
    
    // 將實例掛載到全域物件供除錯使用
    if (CONFIG.DEBUG) {
        window.dashboard = dashboardApp;
    }
    
    return dashboardApp;
}

// DOM 載入完成後自動初始化
document.addEventListener('DOMContentLoaded', initApp);

// 匯出給其他模組使用
export { ERIDashboard, initApp };
