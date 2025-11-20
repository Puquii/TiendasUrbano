// Catalog JavaScript Functionality

// Filter Toggle for Mobile
const filterToggle = document.getElementById('filter-toggle');
const sidebar = document.querySelector('.catalog-sidebar');
let sidebarOverlay;

if (filterToggle) {
    filterToggle.addEventListener('click', () => {
        // Create overlay if it doesn't exist
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
            
            sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Toggle sidebar
        sidebar.classList.add('mobile-active');
        setTimeout(() => {
            sidebar.classList.add('show');
            sidebarOverlay.classList.add('active');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    });
}

function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            sidebar.classList.remove('mobile-active');
        }, 300);
    }
}

// Clear Filters
const clearFiltersBtn = document.querySelector('.btn-clear-filters');
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.value !== 'todas') {
                checkbox.checked = false;
            } else {
                checkbox.checked = true;
            }
        });
    });
}

// Product Favorite Toggle
const favoriteButtons = document.querySelectorAll('.product-favorite');
favoriteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('active');
        
        const svg = btn.querySelector('svg');
        if (btn.classList.contains('active')) {
            svg.setAttribute('fill', 'currentColor');
        } else {
            svg.setAttribute('fill', 'none');
        }
    });
});

// Quick View
const quickViewButtons = document.querySelectorAll('.product-quick-view');
quickViewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        
        alert(`Vista rápida de: ${productName}\n\n(Esta funcionalidad se implementaría con un modal)`);
    });
});

// Category Filter
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.value === 'todas') {
            if (checkbox.checked) {
                categoryCheckboxes.forEach(cb => {
                    if (cb.value !== 'todas') cb.checked = false;
                });
            }
        } else {
            const todasCheckbox = document.querySelector('input[value="todas"]');
            if (todasCheckbox) {
                todasCheckbox.checked = false;
            }
        }
        
        // Update product count
        updateProductCount();
    });
});

// Price Filter
const priceCheckboxes = document.querySelectorAll('input[name="price"]');
priceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateProductCount();
    });
});

// Stock Filter
const stockCheckboxes = document.querySelectorAll('input[name="stock"]');
stockCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateProductCount();
    });
});

// Update Product Count (Demo)
function updateProductCount() {
    const checkedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked && cb.value !== 'todas')
        .map(cb => cb.value);
    
    const checkedPrices = Array.from(priceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    const checkedStock = Array.from(stockCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // This is a demo - in a real app, you would filter products based on selected filters
    console.log('Selected filters:', {
        categories: checkedCategories,
        prices: checkedPrices,
        stock: checkedStock
    });
}

// Sort Select
const sortSelect = document.querySelector('.sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        const sortValue = e.target.value;
        console.log('Sorting by:', sortValue);
        
        // This is a demo - in a real app, you would sort products based on selected option
        // For example, you could rearrange the product cards in the DOM
    });
}

// Product Card Click (Navigate to product detail)
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on favorite or quick view buttons
        if (e.target.closest('.product-favorite') || e.target.closest('.product-quick-view')) {
            return;
        }
        
        const productName = card.querySelector('h3').textContent;
        console.log('Navigating to product:', productName);
        // In a real app, navigate to product detail page
        // window.location.href = `/producto/${productId}`;
    });
    
    // Add cursor pointer style
    card.style.cursor = 'pointer';
});

// Pagination
const paginationButtons = document.querySelectorAll('.pagination-btn');
paginationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        
        // Remove active class from all buttons
        paginationButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button (if it's a number)
        if (!btn.querySelector('svg')) {
            btn.classList.add('active');
        }
        
        // Scroll to top of catalog
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('Changed to page:', btn.textContent);
    });
});

// Close sidebar on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        closeSidebar();
    }
});

// Handle browser back button
window.addEventListener('popstate', () => {
    closeSidebar();
});
