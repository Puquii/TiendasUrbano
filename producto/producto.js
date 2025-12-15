// ==========================================
// PRODUCT DATA - Simulación de base de datos
// ==========================================
const productData = {
    id: 1,
    name: "Blazer Elegante Premium",
    price: 29990,
    originalPrice: 45990,
    discount: 35,
    stock: {
        XS: 0,
        S: 3,
        M: 8,
        L: 5,
        XL: 2
    },
    images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
        "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800",
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800",
        "https://images.unsplash.com/photo-1543297057-25167a0eeb4f?w=800"
    ]
};

// Sample reviews data
const reviewsData = [
    {
        id: 1,
        name: "María González",
        rating: 5,
        title: "¡Excelente calidad!",
        text: "El blazer es hermoso, la tela es de muy buena calidad y el corte es perfecto. Me queda exactamente como esperaba. Muy feliz con mi compra.",
        date: "2024-12-10",
        helpful: 12
    },
    {
        id: 2,
        name: "Carla Ruiz",
        rating: 4,
        title: "Muy bonito pero talla pequeña",
        text: "El blazer es precioso y la calidad es buena, pero compré talla M y me quedó un poco ajustado. Recomiendo pedir una talla más grande. El envío fue rápido.",
        date: "2024-12-08",
        helpful: 8
    },
    {
        id: 3,
        name: "Valentina Torres",
        rating: 5,
        title: "Perfecto para el trabajo",
        text: "Justo lo que buscaba para usar en la oficina. Se ve elegante y profesional. El precio es excelente considerando la calidad. Lo recomiendo 100%.",
        date: "2024-12-05",
        helpful: 15
    },
    {
        id: 4,
        name: "Daniela Morales",
        rating: 4,
        title: "Buena compra",
        text: "Estoy satisfecha con el producto. La entrega fue rápida y el blazer llegó en perfectas condiciones. El color es tal como se ve en las fotos.",
        date: "2024-12-01",
        helpful: 6
    },
    {
        id: 5,
        name: "Sofía Vargas",
        rating: 5,
        title: "Me encantó!",
        text: "Segunda vez que compro en Tiendas Urbano y siempre quedo encantada. El blazer es hermoso, cómodo y versátil. Excelente relación precio-calidad.",
        date: "2024-11-28",
        helpful: 10
    }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
let selectedSize = null;
let selectedColor = null;
let quantity = 1;
let currentStock = 0;
let currentImageIndex = 0;
let selectedRating = 0;
let displayedReviews = 3;

// ==========================================
// DOM ELEMENTS
// ==========================================
const mainImage = document.getElementById('mainProductImage');
const thumbnails = document.querySelectorAll('.thumbnail');
const sizeButtons = document.querySelectorAll('.size-btn');
const colorButtons = document.querySelectorAll('.color-btn');
const selectedSizeText = document.getElementById('selectedSize');
const selectedColorText = document.getElementById('selectedColor');
const quantityInput = document.getElementById('quantityInput');
const decreaseBtn = document.getElementById('decreaseQty');
const increaseBtn = document.getElementById('increaseQty');
const addToCartBtn = document.getElementById('addToCartBtn');
const stockIndicator = document.getElementById('stockIndicator');
const stockFill = document.getElementById('stockFill');
const stockMessage = document.getElementById('stockMessage');
const stockBadge = document.getElementById('stockBadge');
const toast = document.getElementById('toast');
const wishlistBtn = document.getElementById('wishlistBtn');
const cartCount = document.querySelector('.cart-count');

// Modal elements
const imageModal = document.getElementById('imageModal');
const zoomBtn = document.getElementById('zoomBtn');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalThumbs = document.getElementById('modalThumbs');
const prevImageBtn = document.getElementById('prevImageBtn');
const nextImageBtn = document.getElementById('nextImageBtn');

// Review modal elements
const reviewModal = document.getElementById('reviewModal');
const writeReviewBtn = document.getElementById('writeReviewBtn');
const reviewModalClose = document.getElementById('reviewModalClose');
const reviewModalOverlay = document.getElementById('reviewModalOverlay');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');
const reviewForm = document.getElementById('reviewForm');
const ratingStars = document.querySelectorAll('.rating-star');
const reviewsList = document.getElementById('reviewsList');
const loadMoreReviews = document.getElementById('loadMoreReviews');

// Size guide modal elements
const sizeGuideModal = document.getElementById('sizeGuideModal');
const sizeGuideBtn = document.getElementById('sizeGuideBtn');
const sizeGuideClose = document.getElementById('sizeGuideClose');
const sizeGuideOverlay = document.getElementById('sizeGuideOverlay');

// ==========================================
// INITIALIZE APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeThumbnails();
    initializeSizeOptions();
    initializeColorOptions();
    initializeQuantityControls();
    initializeWishlist();
    initializeImageModal();
    initializeReviewModal();
    initializeSizeGuideModal();
    loadCartCount();
    updateStockDisplay();
    loadReviews();
});

