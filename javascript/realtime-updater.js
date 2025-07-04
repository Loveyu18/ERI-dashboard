// 手動數據更新模組
class ManualDataUpdater {
    constructor() {
        this.lastDataSnapshot = null;
        this.updateIndicators = new Map();
        
        this.init();
    }

    init() {
        console.log("🔄 初始化手動數據更新系統");
        this.createUpdateIndicators();
        this.bindManualRefreshButton();
        
        // 初始載入數據
        this.loadInitialData();
    }

    // 綁定手動刷新按鈕
    bindManualRefreshButton() {
        const manualRefreshBtn = document.getElementById('manualRefreshBtn');
        if (manualRefreshBtn) {
            manualRefreshBtn.addEventListener('click', () => {
                this.manualRefresh();
            });
            console.log("✅ 手動刷新按鈕已綁定");
        }
    }

    // 初始載入數據
    async loadInitialData() {
        console.log("📊 載入初始數據");
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.lastDataSnapshot = this.createDataSnapshot(data);
            this.updateUI(data, false);
            this.showUpdateNotification("數據載入完成", "success");
            
        } catch (error) {
            console.error("❌ 初始數據載入失敗:", error);
            this.showUpdateNotification("數據載入失敗", "error");
        }
    }

    // 創建數據更新指示器
    createUpdateIndicators() {
        const rooms = ['A', 'B', 'C'];
        rooms.forEach(roomId => {
            const room = document.getElementById(`room${roomId}`);
            if (room) {
                // 創建更新指示器
                const indicator = document.createElement('div');
                indicator.className = 'data-update-indicator';
                indicator.innerHTML = '✨';
                indicator.style.display = 'none';
                room.appendChild(indicator);
                
                this.updateIndicators.set(roomId, indicator);
            }
        });
    }



    // 創建數據快照用於比較
    createDataSnapshot(data) {
        const latestDataForRooms = getLatestDataForEachRoom(data);
        
        return {
            roomA: latestDataForRooms.A.value,
            roomB: latestDataForRooms.B.value,
            roomC: latestDataForRooms.C.value,
            timestampA: latestDataForRooms.A.timestamp,
            timestampB: latestDataForRooms.B.timestamp,
            timestampC: latestDataForRooms.C.timestamp,
            dataLength: data.length
        };
    }

    // 比較兩個數據快照
    compareSnapshots(oldSnapshot, newSnapshot) {
        const changes = {
            hasChanges: false,
            changedRooms: [],
            newData: false
        };

        // 檢查房間數據變化
        const rooms = ['A', 'B', 'C'];
        rooms.forEach(room => {
            const oldValue = oldSnapshot[`room${room}`];
            const newValue = newSnapshot[`room${room}`];
            const oldTimestamp = oldSnapshot[`timestamp${room}`];
            const newTimestamp = newSnapshot[`timestamp${room}`];

            if (oldValue !== newValue || oldTimestamp !== newTimestamp) {
                changes.hasChanges = true;
                changes.changedRooms.push({
                    room: room,
                    oldValue: oldValue,
                    newValue: newValue,
                    oldTimestamp: oldTimestamp,
                    newTimestamp: newTimestamp
                });
            }
        });

        // 檢查是否有新數據記錄
        if (oldSnapshot.dataLength !== newSnapshot.dataLength) {
            changes.hasChanges = true;
            changes.newData = true;
        }

        return changes;
    }

    // 更新 UI
    updateUI(data, showAnimation = false, changes = null) {
        // 獲取最新數據
        const latestDataForRooms = getLatestDataForEachRoom(data);

        // 更新房間狀態
        this.updateRoomWithAnimation("A", latestDataForRooms.A.value, "中華辦7樓", latestDataForRooms.A.timestamp, showAnimation && changes && changes.changedRooms.some(c => c.room === 'A'));
        this.updateRoomWithAnimation("B", latestDataForRooms.B.value, "中華辦8樓", latestDataForRooms.B.timestamp, showAnimation && changes && changes.changedRooms.some(c => c.room === 'B'));
        this.updateRoomWithAnimation("C", latestDataForRooms.C.value, "衡陽辦", latestDataForRooms.C.timestamp, showAnimation && changes && changes.changedRooms.some(c => c.room === 'C'));

        // 更新建議
        const validValues = [
            latestDataForRooms.A.value,
            latestDataForRooms.B.value,
            latestDataForRooms.C.value,
        ].filter((val) => val !== null && val !== undefined);
        const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
        updateAdvice(maxValue, {
            A: latestDataForRooms.A.value,
            B: latestDataForRooms.B.value,
            C: latestDataForRooms.C.value,
        });

        // 更新圖表（如果有新數據）
        if (changes && changes.newData) {
            const today = new Date();
            const todayString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
            const todayData = data.filter(row => {
                const dateStr = row["日期"] || row["date"];
                return dateStr && dateStr.toString().trim() === todayString;
            });

            let chartData = todayData;
            let chartTitle = "今日 CO₂ 趨勢圖";

            if (todayData.length === 0) {
                chartData = getRecentData(data, 7);
                chartTitle = "近期 CO₂ 趨勢圖 (最近7天)";
            }

            updateChart(chartData);
            
            const chartTitleEl = document.getElementById("chartTitle");
            if (chartTitleEl) {
                chartTitleEl.textContent = chartTitle;
            }
        }

        // 更新最新數據表格
        if (changes && changes.newData && window.recentDataModule && typeof window.recentDataModule.displayRecentData === "function") {
            try {
                allData = data ? [...data] : [];
                window.recentDataModule.displayRecentData(allData);
            } catch (error) {
                console.error("更新最新數據表格時出錯:", error);
            }
        }
    }

    // 帶動畫效果的房間更新
    updateRoomWithAnimation(roomId, value, displayName, timestamp, showUpdateAnimation = false) {
        const room = document.getElementById(`room${roomId}`);
        if (!room) return;

        // 更新數據
        updateRoom(roomId, value, displayName, timestamp);

        // 顯示更新動畫
        if (showUpdateAnimation) {
            this.showRoomUpdateAnimation(roomId);
        }
    }

    // 顯示房間更新動畫
    showRoomUpdateAnimation(roomId) {
        const indicator = this.updateIndicators.get(roomId);
        const room = document.getElementById(`room${roomId}`);
        
        if (indicator && room) {
            // 顯示更新指示器
            indicator.style.display = 'block';
            indicator.style.opacity = '1';
            indicator.style.transform = 'scale(1)';
            
            // 房間卡片閃爍效果
            room.style.transition = 'all 0.3s ease';
            room.style.transform = 'scale(1.02)';
            room.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
            
            // 恢復動畫
            setTimeout(() => {
                room.style.transform = 'scale(1)';
                room.style.boxShadow = '';
                
                // 隱藏指示器
                setTimeout(() => {
                    indicator.style.opacity = '0';
                    indicator.style.transform = 'scale(0)';
                    setTimeout(() => {
                        indicator.style.display = 'none';
                    }, 300);
                }, 1500);
            }, 300);
        }
    }

    // 顯示更新通知
    showUpdateNotification(message, type = "info") {
        const lastUpdateEl = document.getElementById("lastUpdate");
        if (!lastUpdateEl) return;

        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        
        const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "🔄";
        lastUpdateEl.textContent = `${emoji} ${message} | 最後檢查：${timeString}`;
        
        // 添加視覺效果
        lastUpdateEl.style.transition = 'all 0.3s ease';
        lastUpdateEl.style.color = type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#6B7280";
        
        // 恢復原色
        setTimeout(() => {
            lastUpdateEl.style.color = '';
        }, 2000);
    }

    // 更新最後檢查時間
    updateLastCheckTime() {
        const lastUpdateEl = document.getElementById("lastUpdate");
        if (!lastUpdateEl) return;

        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        
        lastUpdateEl.textContent = `📊 數據最新 | 最後檢查：${timeString}`;
    }

    // 手動刷新數據
    async manualRefresh() {
        console.log("🔄 手動刷新數據");
        
        const manualRefreshBtn = document.getElementById('manualRefreshBtn');
        if (manualRefreshBtn) {
            manualRefreshBtn.classList.add('refreshing');
            manualRefreshBtn.disabled = true;
        }
        
        this.showUpdateNotification("正在刷新數據...", "info");
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const newData = await response.json();
            
            // 比較數據是否有變化
            let hasChanges = false;
            let changes = null;
            
            if (this.lastDataSnapshot) {
                const newSnapshot = this.createDataSnapshot(newData);
                changes = this.compareSnapshots(this.lastDataSnapshot, newSnapshot);
                hasChanges = changes.hasChanges;
                this.lastDataSnapshot = newSnapshot;
            } else {
                // 第一次載入
                this.lastDataSnapshot = this.createDataSnapshot(newData);
                hasChanges = true;
            }

            // 更新 UI
            this.updateUI(newData, hasChanges, changes);
            
            if (hasChanges) {
                this.showUpdateNotification("數據已更新", "success");
                console.log("📊 檢測到數據變化，UI 已更新");
            } else {
                this.showUpdateNotification("數據無變化", "info");
                console.log("✅ 數據無變化");
            }
            
        } catch (error) {
            console.error("手動刷新失敗:", error);
            this.showUpdateNotification("刷新失敗", "error");
        } finally {
            if (manualRefreshBtn) {
                setTimeout(() => {
                    manualRefreshBtn.classList.remove('refreshing');
                    manualRefreshBtn.disabled = false;
                }, 1000);
            }
        }
    }
}

// 全域實例
let manualDataUpdater = null;
