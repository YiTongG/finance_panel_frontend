
// API base configuration
const API = {
    // Base URL - The actual IP address and port where the backend is running
    BASE_URL: 'https://38a2b84f1292.ngrok-free.app',

    // Common request methods
    async get(endpoint, params = {}) {
        try {
            // Construct the full URL with query parameters
            const url = new URL(`${this.BASE_URL}${endpoint}`);
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );

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
    }
};

export { API, IndicesAPI, StockAPI };