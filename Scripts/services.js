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

// 	WEB DEVELOPMENT SECTION //
gsap.utils.toArray(".section-title").forEach((title, i) => { 
	gsap.set(title, {
		yPercent: 50,
		opacity: 0,
	})
	gsap.to(title, {
		scrollTrigger: {
			trigger: title,
			start: "top 90%",
			end: "top 60%",
			toggleActions: "play none reverse reset",
			ease: "power4.inOut",
			scrub: 2,
			// markers: true,
		},
		opacity: 1,
		yPercent: 0,
		duration: .5,
	});
});
const scrollers = document.querySelectorAll(".marquee-horizontal");

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

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