// fragrances.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) color‐classes for the pills inside each card
  const scentClasses = {
    Fresh: "scent-fresh",
    Floral: "scent-floral",
    Woody: "scent-woody",
    Oriental: "scent-oriental",
  };
  const seasonClasses = {
    Spring: "season-spring",
    Summer: "season-summer",
    Fall: "season-fall",
    Winter: "season-winter",
  };

  // 2) grab DOM nodes
  const grid = document.getElementById("allFragrancesGrid");
  const tpl = document.getElementById("frag-card-template");
  const searchInput = document.getElementById("filter-search");
  const brandSelect = document.getElementById("filter-brand");
  const scentContainer = document.getElementById("filter-scent");
  const seasonContainer = document.getElementById("filter-season");
  const rendered = [];

  // 3) parse CSV
  Papa.parse("data/FragranceSheet.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({ data }) => {
      const brands = new Set();
      const scents = new Set();
      const seasons = new Set();

      // build cards + collect sets
      data.forEach((row) => {
        if (!row.Name) return;
        const slug = row.Name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // clone template
        const clone = tpl.content.cloneNode(true);
        clone.querySelector(".frag-image").src = `BottleImages/${slug}.avif`;
        clone.querySelector(".frag-image").alt = row.Name;
        clone.querySelector(
          ".btn-frag-view"
        ).href = `perfume.html?name=${encodeURIComponent(slug)}`;

        // scent pills on the card
        const sw = clone.querySelector(".frag-scent-multi");
        row.Scent.split(",")
          .map((s) => s.trim())
          .forEach((s) => {
            const span = document.createElement("span");
            span.textContent = s;
            span.classList.add(
              "px-2",
              "py-1",
              "text-white",
              scentClasses[s] || "bg-secondary"
            );
            sw.appendChild(span);
            scents.add(s);
          });

        // season pills on the card
        const sew = clone.querySelector(".frag-season-multi");
        row.Season.split(",")
          .map((s) => s.trim())
          .forEach((s) => {
            const span = document.createElement("span");
            span.textContent = s;
            span.classList.add(
              "px-2",
              "py-1",
              "text-white",
              seasonClasses[s] || "bg-secondary"
            );
            sew.appendChild(span);
            seasons.add(s);
          });

        // text fields
        clone.querySelector(".frag-name").textContent = row.Name;
        clone.querySelector(".frag-brand").textContent = row.Brand;
        clone.querySelector(".frag-rating").textContent = row.Ratings;
        clone.querySelector(".frag-votes").textContent = `(${row.Votes})`;
        brands.add(row.Brand);

        // append to grid
        const wrapper = document.createElement("div");
        wrapper.appendChild(clone);
        const col = wrapper.firstElementChild;
        grid.appendChild(col);
        rendered.push(col);
      });

      // 4) build Brand <select>
      function buildOptions(set, selectEl, label) {
        selectEl.innerHTML = `<option value="">All ${label}</option>`;
        Array.from(set)
          .sort()
          .forEach((val) => {
            const opt = document.createElement("option");
            opt.value = val;
            opt.textContent = val;
            selectEl.appendChild(opt);
          });
      }
      buildOptions(brands, brandSelect, "Brands");

      // 5) build custom‐checkbox pills inside each dropdown
      function buildToggles(set, container, type) {
        container.innerHTML = "";
        Array.from(set)
          .sort()
          .forEach((value) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-filter"; // your custom style
            btn.textContent = value;
            btn.dataset.filterType = type;
            btn.dataset.filterValue = value;
            container.appendChild(btn);
          });
      }
      buildToggles(scents, scentContainer, "scent");
      buildToggles(seasons, seasonContainer, "season");

      // 6) track active filters
      const active = {
        brand: "",
        scent: new Set(),
        season: new Set(),
      };

      // 7) show/hide cards
      function applyFilters() {
        const q = searchInput.value.trim().toLowerCase();
        rendered.forEach((col) => {
          const nm = col.querySelector(".frag-name").textContent.toLowerCase();
          const br = col.querySelector(".frag-brand").textContent;
          const scL = Array.from(
            col.querySelectorAll(".frag-scent-multi span")
          ).map((el) => el.textContent);
          const seL = Array.from(
            col.querySelectorAll(".frag-season-multi span")
          ).map((el) => el.textContent);

          const okSearch = !q || nm.includes(q) || br.toLowerCase().includes(q);
          const okBrand = !active.brand || br === active.brand;
          const okScent =
            !active.scent.size ||
            [...active.scent].every((s) => scL.includes(s));
          const okSeason =
            !active.season.size ||
            [...active.season].every((s) => seL.includes(s));

          col.style.display =
            okSearch && okBrand && okScent && okSeason ? "" : "none";
        });
      }

      // 8) wire up interactions
      searchInput.addEventListener("input", applyFilters);
      brandSelect.addEventListener("change", () => {
        active.brand = brandSelect.value;
        applyFilters();
      });

      // listen for clicks on any .btn-filter (scent or season)
      document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-filter");
        if (!btn) return;

        const { filterType, filterValue } = btn.dataset;
        const set = active[filterType];

        btn.classList.toggle("active");
        if (btn.classList.contains("active")) set.add(filterValue);
        else set.delete(filterValue);

        // update the dropdown’s button text
        if (filterType === "scent") {
          document.getElementById("scentDropdownBtn").textContent = set.size
            ? [...set].join(", ")
            : "All Scents";
        } else {
          document.getElementById("seasonDropdownBtn").textContent = set.size
            ? [...set].join(", ")
            : "All Seasons";
        }

        applyFilters();
      });
    },
    error: (err) => console.error(err),
  });
});
