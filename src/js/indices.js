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

    document.addEventListener('DOMContentLoaded', () => {
        const moreStocksBtn = document.getElementById('moreStocksBtn');
        if (moreStocksBtn) {
            moreStocksBtn.addEventListener('click', goToMoreStocks);
        }
        initRegionTrendChart();
        initMarketPerformance();
        initNewsRecommendation();
    });