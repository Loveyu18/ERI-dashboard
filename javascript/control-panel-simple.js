// 超簡單控制面板 - 無複雜邏輯
console.log("🚀 Simple control panel loading...");

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM loaded, initializing simple controls");

    // 獲取按鈕和控制區域
    const historyBtn = document.getElementById("historyModeBtn");
    const compareBtn = document.getElementById("compareModeBtn");
    const inputBtn = document.getElementById("inputModeBtn");
    const todayBtn = document.getElementById("todayModeBtn");

    const historyControls = document.getElementById("historyControls");
    const compareControls = document.getElementById("compareControls");
    const inputControls = document.getElementById("inputControls");

    console.log("📋 Elements found:", {
        buttons: {
            historyBtn: !!historyBtn,
            compareBtn: !!compareBtn,
            inputBtn: !!inputBtn,
            todayBtn: !!todayBtn,
        },
        controls: {
            historyControls: !!historyControls,
            compareControls: !!compareControls,
            inputControls: !!inputControls,
        },
    });

    // 簡單的顯示/隱藏函數
    function showOnly(targetControl) {
        console.log("👀 Showing:", targetControl ? targetControl.id : "none");

        // 隱藏所有
        [historyControls, compareControls, inputControls].forEach((control) => {
            if (control) {
                control.style.display = "none";
                control.classList.remove("show");
            }
        });

        // 顯示目標
        if (targetControl) {
            targetControl.style.display = "flex";
            setTimeout(() => {
                targetControl.classList.add("show");
            }, 50);
        }
    }

    // 按鈕事件 - 超簡單
    if (historyBtn && historyControls) {
        historyBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("🎯 History clicked");

            if (historyControls.classList.contains("show")) {
                showOnly(null); // 隱藏
            } else {
                showOnly(historyControls); // 顯示
            }
        });
    }

    if (compareBtn && compareControls) {
        compareBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("🎯 Compare clicked");

            if (compareControls.classList.contains("show")) {
                showOnly(null);
            } else {
                showOnly(compareControls);
            }
        });
    }

    if (inputBtn && inputControls) {
        inputBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("🎯 Input clicked");

            if (inputControls.classList.contains("show")) {
                showOnly(null);
            } else {
                showOnly(inputControls);
            }
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("🎯 Today clicked");
            showOnly(null);
        });
    }

    // 防止控制區域內點擊關閉
    [historyControls, compareControls, inputControls].forEach((control) => {
        if (control) {
            control.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        }
    });

    // 外部點擊關閉 - 延遲註冊
    setTimeout(() => {
        document.addEventListener("click", function () {
            console.log("🌍 Outside click - hiding all");
            showOnly(null);
        });
    }, 500);

    // ESC 關閉
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            showOnly(null);
        }
    });

    console.log("✅ Simple control panel ready!");
    
    // 手動刷新按鈕處理
    const manualRefreshBtn = document.getElementById('manualRefreshBtn');
    if (manualRefreshBtn) {
        manualRefreshBtn.addEventListener('click', function() {
            console.log("🔄 Manual refresh clicked");
            
            // 添加點擊動畫效果
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
            
            // 添加旋轉動畫
            const refreshIcon = this.querySelector('.refresh-icon');
            if (refreshIcon) {
                refreshIcon.style.transform = 'rotate(360deg)';
                refreshIcon.style.transition = 'transform 0.6s ease-in-out';
            }
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.opacity = '';
                if (refreshIcon) {
                    refreshIcon.style.transform = '';
                }
            }, 600);
            
            // 執行刷新功能（確保函數存在）
            if (typeof loadCO2Data === 'function') {
                loadCO2Data();
            }
        });
    }
    
    // 修正控制面板定位
    function fixControlGroupPositioning() {
        const historyBtn = document.getElementById("historyModeBtn");
        const compareBtn = document.getElementById("compareModeBtn"); 
        const inputBtn = document.getElementById("inputModeBtn");
        
        if (historyBtn && historyControls) {
            positionControlGroup(historyBtn, historyControls);
        }
        if (compareBtn && compareControls) {
            positionControlGroup(compareBtn, compareControls);
        }
        if (inputBtn && inputControls) {
            positionControlGroup(inputBtn, inputControls);
        }
    }
    
    // 控制組定位函數
    function positionControlGroup(button, controlGroup) {
        if (!button || !controlGroup) return;
        
        const buttonRect = button.getBoundingClientRect();
        const modeControlBar = document.querySelector('.mode-control-bar');
        
        if (!modeControlBar) return;
        
        const modeControlBarRect = modeControlBar.getBoundingClientRect();
        const buttonLeft = buttonRect.left - modeControlBarRect.left;
        const buttonWidth = buttonRect.width;
        const controlGroupWidth = controlGroup.offsetWidth || 280;
        
        const centerPosition = buttonLeft + (buttonWidth / 2) - (controlGroupWidth / 2);
        const containerWidth = modeControlBar.offsetWidth;
        const minLeft = 8;
        const maxLeft = containerWidth - controlGroupWidth - 8;
        const finalLeft = Math.max(minLeft, Math.min(maxLeft, centerPosition));
        
        controlGroup.style.left = `${finalLeft}px`;
    }
    
    // 監聽視窗大小變化
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fixControlGroupPositioning();
        }, 100);
    });
    
    // 在顯示控制組時進行定位
    const originalShowOnly = showOnly;
    showOnly = function(targetControl) {
        originalShowOnly(targetControl);
        setTimeout(() => {
            fixControlGroupPositioning();
        }, 60);
    };
});
