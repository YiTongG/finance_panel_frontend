import { StockAPI,TransactionAPI } from '/src/config/api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const USER_ID = 45430196
    const STOCK_CODE = urlParams.get('ticker');
    if (!STOCK_CODE) {
        document.body.innerHTML = '<h1>Error: Stock symbol not provided in URL.</h1>';
        return;
    }
    // Initialize ECharts instance
    const chartDom = document.getElementById('stockChart');
    const myChart = echarts.init(chartDom);

    /**
     * Fetches the current quote for the header.
     * @param {string} code - The stock symbol to fetch. name
     */
    async function fetchCurrentQuote(stockCode) {
        try {
                const historyResult = await StockAPI.searchStocksHistory(stockCode,'1d');
                if (historyResult.success && historyResult.data.length > 0) {
                    const latestQuote = historyResult.data[0]; // The most recent quote
                    const displayData = {
                        ...latestQuote  // Contains close price, date, etc.
                    };
    
                    updateHeaderUI(displayData);
                } else {
                    console.warn(`Could not find price history for symbol: ${stockCode}`);
                }
            
        } catch (error) {
            // This catches errors from either API call.
            console.error('Failed to fetch stock data:', error);
        }
    }
    /**
     * Updates the top header section of the page.
     * @param {object} quote - A stock quote object from the /search endpoint.
     */
    function updateHeaderUI(quote) {
        const currentPrice = parseFloat(quote.closePrice);
        // Use open price for daily change calculation
        const changeAmount = currentPrice - parseFloat(quote.openPrice);
        const changePercent = (changeAmount / parseFloat(quote.openPrice)) * 100;

        document.querySelector('.stock-symbol').textContent = `${quote.stockCode} • ${quote.fullName}`;
        document.getElementById('currentPrice').textContent = currentPrice.toFixed(2);
        document.getElementById('changeAmount').textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)}`;
        document.getElementById('changePercent').textContent = `(${changeAmount >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;

        const priceChangeElement = document.getElementById('priceChange');
        priceChangeElement.classList.toggle('positive', changeAmount >= 0);
        priceChangeElement.classList.toggle('negative', changeAmount < 0);
        document.getElementById('changeIcon').textContent = changeAmount >= 0 ? '📈' : '📉';
    }

    /**
     * Fetches historical data and updates the chart and analysis table.
     * @param {string} period - The time interval for the historical data (e.g., '1m', '1d').
     */
    async function loadHistoricalData(period = '1d') {
        try {
            myChart.showLoading();
            const result = await StockAPI.searchStocksHistory(STOCK_CODE, period);
            if (!result.success || result.data.length === 0) {
                myChart.hideLoading();
                myChart.setOption({ title: { text: 'No historical data available.', left: 'center', top: 'center' } }, true);
                clearAnalysisTable();
                return;
            }
            updateChartAndTableUI(result.data);

        } catch (error) {
            console.error('Failed to load historical data:', error);
        }
    }

    /**
     * Updates the ECharts instance and the bottom analysis table.
     * @param {Array} historicalData - An array of historical data points.
     */
    function updateChartAndTableUI(historicalData) {
        // --- Process Data for Chart and Analysis ---
        const chartData = historicalData.map(item => [
            new Date(item.timestamp).getTime(),
            parseFloat(item.openPrice),
            parseFloat(item.closePrice),
            parseFloat(item.lowPrice),
            parseFloat(item.highPrice)
        ]).reverse(); // Reverse for chronological order

        const prices = historicalData.map(item => parseFloat(item.closePrice));
        const startPrice = prices[prices.length - 1];
        const endPrice = prices[0];
        const changeAmount = endPrice - startPrice;

        const highPrice = Math.max(...prices);
        const lowPrice = Math.min(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const volatility = ((highPrice - lowPrice) / avgPrice) * 100;

        // --- Update Analysis Table ---
        document.getElementById('startPrice').textContent = startPrice.toFixed(2);
        document.getElementById('chartEndPrice').textContent = endPrice.toFixed(2);
        document.getElementById('priceChangeValue').textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)}`;
        document.getElementById('highPrice').textContent = highPrice.toFixed(2);
        document.getElementById('lowPrice').textContent = lowPrice.toFixed(2);
        document.getElementById('priceRange').textContent = `${lowPrice.toFixed(2)} - ${highPrice.toFixed(2)}`;
        document.getElementById('avgPrice').textContent = avgPrice.toFixed(2);
        document.getElementById('volatility').textContent = `${volatility.toFixed(2)}%`;
        document.getElementById('dataPoints').textContent = historicalData.length;

        // --- Update ECharts ---
        const chartOption = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            grid: { left: '10%', right: '10%', bottom: '15%' },
            xAxis: { type: 'time', scale: true },
            yAxis: { scale: true, splitArea: { show: true } },
            dataZoom: [
                { type: 'inside', start: 0, end: 100 },
                { show: true, type: 'slider', top: '90%', start: 0, end: 100 }
            ],
            series: [{
                name: STOCK_CODE,
                type: 'candlestick',
                data: chartData,
                itemStyle: {
                    color: '#26A69A', color0: '#EF5350',
                    borderColor: '#26A69A', borderColor0: '#EF5350'
                }
            }]
        };

        myChart.hideLoading();
        myChart.setOption(chartOption, true); // `true` clears the previous option
    }

    /**
     * Clears the analysis table when no data is available.
     */
    function clearAnalysisTable() {
        const fields = ['startPrice', 'chartEndPrice', 'priceChangeValue', 'highPrice', 'lowPrice', 'priceRange', 'avgPrice', 'volatility', 'dataPoints'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (id === 'dataPoints') el.textContent = '0';
            else if (id === 'priceRange') el.textContent = '0.00 - 0.00';
            else el.textContent = '0.00';
        });
    }

    // --- Add Event Listeners for Time Range Buttons ---
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const period = button.getAttribute('data-period');
            // Map front-end period to your API's expected interval value
            const apiInterval = {
                '1m': '1m',
                '2m': '2m',
                '3m': '3m',
                '4m': '4m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
                '1wk': '1wk',
                '1m': '1m',
                '1qty': '1qty',
            }[period] || '1d';

            loadHistoricalData(apiInterval);
        });
    });

    // --- Go Back Button ---
    window.goBack = function () {
        window.history.back();
    }
    let currentStockPrice = 295.45;
    const tradeAmountInput = document.getElementById('tradeAmount');
    let currentUserBalance = 0;
    let currentHoldings = 0;


    // NEW: Function to load user's trading data
    async function loadTradePanelData() {
        try {
            const result = await TransactionAPI.getUserTransactions(USER_ID);
            if (result.success && result.data.length > 0) {
                const transactions = result.data;
                // Balance is the same in all records, take it from the first
                currentUserBalance = parseFloat(transactions[0].money);

                // Find holdings for the CURRENT stock
                const stockHolding = transactions.find(t => t.stockCode === STOCK_CODE);
                currentHoldings = stockHolding ? stockHolding.holdNumber : 0;

                // Update UI
                document.getElementById('userBalance').textContent = `$${currentUserBalance.toLocaleString('en-US')}`;
                document.getElementById('userHoldings').textContent = currentHoldings;
            } else {
                // If no transaction data, you might need to fetch user's balance from another endpoint
                console.warn('No transaction data found for user.');
            }
        } catch (error) {
            console.error("Failed to load user transaction data:", error);
        }
        updateTradeButtonsState();
    }

    // NEW: Function to enable/disable trade buttons
    function updateTradeButtonsState() {
        const amount = parseInt(tradeAmountInput.value, 10);
        if (isNaN(amount) || amount <= 0) {
            buyButton.disabled = true;
            sellButton.disabled = true;
            return;
        }

        // Can the user afford to buy?
        buyButton.disabled = (amount * currentStockPrice > currentUserBalance);

        // Does the user have enough shares to sell?
        sellButton.disabled = (amount > currentHoldings);
    }

    // NEW: Function to execute a trade
    async function executeTrade(type) {
        const amount = parseInt(tradeAmountInput.value, 10);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const tradeData = {
            userId: USER_ID,
            stockCode: STOCK_CODE,
            type: type, // 'BUY' or 'SELL'
            shares: amount,
            price: currentStockPrice
        };

        try {
            const result = await TransactionAPI.createTransaction(tradeData);
            if (result.success) {
                alert(`Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${amount} shares of ${STOCK_CODE}!`);
                // Refresh the panel to show new balance and holdings
                await loadTradePanelData();
                tradeAmountInput.value = ''; // Clear input
            } else {
                alert(`Trade failed: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Trade execution failed:', error);
            alert('An error occurred while executing the trade.');
        }
    }

    // --- Event Listeners ---
    tradeAmountInput.addEventListener('input', updateTradeButtonsState);
    buyButton.addEventListener('click', () => executeTrade('BUY'));
    sellButton.addEventListener('click', () => executeTrade('SELL'));

    // --- Initial Page Load ---
    async function initializePage() {
        // First, populate the header with the latest data
        await fetchCurrentQuote(STOCK_CODE);
        await loadTradePanelData();
        await loadHistoricalData('1m'); // '1m' for the default '1D' view
    }

    initializePage();
});