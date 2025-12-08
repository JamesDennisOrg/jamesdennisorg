/* ===== MARQUEE - DESKTOP ===== */
function initMarqueeInteraction() {
    // Check if we're on a touch device
    const isTouchDevice = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          (navigator.msMaxTouchPoints > 0);
    
    if (isTouchDevice) {
        console.log('Touch device - skipping desktop initialization');
        return;
    }

    console.log('=== INITIALIZING MARQUEE INTERACTION ===');

    const wrappers = document.querySelectorAll('.marquee-wrapper');
    
    wrappers.forEach(wrapper => {
        // Create DESKTOP-ONLY tooltip
        const tooltip = document.createElement('div');
        tooltip.classList.add('marquee-tooltip-desktop'); // ← Changed class name
        tooltip.textContent = 'CLICK ANY ITEM'; // ← Desktop-only message
        
        tooltip.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--brand);
            color: var(--text);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            white-space: nowrap;
            transition: all .3s ease;
        `;
        wrapper.appendChild(tooltip);
        
        // Get all items
        const items = wrapper.querySelectorAll('.item');
        
        // DESKTOP-ONLY hover behavior
        wrapper.addEventListener('mouseenter', () => {
            items.forEach(item => {
                item.style.animationPlayState = 'paused';
            });
            tooltip.style.opacity = '1';
            tooltip.style.top = '-2px';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            items.forEach(item => {
                item.style.animationPlayState = 'running';
            });
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.top = '-40px';
            }, 250);
        });
        
        // DESKTOP-ONLY click interaction
        items.forEach(item => {
            item.style.pointerEvents = 'auto';
            item.style.cursor = 'help';
            
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                // Remove aligned class from all items first
                items.forEach(otherItem => {
                    otherItem.classList.remove('aligned');
                    otherItem.style.scale = '1';
                    otherItem.style.opacity = '0';
                    otherItem.style.transform = '';
                    otherItem.style.transition = '';
                });
                
                // Visual feedback
                this.style.scale = '1.2';
                this.classList.add('aligned');
                this.style.opacity = '1';
                
                // Find matching item
                const isLeft = this.classList.contains('item-left');
                const allItems = Array.from(items);
                const match = findMatchingItem(allItems, this, isLeft);
                
                if (match) {
                    match.style.scale = '1.2';
                    match.classList.add('aligned');
                    match.style.opacity = '1';
                    
                    // Snap both to center
                    snapToCenter(this, match, wrapper);
                }
                
                // Reset after 3 seconds
                setTimeout(() => {
                    [this, match].forEach(item => {
                        if (item) {
                            item.style.scale = '1';
                            item.classList.remove('aligned');
                            item.style.transform = '';
                            item.style.transition = '';
                        }
                    });
                    
                    items.forEach(otherItem => {
                        if (otherItem !== this && otherItem !== match) {
                            otherItem.style.opacity = '1';
                        }
                    });
                }, 3000);
            }, true);
        });
    });
}
/* ===== MARQUEE - MOBILE ===== */
function initMobileMarqueeInteraction() {
    // Check if we're on a touch device
    const isTouchDevice = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          (navigator.msMaxTouchPoints > 0);
    
    if (!isTouchDevice) {
        console.log('Not a touch device - skipping mobile initialization');
        return;
    }
    
    console.log('=== INITIALIZING MOBILE MARQUEE INTERACTION ===');

    const wrappers = document.querySelectorAll('.marquee-wrapper');
    
    wrappers.forEach(wrapper => {
        // Create MOBILE-ONLY tooltip (different class name)
        const mobileTooltip = document.createElement('div');
        mobileTooltip.classList.add('marquee-tooltip-mobile');
        mobileTooltip.textContent = 'TOUCH TO PAUSE';
        
        mobileTooltip.style.cssText = `
            position: absolute;
            top: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            z-index: 10001;
            pointer-events: none;
            opacity: 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            white-space: nowrap;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;
        wrapper.appendChild(mobileTooltip);
        
        const items = wrapper.querySelectorAll('.item');
        let isPaused = false;
        let touchTimer;
        
        // Show tooltip on first load
        setTimeout(() => {
            mobileTooltip.style.opacity = '1';
            mobileTooltip.style.top = '10px';
            
            // Auto-hide after 4 seconds
            setTimeout(() => {
                mobileTooltip.style.opacity = '0';
                mobileTooltip.style.top = '-35px';
            }, 4000);
        }, 1000);
        
        // Simple touch to toggle pause/resume
        wrapper.addEventListener('touchstart', (e) => {
            // Only respond to touches on items, not empty space
            if (!e.target.classList.contains('item') && 
                !e.target.closest('.item')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Clear any existing timer
            clearTimeout(touchTimer);
            
            // Toggle pause state
            isPaused = !isPaused;
            
            // Apply to all items
            items.forEach(item => {
                item.style.animationPlayState = isPaused ? 'paused' : 'running';
            });
            
            // Update tooltip
            mobileTooltip.textContent = isPaused ? 'TOUCH TO RESUME' : 'TOUCH TO PAUSE';
            mobileTooltip.style.opacity = '1';
            mobileTooltip.style.top = '0px';
            
            // Auto-hide tooltip after 2 seconds
            touchTimer = setTimeout(() => {
                mobileTooltip.style.opacity = '0';
                mobileTooltip.style.top = '-35px';
            }, 2000);
            
            // If resuming, also hide tooltip after 1 second
            if (!isPaused) {
                setTimeout(() => {
                    mobileTooltip.style.opacity = '0';
                    mobileTooltip.style.top = '-35px';
                }, 1000);
            }
        }, { passive: false }); // Important for preventDefault() to work
        
        // Optional: Also hide tooltip when touching outside
        document.addEventListener('touchstart', (e) => {
            if (!wrapper.contains(e.target)) {
                mobileTooltip.style.opacity = '0';
                mobileTooltip.style.top = '-35px';
            }
        });
    });
}


