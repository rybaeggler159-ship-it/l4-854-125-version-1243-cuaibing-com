(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function textOf(value) {
        return String(value || "").toLowerCase();
    }

    ready(function () {
        var toggle = document.getElementById("menuToggle");
        var menu = document.getElementById("mobileMenu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var target = panel.getAttribute("data-target") || ".movie-card";
            var cards = Array.prototype.slice.call(document.querySelectorAll(target));
            var searchInput = panel.querySelector("[data-search-input]");
            var regionInput = panel.querySelector("[data-filter-region]");
            var typeInput = panel.querySelector("[data-filter-type]");
            var yearInput = panel.querySelector("[data-filter-year]");
            var empty = document.querySelector("[data-empty-state]");

            function applyFilters() {
                var query = textOf(searchInput && searchInput.value);
                var region = textOf(regionInput && regionInput.value);
                var type = textOf(typeInput && typeInput.value);
                var year = textOf(yearInput && yearInput.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].map(textOf).join(" ");
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (region && textOf(card.getAttribute("data-region")) !== region) {
                        ok = false;
                    }
                    if (type && textOf(card.getAttribute("data-type")) !== type) {
                        ok = false;
                    }
                    if (year && textOf(card.getAttribute("data-year")).indexOf(year) === -1) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [searchInput, regionInput, typeInput, yearInput].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", applyFilters);
                    input.addEventListener("change", applyFilters);
                }
            });
        });
    });
})();
