import { StockAPI } from '/src/config/api-config.js';

// Current active tab for hot stocks
let currentTab = 'volume';

// return to index page
function backToIndex() {
    console.log("Navigating to index page...");
    window.location.href = "indices.html";
}

// Render stock items (for hot stocks)
function renderStocksList(stocks) {
    const stocksList = document.getElementById('stocksList');
    stocksList.innerHTML = stocks.map(stock => `
        <div class="stock-item">
        <div class="stock-info">
        <div class="stock-symbol">${stock.ticker}</div>
        <div class="stock-name">${stock.name}</div>
        </div>
        <div class="stock-price">$${stock.price}</div>
        <div class="stock-volume">${stock.volume}</div>
        <div class="stock-amplitude">${stock.amplitude}</div>
        <div class="stock-change ${stock.change.includes('+') ? 'positive' : 'negative'}">${stock.change}</div>
        </div>

    `).join('');
    // Attach click listeners to each newly rendered stock item for navigation
    stocksList.querySelectorAll('.stock-item').forEach(item => {
        item.addEventListener('click', function (event) {
            // Apply ripple effect on click
            addRippleEffect(event);

            const stockTicker = this.querySelector('.stock-symbol').textContent;
            if (stockTicker) {
                // A brief delay allows the ripple animation to be visible before navigation
                setTimeout(() => {
                    window.location.href = `details.html?ticker=${stockTicker}`;
                }, 150);
            }
        });
    });

}

// Fetch and render hot stocks
async function fetchAndRenderHotStocks() {

    try {
        const hotStocks = await StockAPI.getHotStocks(currentTab);
        console.log('Hot stocks:', hotStocks);
        renderStocksList(hotStocks);
    } catch (error) {
        console.error('Failed to fetch hot stocks:', error);
        // Fallback or error display
        document.getElementById('stocksList').innerHTML = '<p style="color: #94A3B8;">Failed to load hot stocks, please try again later.</p>';
    }

}

function renderAssetsList(assetsData) {
    const assetsList = document.getElementById("holdList");
    if (!assetsList) {
        console.error("Element with ID 'holdList' not found.");
        return;
    }

    // Aggregate holdings by stockCode
    const aggregatedHoldings = assetsData.reduce((acc, currentItem) => {
        const { stockCode, holdNumber } = currentItem;
        if (acc[stockCode]) {
            acc[stockCode].holdNumber += holdNumber;
        } else {
            acc[stockCode] = {
                stockName: stockCode, // Use stockCode as stockName
                holdNumber: holdNumber
            };
        }
        return acc;
    }, {});

    // Convert the aggregated object into an array
    const userAssetsToRender = Object.values(aggregatedHoldings);

    // Clear previous content
    assetsList.innerHTML = '';

    if (userAssetsToRender.length === 0) {
        assetsList.innerHTML = '<p style="text-align: center; color: #64748b;">You currently have no stock holdings.</p>';
        return;
    }

    // Render each aggregated stock holding
    assetsList.innerHTML = userAssetsToRender.map(asset => `
        <div class="asset-item">
            <span style="color:white">${asset.stockName}</span>
            <span style="color:white">${asset.holdNumber}</span> 
        </div>
    `).join(''); // Use .join('') to concatenate all mapped strings
}

// Fetch and render user assets
async function fetchAndRenderUserAssets() {
    try {
        const UserId = 45430196; // Example user ID, replace with actual user ID logic
        const response = await StockAPI.getUserAssets(UserId); // Renamed to 'response' for clarity

        if (response && response.success && Array.isArray(response.data)) {
            console.log('User assets:', response.data);
            renderAssetsList(response.data);
        } else {
            // Handle cases where API returns success: false or data is not an array
            console.warn('API returned no data or an invalid data format:', response);
            document.getElementById('holdList').innerHTML = '<p style="color: #94A3B8;">No user assets found or invalid data received.</p>';
        };
    } catch (error) {
        console.error('Failed to fetch user assets:', error);
        // Fallback or error display
        // document.getElementById('holdList').innerHTML = '<p style="color: #94A3B8;">Failed to load user assets, please try again later.</p>';
        document.getElementById('holdList').innerHTML = `
            <div class="asset-item">
                <span style="color:white">NVIDA</span>
                <span style="color:white">5</span> 
            </div>
            <div class="asset-item">
                <span style="color:white">TSLA</span>
                <span style="color:white">3</span>
            </div>
            <div class="asset-item">
                <span style="color:white">AAPL</span>
                <span style="color:white">2</span>
            </div>
            <div class="asset-item">
                <span style="color:white">GOOGL</span>
                <span style="color:white">1</span>
            </div>`
    }
}
// Set up tab switching for hot stocks
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            fetchAndRenderHotStocks(); // Re-fetch based on new tab
        });
    });
}


// Ripple animation effect
function addRippleEffect(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
    ripple.style.left = (e.clientX - rect.left - rect.width / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - rect.height / 2) + 'px';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    fetchAndRenderHotStocks();
    setupTabSwitching();
    fetchAndRenderUserAssets();
    // setupSearch();
    // Attach ripple effect to stock items and sector cards
    document.querySelectorAll('.stock-item, .sector-card').forEach(el => {
        el.addEventListener('click', addRippleEffect);
    });

    // Page load animations
    document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
    });
    // Back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', backToIndex);
    }
    // Perform search action


    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Search query cannot be empty. Please enter a stock name or ticker.');
            return;
        }
    
        try {
            const response = await StockAPI.searchStocks(query);
            
            // Check if the search returned any results
            if (response && response.data && response.data.length > 0) {
                const stock = response.data[0];
                
                // **FIX:** Check that the stock object and its ticker property both exist
                if (stock && stock.stockCode) {
                    window.location.href = `details.html?ticker=${stock.stockCode}`;
                } else {
                    // Handle cases where the API result is malformed
                    console.error("API Error: Search result is missing a ticker.", stock);
                    alert("An error occurred with the search result. Please try again.");
                }
            } else {
                // Redirect with the query if no results are found
                window.location.href = `details.html`;
            }
        } catch (error) {
            console.error('Error during stock search:', error);
            alert('An error occurred while searching for stocks. Please try again later.');
        }
    }
    // Attach the event listener to the search button
    searchButton.addEventListener('click', performSearch);

    // Allow searching on Enter key press
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

});

