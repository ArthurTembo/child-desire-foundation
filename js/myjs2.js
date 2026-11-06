const revealTargets = document.querySelectorAll("[data-scroll-reveal], [data-scroll-reveal-item]");

        if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.documentElement.classList.add("scroll-reveal-enabled");

            const sectionObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            revealTargets.forEach((target) => sectionObserver.observe(target));
        }