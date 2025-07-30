
// API基础配置
const API = {
    // Base URL - The actual IP address and port where the backend is running
    BASE_URL: 'https://d307a0585538.ngrok-free.app',

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
const StockAPI = {
    // get hot stocks based on current tab
    getHotStocks(sortBy = '') {
        return API.get('/api/stocks/hot', { sortBy });
    },
    // search stocks by keyword
    searchStocks(query) {
        if (!query) {
            throw new Error('Search keyword cannot be empty');
        }
        return API.get('/api/stocks/search', { query: query });
    },

    // Searches for a single stock's historical data.
    searchStocksHistory(symbol, interval) {
        if (!symbol || symbol.trim() === '') {
            throw new Error('Stock symbol cannot be empty.');
        }
        if (!interval || interval.trim() === '') {
            throw new Error('Time interval cannot be empty.');
        }
        return API.get('/api/stocks/history',  { symbol: symbol, interval: interval });
    }
      
};

export { API, IndicesAPI, StockAPI };