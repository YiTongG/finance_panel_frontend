import { IndicesAPI } from '/src/config/api-config.js';

// Function to initialize and render the Region Trend Pie Chart
async function initRegionTrendChart() {
    const chartDom = document.getElementById('regionTrendChart');
    if (!chartDom) {
        console.error("Region Trend Chart container not found.");
        return;
    }
    const regionTrendChart = echarts.init(chartDom);

    try {
        const data = await IndicesAPI.getRegionTrend();
        console.log("Region Trend Data:", data);

        const seriesData = data.map(item => ({
            name: item.region,
            value: item.count
        }));
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '73%',
                left: 'center',
                textStyle: {
                    color: '#e0e0e0' // 例如，浅灰色文字，适合深色背景
                }
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '38%'],
                    avoidLabelOverlap: false,
                    padAngle: 5,
                    itemStyle: {
                        borderRadius: 10
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: seriesData
                }
            ]
        };
        regionTrendChart.setOption(option);

        window.addEventListener('resize', () => {
            regionTrendChart.resize();
        });

    } catch (error) {
        console.error("Failed to fetch or render region trend data:", error);
    }
}

async function initMarketPerformance() {
    const performanceListDom = document.getElementById('performanceList');
    if (!performanceListDom) {
        console.error("Market Performance List container not found.");
        return;
    }
    try {
        const indexes = await IndicesAPI.getIndexes();
        console.log("Indexes Data:", indexes); // Log the data to inspect its structure

        performanceListDom.innerHTML = ''; // Clear existing content

        if (!Array.isArray(indexes) || indexes.length === 0) {
            performanceListDom.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">No market performance data available.</div>';
            return;
        }

        indexes.forEach((item) => {
            const changeStr = String(item.change);
            const changeClass = changeStr.startsWith('+') ? 'positive' : 'negative';

            const listItem = document.createElement('div');
            listItem.classList.add('performance-item', changeClass);
            // {/* <span class="performance-rank">${index + 1}.</span> */}
            listItem.innerHTML = `           
                <div class="performance-item-left">
                    <span class="performance-name">${item.name}</span>
                </div>
                <div class="performance-item-right">
                    <span class="performance-change ${item.change.includes('+') ? 'positive' : 'negative'}">${item.change}</span>
                </div>           
            `;
            performanceListDom.appendChild(listItem);
        });

    } catch (error) {
        console.error("Failed to fetch or render market performance data:", error);
        performanceListDom.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Failed to load market performance data. Please check the API.</div>';
    }
}

// Global variable to hold the news scrolling content element
let newsScrollContent = null;
let resizeObserver = null; //

