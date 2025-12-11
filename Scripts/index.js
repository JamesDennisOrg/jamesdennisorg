const ctaHeading = document.querySelector(".cta-wrapper-index h2");
const ctaText = document.querySelector(".cta-wrapper-index p");

let ctaTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".cta-wrapper-index",
        start: "top 60%",
        toggleActions: "play none none none",
    },
});
ctaTl.from(ctaHeading, {
    yPercent: 100,
    opacity: 0,
    duration: .5,
})
.from(ctaText, {
    yPercent: 100,
    opacity: 0,
    duration: .5,
}, "<+.3")
.from(".cube-container", {
    scale: 0,
    duration: .8,
})
.from(".cube-section", {
    y: 30, opacity: 0, duration: 1.5, ease: "bounce.out", delay: 1.3,
}, "<-.15")
.from(".action-block .cta-options", {
    y: 30, opacity: 0, duration: .5, ease: "bounce.out",
}, "<+.5")
            