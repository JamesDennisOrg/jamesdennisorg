let ctaTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".cta-wrapper-index",
        start: "top 60%",
        toggleActions: "play none none none",
    },
});
ctaTl.from(".index-cta-intro-wrapper h2", { yPercent: 100, opacity: 0, duration: .5 })
.from(".index-cta-intro-wrapper p", { yPercent: 100, opacity: 0, duration: .5, stagger: 0.2 }, ">")
.from(".cube-container", { scale: 0, duration: .8 }, "<")
.from(".cube-section", { y: 30, opacity: 0, duration: 1.2, ease: "bounce.out" }, "<+.3")
.from(".action-block .cta-options", { y: 30, opacity: 0, duration: 1, ease: "bounce.out" }, "<")
            