let cartData = null;
let selectedPaymentMethod = 'COD';

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
}

async function loadCartData() {
    try {
        cartData = await cartAPI.getMyCart();
        
        if (!cartData.items || cartData.items.length === 0) {
            showToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.', 'warning');
            setTimeout(() => {
                window.location.href = 'customer.html';
            }, 2000);
            return;
        }

        const container = document.getElementById('cartItems');
        container.innerHTML = cartData.items.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.title}</strong>
                    <div style="color: #666;">x${item.quantity}</div>
                </div>
                <div style="font-weight: 600; color: #667eea;">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');

        document.getElementById('totalAmount').textContent = formatPrice(cartData.totalPrice);

        const user = auth.getUser();
        if (user) {
            document.getElementById('receiverName').value = user.name || '';
            document.getElementById('receiverPhone').value = user.phone || '';
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function selectPayment(element, method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

async function placeOrder() {
    const receiverName = document.getElementById('receiverName').value.trim();
    const receiverPhone = document.getElementById('receiverPhone').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    if (!receiverName) {
        showToast('Vui lòng nhập họ tên người nhận', 'error');
        return;
    }

    if (!receiverPhone || !/^[0-9]{10}$/.test(receiverPhone)) {
        showToast('Vui lòng nhập số điện thoại hợp lệ (10 số)', 'error');
        return;
    }

    if (!shippingAddress) {
        showToast('Vui lòng nhập địa chỉ giao hàng', 'error');
        return;
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        showToast('Giỏ hàng trống', 'error');
        return;
    }

    const btn = document.querySelector('.btn-place-order');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Đang xử lý...';

    try {
        const orderData = {
            items: cartData.items.map(item => ({
                bookId: item.bookId,
                quantity: item.quantity
            })),
            shippingAddress: `${receiverName}\n${receiverPhone}\n${shippingAddress}`,
            phone: receiverPhone,
            paymentMethod: selectedPaymentMethod
        };

        await ordersAPI.create(orderData);
        showToast('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
        
        setTimeout(() => {
            window.location.href = 'customer.html';
        }, 2000);
    } catch (error) {
        showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = 'Đặt hàng';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartData();
});