// ==========================================
// IMAGE GALLERY FUNCTIONALITY
// ==========================================
function initializeThumbnails() {
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            mainImage.src = productData.images[index];
            currentImageIndex = index;
        });
    });
}

function initializeImageModal() {
    // Open modal
    zoomBtn.addEventListener('click', () => {
        openImageModal(currentImageIndex);
    });

    mainImage.addEventListener('click', () => {
        openImageModal(currentImageIndex);
    });

    // Close modal
    modalClose.addEventListener('click', closeImageModal);
    modalOverlay.addEventListener('click', closeImageModal);

    // Navigation
    prevImageBtn.addEventListener('click', () => navigateImage(-1));
    nextImageBtn.addEventListener('click', () => navigateImage(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (imageModal.classList.contains('active')) {
            if (e.key === 'Escape') closeImageModal();
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowRight') navigateImage(1);
        }
    });
}

function openImageModal(index) {
    currentImageIndex = index;
    modalImage.src = productData.images[index];
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Create thumbnails in modal
    modalThumbs.innerHTML = '';
    productData.images.forEach((img, i) => {
        const thumb = document.createElement('img');
        thumb.src = img;
        thumb.className = `modal-thumb ${i === index ? 'active' : ''}`;
        thumb.addEventListener('click', () => {
            currentImageIndex = i;
            modalImage.src = productData.images[i];
            document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        modalThumbs.appendChild(thumb);
    });
}

function closeImageModal() {
    imageModal.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = productData.images.length - 1;
    if (currentImageIndex >= productData.images.length) currentImageIndex = 0;
    
    modalImage.src = productData.images[currentImageIndex];
    document.querySelectorAll('.modal-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === currentImageIndex);
    });
}

// ==========================================
// SIZE & COLOR SELECTION
// ==========================================
function initializeSizeOptions() {
    sizeButtons.forEach(btn => {
        const size = btn.getAttribute('data-size');
        const stock = parseInt(btn.getAttribute('data-stock'));
        
        if (stock === 0) {
            btn.disabled = true;
        }
        
        btn.addEventListener('click', () => {
            if (!btn.disabled) {
                sizeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                selectedSize = size;
                selectedSizeText.textContent = size;
                currentStock = stock;
                
                quantityInput.max = stock;
                if (parseInt(quantityInput.value) > stock) {
                    quantityInput.value = stock;
                    quantity = stock;
                }
                
                updateStockDisplay();
                updateAddToCartButton();
            }
        });
    });
}

function initializeColorOptions() {
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            selectedColor = btn.getAttribute('data-color');
            selectedColorText.textContent = selectedColor;
            
            updateAddToCartButton();
        });
    });
}

// ==========================================
// QUANTITY CONTROLS
// ==========================================
function initializeQuantityControls() {
    decreaseBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityInput.value = quantity;
            updateQuantityButtons();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const maxQty = selectedSize ? currentStock : 10;
        if (quantity < maxQty) {
            quantity++;
            quantityInput.value = quantity;
            updateQuantityButtons();
        }
    });
    
    quantityInput.addEventListener('change', (e) => {
        let value = parseInt(e.target.value);
        const maxQty = selectedSize ? currentStock : 10;
        
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > maxQty) {
            value = maxQty;
        }
        
        quantity = value;
        quantityInput.value = value;
        updateQuantityButtons();
    });
}

