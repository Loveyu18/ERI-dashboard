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
});
