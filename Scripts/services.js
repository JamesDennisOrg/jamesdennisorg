gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

///IMAGE FLIP / EXPAND TO DETAILS OVERLAY BOX//////////////////////////
const items = gsap.utils.toArray(".item"),
      details = document.querySelector('.detail'),
      detailContent = document.querySelector('.content'),
      detailImage = document.querySelector('.detail img'),
      detailTitle = document.querySelector('.detail .title'),
      detailSecondary = document.querySelector('.detail .secondary'),
      detailDescription = document.querySelector(".detail .description");

let activeItem; // keeps track of which item is open (details)

gsap.set(detailContent, { yPercent: -100 }); // close the details "drawer" (content) initially

function showDetails(item) {
	if (activeItem) { // click handling if user clicks outside expanded details popup
		return hideDetails();
	}
	let onLoad = () => {

		// position the details on top of the item (scaled down)
		Flip.fit(details, item, {scale: true, fitChild: detailImage});

		// record the state
		const state = Flip.getState(details);

		// set the final state
		gsap.set(details, {clearProps: true}); // Remove all original position/style props before scaling
        // Set new state and styling
		gsap.set(details, {
			xPercent: -50, 
			top: "51%", 
			yPercent: -50, 
			visibility: "visible", 
			overflow: "hidden",
			
		});
		gsap.to(details, {
			boxShadow: "var(--shadow-top)",
		}, "<+=0.25");
        
        // Flip.from() returns a timeline, so add a tween to reveal the detail content. That way, if the flip gets interrupted and forced to completion & killed, this does too.
		Flip.from(state, {
			duration: 0.5,
			ease: "power2.inOut",
			scale: true,
			onComplete: () => gsap.set(details, {overflowY: "auto"}) // to permit scrolling if necessary
		})
			
			.to(detailContent, {yPercent: 0}, 0.2);

		detailImage.removeEventListener("load", onLoad);
		document.addEventListener('click', hideDetails);
	};

	// Change image and text
	const data = item.dataset;
	detailImage.addEventListener("load", onLoad);
	detailImage.src = item.querySelector('img').src;
	detailTitle.innerText = data.title;
	detailSecondary.innerText = data.secondary;
	detailDescription.innerText = data.text;

	// stagger-fade the items out from the one that was selected in a staggered way (and kill the tween of the selected item)
	gsap.to(items, {opacity: 0.3, stagger: { amount: 0.7, from: items.indexOf(item), grid: "auto"}}).kill(item);
	gsap.to(".images-grid", {backgroundColor: "transparent", duration: 1, delay: 0.3}); // fade out the background
	activeItem = item;
}

function hideDetails() {
	document.removeEventListener('click', hideDetails);
	gsap.set(details, {overflow: "hidden"});

	// record the current state of details
	const state = Flip.getState(details);

	// scale details down so that its detailImage fits exactly on top of activeItem
	Flip.fit(details, activeItem, {scale: true, fitChild: detailImage});

	// animate the other elements, like all fade all items back up to full opacity, slide the detailContent away, and tween the background color to white.
	const tl = gsap.timeline();
	tl.set(details, {overflow: "hidden", boxShadow: "unset"})
    .to(detailContent, {yPercent: -100})
	  .to(items, {opacity: 1, stagger: {amount: 0.7, from: items.indexOf(activeItem), grid: "auto"}})
	  .to(".images-grid", {backgroundColor: "transparent"}, "<");

	// animate from the original state to the current one.
	Flip.from(state, {
		scale: true,
		duration: 0.5,
		delay: 0.2, // 0.2 seconds because we want the details to slide up first, then flip.
		onInterrupt: () => tl.kill()
	})
	  .set(details, {zIndex: -1, visibility: "hidden"});

	activeItem = null;
}

// Add click listeners
gsap.utils.toArray('.item').forEach(item => item.addEventListener('click', () => showDetails(item)));

const scrollers = document.querySelectorAll(".marquee-horizontal");

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

/* Scrolling Marquees */
function addAnimation() {
  scrollers.forEach(scroller => {
    scroller.setAttribute("data-animated", true);
    
    const marqueeText = scroller.querySelector('.track-horizontal');
    const scrollerItems = Array.from(marqueeText.children);
    
    scrollerItems.forEach(item => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute('aria-hidden', true);
      marqueeText.appendChild(duplicatedItem);
    })
  });
}