function updateQuantityButtons() {
    decreaseBtn.disabled = quantity <= 1;
    
    const maxQty = selectedSize ? currentStock : 10;
    increaseBtn.disabled = quantity >= maxQty;
}

// ==========================================
// STOCK DISPLAY
// ==========================================
function updateStockDisplay() {
    if (!selectedSize) {
        const totalStock = Object.values(productData.stock).reduce((sum, stock) => sum + stock, 0);
        currentStock = totalStock;
        
        stockMessage.innerHTML = `Disponibilidad: <strong>${totalStock} unidades</strong> en total`;
        stockIndicator.className = 'stock-indicator high-stock';
        stockFill.style.width = '100%';
        
        stockBadge.className = 'stock-badge in-stock';
        stockBadge.innerHTML = '<span class="stock-icon">✓</span><span class="stock-text">En Stock</span>';
    } else {
        const stock = currentStock;
        const maxStock = Math.max(...Object.values(productData.stock));
        const percentage = (stock / maxStock) * 100;
        
        stockFill.style.width = `${percentage}%`;
        
        if (stock === 0) {
            stockMessage.innerHTML = '<strong>Sin stock</strong> en esta talla';
            stockIndicator.className = 'stock-indicator out-stock';
            stockBadge.className = 'stock-badge out-stock';
            stockBadge.innerHTML = '<span class="stock-icon">✕</span><span class="stock-text">Sin Stock</span>';
        } else if (stock <= 3) {
            stockMessage.innerHTML = `¡Solo quedan <strong>${stock} unidades</strong> en talla ${selectedSize}!`;
            stockIndicator.className = 'stock-indicator low-stock';
            stockBadge.className = 'stock-badge low-stock';
            stockBadge.innerHTML = '<span class="stock-icon">⚠</span><span class="stock-text">Stock Bajo</span>';
        } else {
            stockMessage.innerHTML = `<strong>${stock} unidades</strong> disponibles en talla ${selectedSize}`;
            stockIndicator.className = 'stock-indicator high-stock';
            stockBadge.className = 'stock-badge in-stock';
            stockBadge.innerHTML = '<span class="stock-icon">✓</span><span class="stock-text">En Stock</span>';
        }
    }
}

