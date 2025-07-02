// 控制面板功能
document.addEventListener("DOMContentLoaded", function () {
    // 獲取控制面板元素
    const controlPanel = document.getElementById("controlPanel");
    const controlToggleBtn = document.getElementById("controlToggleBtn");
    const closePanelBtn = document.getElementById("closePanelBtn");

    // 確保控制面板初始隱藏
    controlPanel.style.transform = "translateX(110%)";
    controlPanel.style.visibility = "hidden";
    controlPanel.style.opacity = "0";

    // 打開控制面板
    controlToggleBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // 防止事件冒泡
        controlPanel.classList.add("open");
        controlPanel.style.transform = ""; // 移除內聯樣式，使用類樣式
        controlPanel.style.visibility = "";
        controlPanel.style.opacity = "";
    });

    // 關閉控制面板
    closePanelBtn.addEventListener("click", function () {
        controlPanel.classList.remove("open");
    });

    // 點擊面板外部區域關閉面板
    document.addEventListener("click", function (event) {
        if (
            !controlPanel.contains(event.target) &&
            !controlToggleBtn.contains(event.target) &&
            controlPanel.classList.contains("open")
        ) {
            controlPanel.classList.remove("open");
        }
    });
});