// function initMarqueeScrubbing() {
//     console.log("scrubbing initiated");
//     const container = document.querySelector('.marquee-container');
//     const tracks = document.querySelectorAll('.track-horizontal');
    
//     if (!container || tracks.length === 0) return;
    
//     let isDragging = false;
//     let startX = 0;
//     let startTranslateX = 0;
//     let originalAnimations = [];
    
//     // Store original animation states
//     function storeAnimations() {
//         originalAnimations = Array.from(tracks).map(track => ({
//             element: track,
//             animation: track.style.animation,
//             transform: track.style.transform
//         }));
//     }
    
//     // Restore original animations
//     function restoreAnimations() {
//         originalAnimations.forEach(item => {
//             item.element.style.animation = item.animation;
//             item.element.style.transform = item.transform;
//         });
//     }
    
//     // Start manual scrubbing
//     function startScrubbing(e) {
//         isDragging = true;
//         startX = e.clientX;
        
//         // Store current positions
//         tracks.forEach(track => {
//             const style = window.getComputedStyle(track);
//             const matrix = new DOMMatrix(style.transform);
//             track.dataset.startTranslate = matrix.m41;
//         });
        
//         container.style.cursor = 'grabbing';
//         e.preventDefault();
//     }
    
//     // Handle scrubbing
//     function handleScrubbing(e) {
//         if (!isDragging) return;
        
//         const deltaX = (e.clientX - startX) * 1.5; // Sensitivity
        
//         tracks.forEach(track => {
//             const startTranslate = parseFloat(track.dataset.startTranslate) || 0;
//             const newTranslate = startTranslate + deltaX;
            
//             // Apply the scrub directly
//             track.style.transform = `translateX(${newTranslate}px)`;
//             track.style.animation = 'none'; // Keep animation disabled while scrubbing
//         });
//     }
    
//     // Stop scrubbing
//     function stopScrubbing() {
//         if (!isDragging) return;
        
//         isDragging = false;
//         container.style.cursor = '';
        
//         // Don't restore immediately - wait for mouse to leave container
//         // This keeps the manual scroll position while still hovered
//     }
    
//     // Mouse enters container
//     container.addEventListener('mouseenter', () => {
//         storeAnimations();
        
//         // Just use CSS hover to pause (your existing CSS handles this)
//         // We'll only take over if user starts dragging
//         container.style.cursor = 'grab';
//     });
    
//     // Mouse leaves container
//     container.addEventListener('mouseleave', () => {
//         if (isDragging) {
//             stopScrubbing();
//         }
        
//         // Restore original animations
//         restoreAnimations();
//         container.style.cursor = '';
//     });
    
//     // Mouse down to start dragging
//     container.addEventListener('mousedown', startScrubbing);
    
//     // Mouse move for dragging
//     document.addEventListener('mousemove', handleScrubbing);
    
//     // Mouse up to stop dragging
//     document.addEventListener('mouseup', stopScrubbing);
    
//     // Prevent default drag behavior
//     container.addEventListener('dragstart', (e) => e.preventDefault());
    
//     // Optional: Add wheel scrolling
//     container.addEventListener('wheel', (e) => {
//         e.preventDefault();
        
//         // Pause animations for wheel interaction
//         tracks.forEach(track => {
//             track.style.animationPlayState = 'paused';
//         });
        
//         const currentStyle = window.getComputedStyle(tracks[0]);
//         const currentMatrix = new DOMMatrix(currentStyle.transform);
//         let currentTranslate = currentMatrix.m41;
        
//         // Scroll horizontally with vertical wheel
//         currentTranslate += e.deltaY * 2;
        
//         // Apply to all tracks
//         tracks.forEach(track => {
//             track.style.transform = `translateX(${currentTranslate}px)`;
//             track.style.animation = 'none';
//         });
        
//         // Reset cursor to indicate interaction
//         container.style.cursor = 'grab';
//     });
// }

