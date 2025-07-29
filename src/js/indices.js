import { API,IndicesAPI } from '/src/config/api-config.js'; 
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
        console.log("Region Trend Data:", data); // Log the data to inspect its structure

        // Process the data for ECharts.
        // Assuming 'data' is an array of objects like:
        // [{ name: 'Asia', value: 30 }, { name: 'Europe', value: 25 }, ...]
        // If the structure is different, you might need to map it.
        const seriesData = data.map(item => ({
            name: item.region, // Use 'region' as the name
            value: item.count  // Use 'count' as the value
        }));

const option = {
            tooltip: {
                trigger: 'item',
                // Adjust the formatter to show percentage or count as desired.
                // You can also use item.data.percentage if you want to pass it
                // directly into the ECharts data structure, but the default {d}%
                // calculates it based on the values, which is usually sufficient.
                formatter: '{b}: {c} ({d}%)' // Shows name (region), value (count), and percentage
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#fff' // Adjust legend text color for dark background
                }
            },
            series: [
                {
                    name: 'Region Trend',
                    type: 'pie',
                    radius: '50%', // Size of the pie chart
                    center: ['50%', '60%'], // Position of the pie chart
                    data: seriesData, // Use the processed data here
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        color: '#fff' // Adjust label text color for dark background
                    },
                    labelLine: {
                        lineStyle: {
                            color: '#fff' // Adjust label line color for dark background
                        }
                    }
                }
            ]
        };

        regionTrendChart.setOption(option);

        // Make the chart responsive to window resizing
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

        // Check if data is an array and not empty
        if (!Array.isArray(indexes) || indexes.length === 0) {
            performanceListDom.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">No market performance data available.</div>';
            return;
        }

        indexes.forEach((item, index) => {
            // Ensure item.change is a string to use startsWith
            const changeStr = String(item.change);
            const isPositive = changeStr.startsWith('+');
            const changeClass = isPositive ? 'positive' : 'negative';
            const arrowIcon = isPositive ? '▲' : '▼'; // Up or Down arrow

            const listItem = document.createElement('div');
            listItem.classList.add('performance-item', changeClass);

            listItem.innerHTML = `
                <div class="performance-item-left">
                    <span class="performance-rank">${index + 1}.</span>
                    <span class="performance-name">${item.name}</span>
                </div>
                <div class="performance-item-right">
                    <span class="change-indicator">${arrowIcon}</span>
                    <span class="change-value">${item.change}</span>
                </div>
            `;
            performanceListDom.appendChild(listItem);
        });

    } catch (error) {
        console.error("Failed to fetch or render market performance data:", error);
        performanceListDom.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Failed to load market performance data. Please check the API.</div>';
    }
}
async function initNewsRecommendation() {
    const newsListDom = document.getElementById('newsList');
    if (!newsListDom) {
        console.error("News List container not found.");
        return;
    }

    // Initial state: Show loading message
    newsListDom.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">Loading recent news...</div>';

    const MAX_RETRIES = 5; // Maximum number of retries
    const INITIAL_DELAY_MS = 1000; // Initial delay before first retry (1 second)

    async function fetchNewsWithRetry(retriesLeft, delay) {
        try {
            const newsData = await IndicesAPI.getNewsRecommendation();
            console.log("News Recommendation Data:", newsData); // Log the data

            newsListDom.innerHTML = ''; // Clear loading message

            // Check if data is an array and not empty
            if (!Array.isArray(newsData) || newsData.length === 0) {
                newsListDom.innerHTML = '<div style="color: #ccc; padding: 20px; text-align: center;">No recent news available.</div>';
                return;
            }

            newsData.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');

                newsItem.innerHTML = `
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                        <div class="news-title">${item.title}</div>
                    </a>
                `;
                newsListDom.appendChild(newsItem);
            });

        } catch (error) {
            console.error(`Failed to fetch news. Retries left: ${retriesLeft}. Error:`, error);

            if (retriesLeft > 0) {
                // Display a temporary retry message to the user
                newsListDom.innerHTML = `<div style="color: orange; padding: 20px; text-align: center;">Failed to load news. Retrying in ${delay / 1000} seconds...</div>`;
                setTimeout(() => {
                    fetchNewsWithRetry(retriesLeft - 1, delay * 2); // Double the delay for next retry
                }, delay);
            } else {
                // No retries left, display final error message
                newsListDom.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Failed to load recent news after multiple attempts. Please try again later.</div>';
            }
        }
    }

    // Start the first attempt
    fetchNewsWithRetry(MAX_RETRIES, INITIAL_DELAY_MS);
}
// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Other initializations...
    initRegionTrendChart();
    initMarketPerformance();
    initNewsRecommendation();
});