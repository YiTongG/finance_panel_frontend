
// 更多股票按钮跳转功能
function goToMoreStocks() {
    alert('跳转到更多股票页面');
}

class FinancialDashboard {
    constructor() {
        this.charts = {};
        this.mockIndexData = [
            // 美洲
            { name: "道琼斯", change: "+0.47%", isPositive: true, top: "42%", left: "19%", id: "dowjones" },
            { name: "标普500", change: "+0.40%", isPositive: true, top: "45%", left: "20%", id: "sp500" },
            { name: "纳斯达克", change: "+0.24%", isPositive: true, top: "48%", left: "19%", id: "nasdaq" },
            { name: "巴西IBOV", change: "-0.15%", isPositive: false, top: "68%", left: "30%", id: "ibov" },


            // 欧洲
            { name: "英国富时", change: "+0.18%", isPositive: true, top: "35%", left: "45%", id: "ftse" },
            { name: "德国DAX", change: "+0.47%", isPositive: true, top: "38%", left: "49%", id: "dax" },
            { name: "法国CAC", change: "+0.84%", isPositive: true, top: "40%", left: "47%", id: "cac" },
            { name: "俄罗斯RTS", change: "-0.50%", isPositive: false, top: "30%", left: "58%", id: "rts" },


            // 亚洲
            { name: "上证指数", change: "+0.12%", isPositive: true, top: "40%", left: "78%", id: "sse" },
            { name: "日经225", change: "-1.10%", isPositive: false, top: "35%", left: "86%", id: "nikkei" },
            { name: "恒生指数", change: "+0.68%", isPositive: true, top: "46%", left: "80%", id: "hsi" },
            { name: "印度NIFTY", change: "+0.05%", isPositive: true, top: "50%", left: "69%", id: "nifty" },


            // 大洋洲
            { name: "澳大利亚ASX", change: "-0.33%", isPositive: false, top: "78%", left: "90%", id: "asx" }
        ];

        // Mock data for different indices
        this.indexSpecificData = {
            "default": {
                trendData: this.generateTrendData(4200, 7),
                industryData: [28.5, 22.3, 18.7, 30.5],
                riskData: [65, 78, 45, 32, 58, 42],
                statCards: {
                    totalMarketCap: { value: 45.2, change: 2.3, isPositive: true, unit: 'T' },
                    tradingVolume: { value: 2.8, change: 5.7, isPositive: true, unit: 'T' },
                    volatilityIndex: { value: 18.5, change: -1.2, isPositive: false, unit: '' },
                    activeMarkets: { value: 156, change: 3, isPositive: true, unit: '' }
                }
            },
            "dowjones": {
                trendData: this.generateTrendData(38000, 7),
                industryData: [35, 20, 15, 25],
                riskData: [50, 80, 60, 40, 70, 30],
                statCards: {
                    totalMarketCap: { value: 25.5, change: 0.8, isPositive: true, unit: 'T' },
                    tradingVolume: { value: 1.5, change: 2.1, isPositive: true, unit: 'T' },
                    volatilityIndex: { value: 15.2, change: -0.5, isPositive: false, unit: '' },
                    activeMarkets: { value: 30, change: 0, isPositive: true, unit: '' }
                }
            },
            "nasdaq": {
                trendData: this.generateTrendData(17000, 7),
                industryData: [50, 10, 5, 20],
                riskData: [75, 60, 80, 50, 65, 55],
                statCards: {
                    totalMarketCap: { value: 18.3, change: 1.5, isPositive: true, unit: 'T' },
                    tradingVolume: { value: 2.1, change: 4.8, isPositive: true, unit: 'T' },
                    volatilityIndex: { value: 25.1, change: 2.3, isPositive: true, unit: '' },
                    activeMarkets: { value: 100, change: 5, isPositive: true, unit: '' }
                }
            },
            "sse": {
                trendData: this.generateTrendData(3000, 7),
                industryData: [20, 30, 25, 15],
                riskData: [70, 50, 65, 70, 40, 80],
                statCards: {
                    totalMarketCap: { value: 10.1, change: -0.2, isPositive: false, unit: 'T' },
                    tradingVolume: { value: 0.8, change: 1.1, isPositive: true, unit: 'T' },
                    volatilityIndex: { value: 20.3, change: 0.8, isPositive: true, unit: '' },
                    activeMarkets: { value: 50, change: 1, isPositive: true, unit: '' }
                }
            },
            "nikkei": {
                trendData: this.generateTrendData(39000, 7),
                industryData: [22, 28, 15, 30],
                riskData: [40, 70, 55, 35, 60, 45],
                statCards: {
                    totalMarketCap: { value: 6.5, change: -1.1, isPositive: false, unit: 'T' },
                    tradingVolume: { value: 0.6, change: -0.5, isPositive: false, unit: 'T' },
                    volatilityIndex: { value: 16.8, change: -0.3, isPositive: false, unit: '' },
                    activeMarkets: { value: 25, change: 0, isPositive: true, unit: '' }
                }
            }
            // Add more index-specific data as needed
        };

        this.currentActiveIndex = "default"; // Track the currently displayed index data
        this.liveDataInterval = null; // To clear the live data refresh interval
        this.init();
    }