async function initNewsRecommendation() {
    const newsListDom = document.getElementById('newsList');
    if (!newsListDom) {
        console.error("News List container not found.");
        return;
    }

    if (!newsScrollContent) {
        newsScrollContent = document.createElement('div');
        newsScrollContent.classList.add('news-scroll-content');
        newsListDom.appendChild(newsScrollContent);
    } else {
        newsScrollContent.innerHTML = '';
    }

    newsScrollContent.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">Loading recent news...</div>';

    const MAX_RETRIES = 5;
    const INITIAL_DELAY_MS = 1000;

    function duplicateContent() {
        const existingDuplicates = newsScrollContent.querySelectorAll('.duplicated');
        existingDuplicates.forEach(el => el.remove());

        const originalItems = Array.from(newsScrollContent.querySelectorAll('.news-item:not(.duplicated)'));

        if (originalItems.length === 0) {
            return;
        }

        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('duplicated');
            newsScrollContent.appendChild(clone);
        });

        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('duplicated');
            newsScrollContent.appendChild(clone);
        });
    }

    function setupScrollAnimation() {
        const newsListHeight = newsListDom.clientHeight;
        const contentHeight = newsScrollContent.scrollHeight;

        if (contentHeight <= newsListHeight) {
            newsScrollContent.style.animation = 'none';
            newsScrollContent.style.transform = 'translateY(0)';
            return;
        }

        let originalContentTotalHeight = 0;
        const originalNewsItems = newsScrollContent.querySelectorAll('.news-item:not(.duplicated)');
        originalNewsItems.forEach(item => {
            originalContentTotalHeight += item.offsetHeight + parseFloat(getComputedStyle(item).marginBottom || '0');
        });

        newsScrollContent.style.setProperty('--scroll-distance', `-${originalContentTotalHeight}px`);

        const scrollSpeedPxPerSec = 40;
        const duration = originalContentTotalHeight / scrollSpeedPxPerSec;

        newsScrollContent.style.setProperty('--scroll-duration', `${duration}s`);
        newsScrollContent.style.animation = `scroll-up var(--scroll-duration, ${duration}s) linear infinite`;
    }

    async function fetchNewsWithRetry(retriesLeft, delay) {
        try {
            const newsData = await IndicesAPI.getNewsRecommendation();
            console.log("News Recommendation Data:", newsData);

            newsScrollContent.innerHTML = '';

            if (!Array.isArray(newsData) || newsData.length === 0) {
                newsScrollContent.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">No recent news available.</div>';
                newsScrollContent.style.animation = 'none';
                return;
            }

            newsData.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');

                // **修改此处：在 news-title 前添加 news-marker**
                newsItem.innerHTML = `
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                        <div class="news-title">● ${item.title}</div>
                    </a>
                `;
                newsScrollContent.appendChild(newsItem);
            });

            duplicateContent();
            setupScrollAnimation();

            if (resizeObserver) {
                resizeObserver.disconnect();
            }

            resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === newsScrollContent) {
                        setupScrollAnimation();
                    }
                }
            });
            resizeObserver.observe(newsScrollContent);


        } catch (error) {
            console.error(`Failed to fetch news. Retries left: ${retriesLeft}. Error:`, error);

            if (retriesLeft > 0) {
                newsScrollContent.innerHTML = `<div style="color: orange; padding: 20px; text-align: center;">Failed to load news. Retrying in ${delay / 1000} seconds...</div>`;
                setTimeout(() => {
                    fetchNewsWithRetry(retriesLeft - 1, delay * 2);
                }, delay);
            } else {
                newsScrollContent.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Failed to load recent news after multiple attempts. Please try again later.</div>';
                newsScrollContent.style.animation = 'none';
            }
        }
    }

    fetchNewsWithRetry(MAX_RETRIES, INITIAL_DELAY_MS);
}

function goToMoreStocks() {
    console.log("Navigating to more stocks page...");
    window.location.href = "stocks.html";
}



class FinancialDashboard {
    constructor() {
        this.charts = {};
        this.mockIndexData = [
            // 北美洲 (North America)
            { name: "Dow Jones Industrial Average", value: "0", change: "+0.47%", isPositive: true, top: "42%", left: "19%", id: "dowjones" }, // 美国 (纽约)
            { name: "S&P 500", value: "0", change: "+0.40%", isPositive: true, top: "45%", left: "20%", id: "sp500" }, // 美国 (纽约附近，略有偏移)
            { name: "NASDAQ Composite", value: "0", change: "+0.24%", isPositive: true, top: "48%", left: "19%", id: "nasdaq" }, // 美国 (纽约附近，略有偏移)
            { name: "S&P/TSX Composite index", value: "0", change: "+0.12%", isPositive: true, top: "35%", left: "17%", id: "S&P/TSX Composite index" }, // 加拿大 (多伦多)

            // 南美洲 (South America)
            { name: "IBOVESPA", value: "0", change: "-0.15%", isPositive: false, top: "68%", left: "30%", id: "IBOVESPA" }, // 巴西 (圣保罗)

            // 欧洲 (Europe)
            { name: "FTSE 100", value: "0", change: "+0.18%", isPositive: true, top: "35%", left: "44%", id: "ftse" }, // 英国 (伦敦)
            { name: "CAC 40", value: "0", change: "+0.84%", isPositive: true, top: "38%", left: "47%", id: "cac" }, // 法国 (巴黎)
            { name: "DAX P", value: "0", change: "+0.47%", isPositive: true, top: "37%", left: "49%", id: "dax" }, // 德国 (法兰克福)

            // 亚洲 (Asia)
            { name: "000001.SS", value: "0", change: "+0.12%", isPositive: true, top: "43%", left: "79%", id: "000001.SS" }, // 中国 (上海) - 调整以避免与深圳重叠
            { name: "399001.SZ", value: "0", change: "+0.12%", isPositive: true, top: "48%", left: "78%", id: "399001.SZ" }, // 中国 (深圳)
            { name: "Hang Seng Index", value: "0", change: "+0.68%", isPositive: true, top: "46%", left: "81%", id: "hsi" }, // 香港
            { name: "Nikkei 225", value: "0", change: "-1.10%", isPositive: false, top: "35%", left: "87%", id: "nikkei" }, // 日本 (东京)
            { name: "KOSPI Composite Index", value: "0", change: "-0.50%", isPositive: false, top: "36%", left: "84%", id: "KOSPI Composite Index" }, // 韩国 (首尔) - 调整以避免与日本重叠
            { name: "NIFTY 50", value: "0", change: "+0.05%", isPositive: true, top: "50%", left: "69%", id: "nifty" }, // 印度 (孟买)

            // 大洋洲 (Oceania)
            { name: "S&P/ASX 200 [XJO]", value: "0", change: "+0.12%", isPositive: true, top: "78%", left: "90%", id: "S&P/ASX 200 [XJO]" }, // 澳大利亚 (悉尼/墨尔本)
        ];

        this.placedCardRects = [];
        // 定义一个基础 z-index 值，用于正常状态下的卡片
        this.baseZIndex = 100;
        // 定义一个悬停时的 z-index 值，要高于所有正常卡片
        this.hoverZIndex = 999;

        this.indicesAPI = typeof IndicesAPI !== 'undefined' ? IndicesAPI : null;

        this.init();
    }


