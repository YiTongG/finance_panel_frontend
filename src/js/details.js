
// 返回上一页功能
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // 如果没有历史记录，可以跳转到默认页面
        window.location.href = '/';
    }
}

class StockDashboard {
    constructor() {
        this.activePeriod = '1D';
        this.chart = null;
        this.isUpdating = false;

        // 时间段配置
        this.timePeriods = {
            '1D': { label: '1D' },
            '5D': { label: '5D' },
            '1M': { label: '1M' },
            '6M': { label: '6M' },
            'YTD': { label: '年初至今' },
            '1Y': { label: '1年' },
            '5Y': { label: '5年' },
            'ALL': { label: '全部' }
        };

        // 时间信息配置
        this.timeInfoMap = {
            '1D': {
                startLabel: '开盘价格',
                rangeLabel: '日内波动',
                subtitle: '今日交易 • 美国东部时间'
            },
            '5D': {
                startLabel: '周初价格',
                rangeLabel: '5日波动',
                subtitle: '本周交易 • 5个交易日'
            },
            '1M': {
                startLabel: '月初价格',
                rangeLabel: '月度波动',
                subtitle: '本月表现 • 30个交易日'
            },
            '6M': {
                startLabel: '期初价格',
                rangeLabel: '半年波动',
                subtitle: '半年表现 • 6个月周期'
            },
            'YTD': {
                startLabel: '年初价格',
                rangeLabel: '年度波动',
                subtitle: '年初至今 • 2025年表现'
            },
            '1Y': {
                startLabel: '年前价格',
                rangeLabel: '年度波动',
                subtitle: '过去一年 • 12个月表现'
            },
            '5Y': {
                startLabel: '5年前价格',
                rangeLabel: '5年波动',
                subtitle: '五年表现 • 长期投资视角'
            },
            'ALL': {
                startLabel: '历史起始价',
                rangeLabel: '历史波动',
                subtitle: '全部历史 • 长期增长轨迹'
            }
        };

        this.initializePeriodData();
        this.init();
    }

    // 初始化所有时间段的数据
    initializePeriodData() {
        this.periodData = {
            '1D': {
                data: this.generateDayData(),
                volume: this.generateVolumeData(24)
            },
            '5D': {
                data: this.generateWeekData(),
                volume: this.generateVolumeData(120)
            },
            '1M': {
                data: this.generateMonthData(),
                volume: this.generateVolumeData(30)
            },
            '6M': {
                data: this.generateSixMonthData(),
                volume: this.generateVolumeData(180)
            },
            'YTD': {
                data: this.generateYTDData(),
                volume: this.generateVolumeData(200)
            },
            '1Y': {
                data: this.generateYearData(),
                volume: this.generateVolumeData(365)
            },
            '5Y': {
                data: this.generateFiveYearData(),
                volume: this.generateVolumeData(1825)
            },
            'ALL': {
                data: this.generateAllTimeData(),
                volume: this.generateVolumeData(3650)
            }
        };
    }

    // 初始化
    init() {
        this.initChart();
        this.bindEvents();
        this.updateAllData();
    }