function initMarqueeScrubbingEnhanced() {
    console.log("Scrubbing Initialised");
    const container = document.querySelector('.marquee-container');
    const tracks = document.querySelectorAll('.track-horizontal');
    
    if (!container || tracks.length === 0) return;
    
    let isDragging = false;
    let startX = 0;
    let startTranslateX = 0;
    let isInteracting = false;
    let hasShownHint = false;
    
    // Create instruction tooltip
    function createInstructionTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'marquee-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <span class="tooltip-emoji">👆</span>
                <div>
                    <strong>Try scrolling here!</strong>
                    <p>click & drag to explore</p>
                </div>
                <button class="tooltip-close">&times;</button>
            </div>
        `;
        container.appendChild(tooltip);
        
        // Close button
        tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.style.opacity = '0';
                setTimeout(() => tooltip.remove(), 300);
            }
        }, 5000);
        
        return tooltip;
    }
    
    // Store animation state
    function pauseAnimationsAndStoreState() {
        tracks.forEach(track => {
            // Store current animation
            track.dataset.originalAnimation = track.style.animation;
            track.dataset.originalTransform = track.style.transform;
            
            // Pause CSS animation
            track.style.animationPlayState = 'paused';
        });
    }
    
    // Restore animations
    function restoreAnimations() {
        if (isInteracting) return;
        
        tracks.forEach(track => {
            track.style.animation = track.dataset.originalAnimation || '';
            track.style.animationPlayState = 'running';
            track.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        
        // Remove transition after animation completes
        setTimeout(() => {
            tracks.forEach(track => {
                track.style.transition = '';
            });
        }, 500);
    }
    
    // Snap to nearest item
    function snapToNearestItem() {
        const firstTrack = tracks[0];
        const style = window.getComputedStyle(firstTrack);
        const matrix = new DOMMatrix(style.transform);
        const currentX = matrix.m41;
        
        // Calculate item width (500px + 16px gap)
        const itemWidth = 516;
        
        // Find nearest snap point
        const snapIndex = Math.round(Math.abs(currentX) / itemWidth);
        console.log(snapIndex);
        const snapPosition = -snapIndex * itemWidth;
        console.log(snapPosition);
        
        // Smooth snap with transition
        tracks.forEach(track => {
            track.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            track.style.transform = `translateX(${snapPosition}px)`;
        });
        
        // Highlight the aligned items
        highlightAlignedItems(snapIndex);
        
        // Remove transition after snapping
        setTimeout(() => {
            tracks.forEach(track => {
                track.style.transition = '';
            });
        }, 300);
    }
    
    // Highlight aligned items
    function highlightAlignedItems(index) {
        const allItems = container.querySelectorAll('.marquee-text');
        const itemIndex = index % 4; // Original items count
        
        // Remove previous highlights
        allItems.forEach(item => item.classList.remove('aligned'));
        
        // Add highlight to aligned items
        allItems.forEach((item, i) => {
            if (i % 4 === itemIndex) { // Match every 4th item (original + duplicates)
                item.classList.add('aligned');
            }
        });
    }
    
    // Start interaction
    function startInteraction() {
        isInteracting = true;
        pauseAnimationsAndStoreState();
        
        // Show hint on first interaction
        if (!hasShownHint) {
            hasShownHint = true;
            setTimeout(() => {
                const tooltip = createInstructionTooltip();
                // Hide tooltip when user starts interacting
                container.addEventListener('mousedown', () => {
                    tooltip.style.opacity = '0';
                    setTimeout(() => tooltip.remove(), 300);
                }, { once: true });
                container.classList.add('has-interacted');

                container.addEventListener('wheel', () => {
                    tooltip.style.opacity = '0';
                    setTimeout(() => tooltip.remove(), 300);
                }, { once: true });
            }, 300);
        }
    }
    
    // End interaction
    function endInteraction() {
        isInteracting = false;
        isDragging = false;
        container.style.cursor = '';
        
        // Snap to nearest item
        snapToNearestItem();
        
        // Restore animations after a delay
        setTimeout(() => {
            if (!container.matches(':hover')) {
                restoreAnimations();
            }
        }, 100);
    }
    
    // Mouse enter
    container.addEventListener('mouseenter', (e) => {
        startInteraction();
        container.style.cursor = 'grab';
        
        // Temporarily disable Lenis/page scroll if possible
        if (typeof lenis !== 'undefined') {
            lenis.options.wheelMultiplier = 0.1; // Slow down page scroll
        }
    });
    
    // Mouse leave
    container.addEventListener('mouseleave', () => {
        if (!isDragging) {
            endInteraction();
            
            // Restore Lenis/page scroll
            if (typeof lenis !== 'undefined') {
                lenis.options.wheelMultiplier = 1; // Restore normal scroll
            }
        }
        restoreAnimations();
        container.style.cursor = '';
    });

    // Mouse down - start dragging
    container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left click
        
        isDragging = true;
        startX = e.clientX;
        
        // Get current positions
        const style = window.getComputedStyle(tracks[0]);
        const matrix = new DOMMatrix(style.transform);
        startTranslateX = matrix.m41;
        
        container.style.cursor = 'grabbing';
        
        // Disable text selection while dragging
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
    });
    
    // Mouse move - handle dragging
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = (e.clientX - startX) * 1.8; // Sensitivity
        const newTranslateX = startTranslateX + deltaX;
        
        // Apply to all tracks
        tracks.forEach(track => {
            track.style.animation = 'none'; // Disable animation while dragging
            track.style.transform = `translateX(${newTranslateX}px)`;
        });
    });
    
    // Mouse up - stop dragging
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        
        // Re-enable text selection
        document.body.style.userSelect = '';
        
        endInteraction();
    });
    
    // Wheel scrolling
    // container.addEventListener('wheel', (e) => {
    //     e.preventDefault();
    //     startInteraction();
        
    //     // Get current position
    //     const style = window.getComputedStyle(tracks[0]);
    //     const matrix = new DOMMatrix(style.transform);
    //     let currentX = matrix.m41;
        
    //     // Scroll horizontally with vertical wheel
    //     currentX += e.deltaY * 3;
        
    //     // Apply to all tracks with animation disabled
    //     tracks.forEach(track => {
    //         track.style.animation = 'none';
    //         track.style.transform = `translateX(${currentX}px)`;
    //     });
        
    //     // Reset interaction timeout
    //     clearTimeout(container.interactionTimeout);
    //     container.interactionTimeout = setTimeout(() => {
    //         if (!isDragging) {
    //             snapToNearestItem();
    //         }
    //     }, 150);
        
    //     // Show grabbing cursor temporarily
    //     container.style.cursor = 'grab';
    //     clearTimeout(container.cursorTimeout);
    //     container.cursorTimeout = setTimeout(() => {
    //         if (!isDragging) {
    //             container.style.cursor = '';
    //         }
    //     }, 1000);
    // });

    // // Prevent page scroll when wheel event starts on marquee
    // container.addEventListener('wheel', (e) => {
    //     e.stopPropagation();
    // }, { passive: false });

    // // Or even more aggressive - prevent ALL wheel events on container
    // container.addEventListener('wheel', (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     e.stopImmediatePropagation();
    //     return false;
    // }, { passive: false });
    
    // Prevent default drag behavior
    container.addEventListener('dragstart', (e) => e.preventDefault());
}

class StatsCounterGSAP {
    constructor() {
        this.animatedSections = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedSections.has(entry.target)) {
                        this.animatedSections.add(entry.target);
                        this.animateSectionStats(entry.target);
                    }
                });
            },
            {
                threshold: 0.5,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe ALL stats containers
        const statsContainers = document.querySelectorAll('.problem-stats, .impact-stats, .seo-stats-highlight, .hero-stats');
        statsContainers.forEach(container => {
            observer.observe(container);
        });
    }

    animateSectionStats(container) {
        const statNumbers = container.querySelectorAll('.stat-number');
        
        statNumbers.forEach((element, index) => {
            const target = parseFloat(element.getAttribute('data-target'));
            const isInteger = Number.isInteger(target);
            
            gsap.to({ value: 0 }, {
                value: target,
                duration: 2,
                delay: index * 0.2,
                ease: "power2.out",
                onUpdate: function() {
                    if (isInteger) {
                        element.textContent = Math.floor(this.targets()[0].value);
                    } else {
                        element.textContent = this.targets()[0].value.toFixed(1);
                    }
                }
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined') {
        new StatsCounterGSAP();
    }

    // initMarqueeScrubbing();
    initMarqueeScrubbingEnhanced();
});