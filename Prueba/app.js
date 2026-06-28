// Puebla Bites - Application Logic

/* ==========================================================================
   1. Database of Local Fast Food Spots in Puebla
   ========================================================================== */
const RESTAURANTS = [
    {
        id: "cemitas-as-oros",
        name: "Cemitas El As de Oros",
        category: "cemitas",
        rating: 4.8,
        price: 1, // $
        zone: "centro",
        zoneLabel: "Centro Histórico (Mercado de Sabores)",
        address: "Av. 4 Pte. 1104, Centro, Puebla, Pue.",
        specialty: "Cemita de Milanesa de Cerdo",
        desc: "Las famosas y colosales cemitas del Mercado de Sabores. Servidas con milanesa crujiente, toneladas de quesillo deshebrado, aguacate fresco, pápalo y chipotles dulces caseros.",
        image: "images/cemita_poblana.png",
        mapsLink: "https://maps.google.com/?q=Cemitas+El+As+de+Oros+Puebla"
    },
    {
        id: "tacos-bagdad",
        name: "Tacos Bagdad",
        category: "tacos",
        rating: 4.9,
        price: 2, // $$
        zone: "centro",
        zoneLabel: "Centro Histórico",
        address: "Av. 2 Pte. 311, Centro, Puebla, Pue.",
        specialty: "Taco Árabe Especial en Pan Árabe",
        desc: "Fundados en 1933, son pioneros de los auténticos Tacos Árabes en Puebla. Carne de cerdo perfectamente condimentada, cocinada en trompo al carbón y servida en su icónico pan árabe grueso.",
        image: "images/tacos_arabes.png",
        mapsLink: "https://maps.google.com/?q=Tacos+Bagdad+Puebla"
    },
    {
        id: "chalupas-san-francisco",
        name: "Chalupas de San Francisco",
        category: "chalupas",
        rating: 4.7,
        price: 1, // $
        zone: "san-francisco",
        zoneLabel: "San Francisco",
        address: "Paseo de San Francisco, El Alto, Puebla, Pue.",
        specialty: "Orden Mixta de Chalupas",
        desc: "El rincón tradicional por excelencia. Tortillas pequeñas fritas en manteca de cerdo, bañadas en salsa verde y roja picante, carne de cerdo deshebrada y cebolla picada fina.",
        image: "images/chalupas_poblanas.png",
        mapsLink: "https://maps.google.com/?q=Chalupas+de+San+Francisco+Puebla"
    },
    {
        id: "molotes-gran-fama",
        name: "Molotes La Gran Fama",
        category: "molotes",
        rating: 4.6,
        price: 1, // $
        zone: "centro",
        zoneLabel: "Centro Histórico",
        address: "Av. Reforma 509, Centro, Puebla, Pue.",
        specialty: "Molote de Tinga con Queso",
        desc: "Una institución poblana abierta desde hace décadas. Molotes crujientes de masa de maíz frita, rellenos de guisos tradicionales como tinga de pollo, chicharrón prensado o champiñones.",
        image: "images/molotes_poblanos.png",
        mapsLink: "https://maps.google.com/?q=Molotes+La+Gran+Fama+Puebla"
    },
    {
        id: "cemitas-la-colonial",
        name: "Cemitas La Colonial",
        category: "cemitas",
        rating: 4.6,
        price: 1, // $
        zone: "el-carmen",
        zoneLabel: "El Carmen",
        address: "Calle 16 de Septiembre 1106, El Carmen, Puebla, Pue.",
        specialty: "Cemita de Carnitas o Pata",
        desc: "Famosas por su sabor tradicional y servicio ultra veloz. La de pata de res escabechada y la de milanesa son las favoritas de los comensales poblanos locales.",
        image: "images/cemita_poblana.png",
        mapsLink: "https://maps.google.com/?q=Cemitas+La+Colonial+Puebla"
    },
    {
        id: "tacos-oriental",
        name: "Antigua Taquería La Oriental",
        category: "tacos",
        rating: 4.5,
        price: 2, // $$
        zone: "la-paz",
        zoneLabel: "La Paz / Varias Sucursales",
        address: "Av. Juárez 2105, La Paz, Puebla, Pue.",
        specialty: "Taco Árabe y Queso Árabe",
        desc: "Una de las cadenas más queridas y tradicionales de Puebla. Ofrece carne árabe de gran calidad, salsa chipotle especial y unas quesadillas en pan árabe (quesos árabes) imperdibles.",
        image: "images/tacos_arabes.png",
        mapsLink: "https://maps.google.com/?q=Antigua+Taqueria+La+Oriental+Juarez+Puebla"
    },
    {
        id: "molotes-cholula-pica",
        name: "Molotes El Picaapica",
        category: "molotes",
        rating: 4.7,
        price: 1, // $
        zone: "cholula",
        zoneLabel: "San Andrés Cholula",
        address: "Calle 14 Ote. 402, San Juan Aquiahuac, Cholula, Pue.",
        specialty: "Molote Especial con Chicharrón y Papas",
        desc: "Lugar sumamente popular entre los estudiantes en Cholula. Molotes gigantes con combinaciones modernas y salsas extremadamente picantes pero adictivas.",
        image: "images/molotes_poblanos.png",
        mapsLink: "https://maps.google.com/?q=Molotes+El+Picaapica+Cholula"
    },
    {
        id: "burgers-cobacha",
        name: "Super Hamburguesas La Cobacha",
        category: "otros",
        rating: 4.7,
        price: 2, // $$
        zone: "cholula",
        zoneLabel: "San Pedro Cholula",
        address: "Av. Morelos 506, San Pedro Cholula, Pue.",
        specialty: "Hamburguesa de Asada con Quesillo",
        desc: "El toque callejero poblano llevado a las hamburguesas. Carne al carbón jugosa, complementada con el tradicional quesillo de hebra fundido y rodajas de aguacate criollo.",
        image: "images/cemita_poblana.png",
        mapsLink: "https://maps.google.com/?q=La+Cobacha+Cholula"
    }
];

