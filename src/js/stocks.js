import { API, StockAPI } from '/src/config/api-config.js';

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
}

// Fetch and render hot stocks
async function fetchAndRenderHotStocks() {
    try {
        const hotStocks = await StockAPI.getHotStocks(currentTab);
        renderStocksList(hotStocks);
    } catch (error) {
        console.error('Failed to fetch hot stocks:', error);
        // Fallback or error display
        document.getElementById('stocksList').innerHTML = '<p style="color: #94A3B8;">Failed to load hot stocks, please try again later.</p>';
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
        console.log('Search query:', query);

        if (!query) {
            alert('Search query cannot be empty. Please enter a stock name.');
            searchInput.value = ''; // Clear the search input
            return; // Exit the function
        }
        try {
            const response = await StockAPI.searchStocks(query);
            console.log('API response:', response);
            if (response && response.success === true && response.count === 0 && response.data && response.data.length === 0) {
                alert('The entered stock name is incorrect or no results were found. Please try again.');
                searchInput.value = ''; // Clear the search input
                return; // Exit the function
            }
            console.log('Stock data:', response.data);
        } catch (error) {
            console.error('Error during stock search:', error);
            alert('An error occurred while searching for stocks. Please try again later.');
        }
    }

    // Attach the event listener to the search button
    searchButton.addEventListener('click', performSearch);

    // Optional: Allow searching on Enter key press
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

});