    async init() {
        await this.loadAndMergeIndexData();
        this.renderIndexMap();
        this.updateDashboardForIndex(this.currentActiveIndex);
        this.startLiveTime();
    }

    async loadAndMergeIndexData() {
        if (!this.indicesAPI) {
            console.warn("IndicesAPI not available. Using mockIndexData directly.");
            return;
        }

        try {
            const apiIndexes = await this.indicesAPI.getIndexes();
            if (Array.isArray(apiIndexes) && apiIndexes.length > 0) {
                const apiIndexesMap = new Map(apiIndexes.map(item => [item.name, item]));

                this.mockIndexData = this.mockIndexData.map(mockItem => {
                    const apiItem = apiIndexesMap.get(mockItem.id) || apiIndexesMap.get(mockItem.name);
                    
                    if (apiItem) {
                        const newChange = String(apiItem.change);
                        const isPositive = newChange.startsWith('+');
                        return {
                            ...mockItem,
                            value: apiItem.value,
                            change: newChange,
                            isPositive: isPositive,
                            name: apiItem.name
                        };
                    }
                    return mockItem;
                });
                console.log("Merged Index Data:", this.mockIndexData);
            } else {
                console.warn("IndicesAPI.getIndexes() returned empty or invalid data. Using mockIndexData directly.");
            }
        } catch (error) {
            console.error("Failed to fetch index data from API, using mock data:", error);
        }
    }