/* ==========================================================================
   2. State Management
   ========================================================================== */
let state = {
    filters: {
        category: "all",
        zone: "all",
        price: "all",
        search: ""
    },
    sort: "rating",
    favorites: JSON.parse(localStorage.getItem("puebla_bites_favs")) || []
};

/* ==========================================================================
   3. DOM Elements
   ========================================================================== */
const DOM = {
    catalogGrid: document.getElementById("catalog-grid"),
    resultsCount: document.getElementById("results-count"),
    emptyState: document.getElementById("empty-state"),
    searchInput: document.getElementById("search-input"),
    searchClearBtn: document.getElementById("search-clear-btn"),
    categoriesContainer: document.getElementById("categories-container"),
    zoneSelect: document.getElementById("zone-select"),
    priceContainer: document.getElementById("price-options-container"),
    sortSelect: document.getElementById("sort-select"),
    resetFiltersBtn: document.getElementById("reset-filters-btn"),
    favoritesGrid: document.getElementById("favorites-grid"),
    emptyFavorites: document.getElementById("empty-favorites"),
    favoriteCount: document.getElementById("favorite-count"),
    themeToggleBtn: document.getElementById("theme-toggle-btn"),
    
    // Randomizer
    spinBtn: document.getElementById("spin-button"),
    wheel: document.getElementById("wheel"),
    spinResultCard: document.getElementById("spin-result-card"),
    closeResultBtn: document.getElementById("close-result-btn"),
    resultImg: document.getElementById("result-img"),
    resultCategory: document.getElementById("result-category"),
    resultTitle: document.getElementById("result-title"),
    resultDesc: document.getElementById("result-desc"),
    resultZone: document.getElementById("result-zone"),
    resultRating: document.getElementById("result-rating"),
    resultMapLink: document.getElementById("result-map-link"),
    resultFavBtn: document.getElementById("result-fav-btn"),
    
    // Navigation / Headings
    navLinkExplore: document.getElementById("nav-link-explore"),
    navLinkRandom: document.getElementById("nav-link-random"),
    navLinkFavs: document.getElementById("nav-link-favs"),
    logoLink: document.getElementById("logo-link"),
    footerCemitas: document.getElementById("footer-cemitas"),
    footerTacos: document.getElementById("footer-tacos"),
    footerChalupas: document.getElementById("footer-chalupas"),
    footerMolotes: document.getElementById("footer-molotes")
};

/* ==========================================================================
   4. Rendering Logic
   ========================================================================== */

// Helper to create price representation
function getPriceHTML(priceLevel) {
    let html = "";
    for (let i = 1; i <= 3; i++) {
        if (i <= priceLevel) {
            html += "<span>$</span>";
        } else {
            html += "<span class='card-price-inactive'>$</span>";
        }
    }
    return html;
}

