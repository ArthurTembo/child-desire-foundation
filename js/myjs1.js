
        const backToTopButton = document.querySelector(".back-to-top");
        const backToTopWrap = document.querySelector(".back-to-top-wrap");
        let backToTopFrame = 0;
        const updateBackToTopVisibility = () => {
            const visible = window.scrollY > 400;
            backToTopWrap.classList.toggle("is-visible", visible);
            backToTopButton.setAttribute("aria-hidden", String(!visible));
            backToTopButton.tabIndex = visible ? 0 : -1;
        };

        window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
        updateBackToTopVisibility();
        backToTopButton.addEventListener("click", () => {
            if (backToTopFrame) {
                cancelAnimationFrame(backToTopFrame);
                backToTopFrame = 0;
            }

            const startY = window.scrollY;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                window.scrollTo(0, 0);
                updateBackToTopVisibility();
                return;
            }

            const root = document.documentElement;
            const previousScrollBehavior = root.style.scrollBehavior;
            const duration = Math.min(900, Math.max(450, startY * 0.45));
            let startTime;
            root.style.scrollBehavior = "auto";

            const scrollUp = (timestamp) => {
                startTime ??= timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easedProgress = 1 - (1 - progress) ** 3;
                window.scrollTo(0, startY * (1 - easedProgress));

                if (progress < 1) {
                    backToTopFrame = requestAnimationFrame(scrollUp);
                } else {
                    root.style.scrollBehavior = previousScrollBehavior;
                    backToTopFrame = 0;
                    updateBackToTopVisibility();
                }
            };

            backToTopFrame = requestAnimationFrame(scrollUp);
        });

        const updateHeroPaginationNumbers = (heroSwiper) => {
            heroSwiper.pagination.bullets.forEach((bullet, index) => {
                bullet.textContent = String(index + 1);
            });
        };

        const startHeroAutoplay = () => {
            const heroSwiper = document.querySelector(".hero-slider")?.swiper;
            if (!heroSwiper) {
                return;
            }

            updateHeroPaginationNumbers(heroSwiper);
            heroSwiper.on("paginationRender", () => updateHeroPaginationNumbers(heroSwiper));

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            heroSwiper.params.autoplay = { delay: 5000, disableOnInteraction: false };
            heroSwiper.originalParams.autoplay = heroSwiper.params.autoplay;
            heroSwiper.autoplay.start();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", startHeroAutoplay, { once: true });
        } else {
            startHeroAutoplay();
        }

        const programMobileQuery = window.matchMedia("(max-width: 575.98px)");
        const programToggleButtons = Array.from(document.querySelectorAll("#programs .program-toggle"));
        const programCards = document.querySelector("#programs .program-cards");
        const programCarouselPrevious = document.querySelector("#programs .program-carousel-prev");
        const programCarouselNext = document.querySelector("#programs .program-carousel-next");
        const updateProgramCarouselControls = () => {
            if (!programCards) return;

            const isMobile = programMobileQuery.matches;
            const atStart = programCards.scrollLeft <= 1;
            const atEnd = programCards.scrollLeft + programCards.clientWidth >= programCards.scrollWidth - 1;

            [[programCarouselPrevious, !isMobile || atStart], [programCarouselNext, !isMobile || atEnd]]
                .forEach(([button, hidden]) => {
                    button.disabled = hidden;
                    button.classList.toggle("is-hidden", hidden);
                    button.setAttribute("aria-hidden", String(hidden));
                    button.tabIndex = hidden ? -1 : 0;
                });
        };

        programCards.addEventListener("scroll", updateProgramCarouselControls, { passive: true });
        programMobileQuery.addEventListener("change", updateProgramCarouselControls);
        window.addEventListener("resize", updateProgramCarouselControls);
        programCarouselPrevious.addEventListener("click", () => {
            programCards.scrollBy({
                left: -programCards.clientWidth * 0.9,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
            });
        });
        programCarouselNext.addEventListener("click", () => {
            programCards.scrollBy({
                left: programCards.clientWidth * 0.9,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
            });
        });
        updateProgramCarouselControls();

        const setProgramDescriptionExpanded = (button, expanded) => {
            const description = document.getElementById(button.getAttribute("aria-controls"));
            const card = button.closest(".event-wrap");
            const collapsedOnMobile = programMobileQuery.matches && !expanded;

            button.setAttribute("aria-expanded", String(expanded));
            button.textContent = expanded ? "Hide" : "Learn More";
            description.setAttribute("aria-hidden", String(collapsedOnMobile));
            description.inert = collapsedOnMobile;
            card.classList.toggle("program-expanded", expanded);
        };

        programToggleButtons.forEach((button) => {
            setProgramDescriptionExpanded(button, false);
            button.addEventListener("click", () => {
                const isExpanded = button.getAttribute("aria-expanded") === "true";
                setProgramDescriptionExpanded(button, !isExpanded);
            });
        });

        programMobileQuery.addEventListener("change", () => {
            programToggleButtons.forEach((button) => setProgramDescriptionExpanded(button, false));
        });

        const gallery = document.querySelector("#gallery");
        const galleryToggleButtons = Array.from(gallery.querySelectorAll(".gallery-toggle"));
        gallery.classList.add("gallery-interactive");

        galleryToggleButtons.forEach((button) => {
            const description = document.getElementById(button.getAttribute("aria-controls"));
            const card = button.closest(".gallery-item");

            button.hidden = false;
            description.setAttribute("aria-hidden", "true");
            description.inert = true;

            button.addEventListener("click", () => {
                const expanded = button.getAttribute("aria-expanded") !== "true";

                button.setAttribute("aria-expanded", String(expanded));
                button.textContent = expanded ? "Hide" : "Learn More";
                description.setAttribute("aria-hidden", String(!expanded));
                description.inert = !expanded;
                card.classList.toggle("gallery-expanded", expanded);
            });
        });

        const navigation = document.querySelector("#site-menu");
        const navigationBar = document.querySelector(".nav-bar");
        const navigationItems = Array.from(navigation.querySelectorAll("li"));
        const navigationSections = navigationItems
            .map((item) => {
                const link = item.querySelector("a");
                const section = document.querySelector(link.getAttribute("href"));
                return section ? { item, link, section } : null;
            })
            .filter(Boolean);

        const setActiveNavigation = (activeSection) => {
            navigationSections.forEach(({ item, link, section }) => {
                const isActive = section === activeSection;
                item.classList.toggle("current-menu-item", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "page");
                    if (window.matchMedia("(min-width: 992px)").matches) {
                        const navBounds = navigation.getBoundingClientRect();
                        const linkBounds = link.getBoundingClientRect();
                        navigation.style.setProperty("--active-nav-left", `${linkBounds.left - navBounds.left}px`);
                        navigation.style.setProperty("--active-nav-width", `${linkBounds.width}px`);
                    }
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        };

        let pendingNavigationTarget = null;
        let navigationTargetTimeout = 0;

        const updateScrollSpy = () => {
            const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
            const activationLine = Math.max(navigationBar.getBoundingClientRect().bottom, scrollPadding) + 1;

            if (pendingNavigationTarget) {
                const targetTop = pendingNavigationTarget.getBoundingClientRect().top;

                if (targetTop <= activationLine + 2) {
                    pendingNavigationTarget = null;
                    window.clearTimeout(navigationTargetTimeout);
                } else {
                    return;
                }
            }

            const activeItem = navigationSections.find(({ section }) => {
                const bounds = section.getBoundingClientRect();
                return bounds.top <= activationLine && bounds.bottom > activationLine;
            });
            const activeSection = activeItem?.section
                ?? navigationSections
                    .filter(({ section }) => section.getBoundingClientRect().top <= activationLine)
                    .at(-1)?.section
                ?? navigationSections[0]?.section;

            if (activeSection) setActiveNavigation(activeSection);
        };

        let scrollSpyFrame = 0;
        const scheduleScrollSpyUpdate = () => {
            if (!scrollSpyFrame) {
                scrollSpyFrame = requestAnimationFrame(() => {
                    updateScrollSpy();
                    scrollSpyFrame = 0;
                });
            }
        };

        navigation.addEventListener("click", (event) => {
            const link = event.target.closest('a[href^="#"]');
            const destination = link && document.querySelector(link.getAttribute("href"));

            if (destination) {
                pendingNavigationTarget = destination;
                window.clearTimeout(navigationTargetTimeout);
                navigationTargetTimeout = window.setTimeout(() => {
                    pendingNavigationTarget = null;
                    scheduleScrollSpyUpdate();
                }, 2000);
                setActiveNavigation(destination);
            }
        });
        window.addEventListener("scroll", scheduleScrollSpyUpdate, { passive: true });
        window.addEventListener("resize", () => {
            scheduleScrollSpyUpdate();
            window.requestAnimationFrame(() => {
                const activeNavigation = navigationSections.find(({ item }) => item.classList.contains("current-menu-item"));
                if (activeNavigation) setActiveNavigation(activeNavigation.section);
            });
        });
        window.addEventListener("hashchange", scheduleScrollSpyUpdate);
        updateScrollSpy();
    