    init() {
        this.renderIndexMap();
        this.renderPerformanceList();
        this.initCharts();
        this.updateDashboardForIndex(this.currentActiveIndex); // Initialize with default data
        this.startLiveTime();
        // We'll manage data refresh dynamically
        // this.startDataRefresh();
    }


    renderIndexMap() {
        const mapContainer = document.getElementById('mapContainer');


        // 清除现有的点位和连接线
        const existingElements = mapContainer.querySelectorAll('.index-point-wrapper');
        existingElements.forEach(el => el.remove());


        this.mockIndexData.forEach((index, i) => {
            setTimeout(() => {
                const wrapper = document.createElement('div');
                wrapper.className = 'index-point-wrapper';
                wrapper.style.top = index.top;
                wrapper.style.left = index.left;
                wrapper.dataset.indexId = index.id; // Store index ID

                // Add click listener to the wrapper
                wrapper.addEventListener('click', () => {
                    this.updateDashboardForIndex(index.id);
                });


                const dot = document.createElement('div');
                dot.className = `index-dot ${index.isPositive ? 'positive' : 'negative'}`;


                const card = document.createElement('div');
                card.className = 'index-info-card';
                card.innerHTML = `
                    <div class="index-info-card-name">${index.name}</div>
                    <div class="index-info-card-change ${index.isPositive ? 'positive' : 'negative'}">${index.change}</div>
                `;


                // 创建L形连接线段
                const lineH = document.createElement('div');
                lineH.className = 'connection-line line-h';


                const lineV = document.createElement('div');
                lineV.className = 'connection-line line-v';


                wrapper.appendChild(lineH);
                wrapper.appendChild(lineV);
                wrapper.appendChild(dot); // dot should be on top of lines
                wrapper.appendChild(card);
                mapContainer.appendChild(wrapper);


                // --- 计算卡片和连接线位置 ---
                const dotCenterX = 0;
                const dotCenterY = 0;
                const estimatedCardWidth = 90;
                const estimatedCardHeight = 40;
                const dotLeftPercentage = parseFloat(index.left);
                const dotTopPercentage = parseFloat(index.top);


                let cardOffsetX = 0;
                let cardOffsetY = 0;
                const verticalOffsets = [-45, 25, -25, 45, -10, 10];
                const baseHorizontalOffset = 20;


                // 根据点位位置调整初始偏移方向和垂直偏移
                if (dotLeftPercentage < 35) { // 靠左
                    cardOffsetX = baseHorizontalOffset;
                    cardOffsetY = verticalOffsets[(i * 2) % verticalOffsets.length];
                } else if (dotLeftPercentage > 65) { // 靠右
                    cardOffsetX = -estimatedCardWidth - baseHorizontalOffset;
                    cardOffsetY = verticalOffsets[(i * 2 + 1) % verticalOffsets.length];
                } else { // 中间
                    cardOffsetX = dotTopPercentage < 50 ? baseHorizontalOffset : -estimatedCardWidth - baseHorizontalOffset;
                    cardOffsetY = verticalOffsets[(i * 2) % verticalOffsets.length];
                }


                // 水平方向上的微调，进一步错开
                cardOffsetX += (i % 3 - 1) * 15;


                const cardLeft = dotCenterX + cardOffsetX;
                const cardTop = dotCenterY + cardOffsetY;


                card.style.left = `${cardLeft}px`;
                card.style.top = `${cardTop}px`;


                // --- L形连接线绘制 ---
                const hLineStartX = dotCenterX;
                const hLineStartY = dotCenterY;
                let hLineEndX;


                if (cardOffsetX > 0) { // 卡片在右侧
                    hLineEndX = cardLeft;
                } else { // 卡片在左侧
                    hLineEndX = cardLeft + estimatedCardWidth;
                }


                lineH.style.left = `${Math.min(hLineStartX, hLineEndX)}px`;
                lineH.style.top = `${hLineStartY}px`;
                lineH.style.width = `${Math.abs(hLineEndX - hLineStartX)}px`;
                lineH.style.height = `1px`;


                const vLineStartX = hLineEndX;
                const vLineStartY = hLineStartY;
                const vLineEndY = cardTop + estimatedCardHeight / 2;


                lineV.style.left = `${vLineStartX}px`;
                lineV.style.top = `${Math.min(vLineStartY, vLineEndY)}px`;
                lineV.style.height = `${Math.abs(vLineEndY - vLineStartY)}px`;
                lineV.style.width = `1px`;


                wrapper.style.opacity = '0';
                wrapper.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    wrapper.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    wrapper.style.opacity = '1';
                    wrapper.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 50);
            }, i * 80);
        });
    }


    renderPerformanceList() {
        const performanceList = document.getElementById('performanceList');
        const sortedData = [...this.mockIndexData].sort((a, b) => {
            return parseFloat(b.change) - parseFloat(a.change);
        });


        performanceList.innerHTML = '';
        sortedData.slice(0, 13).forEach((item, index) => {
            const performanceItem = document.createElement('div');
            performanceItem.className = 'performance-item';
            performanceItem.innerHTML = `
                <div class="performance-name">${index + 1}. ${item.name}</div>
                <div class="performance-change ${item.isPositive ? 'positive' : 'negative'}">
                    ${item.isPositive ? '▲' : '▼'} ${item.change}
                </div>
            `;
            performanceList.appendChild(performanceItem);
        });
    }


    initCharts() {
        this.charts.trendChart = echarts.init(document.getElementById('trendChart'));
        this.charts.industryChart = echarts.init(document.getElementById('industryChart'));
        this.charts.riskChart = echarts.init(document.getElementById('riskChart'));
    }

    updateDashboardForIndex(indexId) {
        this.currentActiveIndex = indexId; // Update the active index
        const data = this.indexSpecificData[indexId] || this.indexSpecificData["default"];

        this.updateTrendChart(data.trendData);
        this.updateIndustryChart(data.industryData);
        this.updateRiskChart(data.riskData);
        this.updateStatCards(data.statCards);

        // Clear existing live data refresh if any, and start a new one for the selected index
        if (this.liveDataInterval) {
            clearInterval(this.liveDataInterval);
        }
        this.startDataRefreshForIndex(indexId);
    }


    updateTrendChart(data) {
        const dates = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            dates.push((date.getMonth() + 1) + '/' + date.getDate());
        }

        const option = {
            animation: true,
            animationDuration: 1000,
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#E2E8F0', /* Light text for dark background */
                    fontSize: 8
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#E2E8F0', /* Light text for dark background */
                    fontSize: 8
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(241, 245, 249, 0.1)', /* Lighter split lines */
                        type: 'dashed'
                    }
                }
            },
            series: [{
                type: 'line',
                smooth: true,
                data: data,
                lineStyle: {
                    color: '#3B82F6', /* Accent blue line */
                    width: 2
                },
                itemStyle: { color: '#3B82F6' }, /* Accent blue points */
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, /* Accent blue area */
                        { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                    ])
                }
            }]
        };
        this.charts.trendChart.setOption(option);
    }


    updateIndustryChart(data) {
        const option = {
            animation: true,
            animationDuration: 1000,
            grid: {
                left: '8%',
                right: '8%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['科技', '金融', '医疗', '消费'],
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#E2E8F0', /* Light text for dark background */
                    fontSize: 8
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#E2E8F0', /* Light text for dark background */
                    fontSize: 8,
                    formatter: '{value}%'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(241, 245, 249, 0.1)', /* Lighter split lines */
                        type: 'dashed'
                    }
                }
            },
            series: [{
                type: 'bar',
                data: data,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#3B82F6' }, /* Accent blue bars */
                        { offset: 1, color: '#667eea' }
                    ]),
                    borderRadius: [2, 2, 0, 0]
                },
                barWidth: '50%'
            }]
        };
        this.charts.industryChart.setOption(option);
    }


    updateRiskChart(data) {
        const option = {
            animation: true,
            animationDuration: 1000,
            radar: {
                indicator: [
                    { name: '波动率', max: 100 },
                    { name: '流动性', max: 100 },
                    { name: '相关性', max: 100 },
                    { name: '杠杆率', max: 100 },
                    { name: '集中度', max: 100 },
                    { name: '信用风险', max: 100 }
                ],
                shape: 'polygon',
                splitNumber: 4,
                axisName: {
                    color: '#E2E8F0', /* Light text for dark background */
                    fontSize: 8
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(241, 245, 249, 0.3)'
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)'] /* Accent blue tints */
                    }
                },
                radius: '50%'
            },
            series: [{
                type: 'radar',
                data: [
                    {
                        value: data,
                        name: '当前风险水平',
                        itemStyle: { color: '#3B82F6' }, /* Accent blue point */
                        areaStyle: {
                            color: 'rgba(59, 130, 246, 0.3)' /* Accent blue area */
                        },
                        lineStyle: {
                            color: '#3B82F6', /* Accent blue line */
                            width: 2
                        }
                    }
                ]
            }]
        };
        this.charts.riskChart.setOption(option);
    }


    generateTrendData(baseValue, days) {
        const data = [];
        let currentValue = baseValue;
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * baseValue * 0.015;
            currentValue += change;
            data.push(Math.round(currentValue));
        }
        return data;
    }


    startLiveTime() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            document.getElementById('liveTime').textContent = timeStr;
        };


        updateTime();
        setInterval(updateTime, 1000);
    }


    startDataRefreshForIndex(indexId) {
        // Clear any existing interval to prevent multiple simultaneous updates
        if (this.liveDataInterval) {
            clearInterval(this.liveDataInterval);
        }

        this.liveDataInterval = setInterval(() => {
            // Only update the map index data for display in map cards
            this.mockIndexData.forEach(item => {
                const currentChange = parseFloat(item.change.replace('%', ''));
                const variation = (Math.random() - 0.5) * 0.08;
                const newChange = (currentChange + variation).toFixed(2);
                item.change = (newChange >= 0 ? '+' : '') + newChange + '%';
                item.isPositive = newChange >= 0;
            });
            this.renderIndexMap(); // Re-render map to show updated changes

            // For other components, get updated data from the index-specific data
            const currentData = this.indexSpecificData[indexId] || this.indexSpecificData["default"];

            // Simulate slight changes for the selected index's data
            currentData.trendData = this.generateTrendData(currentData.trendData[currentData.trendData.length - 1], 7);
            currentData.industryData = currentData.industryData.map(val => Math.min(Math.max(val + (Math.random() - 0.5) * 1, 10), 40));
            currentData.riskData = currentData.riskData.map(val => Math.min(Math.max(val + (Math.random() - 0.5) * 5, 20), 90));

            // Update stat cards dynamically
            const updatedStatCards = {};
            for (const key in currentData.statCards) {
                const original = currentData.statCards[key];
                const variation = (Math.random() - 0.5) * 0.1;
                let newValue = (original.value + variation);
                let newChange = (original.change + (Math.random() - 0.5) * 0.5);

                if (key === 'activeMarkets') { // Active markets should be integer
                    newValue = Math.round(newValue);
                    newChange = Math.round(newChange);
                } else {
                    newValue = parseFloat(newValue.toFixed(original.unit ? 1 : 0));
                    newChange = parseFloat(newChange.toFixed(1));
                }
                
                updatedStatCards[key] = {
                    value: newValue,
                    change: newChange,
                    isPositive: newChange >= 0,
                    unit: original.unit
                };
            }
            currentData.statCards = updatedStatCards;


            this.updateTrendChart(currentData.trendData);
            this.updateIndustryChart(currentData.industryData);
            this.updateRiskChart(currentData.riskData);
            this.updateStatCards(currentData.statCards);

        }, 5000); // Refresh every 5 seconds for demonstration
    }


    updateStatCards(dataToUse) {
        // Use the dataToUse object, which comes from indexSpecificData[indexId].statCards
        const cards = [
            { id: 'totalMarketCap', label: '全球市值', unit: 'T' },
            { id: 'tradingVolume', label: '交易量', unit: 'T' },
            { id: 'volatilityIndex', label: '波动率指数', unit: '' },
            { id: 'activeMarkets', label: '活跃市场', unit: '' }
        ];

        cards.forEach(card => {
            const cardData = dataToUse[card.id];
            if (cardData) {
                const valueElement = document.getElementById(card.id);
                const changeElement = valueElement.nextElementSibling.nextElementSibling; // Get the .stat-change element

                valueElement.textContent = `${card.unit ? '$' : ''}${cardData.value}${card.unit}`;
                changeElement.textContent = `${cardData.change >= 0 ? '+' : ''}${cardData.change}${card.unit === 'T' ? '%' : ''}`; // Add % for T units to make sense
                changeElement.className = `stat-change ${cardData.isPositive ? 'positive' : 'negative'}`;
            }
        });
    }
}


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new FinancialDashboard();


    // 窗口大小变化时重新调整图表
    window.addEventListener('resize', () => {
        Object.values(dashboard.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    });
});