    renderIndexMap() {
        const mapContainer = document.getElementById('mapContainer');
        const existingElements = mapContainer.querySelectorAll('.index-point-wrapper');
        existingElements.forEach(el => el.remove());

        this.placedCardRects = []; // 重置已放置卡片的位置信息

        this.mockIndexData.forEach((index, i) => {
            setTimeout(() => {
                const wrapper = document.createElement('div');
                wrapper.className = 'index-point-wrapper';
                wrapper.style.top = index.top;
                wrapper.style.left = index.left;
                wrapper.dataset.indexId = index.id;
                // 设置初始 z-index
                wrapper.style.zIndex = this.baseZIndex; // 赋予一个基础 z-index

                // 添加鼠标悬停事件监听
                wrapper.addEventListener('mouseenter', () => {
                    wrapper.style.zIndex = this.hoverZIndex; // 鼠标进入时提升 z-index
                });
                wrapper.addEventListener('mouseleave', () => {
                    wrapper.style.zIndex = this.baseZIndex; // 鼠标离开时恢复 z-index
                });

                wrapper.addEventListener('click', () => {
                    this.updateDashboardForIndex(index.id);
                });


                const dot = document.createElement('div');
                dot.className = `index-dot ${index.isPositive ? 'positive' : 'negative'}`;


                const card = document.createElement('div');
                card.className = 'index-info-card';
                card.innerHTML = `
                            <div class="index-info-card-name">${index.name}</div>
                            <div class="index-info-card-value">${index.value}</div>
                            <div class="index-info-card-change ${index.isPositive ? 'positive' : 'negative'}">${index.change}</div>
                        `;


                const lineH = document.createElement('div');
                lineH.className = 'connection-line line-h';


                const lineV = document.createElement('div');
                lineV.className = 'connection-line line-v';


                wrapper.appendChild(lineH);
                wrapper.appendChild(lineV);
                wrapper.appendChild(dot);
                wrapper.appendChild(card);
                mapContainer.appendChild(wrapper);


                const dotCenterX = 0;
                const dotCenterY = 0;
                const CARD_WIDTH = 100;
                const CARD_HEIGHT = 60;
                const CONNECTION_OFFSET = 15;

                const dotLeftPercentage = parseFloat(index.left);
                const dotTopPercentage = parseFloat(index.top);

                let cardOffsetX = 0;
                let cardOffsetY = 0;

                if (dotLeftPercentage < 30) {
                    cardOffsetX = CONNECTION_OFFSET;
                } else if (dotLeftPercentage > 70) {
                    cardOffsetX = -CARD_WIDTH - CONNECTION_OFFSET;
                } else {
                    cardOffsetX = dotTopPercentage < 50 ? CONNECTION_OFFSET : -CARD_WIDTH - CONNECTION_OFFSET;
                }

                if (dotTopPercentage < 30) {
                    cardOffsetY = CONNECTION_OFFSET;
                } else if (dotTopPercentage > 70) {
                    cardOffsetY = -CARD_HEIGHT - CONNECTION_OFFSET;
                } else {
                    cardOffsetY = dotLeftPercentage < 50 ? CONNECTION_OFFSET : -CARD_HEIGHT - CONNECTION_OFFSET;
                }

                const spacingFactor = 20;
                cardOffsetY += (i % 5 - 2) * spacingFactor;
                cardOffsetX += (i % 3 - 1) * spacingFactor / 2;

                let finalCardLeft = dotCenterX + cardOffsetX;
                let finalCardTop = dotCenterY + cardOffsetY;

                const mapContainerRect = mapContainer.getBoundingClientRect();
                const wrapperRect = wrapper.getBoundingClientRect();

                let currentCardAbsLeft = wrapperRect.left - mapContainerRect.left + finalCardLeft;
                let currentCardAbsTop = wrapperRect.top - mapContainerRect.top + finalCardTop;

                let iterations = 0;
                const MAX_ITERATIONS = 10;
                const ADJUSTMENT_STEP = 10;

                while (this.checkCollision(currentCardAbsLeft, currentCardAbsTop, CARD_WIDTH, CARD_HEIGHT) && iterations < MAX_ITERATIONS) {
                    if (iterations % 2 === 0) {
                        finalCardLeft += ADJUSTMENT_STEP;
                    } else {
                        finalCardTop += ADJUSTMENT_STEP;
                    }

                    currentCardAbsLeft = wrapperRect.left - mapContainerRect.left + finalCardLeft;
                    currentCardAbsTop = wrapperRect.top - mapContainerRect.top + finalCardTop;
                    iterations++;
                }

                card.style.left = `${finalCardLeft}px`;
                card.style.top = `${finalCardTop}px`;

                this.placedCardRects.push({
                    left: currentCardAbsLeft,
                    top: currentCardAbsTop,
                    right: currentCardAbsLeft + CARD_WIDTH,
                    bottom: currentCardAbsTop + CARD_HEIGHT
                });


                const hLineStartX = dotCenterX;
                const hLineStartY = dotCenterY;
                let hLineEndX;

                if (finalCardLeft > dotCenterX) {
                    hLineEndX = finalCardLeft;
                } else {
                    hLineEndX = finalCardLeft + CARD_WIDTH;
                }

                lineH.style.left = `${Math.min(hLineStartX, hLineEndX)}px`;
                lineH.style.top = `${hLineStartY}px`;
                lineH.style.width = `${Math.abs(hLineEndX - hLineStartX)}px`;
                lineH.style.height = `1px`;

                const vLineStartX = hLineEndX;
                const vLineStartY = hLineStartY;
                let vLineEndY;

                if (finalCardTop > dotCenterY) {
                    vLineEndY = finalCardTop;
                } else {
                    vLineEndY = finalCardTop + CARD_HEIGHT;
                }

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

    checkCollision(newLeft, newTop, newWidth, newHeight) {
        const newRight = newLeft + newWidth;
        const newBottom = newTop + newHeight;

        for (const rect of this.placedCardRects) {
            if (!(newRight < rect.left ||
                  newLeft > rect.right ||
                  newBottom < rect.top ||
                  newTop > rect.bottom)) {
                return true;
            }
        }
        return false;
    }


    updateDashboardForIndex(indexId) {
        this.currentActiveIndex = indexId;
        const data = this.indexSpecificData?.[indexId] || this.indexSpecificData?.["default"];

        if (data) {
            this.updateTrendChart(data.trendData);
            this.updateIndustryChart(data.industryData);
            this.updateRiskChart(data.riskData);
            this.updateStatCards(data.statCards);

            if (this.liveDataInterval) {
                clearInterval(this.liveDataInterval);
            }
            this.startDataRefreshForIndex(indexId);
        } else {
            console.warn(`No specific data found for index: ${indexId}. Dashboard might not update fully.`);
        }
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
        if (this.liveDataInterval) {
            clearInterval(this.liveDataInterval);
        }

        this.liveDataInterval = setInterval(async () => {
            if (this.indicesAPI) {
                try {
                    const apiIndexes = await this.indicesAPI.getIndexes();
                    if (Array.isArray(apiIndexes) && apiIndexes.length > 0) {
                        const apiIndexesMap = new Map(apiIndexes.map(item => [item.name, item]));
                        this.mockIndexData = this.mockIndexData.map(mockItem => {
                            const apiItem = apiIndexesMap.get(mockItem.id) || apiIndexesMap.get(mockItem.name);
                            if (apiItem) {
                                const newChange = String(apiItem.change);
                                const isPositive = newChange.startsWith('+');
                                return {
                                    ...mockItem,
                                    value: apiItem.value,
                                    change: newChange,
                                    isPositive: isPositive,
                                    name: apiItem.name
                                };
                            }
                            return mockItem;
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch live index data from API, using simulated changes:", error);
                    this.mockIndexData.forEach(item => {
                        const currentChange = parseFloat(item.change.replace('%', ''));
                        const variation = (Math.random() - 0.5) * 0.08;
                        const newChange = (currentChange >= 0 ? '+' : '') + (currentChange + variation).toFixed(2) + '%';
                        item.change = newChange;
                        item.isPositive = newChange.startsWith('+');
                        const currentValue = parseFloat(item.value.replace(/,/g, ''));
                        const valueVariation = (Math.random() - 0.5) * 10;
                        item.value = (currentValue + valueVariation).toFixed(2);
                    });
                }
            } else {
                this.mockIndexData.forEach(item => {
                    const currentChange = parseFloat(item.change.replace('%', ''));
                    const variation = (Math.random() - 0.5) * 0.08;
                    const newChange = (currentChange >= 0 ? '+' : '') + (currentChange + variation).toFixed(2) + '%';
                    item.change = newChange;
                    item.isPositive = newChange.startsWith('+');
                    const currentValue = parseFloat(item.value.replace(/,/g, ''));
                    const valueVariation = (Math.random() - 0.5) * 10;
                    item.value = (currentValue + valueVariation).toFixed(2);
                });
            }

            this.renderIndexMap();

            const currentData = this.indexSpecificData?.[indexId] || this.indexSpecificData?.["default"];

            if (currentData) {
                currentData.trendData = this.generateTrendData(currentData.trendData[currentData.trendData.length - 1], 7);
                currentData.industryData = currentData.industryData.map(val => Math.min(Math.max(val + (Math.random() - 0.5) * 1, 10), 40));
                currentData.riskData = currentData.riskData.map(val => Math.min(Math.max(val + (Math.random() - 0.5) * 5, 20), 90));

                const updatedStatCards = {};
                for (const key in currentData.statCards) {
                    const original = currentData.statCards[key];
                    const variation = (Math.random() - 0.5) * 0.1;
                    let newValue = (original.value + variation);
                    let newChange = (original.change + (Math.random() - 0.5) * 0.5);

                    if (key === 'activeMarkets') {
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
            }

        }, 5000);
    }

    updateTrendChart(data) { console.log("Updating Trend Chart with:", data); }
    updateIndustryChart(data) { console.log("Updating Industry Chart with:", data); }
    updateRiskChart(data) { console.log("Updating Risk Chart with:", data); }
    updateStatCards(data) { console.log("Updating Stat Cards with:", data); }
    generateTrendData(lastValue, count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            lastValue = lastValue + (Math.random() - 0.5) * 10;
            data.push(lastValue);
        }
        return data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const moreStocksBtn = document.getElementById('moreStocksBtn');
    if (moreStocksBtn) {
        moreStocksBtn.addEventListener('click', goToMoreStocks);
    }
    const dashboard = new FinancialDashboard();

    // when window is resized, resize all charts
    window.addEventListener('resize', () => {
        Object.values(dashboard.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    });
    initRegionTrendChart();
    initMarketPerformance();
    initNewsRecommendation();
});
