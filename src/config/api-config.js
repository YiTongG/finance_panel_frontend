
// API基础配置
const API = {
    // 基础URL - 后端实际运行的IP地址和端口
    BASE_URL: 'http://127.0.0.1:5000', 

    // 通用请求方法
    async get(endpoint, params = {}) {
        try {
            // 构建URL查询参数
            const url = new URL(`${this.BASE_URL}${endpoint}`);
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );
            url.searchParams.append('_', new Date().getTime());

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }
};
const IndicesAPI = {
    // get all indices for map 
    getIndexes() {
        return API.get('/api/indexes/all');
    },
    // get regionTrend for ab ar chat
    getRegionTrend(region) {
        return API.get(`/api/indexes/regionTrend`);
    },
    // get news recommendation for scroll
    getNewsRecommendation() {
        return API.post('/api/global/news');
    }
}
//股票API - 基于stocksRoutes.js和stockController.js
const StockAPI = {
    // 获取大盘指数
    getIndexes() {
        return API.get('/api/stocks/indexes');
    },

    // 获取热门股票，可选排序方式
    getHotStocks(sortBy = '') {
        return API.get('/api/stocks/hot', { sortBy });
    },

    // 获取行业板块
    getSectors() {
        return API.get('/api/stocks/sectors');
    },

    /**
     * Searches for stocks by name or symbol.
     * @param {string} query - The search term (e.g., "Tesla", "TSLA").
     * @returns {Promise<object>} The API response.
     */
    searchStocks(query) {
        if (!query || query.trim() === '') {
            // FIX 2: Translated error message to English for consistency.
            throw new Error('Search query cannot be empty.');
        }

        return API.get('/api/stocks/search', {  query: query });
    },

    /**
     * Searches for a single stock's historical data.
     * @param {string} symbol - The exact stock symbol (e.g., "TSLA").
     * @param {string} interval - The time interval (e.g., '1d', '1wk', '1mo').
     * @returns {Promise<object>} The API response.
     */
    // FIX 1: Corrected function name typo from "searchStocksHistort" to "searchStocksHistory".
    searchStocksHistory(symbol, interval) {
        // FIX 2: Changed function signature to accept 'symbol' and 'interval' for clarity and correctness.
        if (!symbol || symbol.trim() === '') {
            throw new Error('Stock symbol cannot be empty.');
        }
        if (!interval || interval.trim() === '') {
            throw new Error('Time interval cannot be empty.');
        }

        // FIX 3: Corrected the parameters to pass both 'symbol' and 'interval'
        // as required by your backend API. The original code had an undefined variable 's'.
        return API.get('/api/stocks/history',  { symbol: symbol, interval: interval });
    }  
};

// 交易API - 基于transactionRoutes.js和transactionController.js
// const TransactionAPI = {
//     // 获取所有交易
//     getAllTransactions() {
//         return API.get('/api/transactions');
//     },

//     // 创建新交易
//     createTransaction(transactionData) {
//         // 交易数据应包含：股票代码、交易类型、数量、价格等
//         return API.post('/api/transactions', transactionData);
//     },

//     // 更新交易
//     updateTransaction(id, transactionData) {
//         return API.put(`/api/transactions/${id}`, transactionData);
//     },

//     // 删除交易
//     deleteTransaction(id) {
//         return API.delete(`/api/transactions/${id}`);
//     }
// };

// 如果想支持模块导出(需要使用构建工具或现代浏览器)
export { API, IndicesAPI,StockAPI};