    // 绑定事件
    bindEvents() {
        // 时间范围按钮事件
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.changePeriod(period);
            });
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
    }

    // 生成数据的方法们 - 确保数据的一致性和可预测性
    generateDayData() {
        const data = [];
        const basePrice = 332.11;
        let currentPrice = basePrice;

        for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}` : i;
            const change = (Math.sin(i * 0.5) + Math.random() * 0.5 - 0.25) * 2;
            currentPrice += change;
            if (i === 23) {
                currentPrice = 332.56;
            }
            data.push([`${hour}:00`, Math.max(currentPrice, 300)]);
        }
        return data;
    }

    generateWeekData() {
        const data = [];
        const basePrice = 330.12;
        let currentPrice = basePrice;
        let pointCount = 0;
        const totalPoints = 60;

        for (let day = 0; day < 5; day++) {
            for (let hour = 0; hour < 24; hour += 2) {
                const progress = pointCount / (totalPoints - 1);
                const targetPrice = 332.56;
                const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
                const noise = (Math.random() - 0.5) * 3;
                currentPrice = interpolatedPrice + noise;

                if (pointCount === totalPoints - 1) {
                    currentPrice = targetPrice;
                }

                data.push([`7/${21 + day} ${hour}:00`, Math.max(currentPrice, 300)]);
                pointCount++;
            }
        }
        return data;
    }

    generateMonthData() {
        const data = [];
        const basePrice = 324.80;
        const targetPrice = 332.56;

        for (let i = 1; i <= 30; i++) {
            const progress = (i - 1) / 29;
            const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
            const noise = (Math.random() - 0.5) * 6;
            let currentPrice = interpolatedPrice + noise;

            if (i === 30) {
                currentPrice = targetPrice;
            }

            data.push([`6/${i}`, Math.max(currentPrice, 280)]);
        }
        return data;
    }

    generateSixMonthData() {
        const data = [];
        const basePrice = 315.20;
        const targetPrice = 332.56;
        const months = ['2月', '3月', '4月', '5月', '6月', '7月'];
        let pointCount = 0;
        const totalPoints = 24;

        for (let month = 0; month < 6; month++) {
            for (let week = 1; week <= 4; week++) {
                const progress = pointCount / (totalPoints - 1);
                const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
                const noise = (Math.random() - 0.5) * 10;
                let currentPrice = interpolatedPrice + noise;

                if (pointCount === totalPoints - 1) {
                    currentPrice = targetPrice;
                }

                data.push([`${months[month]}第${week}周`, Math.max(currentPrice, 250)]);
                pointCount++;
            }
        }
        return data;
    }

    generateYTDData() {
        const data = [];
        const basePrice = 298.45;
        const targetPrice = 332.56;
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月'];

        for (let i = 0; i < months.length; i++) {
            const progress = i / (months.length - 1);
            const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
            const noise = (Math.random() - 0.5) * 15;
            let currentPrice = interpolatedPrice + noise;

            if (i === months.length - 1) {
                currentPrice = targetPrice;
            }

            data.push([months[i], Math.max(currentPrice, 240)]);
        }
        return data;
    }

    generateYearData() {
        const data = [];
        const basePrice = 287.89;
        const targetPrice = 332.56;
        const months = ['2024/7', '2024/8', '2024/9', '2024/10', '2024/11', '2024/12',
            '2025/1', '2025/2', '2025/3', '2025/4', '2025/5', '2025/6', '2025/7'];

        for (let i = 0; i < months.length; i++) {
            const progress = i / (months.length - 1);
            const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
            const noise = (Math.random() - 0.5) * 20;
            let currentPrice = interpolatedPrice + noise;

            if (i === months.length - 1) {
                currentPrice = targetPrice;
            }

            data.push([months[i], Math.max(currentPrice, 180)]);
        }
        return data;
    }

    generateFiveYearData() {
        const data = [];
        const basePrice = 145.67;
        const targetPrice = 332.56;
        let pointCount = 0;
        const totalPoints = 23;

        for (let year = 2020; year <= 2025; year++) {
            for (let quarter = 1; quarter <= 4; quarter++) {
                if (year === 2025 && quarter > 3) break;

                const progress = pointCount / (totalPoints - 1);
                const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
                const noise = (Math.random() - 0.5) * 25;
                let currentPrice = interpolatedPrice + noise;

                if (pointCount === totalPoints - 1) {
                    currentPrice = targetPrice;
                }

                data.push([`${year}Q${quarter}`, Math.max(currentPrice, 80)]);
                pointCount++;
            }
        }
        return data;
    }

    generateAllTimeData() {
        const data = [];
        const basePrice = 28.34;
        const targetPrice = 332.56;
        const years = [];

        for (let year = 2015; year <= 2025; year++) {
            years.push(year);
        }

        for (let i = 0; i < years.length; i++) {
            const progress = i / (years.length - 1);
            const interpolatedPrice = basePrice + (targetPrice - basePrice) * progress;
            const noise = (Math.random() - 0.5) * 30;
            let currentPrice = interpolatedPrice + noise;

            if (i === years.length - 1) {
                currentPrice = targetPrice;
            }

            data.push([years[i].toString(), Math.max(currentPrice, 20)]);
        }
        return data;
    }

    generateVolumeData(points) {
        const data = [];
        for (let i = 0; i < points; i++) {
            data.push(Math.floor(Math.random() * 100000000) + 20000000);
        }
        return data;
    }

    // 格式化成交量
    formatVolume(volume) {
        if (volume >= 1000000000) {
            return (volume / 1000000000).toFixed(1) + 'B';
        } else if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return Math.floor(volume).toString();
    }

    // 计算当前时间段的数据
    calculateData() {
        const currentData = this.periodData[this.activePeriod];
        const data = currentData.data;
        const volume = currentData.volume;

        if (!data || data.length === 0) {
            return this.getEmptyData();
        }

        const prices = data.map(item => item[1]);
        const startPrice = prices[0];
        const currentPrice = prices[prices.length - 1];
        const changeAmount = currentPrice - startPrice;
        const changePercent = ((changeAmount / startPrice) * 100);
        const highPrice = Math.max(...prices);
        const lowPrice = Math.min(...prices);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
        const volatility = (Math.sqrt(variance) / avgPrice) * 100;
        const totalVolume = volume.reduce((sum, vol) => sum + vol, 0);
        const avgVolume = totalVolume / volume.length;
        const sharesOutstanding = 3.22;
        const marketCap = (currentPrice * sharesOutstanding);
        const eps = 1.76;
        const peRatio = eps > 0 ? (currentPrice / eps) : 0;
        const targetPrice = currentPrice * (1.08 + (Math.random() * 0.1 - 0.05));

        return {
            currentPrice: currentPrice.toFixed(2),
            changeAmount: changeAmount.toFixed(2),
            changePercent: changePercent.toFixed(2),
            startPrice: startPrice.toFixed(2),
            highPrice: highPrice.toFixed(2),
            lowPrice: lowPrice.toFixed(2),
            avgPrice: avgPrice.toFixed(2),
            priceRange: `${lowPrice.toFixed(2)} - ${highPrice.toFixed(2)}`,
            marketCap: marketCap.toFixed(2) + '万亿',
            peRatio: peRatio.toFixed(2),
            targetPrice: targetPrice.toFixed(2),
            volatility: volatility.toFixed(2),
            dataPoints: data.length.toString(),
            chartEndPrice: currentPrice.toFixed(2),
            priceChangeValue: changeAmount.toFixed(2),
            isPositive: changeAmount >= 0
        };
    }

    getEmptyData() {
        return {
            currentPrice: '0.00', changeAmount: '0.00', changePercent: '0.00',
            startPrice: '0.00', highPrice: '0.00', lowPrice: '0.00',
            priceRange: '0.00 - 0.00', marketCap: '0', peRatio: '0.00',
            targetPrice: '0.00', avgPrice: '0.00', volatility: '0.00',
            dataPoints: '0', chartEndPrice: '0.00', priceChangeValue: '0.00',
            isPositive: false
        };
    }

    // 更新所有数据显示
    updateAllData() {
        const calculatedData = this.calculateData();
        const timeInfo = this.timeInfoMap[this.activePeriod];

        // 更新主要价格信息
        document.getElementById('currentPrice').textContent = calculatedData.currentPrice;
        document.getElementById('priceSubtitle').textContent = timeInfo.subtitle;

        const priceChangeEl = document.getElementById('priceChange');
        priceChangeEl.className = `price-change ${calculatedData.isPositive ? 'positive' : 'negative'}`;

        const changeIcon = document.getElementById('changeIcon');
        changeIcon.textContent = calculatedData.isPositive ? '📈' : '📉';

        document.getElementById('changeAmount').textContent =
            (calculatedData.isPositive ? '+' : '') + calculatedData.changeAmount;
        document.getElementById('changePercent').textContent =
            '(' + (calculatedData.isPositive ? '+' : '') + calculatedData.changePercent + '%)';

        // 更新数据表格
        document.getElementById('startLabel').textContent = timeInfo.startLabel;
        document.getElementById('rangeLabel').textContent = timeInfo.rangeLabel;

        document.getElementById('startPrice').textContent = calculatedData.startPrice;
        document.getElementById('chartEndPrice').textContent = calculatedData.chartEndPrice;
        document.getElementById('priceChangeValue').textContent = calculatedData.priceChangeValue;
        document.getElementById('highPrice').textContent = calculatedData.highPrice;
        document.getElementById('lowPrice').textContent = calculatedData.lowPrice;
        document.getElementById('priceRange').textContent = calculatedData.priceRange;
        document.getElementById('avgPrice').textContent = calculatedData.avgPrice;
        document.getElementById('volatility').textContent = calculatedData.volatility + '%';
        document.getElementById('dataPoints').textContent = calculatedData.dataPoints;
        document.getElementById('marketCap').textContent = calculatedData.marketCap;
        document.getElementById('peRatio').textContent = calculatedData.peRatio;
        document.getElementById('targetPrice').textContent = calculatedData.targetPrice;

        // 更新图表
        this.updateChart();
    }

    // 初始化图表
    initChart() {
        this.chart = echarts.init(document.getElementById('stockChart'));
    }

    // 更新图表
    updateChart() {
        const currentData = this.periodData[this.activePeriod];
        const priceData = currentData.data;
        const volumeData = currentData.volume;
        const calculatedData = this.calculateData();

        if (!priceData || priceData.length === 0) return;

        const option = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            grid: [
                {
                    left: '3%',
                    right: '4%',
                    top: '5%',
                    height: '75%'
                },
                {
                    left: '3%',
                    right: '4%',
                    top: '85%',
                    height: '10%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: priceData.map(item => item[0]),
                    axisLine: {
                        lineStyle: {
                            color: '#e2e8f0',
                            width: 1
                        }
                    },
                    axisLabel: {
                        color: '#64748b',
                        fontSize: 10,
                        fontWeight: 500
                    },
                    axisTick: { show: false },
                    splitLine: { show: false }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: priceData.map(item => item[0]),
                    axisLine: {
                        lineStyle: {
                            color: '#e2e8f0',
                            width: 1
                        }
                    },
                    axisLabel: {
                        color: '#64748b',
                        fontSize: 9
                    },
                    axisTick: { show: false }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    position: 'right',
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: {
                        color: '#64748b',
                        fontSize: 10,
                        fontWeight: 500,
                        formatter: '${value}'
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f1f5f9',
                            width: 1,
                            type: 'dashed'
                        }
                    }
                },
                {
                    type: 'value',
                    gridIndex: 1,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { show: false },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '股价',
                    type: 'line',
                    data: priceData.map(item => item[1]),
                    smooth: 0.3,
                    lineStyle: {
                        color: calculatedData.isPositive ? '#10b981' : '#ef4444',
                        width: 3,
                        shadowColor: calculatedData.isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        shadowBlur: 8,
                        shadowOffsetY: 2
                    },
                    itemStyle: {
                        color: calculatedData.isPositive ? '#10b981' : '#ef4444',
                        borderWidth: 0
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: calculatedData.isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                                },
                                {
                                    offset: 0.8,
                                    color: calculatedData.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                },
                                {
                                    offset: 1,
                                    color: calculatedData.isPositive ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                                }
                            ]
                        }
                    },
                    symbol: 'circle',
                    symbolSize: 0,
                    emphasis: {
                        focus: 'series',
                        symbolSize: 6,
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 2,
                            shadowColor: calculatedData.isPositive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                            shadowBlur: 8
                        }
                    }
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumeData,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#cbd5e1' },
                                { offset: 1, color: '#e2e8f0' }
                            ]
                        },
                        borderRadius: [2, 2, 0, 0]
                    },
                    barWidth: '70%',
                    emphasis: {
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    { offset: 0, color: '#94a3b8' },
                                    { offset: 1, color: '#cbd5e1' }
                                ]
                            }
                        }
                    }
                }
            ],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#64748b',
                        width: 1,
                        type: 'dashed'
                    },
                    lineStyle: {
                        color: '#64748b',
                        width: 1,
                        type: 'dashed'
                    }
                },
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(51, 65, 85, 0.8)',
                borderWidth: 1,
                borderRadius: 10,
                textStyle: {
                    color: '#f1f5f9',
                    fontSize: 12,
                    fontWeight: 500
                },
                padding: [10, 14],
                formatter: function (params) {
                    let result = `<div style="margin-bottom: 6px; font-weight: 600; color: #e2e8f0;">${params[0].axisValue}</div>`;
                    params.forEach(param => {
                        if (param.seriesName === '股价') {
                            result += `<div style="display: flex; align-items: center; margin-bottom: 3px;">
                                        <span style="display: inline-block; width: 6px; height: 6px; background: ${param.color}; border-radius: 50%; margin-right: 6px;"></span>
                                        <span>股价: <strong>$${param.value.toFixed(2)}</strong></span>
                                    </div>`;
                        } else if (param.seriesName === '成交量') {
                            result += `<div style="display: flex; align-items: center;">
                                        <span style="display: inline-block; width: 6px; height: 6px; background: ${param.color}; border-radius: 2px; margin-right: 6px;"></span>
                                        <span>成交量: <strong>${(param.value / 1000000).toFixed(1)}M</strong></span>
                                    </div>`;
                        }
                    });
                    return result;
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true
                }
            ]
        };

        this.chart.setOption(option, true);
    }

    // 切换时间段
    changePeriod(period) {
        if (this.activePeriod === period) return;

        this.activePeriod = period;
        this.isUpdating = true;

        // 更新按钮状态
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');

        // 添加更新动画
        const priceValue = document.getElementById('currentPrice');
        priceValue.classList.add('price-updating');

        // 添加图表切换动画
        const chartContainer = document.getElementById('stockChart');
        chartContainer.style.opacity = '0.7';

        setTimeout(() => {
            this.updateAllData();
            chartContainer.style.opacity = '1';
            priceValue.classList.remove('price-updating');
            this.isUpdating = false;
        }, 400);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    new StockDashboard();
});
