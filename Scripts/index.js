const ctaHeading = document.querySelector(".cta-wrapper-index h2");
const ctaText = document.querySelector(".cta-wrapper-index p");
const ctaBtns = gsap.utils.toArray("buttons .hire-button");

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
.from(".buttons", {
    scale: 0,
    // opacity: 0,
    duration: .8,
    stagger: 0.3,
}, "<")
.from(".cube-container", {
    scale: 0,
    duration: .8,
}, "<")