// Generate single card HTML string
function createCardHTML(spot, isFavoriteSection = false) {
    const isFav = state.favorites.includes(spot.id);
    const favClass = isFav ? "is-favorite" : "";
    const heartIcon = isFav ? "heart" : "heart";
    const fillStyle = isFav ? 'fill="currentColor"' : "";
    
    return `
        <article class="food-card" data-id="${spot.id}">
            <div class="card-media">
                <img src="${spot.image}" alt="${spot.name}" class="card-img" loading="lazy">
                <span class="card-badge">${spot.category}</span>
                <button class="card-fav-btn ${favClass}" data-id="${spot.id}" aria-label="Agregar a favoritos">
                    <i data-lucide="heart" ${isFav ? 'class="star-icon"' : ''}></i>
                </button>
            </div>
            <div class="card-body">
                <div class="card-header-row">
                    <h3 class="card-title">${spot.name}</h3>
                    <div class="card-rating">
                        <i data-lucide="star"></i>
                        <span>${spot.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p class="card-desc">${spot.desc}</p>
                
                <div class="card-specialty">
                    <span>Recomendación:</span>
                    ${spot.specialty}
                </div>
                
                <div class="card-meta-row">
                    <div class="card-location">
                        <i data-lucide="map-pin"></i>
                        <span>${spot.zoneLabel}</span>
                    </div>
                    <div class="card-price">
                        ${getPriceHTML(spot.price)}
                    </div>
                </div>
                
                <div class="card-footer-actions">
                    <a href="${spot.mapsLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm btn-block">
                        <i data-lucide="map"></i> Mapa
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Render dynamic catalog list based on state filters
function renderCatalog() {
    let filtered = RESTAURANTS.filter(spot => {
        // Category Filter
        if (state.filters.category !== "all" && spot.category !== state.filters.category) {
            return false;
        }
        
        // Zone Filter
        if (state.filters.zone !== "all" && spot.zone !== state.filters.zone) {
            return false;
        }
        
        // Price Filter
        if (state.filters.price !== "all" && spot.price !== parseInt(state.filters.price)) {
            return false;
        }
        
        // Search Filter
        if (state.filters.search) {
            const query = state.filters.search.toLowerCase();
            return (
                spot.name.toLowerCase().includes(query) ||
                spot.desc.toLowerCase().includes(query) ||
                spot.specialty.toLowerCase().includes(query) ||
                spot.zoneLabel.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
        if (state.sort === "rating") {
            return b.rating - a.rating;
        } else if (state.sort === "name") {
            return a.name.localeCompare(b.name);
        } else if (state.sort === "price-asc") {
            return a.price - b.price;
        }
        return 0;
    });

    // Update result counter
    const count = filtered.length;
    DOM.resultsCount.textContent = `${count} ${count === 1 ? 'lugar encontrado' : 'lugares encontrados'}`;

    // Render grid
    if (count === 0) {
        DOM.catalogGrid.style.display = "none";
        DOM.emptyState.style.display = "flex";
    } else {
        DOM.catalogGrid.style.display = "grid";
        DOM.emptyState.style.display = "none";
        DOM.catalogGrid.innerHTML = filtered.map(spot => createCardHTML(spot)).join("");
    }
    
    // Re-initialize Lucide icons for dynamically added content
    lucide.createIcons();
    attachCardListeners();
}

// Render bookmarked spots
function renderFavorites() {
    const favoriteSpots = RESTAURANTS.filter(spot => state.favorites.includes(spot.id));
    DOM.favoriteCount.textContent = state.favorites.length;
    
    if (favoriteSpots.length === 0) {
        DOM.favoritesGrid.style.display = "none";
        DOM.emptyFavorites.style.display = "flex";
    } else {
        DOM.favoritesGrid.style.display = "grid";
        DOM.emptyFavorites.style.display = "none";
        DOM.favoritesGrid.innerHTML = favoriteSpots.map(spot => createCardHTML(spot, true)).join("");
    }
    
    lucide.createIcons();
    attachCardListeners();
}

// Attach click listeners to cards' dynamic action buttons
function attachCardListeners() {
    // Favorites Heart Buttons
    document.querySelectorAll(".card-fav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            toggleFavorite(id);
        });
    });
}

/* ==========================================================================
   5. Favorite & Local Storage Controls
   ========================================================================== */
function toggleFavorite(id) {
    if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(favId => favId !== id);
    } else {
        state.favorites.push(id);
    }
    
    localStorage.setItem("puebla_bites_favs", JSON.stringify(state.favorites));
    
    // Re-render both sections to stay synchronized
    renderCatalog();
    renderFavorites();
    updateResultCardFavState();
}

// Keeps the randomizer result overlay favorite button state in sync
function updateResultCardFavState() {
    const currentResultId = DOM.spinResultCard.getAttribute("data-restaurant-id");
    if (!currentResultId) return;
    
    const isFav = state.favorites.includes(currentResultId);
    if (isFav) {
        DOM.resultFavBtn.classList.add("btn-primary");
        DOM.resultFavBtn.classList.remove("btn-outline");
        DOM.resultFavBtn.innerHTML = `<i data-lucide="heart" class="star-icon"></i> Guardado`;
    } else {
        DOM.resultFavBtn.classList.remove("btn-primary");
        DOM.resultFavBtn.classList.add("btn-outline");
        DOM.resultFavBtn.innerHTML = `<i data-lucide="heart"></i> Guardar`;
    }
    lucide.createIcons();
}

/* ==========================================================================
   6. Theme Switcher (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem("puebla_bites_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    DOM.themeToggleBtn.innerHTML = theme === "dark" 
        ? `<i data-lucide="sun"></i>` 
        : `<i data-lucide="moon"></i>`;
    lucide.createIcons();
}

DOM.themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("puebla_bites_theme", newTheme);
    updateThemeIcon(newTheme);
});

/* ==========================================================================
   7. Interactive Recommendation Wheel (Randomizer)
   ========================================================================== */
let isSpinning = false;
let currentRotation = 0;

DOM.spinBtn.addEventListener("click", () => {
    if (isSpinning) return;
    
    isSpinning = true;
    DOM.spinBtn.disabled = true;
    DOM.spinResultCard.style.display = "none";
    
    // Choose a random restaurant
    const randomIndex = Math.floor(Math.random() * RESTAURANTS.length);
    const chosenSpot = RESTAURANTS[randomIndex];
    
    // 6 slices on our wheel, but let's rotate 5 to 8 full spins + segment angle
    // Each category / food has a corresponding slice:
    // Slices are: 0: Cemitas, 1: Tacos, 2: Chalupas, 3: Molotes, 4: Burgers, 5: Hot Dogs (Others)
    const categoryToSliceIndex = {
        "cemitas": 0,
        "tacos": 1,
        "chalupas": 2,
        "molotes": 3,
        "otros": 4
    };
    
    const sliceIndex = categoryToSliceIndex[chosenSpot.category] !== undefined 
        ? categoryToSliceIndex[chosenSpot.category] 
        : 5;
    
    // Angle offset: slices are 60 degrees. Slices are rendered clockwise starting from top/right.
    // To align sliceIndex to the top pointer (270 degrees), we calculate target rotation.
    // Spin degrees = full spins (720 * 3) + target offset
    const segmentAngle = 60;
    // Calculate degree to spin to so that the selected slice ends up pointing up (270 degrees)
    // Slices on wheel are 0 to 5.
    // Pointer is at the top. Let's make a beautiful rotation that feels satisfying.
    const randomShift = Math.floor(Math.random() * 40) - 20; // adding some randomness within the slice
    const targetAngle = 3600 + (360 - (sliceIndex * segmentAngle)) + randomShift;
    
    currentRotation = targetAngle;
    DOM.wheel.style.transform = `rotate(${currentRotation}deg)`;
    
    // After CSS transition finishes (5 seconds)
    setTimeout(() => {
        showRandomizerResult(chosenSpot);
        isSpinning = false;
        DOM.spinBtn.disabled = false;
    }, 5000);
});

function showRandomizerResult(spot) {
    DOM.spinResultCard.setAttribute("data-restaurant-id", spot.id);
    DOM.resultImg.src = spot.image;
    DOM.resultImg.alt = spot.name;
    DOM.resultCategory.textContent = spot.category;
    DOM.resultTitle.textContent = spot.name;
    DOM.resultDesc.textContent = spot.desc;
    DOM.resultZone.textContent = spot.zoneLabel;
    DOM.resultRating.textContent = spot.rating.toFixed(1);
    DOM.resultMapLink.href = spot.mapsLink;
    
    updateResultCardFavState();
    
    DOM.spinResultCard.style.display = "block";
    
    // Smooth scroll to the result card so user sees it instantly
    DOM.spinResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Modal Close Button
DOM.closeResultBtn.addEventListener("click", () => {
    DOM.spinResultCard.style.display = "none";
    DOM.spinResultCard.removeAttribute("data-restaurant-id");
});

// Result card Fav button interaction
DOM.resultFavBtn.addEventListener("click", () => {
    const id = DOM.spinResultCard.getAttribute("data-restaurant-id");
    if (id) {
        toggleFavorite(id);
    }
});

/* ==========================================================================
   8. Event Listeners for Filters & Interactions
   ========================================================================== */

// Search input handling
DOM.searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    
    if (e.target.value.trim().length > 0) {
        DOM.searchClearBtn.style.display = "flex";
    } else {
        DOM.searchClearBtn.style.display = "none";
    }
    
    renderCatalog();
});

// Search clear button
DOM.searchClearBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    state.filters.search = "";
    DOM.searchClearBtn.style.display = "none";
    renderCatalog();
});

// Category filtering buttons
DOM.categoriesContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;
    
    // Toggle active classes
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    state.filters.category = btn.getAttribute("data-category");
    renderCatalog();
});

// Zone dropdown selection
DOM.zoneSelect.addEventListener("change", (e) => {
    state.filters.zone = e.target.value;
    renderCatalog();
});

// Sort select selection
DOM.sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderCatalog();
});

// Price filter button clicks
DOM.priceContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".price-btn");
    if (!btn) return;
    
    const clickedPrice = btn.getAttribute("data-price");
    
    if (state.filters.price === clickedPrice) {
        // Toggle off if clicking the already active price filter
        btn.classList.remove("active");
        state.filters.price = "all";
    } else {
        document.querySelectorAll(".price-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.filters.price = clickedPrice;
    }
    
    renderCatalog();
});

// Reset filter button on empty catalog state
DOM.resetFiltersBtn.addEventListener("click", () => {
    resetAllFilters();
});

function resetAllFilters() {
    state.filters.category = "all";
    state.filters.zone = "all";
    state.filters.price = "all";
    state.filters.search = "";
    state.sort = "rating";
    
    // Sync UI elements
    DOM.searchInput.value = "";
    DOM.searchClearBtn.style.display = "none";
    DOM.zoneSelect.value = "all";
    DOM.sortSelect.value = "rating";
    
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    DOM.categoriesContainer.querySelector('[data-category="all"]').classList.add("active");
    
    document.querySelectorAll(".price-btn").forEach(b => b.classList.remove("active"));
    
    renderCatalog();
}

// Navigation links smooth switching states
function handleNavigationClick(activeLinkId) {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });
    const activeLink = document.getElementById(activeLinkId);
    if (activeLink) activeLink.classList.add("active");
}

DOM.navLinkExplore.addEventListener("click", () => handleNavigationClick("nav-link-explore"));
DOM.navLinkRandom.addEventListener("click", () => handleNavigationClick("nav-link-random"));
DOM.navLinkFavs.addEventListener("click", () => handleNavigationClick("nav-link-favs"));
DOM.logoLink.addEventListener("click", () => handleNavigationClick("nav-link-explore"));

// Footer category triggers
function triggerCategoryFromFooter(cat) {
    resetAllFilters();
    const targetBtn = DOM.categoriesContainer.querySelector(`[data-category="${cat}"]`);
    if (targetBtn) {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");
        state.filters.category = cat;
        renderCatalog();
    }
}

DOM.footerCemitas.addEventListener("click", (e) => {
    e.preventDefault();
    triggerCategoryFromFooter("cemitas");
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

DOM.footerTacos.addEventListener("click", (e) => {
    e.preventDefault();
    triggerCategoryFromFooter("tacos");
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

DOM.footerChalupas.addEventListener("click", (e) => {
    e.preventDefault();
    triggerCategoryFromFooter("chalupas");
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

DOM.footerMolotes.addEventListener("click", (e) => {
    e.preventDefault();
    triggerCategoryFromFooter("molotes");
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

// Window Scroll triggers header shrink/scroll indicator updates
window.addEventListener("scroll", () => {
    const header = document.getElementById("app-header");
    if (window.scrollY > 50) {
        header.style.padding = "4px 0";
        header.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
    } else {
        header.style.padding = "16px 0";
        header.style.boxShadow = "none";
    }
});

/* ==========================================================================
   9. Initialization
   ========================================================================== */
function init() {
    initTheme();
    renderCatalog();
    renderFavorites();
}

window.addEventListener("DOMContentLoaded", init);
