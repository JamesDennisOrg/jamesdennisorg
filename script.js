// -------------------------------------------------
// -------------Lenis Smooth Scroll-----------------
// -------------------------------------------------
// loadComponents();
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
async function loadComponents() {
    // 1. Load HTML components
    try {
        // 1. Load the header
        const headerResponse = await fetch('/Components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        // 2. Load the footer
        const footerResponse = await fetch('/Components/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;

        // 3. DOM Dependent global functions
        dateTime();
        initScrollHandler();
        setupNavLinks();
        setupModal();

        highlightCurrentPage();
    } catch (error) {
        console.error('Error loading components:', error);
    }

    // 2. Run loading animation
    startLoadingAnimation();

    // 3. Initialize page-specific animations
    initPageAnimations(); 
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
    gsap.set(".hero-title", {y: 100, opacity: 0});
    gsap.set(".hero-subtitle", {y: 100, opacity: 0});
    
    // Common animations (runs on all pages)
    gsap.to(".hero-title", {
        y: 0,
        opacity: 1,
        ease: "slow(0.7,0.7,false)",
        delay: 1.2
    });
    
    gsap.to(".hero-subtitle", {
        y: 0,
        opacity: 1,
        ease: "slow(0.7,0.7,false)",
    },"<+.2");

    // Page-specific animations - (Above the fold only - see page specific Scripts/page.js for below the fold)
    switch(page) {
        case "index":
            gsap.set('.logo-char', {opacity:0, yPercent: 100});

            gsap.to('.logo-char', {opacity: 1, yPercent: 0, stagger: {each: 0.02, from: "center", duration: 0.03}, delay: 1.3});
            
            break;
        case "services":
            const content = document.querySelector('.marquee-container');
            function serviceLoadingAnimation() {
                gsap.set(".images-grid h2", {y: 60,opacity: 0});

                let tl = gsap.timeline();

                let targets = gsap.utils.toArray(".images-grid .item");
                targets.forEach(target => {gsap.set(target, {clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",})});

                

                tl.to(".images-grid h2", {
                    y: 150,
                    opacity: 1,
                    duration: .7,
                    ease: "bounce.out",
                    delay: 2
                })
                .to(".images-grid .item", {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                    duration: 1,
                    stagger: .075,
                    ease: "power4.out",
                }, "<");
            }
            setTimeout(() => {
               content.style.display = "flex"; 
            }, 1250);
            
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

        if (scrollPercent > 10 && scrollPercent >= 88) {
            toTop.style.bottom = "80px";
        } else if (scrollPercent > 10 && scrollPercent < 88) {
            toTop.style.bottom = "0px";
        } else {
            toTop.style.bottom = "-80px";                
        }
        prevScrollpos = currentScrollPos;  
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
});
