// const pluginContainers = gsap.utils.toArray(".plugin-container");
// var containerOne = getElementById(plugin-container-2);
// console.log(containerOne);

gsap.from(".plugin-nav-list", {
    y: 30, opacity: 0, delay: 2.5
});
gsap.from("#plugin-container-1", {
    y: 60, opacity: 0, delay: 2.5,
});

let container = ("#plugin-container-2")
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: container,
        start: "top bottom-=10%",
        end: "top top+=50%"
    }
});

tl.from(container, {
    y: 60,
    opacity: 0,
})
