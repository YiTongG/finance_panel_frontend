
// API base configuration
const API = {
    // Base URL - The actual IP address and port where the backend is running
    BASE_URL: 'http://127.0.0.1:5000',

    // Common request methods
    async get(endpoint, params = {}) {
        try {
            // Construct the full URL with query parameters
            const url = new URL(`${this.BASE_URL}${endpoint}`);
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );
            url.searchParams.append('_', new Date().getTime());

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP false: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
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
                throw new Error(`HTTP false: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
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
                throw new Error(`HTTP false: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP false: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
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
    getRegionTrend() {
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

const TransactionAPI = {
    // UPDATED: Changed to get transactions for a specific user
    getUserTransactions(userId) {
        return API.get(`/api/transactions/user/${userId}`);
    },

    // NEW: Added a function to create a new transaction (buy/sell)
    // This assumes your backend has a POST endpoint to handle trades
    createTransaction(transactionData) {
        // transactionData should include: { userId, stockCode, type: 'BUY'|'SELL', shares, price }
        return API.post('/api/transactions/execute', transactionData);
    },

    // ... (other transaction methods if you have them) ...
};

export { API, IndicesAPI, StockAPI, TransactionAPI};