function findMatchingItem(allItems, clickedItem, isLeft) {
    // Get clicked item's index (1-4)
    const clickedIndex = getItemIndex(clickedItem);    
    // Look for item with same index on opposite side
    return allItems.find(item => {
        if (item === clickedItem) return false;
        
        const itemIndex = getItemIndex(item);
        const itemIsLeft = item.classList.contains('item-left');
        
        return itemIndex === clickedIndex && itemIsLeft !== isLeft;
    });
}

function getItemIndex(item) {    
    // Try to get from color
    const style = window.getComputedStyle(item);
    const color = style.color;
    
    if (color.includes('254, 35, 35') || color.includes('red')) return 1;
    if (color.includes('39, 39, 253') || color.includes('blue')) return 2;
    if (color.includes('0, 128, 0') || color.includes('green')) return 3;
    if (color.includes('170, 5, 170') || color.includes('purple')) return 4;
    
    return 1; // Default
}

function snapToCenter(item1, item2, wrapper) {    
    // Get wrapper dimensions relative to its own coordinate system
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperCenterX = wrapperRect.width / 2;
    
    // Get positions relative to the wrapper (not the viewport)
    [item1, item2].forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemWidth = itemRect.width;
        
        // Get position relative to wrapper
        const itemLeftRelative = itemRect.left - wrapperRect.left;
        
        // Calculate center of item
        const itemCenterX = itemLeftRelative + (itemWidth / 2);
        
        // How far item's center is from wrapper's center
        const offsetFromCenter = wrapperCenterX - itemCenterX;
        
        // Apply translation
        item.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        item.style.transform = `translateX(${offsetFromCenter}px)`;
    });
    
    wrapper.classList.add('snapping');
}

// Function is called in script.js "loadComponents" for timing reasons.