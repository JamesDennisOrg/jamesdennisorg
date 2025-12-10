// Initialize currency switcher with exchange rates
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Store exchange rates globally with fallback values
let exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79
};

// Fetch live exchange rates
async function fetchExchangeRates() {
    try {
        const response = await fetch(EXCHANGE_API_URL);
        if (!response.ok) throw new Error('API response not ok');
        
        const data = await response.json();
        if (data && data.rates) {
            exchangeRates = {
                USD: 1,
                EUR: data.rates.EUR || 0.92,
                GBP: data.rates.GBP || 0.79
            };
            console.log('Live exchange rates loaded:', exchangeRates);
            return true;
        }
    } catch (error) {
        console.warn('Using fallback exchange rates:', error);
    }
    return false;
}

// Currency symbols
const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£'
};

// Store original prices from DOM
const originalPrices = new Map();

// Extract numeric price from price element
function extractPriceFromElement(priceElement) {
    const text = priceElement.textContent;
    const match = text.match(/\$(\d+,\d+|\d+)/);
    if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
}

// Format price with currency symbol
function formatPrice(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatted = amount.toLocaleString('en-US');
    return `${symbol}${formatted}`;
}

// Update all prices on page
async function updateAllPrices(currency) {
    // Ensure we have the latest rates
    await fetchExchangeRates();
    
    // If USD, restore original prices
    if (currency === 'USD') {
        document.querySelectorAll('.price').forEach(priceElement => {
            if (originalPrices.has(priceElement)) {
                const originalData = originalPrices.get(priceElement);
                priceElement.innerHTML = originalData.html;
            }
        });
    } else {
        // Convert prices for other currencies
        const rate = exchangeRates[currency];
        
        document.querySelectorAll('.price').forEach(priceElement => {
            if (!originalPrices.has(priceElement)) {
                // Store original on first access
                const amount = extractPriceFromElement(priceElement);
                if (amount !== null) {
                    originalPrices.set(priceElement, {
                        html: priceElement.innerHTML,
                        amount: amount
                    });
                }
            }
            
            const originalData = originalPrices.get(priceElement);
            if (originalData && originalData.amount) {
                const convertedAmount = Math.round(originalData.amount * rate);
                const formattedPrice = formatPrice(convertedAmount, currency);
                
                // Preserve the period (like "/month")
                const spanElement = priceElement.querySelector('span');
                const period = spanElement ? spanElement.outerHTML : '';
                
                priceElement.innerHTML = `${formattedPrice}${period}`;
            }
        });
    }
    
    // Update active currency button
    document.querySelectorAll('.currency-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.currency === currency);
    });
    
    // Save user preference
    localStorage.setItem('preferredCurrency', currency);
}

// Initialize currency switcher with live rates
async function initCurrencySwitcher() {
    // First, store original prices from DOM
    document.querySelectorAll('.price').forEach(priceElement => {
        const amount = extractPriceFromElement(priceElement);
        if (amount !== null) {
            originalPrices.set(priceElement, {
                html: priceElement.innerHTML,
                amount: amount
            });
        }
    });
    
    // Fetch initial exchange rates
    await fetchExchangeRates();
    
    // Add click handlers to currency buttons
    const currencyOptions = document.querySelectorAll('.currency-option');
    currencyOptions.forEach(option => {
        option.addEventListener('click', async function() {
            const currency = this.dataset.currency;
            await updateAllPrices(currency);
        });
    });
    
    // Load saved preference or default to USD
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'USD';
    await updateAllPrices(savedCurrency);
}

document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const serviceCategories = document.querySelectorAll('.service-category');
    const pricingContainers = document.querySelectorAll('.pricing-container');
    
    // Function to show/hide services with smooth transitions
    function filterServices(serviceType) {
        // Update active tab
        filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.service === serviceType);
        });
        
        // Add fade-out effect for all categories first
        serviceCategories.forEach(category => {
            category.classList.remove('active');
        });
        
        // Small delay to allow fade-out
        setTimeout(() => {
            // Show selected categories
            serviceCategories.forEach(category => {
                const shouldShow = serviceType === 'all' || category.dataset.service === serviceType;
                
                if (shouldShow) {
                    category.classList.add('active');
                    const parentContainer = category.closest('.pricing-container');
                    if (parentContainer) {
                        parentContainer.style.display = 'block';
                    }
                } else {
                    const parentContainer = category.closest('.pricing-container');
                    if (parentContainer) {
                        parentContainer.style.display = 'none';
                    }
                }
            });
            
            // If showing "all", ensure all containers are visible
            if (serviceType === 'all') {
                pricingContainers.forEach(container => {
                    container.style.display = 'block';
                });
            }
        }, 50);
    }
    
    // Add click event listeners to filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const serviceType = this.dataset.service;
            filterServices(serviceType);
            
            // Update URL hash for bookmarking
            history.pushState(null, null, `#${serviceType}`);
        });
    });
    
    // Check URL hash on load
    function checkHash() {
        const hash = window.location.hash.substring(1);
        const validServices = ['all', 'security', 'performance', 'wordpress', 'seo'];
        
        if (validServices.includes(hash)) {
            filterServices(hash);
        } else {
            filterServices('all');
        }
    }
    
    // Initialize filter
    checkHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);

    // Initialize currency switcher
    initCurrencySwitcher();
});