function updateAddToCartButton() {
    if (selectedSize && selectedColor && currentStock > 0) {
        addToCartBtn.disabled = false;
    } else {
        addToCartBtn.disabled = true;
    }
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================
addToCartBtn.addEventListener('click', () => {
    if (selectedSize && selectedColor && currentStock > 0) {
        const cartItem = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
            image: productData.images[0]
        };
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItemIndex = cart.findIndex(
            item => item.id === cartItem.id && 
                   item.size === cartItem.size && 
                   item.color === cartItem.color
        );
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += cartItem.quantity;
        } else {
            cart.push(cartItem);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast('✓ Producto agregado al carrito');
    }
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function loadCartCount() {
    updateCartCount();
}

// ==========================================
// WISHLIST FUNCTIONALITY
// ==========================================
function initializeWishlist() {
    wishlistBtn.addEventListener('click', () => {
        wishlistBtn.classList.toggle('active');
        
        if (wishlistBtn.classList.contains('active')) {
            wishlistBtn.querySelector('.heart-icon').textContent = '♥';
            showToast('♥ Agregado a favoritos');
            
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            if (!wishlist.includes(productData.id)) {
                wishlist.push(productData.id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            }
        } else {
            wishlistBtn.querySelector('.heart-icon').textContent = '♡';
            showToast('Eliminado de favoritos');
            
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            wishlist = wishlist.filter(id => id !== productData.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    });
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.includes(productData.id)) {
        wishlistBtn.classList.add('active');
        wishlistBtn.querySelector('.heart-icon').textContent = '♥';
    }
}

// ==========================================
// REVIEWS FUNCTIONALITY
// ==========================================
function loadReviews() {
    reviewsList.innerHTML = '';
    const reviewsToShow = reviewsData.slice(0, displayedReviews);
    
    reviewsToShow.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
    });
    
    if (displayedReviews >= reviewsData.length) {
        loadMoreReviews.style.display = 'none';
    } else {
        loadMoreReviews.style.display = 'block';
    }
}

function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const stars = Array(5).fill(0).map((_, i) => 
        `<span class="star ${i < review.rating ? 'filled' : ''}">★</span>`
    ).join('');
    
    const date = new Date(review.date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    div.innerHTML = `
        <div class="review-header">
            <div class="review-author">
                <div class="review-name">${review.name}</div>
                <div class="review-date">${date}</div>
            </div>
            <div class="review-rating">${stars}</div>
        </div>
        <div class="review-title">${review.title}</div>
        <div class="review-text">${review.text}</div>
        <div class="review-helpful">
            <button class="helpful-btn">👍 Útil (${review.helpful})</button>
        </div>
    `;
    
    return div;
}

loadMoreReviews.addEventListener('click', () => {
    displayedReviews += 3;
    loadReviews();
});

// ==========================================
// REVIEW MODAL
// ==========================================
function initializeReviewModal() {
    writeReviewBtn.addEventListener('click', openReviewModal);
    reviewModalClose.addEventListener('click', closeReviewModal);
    reviewModalOverlay.addEventListener('click', closeReviewModal);
    cancelReviewBtn.addEventListener('click', closeReviewModal);
    
    // Rating stars
    ratingStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateRatingStars();
        });
        
        star.addEventListener('mouseenter', () => {
            ratingStars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    document.getElementById('ratingInput').addEventListener('mouseleave', () => {
        updateRatingStars();
    });
    
    // Form submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (selectedRating === 0) {
            alert('Por favor selecciona una calificación');
            return;
        }
        
        const newReview = {
            id: reviewsData.length + 1,
            name: document.getElementById('reviewName').value,
            rating: selectedRating,
            title: document.getElementById('reviewTitle').value,
            text: document.getElementById('reviewText').value,
            date: new Date().toISOString().split('T')[0],
            helpful: 0
        };
        
        reviewsData.unshift(newReview);
        loadReviews();
        closeReviewModal();
        resetReviewForm();
        showToast('✓ Reseña publicada exitosamente');
    });
}

function openReviewModal() {
    reviewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
    reviewModal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateRatingStars() {
    ratingStars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function resetReviewForm() {
    reviewForm.reset();
    selectedRating = 0;
    updateRatingStars();
}

// ==========================================
// SIZE GUIDE MODAL
// ==========================================
function initializeSizeGuideModal() {
    sizeGuideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSizeGuideModal();
    });
    
    sizeGuideClose.addEventListener('click', closeSizeGuideModal);
    sizeGuideOverlay.addEventListener('click', closeSizeGuideModal);
    
    document.addEventListener('keydown', (e) => {
        if (sizeGuideModal.classList.contains('active') && e.key === 'Escape') {
            closeSizeGuideModal();
        }
    });
}

function openSizeGuideModal() {
    sizeGuideModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSizeGuideModal() {
    sizeGuideModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message) {
    const toastMessage = document.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function resetSelections() {
    sizeButtons.forEach(btn => btn.classList.remove('selected'));
    selectedSize = null;
    selectedSizeText.textContent = 'Selecciona una talla';
    
    colorButtons.forEach(btn => btn.classList.remove('selected'));
    selectedColor = null;
    selectedColorText.textContent = 'Selecciona un color';
    
    quantity = 1;
    quantityInput.value = 1;
    
    updateAddToCartButton();
    updateQuantityButtons();
    updateStockDisplay();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount);
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==========================================
// CONSOLE INFO (Development)
// ==========================================
console.log('🛍️ Tiendas Urbano - Página de Producto Cargada');
console.log('📦 Producto:', productData.name);
console.log('💰 Precio:', formatCurrency(productData.price));
console.log('📊 Stock total:', Object.values(productData.stock).reduce((a, b) => a + b, 0));
