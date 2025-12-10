document.addEventListener("DOMContentLoaded", () => {
    function contactLoadingAnimations() {
        gsap.from(".heading", { opacity: 0, y: 60, delay: 2 });
        gsap.from(".problem-item", { opacity: 0, y:60, delay: 2.2, stagger: .2 });
        gsap.from(".form-header", { opacity: 0, y: 60, delay: 2.5 });
    }
    contactLoadingAnimations();
});