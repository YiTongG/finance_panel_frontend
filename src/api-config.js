// api-config.js

// API基础配置
const API = {
    // 基础URL - 后端实际运行的IP地址和端口
    BASE_URL: 'http://192.168.153.1:5000', 

    // 通用请求方法
    async get(endpoint, params = {}) {
        try {
            // 构建URL查询参数
            const url = new URL(`${this.BASE_URL}${endpoint}`);
            Object.keys(params).forEach(key =>
                url.searchParams.append(key, params[key])
            );

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

// 股票API - 基于stocksRoutes.js和stockController.js
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

    // 搜索股票
    searchStocks(query) {
        if (!query) {
            throw new Error('搜索关键词不能为空');
        }
        return API.get('/api/stocks/search', { q: query });
    }
};

// 交易API - 基于transactionRoutes.js和transactionController.js
const TransactionAPI = {
    // 获取所有交易
    getAllTransactions() {
        return API.get('/api/transactions');
    },

    // 创建新交易
    createTransaction(transactionData) {
        // 交易数据应包含：股票代码、交易类型、数量、价格等
        return API.post('/api/transactions', transactionData);
    },

    // 更新交易
    updateTransaction(id, transactionData) {
        return API.put(`/api/transactions/${id}`, transactionData);
    },

    // 删除交易
    deleteTransaction(id) {
        return API.delete(`/api/transactions/${id}`);
    }
};

// 如果想支持模块导出(需要使用构建工具或现代浏览器)
// export { API, StockAPI, TransactionAPI };