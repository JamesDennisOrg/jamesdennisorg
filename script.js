// -------------------------------------------------
// -------------Lenis Smooth Scroll-----------------
// -------------------------------------------------
const lenis = new Lenis({
    lerp: 0.05,
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

//---------------------------------------------------------------------
//------------------------- Load Components ---------------------------
// --------------------------------------------------------------------
// async function loadFormComponents() {
//     // Find all form placeholders on the page
//     const formPlaceholders = document.querySelectorAll('[data-form-component]');
    
//     for (const placeholder of formPlaceholders) {
//         const formType = placeholder.getAttribute('data-form-component');
//         const formId = placeholder.id || `form-${formType}-${Date.now()}`;
        
//         try {
//             // Load the form HTML
//             const response = await fetch(`/Components/forms/${formType}.html`);
//             if (!response.ok) {
//                 throw new Error(`Failed to load form: ${formType}`);
//             }
            
//             const formHtml = await response.text();
//             placeholder.innerHTML = formHtml;
            
//             console.log(`Loaded form component: ${formType}`);
            
//             // Initialize the form if it has multi-step attributes
//             const form = placeholder.querySelector('form[data-multistep]');
//             if (form) {
//                 // Wait a bit for DOM to settle
//                 setTimeout(() => {
//                     if (window.initMultiStepForm) {
//                         const totalSteps = form.getAttribute('data-total-steps') || 3;
//                         const serviceType = form.getAttribute('data-service') || 'general';
                        
//                         window.initMultiStepForm(form.id, {
//                             totalSteps: parseInt(totalSteps),
//                             serviceType: serviceType
//                         });
//                     }
//                 }, 100);
//             }
            
//         } catch (error) {
//             console.error(`Error loading form component "${formType}":`, error);
//             placeholder.innerHTML = `
//                 <div class="form-error">
//                     <p>Unable to load the form. Please <a href="/contact/">contact me directly</a>.</p>
//                 </div>
//             `;
//         }
//     }
// }
// Unified component loader that handles all component types
// MAIN COMPONENT LOADER - Replaces BOTH old functions
async function loadComponents() {
    try {
        // 1. Load static components (header/footer)
        const headerResponse = await fetch('/Components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        const footerResponse = await fetch('/Components/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;

        // 2. Load ALL dynamic components (forms, carousels, etc.)
        await loadDynamicComponents();

        // 3. Initialize global functionality
        dateTime();
        initScrollHandler();
        setupNavLinks();
        setupModal();
        highlightCurrentPage();
    } catch (error) {
        console.error('Error loading components:', error);
    }

    // 4. UI/UX enhancements
    startLoadingAnimation();
    initPageAnimations();
}

// UNIFIED DYNAMIC COMPONENT LOADER
async function loadDynamicComponents() {
    // CONFIGURATION OBJECT: Maps component types to their settings
    const componentConfig = {
        'form': {                                   // Type 1: Forms
            directory: '/Components/forms/',        // Where these files live
            initializer: initFormComponent          // Function to run after loading
        },
        'carousel': {                               // Type 2: Carousels  
            directory: '/Components/carousels/',    // Where these files live
            initializer: initCarouselComponent      // Function to run after loading
        }
        // ADD NEW TYPES HERE EXAMPLE:
        // 'testimonial': {
        //     directory: '/Components/testimonials/',
        //     initializer: initTestimonialComponent
        // }
    };

    // STEP 1: Find ALL component placeholders on the page
    // Creates selector: [data-form-component], [data-carousel-component]
    const componentSelectors = Object.keys(componentConfig)
        .map(type => `[data-${type}-component]`)
        .join(', ');
    
    const placeholders = document.querySelectorAll(componentSelectors);
    
    // STEP 2: Load each component in parallel for better performance
    const loadPromises = Array.from(placeholders).map(async (placeholder) => {
        // DETECT component type from data attribute
        let componentType, componentName;
        
        // Check each possible attribute (form, carousel, etc.)
        for (const type of Object.keys(componentConfig)) {
            const attrName = `data-${type}-component`;
            const name = placeholder.getAttribute(attrName);
            if (name) {
                componentType = type;
                componentName = name;
                break; // Found it, stop checking
            }
        }
        
        // ERROR CHECK: No valid component found
        if (!componentType || !componentName) {
            console.warn('Invalid component placeholder:', placeholder);
            return; // Skip this placeholder
        }
        
        const config = componentConfig[componentType];
        const componentPath = `${config.directory}${componentName}.html`;
        const componentId = placeholder.id || `${componentType}-${componentName}-${Date.now()}`;
        
        try {
            // STEP 3: Fetch the component HTML from server
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${componentName}`);
            }
            
            const componentHtml = await response.text();
            placeholder.innerHTML = componentHtml; // Inject into DOM
            
            // STEP 4: Initialize component-specific functionality
            if (config.initializer) {
                // Brief delay ensures DOM is ready
                setTimeout(() => {
                    config.initializer(placeholder, componentName, componentId);
                }, 100);
            }
            
        } catch (error) {
            // STEP 5: Graceful error handling
            console.error(`✗ Failed to load ${componentType} "${componentName}":`, error);
            placeholder.innerHTML = `
                <div class="component-error" style="padding: 20px; background: #fee; border: 1px solid #f99;">
                    <p>Unable to load the ${componentType} component. Please try again later.</p>
                </div>
            `;
        }
    });
    
    // STEP 6: Wait for ALL components to finish loading
    await Promise.all(loadPromises);
}

// FORM INITIALIZER
function initFormComponent(container, formType, formId) {
    const form = container.querySelector('form[data-multistep]');
    if (form && window.initMultiStepForm) {
        const totalSteps = form.getAttribute('data-total-steps') || 3;
        const serviceType = form.getAttribute('data-service') || 'general';
        
        window.initMultiStepForm(form.id, {
            totalSteps: parseInt(totalSteps),
            serviceType: serviceType
        });
    }
}

// CAROUSEL INITIALIZER
function initCarouselComponent(container, carouselName, carouselId) {
    const carousel = container.querySelector('.marquee-wrapper');
    if (!carousel) return;
    
    // Add hover pause/resume functionality
    carousel.addEventListener('mouseenter', () => {
        carousel.querySelectorAll('.marquee-text').forEach(item => {
            item.style.animationPlayState = 'paused';
        });
    });
    
    carousel.addEventListener('mouseleave', () => {
        carousel.querySelectorAll('.marquee-text').forEach(item => {
            item.style.animationPlayState = 'running';
        });
    });
}

//---------------------------------------------------------------------
//----------------------- Loading Animations --------------------------
// --------------------------------------------------------------------
function startLoadingAnimation() {
    // First check if elements exist
    const header = document.querySelector('.header');
    const bars = document.querySelectorAll('.bar');
    const loadText = document.querySelector('.load-text');
    const navWrapper = document.querySelector('nav');

    navWrapper.style.display = 'none';
    
    if (!header || !bars.length || !loadText || !navWrapper) {
        console.warn("Animation elements not found - retrying...");
        setTimeout(startLoadingAnimation, 100); // Retry after 100ms
        return;
    }
    // Initialize animations
    gsap.set(".header", { yPercent: -100, opacity: 0 });
    gsap.set(".load-text", { display: "grid", opacity: 0, yPercent: 100 });
    
    let entryTl = gsap.timeline();
    gsap.set(".header", { display: "none" });
    entryTl.add("loader")
        .to(".load-text", {
            opacity: 1, yPercent: 0 
        }, "loader")
        .to(bars, {
            height: 0,
            stagger: { from: "center", amount: 0.1 },
            delay: 1,
        }, "loader")
        .to('.load-text', 
            { yPercent: -100, opacity: 0, display: "none", duration: .3 }, "loader+=1")
        .to('.loader-container', { height: 0 }, "-=.5")
        .to(".header", { display: "flex" }, "-=0.3")
        .to("nav", { display: "flex" }, "-=0.3")
        // .add("content")
        .to(".header", { yPercent: 0, opacity: 1, duration: .3 }, "-=0.3")
}

//---------------------------------------------------------------------
//--------------- Page Specific Loading Animations --------------------
// --------------------------------------------------------------------

function initPageAnimations() {
    const page = document.body.dataset.page; // Set via <body data-page="services">
    const sections = gsap.utils.toArray(".content-section");

    sections.forEach((section, i) => {
        gsap.from(section, {
            scrollTrigger:{
                trigger: section,
                start: "top bottom",
                end: "top 30%",
                scrub: false,
                // markers: true
            },
            y: 200, scale: .85, opacity: 0, ease: "power4.out", duration: 1.5
        })
    })
    gsap.from(".hero-title", {
        y: 50,
        opacity: 0,
        ease: "slow(0.7,0.7,false)",
        delay: 1.5
    });
    
    gsap.from(".hero-subtitle", {
        y: -10,
        opacity: 0,
        ease: "slow(0.7,0.7,false)",
    },"<+.5");

    // Page-specific animations - (Above the fold only - see page specific Scripts/page.js for below the fold)
    switch(page) {
        case "index":
            gsap.set('.logo-char', {opacity:0, yPercent: 100});
            gsap.to('.logo-char', {opacity: 1, yPercent: 0, stagger: {each: 0.02, from: "center", duration: 0.03}, delay: 1.3});
            gsap.from('.scroll-icon-container', { y: 60, duration: .6, delay: 3 });
            break;
        case "services":
            function serviceLoadingAnimation() {
                let tl = gsap.timeline();

                let targets = gsap.utils.toArray(".images-grid .item");
                targets.forEach(target => {gsap.set(target, {clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",})});
            }
            

            let mm = gsap.matchMedia();

            mm.add("(min-width: 900px)", () => {
                gsap.set(".images-grid h2", {y: 200,opacity: 0});
                gsap.to(".images-grid h2", {
                    y: 150,
                    opacity: 1,
                    duration: .7,
                    ease: "bounce.out",
                    delay: 2
                })
                // gsap.set(".images-grid h2", {y: 60,opacity: 0});
                gsap.to(".images-grid h2", {
                    y: 150,
                    opacity: 1,
                    duration: .7,
                    ease: "bounce.out",
                    delay: 2
                })
                gsap.to(".images-grid .item", {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                    duration: 1,
                    stagger: .075,
                    ease: "power4.out",
                }, "<");
            })

            mm.add("(max-width: 899px)", () => {
                gsap.to(".images-grid .item", {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                    duration: 1,
                    stagger: .075,
                    ease: "power4.out",
                }, "<");
            })
            serviceLoadingAnimation();
            break;
        case "plugins":
            // Plugins page animations
            break;
        // Add other pages as needed
    }
}

//---------------------------------------------------------------------
//-------------------------- Global Scripts ---------------------------
// --------------------------------------------------------------------
function dateTime() {
    const date = new Date();
    const years = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
    const datetime = month + " " + years;
    
    document.querySelectorAll('#datetime').forEach(el => {
        el.innerHTML = datetime;
    });
    
    const copyrightEl = document.querySelector('.copyright p');
    if (copyrightEl) {
        copyrightEl.innerHTML = `© ${years} James Dennis`;
    }
}

// --------------------------------------------------------------------
// ----------Hide/Show navbar & ScrolltoTop on scroll up/down----------
// --------------------------------------------------------------------
function initScrollHandler() {
    let prevScrollpos = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;

    window.addEventListener('scroll', () => {
        const header = document.getElementById("header");
        const toTop = document.getElementById("toTop");
        
        if (!header || !toTop) return;

        const currentScrollPos = window.pageYOffset;
        const scrollPercent = ((currentScrollPos / scrollHeight) * 100).toFixed();

        if (prevScrollpos < currentScrollPos && scrollPercent > 10) {
            header.classList.add("hidden");
        } else {
            header.classList.remove("hidden");
        }

        if (scrollPercent > 20) {
            toTop.style.right = "4px";
        } else {
            toTop.style.right = "-50px";                
        }
        prevScrollpos = currentScrollPos;  
    });
}

function initToTopButton() {
    const toTopLink = document.getElementById('toTopLink');
    const toTopContainer = document.getElementById('toTop');
    const toTopImg = document.querySelector('.scroll-to-top');
    
    if (!toTopLink || !toTopContainer || !toTopImg) return;
    
    // Remove default onclick from HTML and handle it here
    toTopLink.onclick = null;
    
    toTopLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 1. Add animation class to trigger the animation
        toTopImg.style.animation = 'none'; // Reset animation
        void toTopImg.offsetWidth; // Trigger reflow
        toTopImg.style.animation = 'subtlePulseIn 0.3s ease forwards';
        
        // 2. Scroll to top with Lenis (with slight delay for animation to start)
        setTimeout(() => {
            if (typeof lenis !== 'undefined' && lenis.scrollTo) {
                lenis.scrollTo('#top');
            } else {
                // Fallback if Lenis isn't available
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 150); // Start scroll halfway through animation
        
        // 3. Hide the button with delay
        setTimeout(() => {
            toTopContainer.style.right = "-50px";
        }, 400); // Hide after scroll starts
        
        // 4. Prevent the default anchor behavior
        return false;
    });
}

//---------------------------------------------------------------------
//--------------------Navigation and Modal Setup----------------------
// --------------------------------------------------------------------
function setupNavLinks() {
    const navLinks = document.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            if (e.target.hostname === window.location.hostname &&
                e.target.getAttribute("href")?.indexOf("#") === -1 &&
                e.target.getAttribute("target") !== "_blank") {
                e.preventDefault();
                let destination = e.target.getAttribute("href");
                document.getElementById("header").classList.add("hidden");
                gsap.fromTo(".bar", {height: 0}, {
                    height: "105vh", 
                    stagger: { amount: 0.05, from: "center"},
                    onComplete: () => window.location = destination
                });
            }
        });
    });
}

function setupModal() {
    // Set global function
    window.modalVisible = function() {
        const modal = document.getElementById("menu-modal");
        if (modal) modal.classList.toggle("visible");
    };
    
    // Add click handler to modal toggle button
    const modalToggle = document.querySelector("[data-modal-toggle]");
    if (modalToggle) {
        modalToggle.addEventListener("click", window.modalVisible);
    }
}

function highlightCurrentPage() {
    // Wait a tiny bit to ensure DOM is fully ready
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            
            // Remove trailing slashes for comparison
            const cleanCurrentPath = currentPath.replace(/\/$/, '');
            const cleanLinkPath = linkPath.replace(/\/$/, '');
            
            // Check if this link matches current page
            if (cleanLinkPath === cleanCurrentPath || 
                (cleanCurrentPath === '' && cleanLinkPath === '/')) {
                link.classList.add('current-page');
            } else {
                link.classList.remove('current-page');
            }
        });
    }, 100);
}
// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadComponents();
    initScrollHandler();
    initToTopButton();
});
