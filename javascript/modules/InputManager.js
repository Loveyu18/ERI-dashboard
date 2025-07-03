/**
 * 輸入管理器
 * 負責手動輸入數據功能
 */

import { CONFIG } from '../config/constants.js';
import { HELPERS } from '../utils/helpers.js';

export class InputManager {
    constructor(options = {}) {
        this.dataService = options.dataService;
        this.isInitialized = false;
        this.elements = {};
        this.formData = {};
        this.isSubmitting = false;
    }

    /**
     * 初始化輸入管理器
     */
    async init() {
        try {
            this.cacheElements();
            this.createInputForm();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ 輸入管理器初始化完成');
            
        } catch (error) {
            console.error('❌ 輸入管理器初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 快取 DOM 元素
     */
    cacheElements() {
        this.elements = {
            inputModeBtn: document.getElementById('input-mode-btn'),
            inputContainer: document.getElementById('input-container'),
            inputForm: document.getElementById('input-form'),
            submitBtn: document.getElementById('submit-data-btn'),
            resetBtn: document.getElementById('reset-form-btn')
        };
    }

    /**
     * 建立輸入表單
     */
    createInputForm() {
        if (this.elements.inputContainer) return;

        const container = document.createElement('div');
        container.id = 'input-container';
        container.className = 'input-container';
        container.style.display = 'none';
        container.innerHTML = this.generateFormHTML();

        // 添加到適當位置
        const targetElement = document.querySelector('.dashboard-content') || 
                             document.querySelector('.main-content') || 
                             document.body;
        
        targetElement.appendChild(container);
        this.elements.inputContainer = container;
        
        // 重新快取表單相關元素
        this.elements.inputForm = container.querySelector('#input-form');
        this.elements.submitBtn = container.querySelector('#submit-data-btn');
        this.elements.resetBtn = container.querySelector('#reset-form-btn');
    }

    /**
     * 生成表單 HTML
     */
    generateFormHTML() {
        const roomOptions = Object.entries(CONFIG.ROOM_NAMES)
            .map(([key, name]) => `<option value="${key}">${name}</option>`)
            .join('');

        return `
            <div class="input-form-container">
                <h3>手動輸入數據</h3>
                <div class="form-description">
                    <p>請填寫以下資訊以新增 CO2 監測數據</p>
                </div>
                
                <form id="input-form" class="input-form">
                    <div class="form-group">
                        <label for="room-select">選擇房間 *</label>
                        <select id="room-select" name="room" required>
                            <option value="">請選擇房間</option>
                            ${roomOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="co2-input">CO2 濃度 (ppm) *</label>
                        <input 
                            type="number" 
                            id="co2-input" 
                            name="co2" 
                            min="0" 
                            max="5000" 
                            step="1" 
                            placeholder="例如: 450"
                            required
                        >
                        <div class="input-hint">
                            <span class="hint-text">正常範圍: 400-1000 ppm</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="timestamp-input">時間戳記</label>
                        <input 
                            type="datetime-local" 
                            id="timestamp-input" 
                            name="timestamp"
                        >
                        <div class="input-hint">
                            <span class="hint-text">留空則使用當前時間</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="notes-input">備註</label>
                        <textarea 
                            id="notes-input" 
                            name="notes" 
                            rows="3" 
                            placeholder="可選：輸入相關備註或說明"
                        ></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" id="submit-data-btn" class="btn btn-primary">
                            <span class="btn-text">提交數據</span>
                            <span class="btn-loading" style="display: none;">提交中...</span>
                        </button>
                        <button type="button" id="reset-form-btn" class="btn btn-secondary">
                            重置表單
                        </button>
                    </div>
                </form>

                <div class="input-status" id="input-status"></div>
                
                <div class="input-guidelines">
                    <h4>輸入指南</h4>
                    <ul>
                        <li><strong>房間選擇：</strong>請選擇正確的監測房間</li>
                        <li><strong>CO2 濃度：</strong>請輸入 0-5000 ppm 範圍內的數值</li>
                        <li><strong>時間戳記：</strong>可指定特定時間，或留空使用當前時間</li>
                        <li><strong>數據驗證：</strong>系統會自動驗證輸入數據的合理性</li>
                    </ul>
                </div>

                <div class="co2-reference">
                    <h4>CO2 濃度參考</h4>
                    <div class="reference-grid">
                        <div class="reference-item excellent">
                            <div class="reference-range">< 600 ppm</div>
                            <div class="reference-level">優良</div>
                        </div>
                        <div class="reference-item good">
                            <div class="reference-range">600-800 ppm</div>
                            <div class="reference-level">良好</div>
                        </div>
                        <div class="reference-item fair">
                            <div class="reference-range">800-1000 ppm</div>
                            <div class="reference-level">普通</div>
                        </div>
                        <div class="reference-item poor">
                            <div class="reference-range">> 1000 ppm</div>
                            <div class="reference-level">不佳</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 表單提交
        if (this.elements.inputForm) {
            this.elements.inputForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 重置按鈕
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // 實時驗證
        this.setupRealTimeValidation();
        
        // 自動填充當前時間
        this.setCurrentTime();
    }

    /**
     * 設置實時驗證
     */
    setupRealTimeValidation() {
        const co2Input = document.getElementById('co2-input');
        const roomSelect = document.getElementById('room-select');

        if (co2Input) {
            co2Input.addEventListener('input', (e) => {
                this.validateCO2Input(e.target);
            });
        }

        if (roomSelect) {
            roomSelect.addEventListener('change', (e) => {
                this.validateRoomSelect(e.target);
            });
        }
    }

    /**
     * 驗證 CO2 輸入
     */
    validateCO2Input(input) {
        const value = parseFloat(input.value);
        const container = input.closest('.form-group');
        const hint = container.querySelector('.input-hint');
        
        // 清除之前的狀態
        container.classList.remove('error', 'warning', 'success');
        
        if (isNaN(value)) {
            return;
        }

        if (value < 0 || value > 5000) {
            container.classList.add('error');
            hint.innerHTML = '<span class="error-text">數值必須在 0-5000 ppm 範圍內</span>';
        } else if (value > 1000) {
            container.classList.add('warning');
            hint.innerHTML = '<span class="warning-text">數值偏高，請確認是否正確</span>';
        } else {
            container.classList.add('success');
            hint.innerHTML = '<span class="success-text">數值正常</span>';
        }
    }

    /**
     * 驗證房間選擇
     */
    validateRoomSelect(select) {
        const container = select.closest('.form-group');
        
        container.classList.remove('error', 'success');
        
        if (select.value) {
            container.classList.add('success');
        }
    }

    /**
     * 設置當前時間
     */
    setCurrentTime() {
        const timestampInput = document.getElementById('timestamp-input');
        if (timestampInput) {
            const now = new Date();
            // 格式化為 datetime-local 格式
            const formattedTime = now.toISOString().slice(0, 16);
            timestampInput.value = formattedTime;
        }
    }

    /**
     * 處理表單提交
     */
    async handleSubmit() {
        if (this.isSubmitting) {
            console.log('⚠️ 正在提交中，請勿重複提交');
            return;
        }

        try {
            // 驗證表單
            if (!this.validateForm()) {
                return;
            }

            // 獲取表單資料
            const formData = this.getFormData();
            
            // 顯示提交中狀態
            this.setSubmittingState(true);
            
            // 提交數據
            await this.submitData(formData);
            
            // 顯示成功訊息
            this.showSuccess('數據提交成功！');
            
            // 重置表單
            this.resetForm();
            
            // 觸發數據提交事件
            this.emit('data:submitted', formData);
            
        } catch (error) {
            console.error('❌ 提交數據失敗:', error);
            this.showError('提交失敗：' + error.message);
        } finally {
            this.setSubmittingState(false);
        }
    }

    /**
     * 驗證表單
     */
    validateForm() {
        const form = this.elements.inputForm;
        if (!form) return false;

        const formData = new FormData(form);
        const room = formData.get('room');
        const co2 = parseFloat(formData.get('co2'));

        // 檢查必填欄位
        if (!room) {
            this.showError('請選擇房間');
            return false;
        }

        if (isNaN(co2)) {
            this.showError('請輸入有效的 CO2 濃度');
            return false;
        }

        // 檢查數值範圍
        if (co2 < 0 || co2 > 5000) {
            this.showError('CO2 濃度必須在 0-5000 ppm 範圍內');
            return false;
        }

        return true;
    }

    /**
     * 獲取表單資料
     */
    getFormData() {
        const form = this.elements.inputForm;
        const formData = new FormData(form);
        
        let timestamp = formData.get('timestamp');
        if (!timestamp) {
            timestamp = new Date().toISOString();
        } else {
            timestamp = new Date(timestamp).toISOString();
        }

        return {
            room: formData.get('room'),
            co2: parseFloat(formData.get('co2')),
            timestamp: timestamp,
            notes: formData.get('notes') || '',
            source: 'manual_input'
        };
    }

    /**
     * 提交數據
     */
    async submitData(data) {
        if (!this.dataService) {
            throw new Error('數據服務未初始化');
        }

        try {
            // 使用數據服務提交
            await this.dataService.submitData(data);
            
            console.log('✅ 數據已成功提交');
            
        } catch (error) {
            console.error('❌ 數據提交失敗:', error);
            throw error;
        }
    }

    /**
     * 設置提交狀態
     */
    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        
        const submitBtn = this.elements.submitBtn;
        if (!submitBtn) return;

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (isSubmitting) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    /**
     * 重置表單
     */
    resetForm() {
        if (this.elements.inputForm) {
            this.elements.inputForm.reset();
        }
        
        // 清除所有驗證狀態
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'warning', 'success');
        });
        
        // 重新設置當前時間
        this.setCurrentTime();
        
        // 清除狀態訊息
        this.clearStatus();
        
        console.log('🔄 表單已重置');
    }

    /**
     * 顯示成功訊息
     */
    showSuccess(message) {
        this.showStatus(message, 'success');
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        this.showStatus(message, 'error');
    }

    /**
     * 顯示狀態訊息
     */
    showStatus(message, type = 'info') {
        const statusContainer = document.getElementById('input-status');
        if (!statusContainer) return;

        const statusElement = document.createElement('div');
        statusElement.className = `status-message ${type}`;
        statusElement.innerHTML = `
            <span class="status-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="status-text">${message}</span>
        `;

        statusContainer.innerHTML = '';
        statusContainer.appendChild(statusElement);
        statusContainer.style.display = 'block';

        // 自動隱藏（成功訊息）
        if (type === 'success') {
            setTimeout(() => {
                this.clearStatus();
            }, 3000);
        }
    }

    /**
     * 清除狀態訊息
     */
    clearStatus() {
        const statusContainer = document.getElementById('input-status');
        if (statusContainer) {
            statusContainer.innerHTML = '';
            statusContainer.style.display = 'none';
        }
    }

    /**
     * 顯示輸入容器
     */
    showDisplay() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.style.display = 'block';
        }
    }

    /**
     * 隱藏輸入容器
     */
    hideDisplay() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.style.display = 'none';
        }
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        this.showDisplay();
        this.setCurrentTime();
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
                    console.error(`❌ 輸入管理器事件 ${event} 處理失敗:`, error);
                }
            });
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        this.events = {};
        
        if (this.elements.inputContainer && this.elements.inputContainer.parentElement) {
            this.elements.inputContainer.remove();
        }
    }
}
