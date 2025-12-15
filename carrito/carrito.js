// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================
const SHIPPING_COSTS = {
    standard: 3990,
    express: 6990,
    free: 0
};

const FREE_SHIPPING_THRESHOLD = 50000;

const DISCOUNT_CODES = {
    'URBANO10': { type: 'percentage', value: 10, label: '10%' },
    'URBANO15': { type: 'percentage', value: 15, label: '15%' },
    'URBANO20': { type: 'percentage', value: 20, label: '20%' },
    'BIENVENIDA': { type: 'percentage', value: 5, label: '5%' },
    'VERANO2024': { type: 'fixed', value: 5000, label: '$5.000' }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
let cart = [];
let selectedShipping = 'standard';
let appliedDiscount = null;
let pendingAction = null;

// ==========================================
// DOM ELEMENTS
// ==========================================
const cartItems = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const continueShopping = document.getElementById('continueShopping');
const cartSidebar = document.getElementById('cartSidebar');
const suggestedProducts = document.getElementById('suggestedProducts');
const cartCount = document.querySelector('.cart-count');

// Summary elements
const itemCount = document.getElementById('itemCount');
const subtotalAmount = document.getElementById('subtotalAmount');
const discountRow = document.getElementById('discountRow');
const discountLabel = document.getElementById('discountLabel');
const discountAmount = document.getElementById('discountAmount');
const shippingAmount = document.getElementById('shippingAmount');
const totalAmount = document.getElementById('totalAmount');
const freeShippingMessage = document.getElementById('freeShippingMessage');
const freeShippingRemaining = document.getElementById('freeShippingRemaining');

// Discount elements
const discountCode = document.getElementById('discountCode');
const applyDiscountBtn = document.getElementById('applyDiscountBtn');
const discountMessage = document.getElementById('discountMessage');

// Checkout elements
const checkoutBtn = document.getElementById('checkoutBtn');
const shippingOptions = document.querySelectorAll('input[name="shipping"]');

// Modal elements
const confirmModal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalClose = document.getElementById('modalClose');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// Toast
const toast = document.getElementById('toast');

// ==========================================
// INITIALIZE APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderCart();
    updateCartCount();
    initializeShippingOptions();
    initializeDiscountCode();
    initializeCheckout();
    initializeModal();
});

// ==========================================
// CART MANAGEMENT
// ==========================================
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        showCartItems();
        renderCartItems();
        updateSummary();
    }
}

function showEmptyCart() {
    cartItems.style.display = 'none';
    continueShopping.style.display = 'none';
    emptyCart.style.display = 'block';
    cartSidebar.style.display = 'none';
    suggestedProducts.style.display = 'block';
}

function showCartItems() {
    cartItems.style.display = 'block';
    continueShopping.style.display = 'block';
    emptyCart.style.display = 'none';
    cartSidebar.style.display = 'flex';
    suggestedProducts.style.display = 'block';
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartItems.appendChild(itemElement);
    });
}

function createCartItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.setAttribute('data-index', index);
    
    const itemTotal = item.price * item.quantity;
    
    div.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <div class="item-variants">
                <div class="variant">
                    <span>Talla:</span>
                    <strong>${item.size}</strong>
                </div>
                <div class="variant">
                    <span>Color:</span>
                    <strong>${item.color}</strong>
                </div>
            </div>
            <div class="item-price">${formatCurrency(item.price)}</div>
            
            <div class="item-actions">
                <div class="quantity-selector">
                    <button class="qty-btn" onclick="decreaseQuantity(${index})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" readonly>
                    <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                </div>
                <button class="btn-remove" onclick="confirmRemoveItem(${index})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
        
        <div class="item-subtotal">
            <span class="subtotal-label">Subtotal</span>
            <span class="subtotal-amount">${formatCurrency(itemTotal)}</span>
        </div>
    `;
    
    return div;
}

// ==========================================
// QUANTITY MANAGEMENT
// ==========================================
function increaseQuantity(index) {
    if (cart[index].quantity < 99) {
        cart[index].quantity++;
        saveCart();
        renderCart();
        updateCartCount();
        showToast('✓ Cantidad actualizada');
    }
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        renderCart();
        updateCartCount();
        showToast('✓ Cantidad actualizada');
    }
}

// ==========================================
// REMOVE ITEM
// ==========================================
function confirmRemoveItem(index) {
    pendingAction = () => removeItem(index);
    modalTitle.textContent = 'Eliminar Producto';
    modalMessage.textContent = '¿Estás seguro que deseas eliminar este producto del carrito?';
    openModal();
}

function removeItem(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();
    showToast(`✓ ${removedItem.name} eliminado del carrito`);
}

// ==========================================
// CART SUMMARY CALCULATIONS
// ==========================================
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateDiscount(subtotal) {
    if (!appliedDiscount) return 0;
    
    const discount = DISCOUNT_CODES[appliedDiscount];
    if (discount.type === 'percentage') {
        return Math.round(subtotal * (discount.value / 100));
    } else if (discount.type === 'fixed') {
        return Math.min(discount.value, subtotal);
    }
    return 0;
}

function calculateShipping() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const subtotalAfterDiscount = subtotal - discount;
    
    // Free shipping if subtotal after discount is over threshold
    if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) {
        enableFreeShipping();
        return 0;
    }
    
    return SHIPPING_COSTS[selectedShipping] || 0;
}

function calculateTotal() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const shipping = calculateShipping();
    
    return subtotal - discount + shipping;
}

function updateSummary() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const shipping = calculateShipping();
    const total = calculateTotal();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update display
    itemCount.textContent = totalItems;
    subtotalAmount.textContent = formatCurrency(subtotal);
    shippingAmount.textContent = shipping === 0 ? 'Gratis' : formatCurrency(shipping);
    totalAmount.textContent = formatCurrency(total);
    
    // Update discount display
    if (discount > 0) {
        discountRow.style.display = 'flex';
        discountLabel.textContent = DISCOUNT_CODES[appliedDiscount].label;
        discountAmount.textContent = formatCurrency(discount);
    } else {
        discountRow.style.display = 'none';
    }
    
    // Update free shipping message
    updateFreeShippingMessage(subtotal - discount);
    
    // Enable/disable checkout button
    checkoutBtn.disabled = cart.length === 0;
}

function updateFreeShippingMessage(currentAmount) {
    if (currentAmount >= FREE_SHIPPING_THRESHOLD) {
        freeShippingMessage.innerHTML = '🎉 ¡Has desbloqueado envío gratis!';
        freeShippingMessage.style.background = '#d1fae5';
        freeShippingMessage.style.borderLeftColor = '#10b981';
    } else {
        const remaining = FREE_SHIPPING_THRESHOLD - currentAmount;
        freeShippingRemaining.textContent = formatCurrency(remaining);
        freeShippingMessage.innerHTML = `💰 Te faltan <strong id="freeShippingRemaining">${formatCurrency(remaining)}</strong> para envío gratis`;
        freeShippingMessage.style.background = '#fef3c7';
        freeShippingMessage.style.borderLeftColor = '#f59e0b';
    }
}

function enableFreeShipping() {
    const freeShippingOption = document.querySelector('input[name="shipping"][value="free"]');
    freeShippingOption.disabled = false;
    freeShippingOption.checked = true;
    selectedShipping = 'free';
}

// ==========================================
// SHIPPING OPTIONS
// ==========================================
function initializeShippingOptions() {
    shippingOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            selectedShipping = e.target.value;
            updateSummary();
            showToast('✓ Opción de envío actualizada');
        });
    });
}

// ==========================================
// DISCOUNT CODE
// ==========================================
function initializeDiscountCode() {
    applyDiscountBtn.addEventListener('click', applyDiscount);
    
    discountCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyDiscount();
        }
    });
}

function applyDiscount() {
    const code = discountCode.value.trim().toUpperCase();
    
    if (!code) {
        showDiscountMessage('Por favor ingresa un código de descuento', 'error');
        return;
    }
    
    if (DISCOUNT_CODES[code]) {
        appliedDiscount = code;
        const discountInfo = DISCOUNT_CODES[code];
        let message = `✓ Código "${code}" aplicado correctamente`;
        
        if (discountInfo.type === 'percentage') {
            message += ` (${discountInfo.value}% de descuento)`;
        } else {
            message += ` (${formatCurrency(discountInfo.value)} de descuento)`;
        }
        
        showDiscountMessage(message, 'success');
        updateSummary();
        discountCode.value = '';
        applyDiscountBtn.textContent = 'Aplicado ✓';
        applyDiscountBtn.disabled = true;
        
        showToast('✓ Código de descuento aplicado');
    } else {
        showDiscountMessage('❌ Código inválido o expirado', 'error');
    }
}

function showDiscountMessage(message, type) {
    discountMessage.textContent = message;
    discountMessage.className = `discount-message ${type}`;
    
    if (type === 'error') {
        setTimeout(() => {
            discountMessage.className = 'discount-message';
        }, 3000);
    }
}

// ==========================================
// CHECKOUT
// ==========================================
function initializeCheckout() {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('⚠️ Tu carrito está vacío');
            return;
        }
        
        // In a real app, this would redirect to checkout page
        pendingAction = () => {
            showToast('🎉 Redirigiendo al proceso de pago...');
            // window.location.href = 'checkout.html';
        };
        
        modalTitle.textContent = 'Proceder al Pago';
        modalMessage.textContent = `Estás a punto de proceder con tu compra de ${cart.length} producto(s) por un total de ${formatCurrency(calculateTotal())}. ¿Deseas continuar?`;
        openModal();
    });
}

// ==========================================
// MODAL
// ==========================================
function initializeModal() {
    modalClose.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalConfirmBtn.addEventListener('click', () => {
        if (pendingAction) {
            pendingAction();
            pendingAction = null;
        }
        closeModal();
    });
    
    // Close on overlay click
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal() {
    confirmModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    confirmModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// CART COUNT
// ==========================================
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
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
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ==========================================
// CLEAR CART (FOR TESTING)
// ==========================================
function clearCart() {
    cart = [];
    appliedDiscount = null;
    selectedShipping = 'standard';
    saveCart();
    renderCart();
    updateCartCount();
    showToast('🗑️ Carrito vaciado');
}

// Make clearCart available globally for testing
window.clearCart = clearCart;

// ==========================================
// ADD SAMPLE PRODUCTS (FOR TESTING)
// ==========================================
function addSampleProducts() {
    cart = [
        {
            id: 1,
            name: "Blazer Elegante Premium",
            price: 29990,
            size: "M",
            color: "Negro",
            quantity: 1,
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"
        },
        {
            id: 2,
            name: "Pantalón de Vestir Elegante",
            price: 24990,
            size: "L",
            color: "Gris",
            quantity: 2,
            image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400"
        }
    ];
    saveCart();
    renderCart();
    updateCartCount();
    showToast('✓ Productos de ejemplo agregados');
}

// Make addSampleProducts available globally for testing
window.addSampleProducts = addSampleProducts;

// ==========================================
// KEYBOARD SHORTCUTS (FOR TESTING)
// ==========================================
document.addEventListener('keydown', (e) => {
    // Ctrl + Shift + C = Clear cart
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        clearCart();
    }
    
    // Ctrl + Shift + A = Add sample products
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        addSampleProducts();
    }
});

// ==========================================
// CONSOLE INFO (Development)
// ==========================================
console.log('🛒 Tiendas Urbano - Carrito de Compras Cargado');
console.log('📦 Productos en carrito:', cart.length);
console.log('💰 Total:', formatCurrency(calculateTotal()));
console.log('\n🔧 Comandos disponibles:');
console.log('  - addSampleProducts() - Agregar productos de ejemplo');
console.log('  - clearCart() - Vaciar carrito');
console.log('  - Ctrl+Shift+A - Agregar productos de ejemplo');
console.log('  - Ctrl+Shift+C - Vaciar carrito');
console.log('\n🎟️ Códigos de descuento válidos:');
console.log('  - URBANO10 (10% descuento)');
console.log('  - URBANO15 (15% descuento)');
console.log('  - URBANO20 (20% descuento)');
console.log('  - BIENVENIDA (5% descuento)');
console.log('  - VERANO2024 ($5.000 descuento)');
