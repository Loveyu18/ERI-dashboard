/**
 * 圖表管理器模組
 * 負責 CO2 圖表的初始化、更新和配置
 */

import { CONFIG } from '../config/constants.js';
import { HELPERS } from '../utils/helpers.js';

export class ChartManager {
    constructor(options = {}) {
        this.containerId = options.containerId || 'co2-chart';
        this.config = { ...CONFIG.CHART, ...options.config };
        this.chart = null;
        this.isInitialized = false;
    }

    /**
     * 初始化圖表
     */
    async init() {
        try {
            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`圖表容器不存在: ${this.containerId}`);
            }

            // 檢查 Chart.js 是否已載入
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js 尚未載入');
            }

            // 清理現有圖表
            if (this.chart) {
                this.chart.destroy();
            }

            // 建立新圖表
            this.chart = new Chart(container, this.getChartConfig());
            this.isInitialized = true;
            
            console.log('✅ 圖表初始化完成');
            
        } catch (error) {
            console.error('❌ 圖表初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取圖表配置
     */
    getChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'CO2 濃度監控',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        callbacks: {
                            title: (tooltipItems) => {
                                return `時間: ${tooltipItems[0].label}`;
                            },
                            label: (context) => {
                                const value = context.parsed.y;
                                const room = context.dataset.label;
                                const level = this.getCO2Level(value);
                                return `${room}: ${value} ppm (${level})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: '時間'
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            callback: function(value, index) {
                                const labels = this.getLabelForValue(value);
                                return labels.split(' ')[1] || labels; // 只顯示時間部分
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'CO2 濃度 (ppm)'
                        },
                        min: 0,
                        max: 2000,
                        ticks: {
                            stepSize: 200,
                            callback: function(value) {
                                return value + ' ppm';
                            }
                        },
                        grid: {
                            color: function(context) {
                                // 標準線顏色
                                if (context.tick.value === 1000) return '#ff6b6b';
                                if (context.tick.value === 800) return '#ffa500';
                                if (context.tick.value === 600) return '#32cd32';
                                return '#e0e0e0';
                            },
                            lineWidth: function(context) {
                                // 標準線寬度
                                if ([600, 800, 1000].includes(context.tick.value)) return 2;
                                return 1;
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        };
    }

    /**
     * 更新圖表數據
     */
    updateChart(data) {
        if (!this.isInitialized || !this.chart) {
            console.warn('⚠️ 圖表尚未初始化');
            return;
        }

        try {
            const chartData = this.prepareChartData(data);
            
            // 更新圖表數據
            this.chart.data.labels = chartData.labels;
            this.chart.data.datasets = chartData.datasets;
            
            // 重新繪製圖表
            this.chart.update('none'); // 不使用動畫以提高性能
            
            console.log('📊 圖表已更新');
            
        } catch (error) {
            console.error('❌ 圖表更新失敗:', error);
        }
    }

    /**
     * 更新比較模式圖表
     */
    updateCompareChart(todayData, compareData) {
        if (!this.isInitialized || !this.chart) {
            console.warn('⚠️ 圖表尚未初始化');
            return;
        }

        try {
            const todayChartData = this.prepareChartData(todayData, '今日');
            const compareChartData = this.prepareChartData(compareData, '比較日期');
            
            // 合併標籤（使用較長的時間軸）
            const allLabels = [...new Set([
                ...todayChartData.labels,
                ...compareChartData.labels
            ])].sort();
            
            // 合併數據集
            const datasets = [];
            
            // 今日數據（實線）
            todayChartData.datasets.forEach(dataset => {
                datasets.push({
                    ...dataset,
                    label: `${dataset.label} (今日)`,
                    borderDash: []
                });
            });
            
            // 比較數據（虛線）
            compareChartData.datasets.forEach(dataset => {
                datasets.push({
                    ...dataset,
                    label: `${dataset.label} (比較)`,
                    borderDash: [5, 5],
                    backgroundColor: dataset.backgroundColor + '40', // 降低透明度
                    borderColor: dataset.borderColor
                });
            });
            
            // 更新圖表
            this.chart.data.labels = allLabels;
            this.chart.data.datasets = datasets;
            this.chart.update();
            
            console.log('📊 比較圖表已更新');
            
        } catch (error) {
            console.error('❌ 比較圖表更新失敗:', error);
        }
    }

    /**
     * 準備圖表數據
     */
    prepareChartData(data, labelSuffix = '') {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // 按時間排序
        const sortedData = [...data].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        // 取得所有時間點
        const timePoints = [...new Set(sortedData.map(item => item.timestamp))];
        
        // 取得所有房間
        const rooms = [...new Set(sortedData.map(item => item.room))];
        
        // 格式化時間標籤
        const labels = timePoints.map(timestamp => 
            HELPERS.formatTime(timestamp)
        );

        // 為每個房間建立數據集
        const datasets = rooms.map(room => {
            const roomData = sortedData.filter(item => item.room === room);
            const values = timePoints.map(timestamp => {
                const dataPoint = roomData.find(item => item.timestamp === timestamp);
                return dataPoint ? dataPoint.co2 : null;
            });

            const color = this.getRoomColor(room);
            const roomDisplayName = CONFIG.ROOM_NAMES[room] || room;
            
            return {
                label: roomDisplayName + (labelSuffix ? ` ${labelSuffix}` : ''),
                data: values,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                fill: false,
                tension: 0.4,
                spanGaps: true
            };
        });

        return { labels, datasets };
    }

    /**
     * 獲取房間顏色
     */
    getRoomColor(room) {
        const colors = {
            'a202': '#ff6b6b',
            'a203': '#4ecdc4',
            'a204': '#45b7d1',
            'a205': '#f9ca24',
            'a206': '#6c5ce7',
            'a207': '#fd79a8',
            'a208': '#00b894',
            'a209': '#e17055'
        };
        
        return colors[room] || '#95a5a6';
    }

    /**
     * 獲取 CO2 濃度等級
     */
    getCO2Level(value) {
        if (value < 600) return '優良';
        if (value < 800) return '良好';
        if (value < 1000) return '普通';
        return '不佳';
    }

    /**
     * 重置圖表
     */
    reset() {
        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets = [];
            this.chart.update();
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.isInitialized = false;
    }

    /**
     * 獲取圖表實例（供進階使用）
     */
    getChart() {
        return this.chart;
    }

    /**
     * 下載圖表為圖片
     */
    downloadChart(filename = 'co2-chart.png') {
        if (!this.chart) return;

        try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = this.chart.toBase64Image();
            link.click();
            
            console.log('📸 圖表已下載:', filename);
            
        } catch (error) {
            console.error('❌ 圖表下載失敗:', error);
        }
    }
}
