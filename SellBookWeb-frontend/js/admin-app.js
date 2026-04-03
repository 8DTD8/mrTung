function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
}

function formatStatus(status) {
    const map = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy',
        'REFUNDED': 'Hoàn tiền'
    };
    return map[status] || status;
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');

    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'books') loadAdminBooks();
    if (sectionId === 'categories') loadAdminCategories();
    if (sectionId === 'orders') loadAdminOrders();
    if (sectionId === 'users') loadAdminUsers();
    if (sectionId === 'coupons') loadAdminCoupons();
    if (sectionId === 'banks') loadAdminBanks();
}

async function loadDashboard() {
    try {
        const [books, users, orders] = await Promise.all([
            booksAPI.getAll(0, 1),
            usersAPI.getAll(),
            ordersAPI.getAll(0, 1)
        ]);

        document.getElementById('totalBooks').textContent = books.pagination?.total || 0;
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('totalOrders').textContent = orders.pagination?.total || 0;
        
        let revenue = 0;
        if (orders.orders) {
            revenue = orders.orders
                .filter(o => o.status !== 'CANCELLED')
                .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        }
        document.getElementById('totalRevenue').textContent = formatPrice(revenue);
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

async function loadAdminBooks() {
    try {
        const data = await booksAPI.getAll(0, 100);
        console.log('Books data:', data);
        const tbody = document.querySelector('#booksTable tbody');
        
        if (!data || !data.books || data.books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Chưa có sách nào trong database. Hãy thêm sách mới!</td></tr>';
            return;
        }

        tbody.innerHTML = data.books.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${formatPrice(book.price)}</td>
                <td>${book.quantity}</td>
                <td>${book.categoryId?.name || '-'}</td>
                <td><span class="badge ${book.active ? 'badge-active' : 'badge-inactive'}">${book.active ? 'Hiện' : 'Ẩn'}</span></td>
                <td>
                    <button class="btn-edit" onclick="editBook('${book._id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteBook('${book._id}')">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAdminCategories() {
    try {
        const categories = await categoriesAPI.getAll();
        const tbody = document.querySelector('#categoriesTable tbody');
        
        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có danh mục nào</td></tr>';
            return;
        }

        tbody.innerHTML = categories.map(cat => `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.description || '-'}</td>
                <td><span class="badge ${cat.active ? 'badge-active' : 'badge-inactive'}">${cat.active ? 'Hiện' : 'Ẩn'}</span></td>
                <td>
                    <button class="btn-edit" onclick="editCategory('${cat._id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteCategory('${cat._id}')">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAdminOrders() {
    try {
        const data = await ordersAPI.getAll(0, 50);
        const tbody = document.querySelector('#ordersTable tbody');
        
        if (!data.orders || data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có đơn hàng nào</td></tr>';
            return;
        }

        tbody.innerHTML = data.orders.map(order => `
            <tr>
                <td>#${order._id.slice(-6)}</td>
                <td>${order.userId?.name || order.userId?.email || 'N/A'}</td>
                <td>${formatPrice(order.totalPrice)}</td>
                <td><span class="badge badge-${order.status.toLowerCase()}">${formatStatus(order.status)}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                    <select onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Chờ xác nhận</option>
                        <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Đã xác nhận</option>
                        <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Đang giao</option>
                        <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Đã giao</option>
                        <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Hủy</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAdminUsers() {
    try {
        const users = await usersAPI.getAll();
        const tbody = document.querySelector('#usersTable tbody');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có người dùng nào</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="badge ${user.active ? 'badge-active' : 'badge-inactive'}">${user.active ? 'Hoạt động' : 'Khóa'}</span></td>
                <td>
                    <button class="btn-edit" onclick="editUser('${user._id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteUser('${user._id}')">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await ordersAPI.updateStatus(orderId, status);
        showToast('Cập nhật trạng thái thành công');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteBook(id) {
    if (!confirm('Bạn có chắc muốn xóa sách này?')) return;
    try {
        await booksAPI.delete(id);
        showToast('Đã xóa sách');
        loadAdminBooks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
        await categoriesAPI.delete(id);
        showToast('Đã xóa danh mục');
        loadAdminCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
        await usersAPI.delete(id);
        showToast('Đã xóa người dùng');
        loadAdminUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function openBookModal() {
    const categories = await categoriesAPI.getAll();
    const categoryOptions = categories.map(c => 
        `<option value="${c._id}">${c.name}</option>`
    ).join('');
    
    document.getElementById('modalBody').innerHTML = `
        <h2>Thêm sách mới</h2>
        <form onsubmit="saveBook(event)">
            <div class="form-group">
                <label>Tiêu đề:</label>
                <input type="text" id="bookTitle" required>
            </div>
            <div class="form-group">
                <label>Tác giả:</label>
                <input type="text" id="bookAuthor" required>
            </div>
            <div class="form-group">
                <label>Giá:</label>
                <input type="number" id="bookPrice" required min="0">
            </div>
            <div class="form-group">
                <label>Số lượng:</label>
                <input type="number" id="bookQuantity" required min="0">
            </div>
            <div class="form-group">
                <label>Danh mục:</label>
                <select id="bookCategoryId" required>${categoryOptions}</select>
            </div>
            <div class="form-group">
                <label>Ảnh bìa (URL):</label>
                <input type="url" id="bookImage" placeholder="https://example.com/image.jpg">
            </div>
            <button type="submit" class="submit-btn">Lưu</button>
        </form>
    `;
    document.getElementById('modal').classList.add('show');
}

function openCategoryModal() {
    document.getElementById('modalBody').innerHTML = `
        <h2>Thêm danh mục</h2>
        <form onsubmit="saveCategory(event)">
            <div class="form-group">
                <label>Tên:</label>
                <input type="text" id="catName" required>
            </div>
            <div class="form-group">
                <label>Mô tả:</label>
                <input type="text" id="catDesc">
            </div>
            <button type="submit" class="submit-btn">Lưu</button>
        </form>
    `;
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

async function saveBook(event) {
    event.preventDefault();
    const data = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        price: parseFloat(document.getElementById('bookPrice').value),
        quantity: parseInt(document.getElementById('bookQuantity').value),
        categoryId: document.getElementById('bookCategoryId').value,
        image: document.getElementById('bookImage').value,
        active: true
    };
    
    try {
        await booksAPI.create(data);
        showToast('Đã thêm sách');
        closeModal();
        loadAdminBooks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function saveCategory(event) {
    event.preventDefault();
    const data = {
        name: document.getElementById('catName').value,
        description: document.getElementById('catDesc').value,
        active: true
    };
    
    try {
        await categoriesAPI.create(data);
        showToast('Đã thêm danh mục');
        closeModal();
        loadAdminCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function editBook(id) {
    try {
        const book = await booksAPI.getById(id);
        const categories = await categoriesAPI.getAll();
        
        const categoryOptions = categories.map(c => 
            `<option value="${c._id}" ${c._id === book.categoryId?._id ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        document.getElementById('modalBody').innerHTML = `
            <h2>Sửa sách</h2>
            <form onsubmit="updateBook(event, '${id}')">
                <div class="form-group">
                    <label>Tiêu đề:</label>
                    <input type="text" id="editBookTitle" value="${book.title}" required>
                </div>
                <div class="form-group">
                    <label>Tác giả:</label>
                    <input type="text" id="editBookAuthor" value="${book.author}" required>
                </div>
                <div class="form-group">
                    <label>Giá:</label>
                    <input type="number" id="editBookPrice" value="${book.price}" required min="0">
                </div>
                <div class="form-group">
                    <label>Số lượng:</label>
                    <input type="number" id="editBookQuantity" value="${book.quantity}" required min="0">
                </div>
                <div class="form-group">
                    <label>Danh mục:</label>
                    <select id="editBookCategoryId" required>${categoryOptions}</select>
                </div>
                <div class="form-group">
                    <label>Ảnh bìa (URL):</label>
                    <input type="url" id="editBookImage" value="${book.image || ''}" placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select id="editBookActive">
                        <option value="true" ${book.active ? 'selected' : ''}>Hiện</option>
                        <option value="false" ${!book.active ? 'selected' : ''}>Ẩn</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn">Cập nhật</button>
            </form>
        `;
        document.getElementById('modal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateBook(event, id) {
    event.preventDefault();
    const data = {
        title: document.getElementById('editBookTitle').value,
        author: document.getElementById('editBookAuthor').value,
        price: parseFloat(document.getElementById('editBookPrice').value),
        quantity: parseInt(document.getElementById('editBookQuantity').value),
        categoryId: document.getElementById('editBookCategoryId').value,
        image: document.getElementById('editBookImage').value,
        active: document.getElementById('editBookActive').value === 'true'
    };
    
    try {
        await booksAPI.update(id, data);
        showToast('Đã cập nhật sách');
        closeModal();
        loadAdminBooks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function editCategory(id) {
    try {
        const cat = await categoriesAPI.getById(id);
        
        document.getElementById('modalBody').innerHTML = `
            <h2>Sửa danh mục</h2>
            <form onsubmit="updateCategory(event, '${id}')">
                <div class="form-group">
                    <label>Tên:</label>
                    <input type="text" id="editCatName" value="${cat.name}" required>
                </div>
                <div class="form-group">
                    <label>Mô tả:</label>
                    <input type="text" id="editCatDesc" value="${cat.description || ''}">
                </div>
                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select id="editCatActive">
                        <option value="true" ${cat.active ? 'selected' : ''}>Hiện</option>
                        <option value="false" ${!cat.active ? 'selected' : ''}>Ẩn</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn">Cập nhật</button>
            </form>
        `;
        document.getElementById('modal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateCategory(event, id) {
    event.preventDefault();
    const data = {
        name: document.getElementById('editCatName').value,
        description: document.getElementById('editCatDesc').value,
        active: document.getElementById('editCatActive').value === 'true'
    };
    
    try {
        await categoriesAPI.update(id, data);
        showToast('Đã cập nhật danh mục');
        closeModal();
        loadAdminCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function editUser(id) {
    showToast('Tính năng đang phát triển');
}

function formatCouponScope(scope) {
    const map = {
        ALL: 'Tất cả sách',
        ONLY_BOOKS: 'Chỉ sách chọn',
        EXCEPT_BOOKS: 'Trừ sách chọn'
    };
    return map[scope] || scope;
}

function formatCouponValidity(c) {
    if (!c.validFrom && !c.validTo) return 'Không giới hạn';
    const from = c.validFrom ? new Date(c.validFrom).toLocaleDateString('vi-VN') : '…';
    const to = c.validTo ? new Date(c.validTo).toLocaleDateString('vi-VN') : '…';
    return `${from} → ${to}`;
}

async function loadAdminCoupons() {
    try {
        const coupons = await couponsAPI.getAll();
        const tbody = document.querySelector('#couponsTable tbody');
        if (!coupons || coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có mã giảm giá</td></tr>';
            return;
        }
        tbody.innerHTML = coupons.map((c) => `
            <tr>
                <td><strong>${c.code}</strong></td>
                <td>${c.discountPercent}%</td>
                <td>${formatCouponScope(c.scope)}${c.scope !== 'ALL' && c.bookIds?.length ? ` (${c.bookIds.length} sách)` : ''}</td>
                <td>${formatCouponValidity(c)}</td>
                <td><span class="badge ${c.active ? 'badge-active' : 'badge-inactive'}">${c.active ? 'Bật' : 'Tắt'}</span></td>
                <td>
                    <button class="btn-edit" onclick="editCoupon('${c._id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteCoupon('${c._id}')">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAdminBanks() {
    try {
        const banks = await banksAPI.getAll();
        const tbody = document.querySelector('#banksTable tbody');
        if (!banks || banks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có tài khoản ngân hàng nào</td></tr>';
            return;
        }
        tbody.innerHTML = banks.map((b) => `
            <tr>
                <td>${b.bankName}</td>
                <td>${b.accountNumber}</td>
                <td>${b.accountHolder}</td>
                <td>${b.bankLogo ? `<img src="${API_CONFIG.BASE_URL}${b.bankLogo}" alt="${b.bankName}" style="width:50px;height:50px;object-fit:contain;">` : '-'}</td>
                <td><span class="badge ${b.active ? 'badge-active' : 'badge-inactive'}">${b.active ? 'Hoạt động' : 'Tắt'}</span></td>
                <td>
                    <button class="btn-edit" onclick="editBank('${b._id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteBank('${b._id}')">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function openBankModal() {
    document.getElementById('modalBody').innerHTML = `
        <h2>Thêm tài khoản ngân hàng</h2>
        <form id="bankForm" onsubmit="saveBank(event)">
            <div class="form-group">
                <label>Tên ngân hàng:</label>
                <input type="text" id="bankName" required placeholder="VD: Vietcombank">
            </div>
            <div class="form-group">
                <label>Số tài khoản:</label>
                <input type="text" id="accountNumber" required placeholder="VD: 1234567890">
            </div>
            <div class="form-group">
                <label>Tên người thụ hưởng:</label>
                <input type="text" id="accountHolder" required placeholder="VD: NGUYEN VAN A">
            </div>
            <div class="form-group">
                <label>Logo ngân hàng:</label>
                <input type="file" id="bankLogo" accept="image/*">
            </div>
            <div class="form-group">
                <label>Mã QR:</label>
                <input type="file" id="qrCode" accept="image/*">
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="bankActive" checked> Hoạt động</label>
            </div>
            <button type="submit" class="submit-btn">Lưu</button>
        </form>
    `;
    document.getElementById('modal').classList.add('show');
}

async function saveBank(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('bankName', document.getElementById('bankName').value);
    formData.append('accountNumber', document.getElementById('accountNumber').value);
    formData.append('accountHolder', document.getElementById('accountHolder').value);
    formData.append('active', document.getElementById('bankActive').checked);
    
    const bankLogoFile = document.getElementById('bankLogo').files[0];
    if (bankLogoFile) formData.append('bankLogo', bankLogoFile);
    
    const qrCodeFile = document.getElementById('qrCode').files[0];
    if (qrCodeFile) formData.append('qrCode', qrCodeFile);
    
    try {
        await banksAPI.create(formData);
        showToast('Đã thêm tài khoản ngân hàng');
        closeModal();
        loadAdminBanks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function editBank(id) {
    try {
        const b = await banksAPI.getById(id);
        document.getElementById('modalBody').innerHTML = `
            <h2>Sửa tài khoản ngân hàng</h2>
            <form id="editBankForm" onsubmit="updateBank(event, '${id}')">
                <div class="form-group">
                    <label>Tên ngân hàng:</label>
                    <input type="text" id="editBankName" required value="${b.bankName}">
                </div>
                <div class="form-group">
                    <label>Số tài khoản:</label>
                    <input type="text" id="editAccountNumber" required value="${b.accountNumber}">
                </div>
                <div class="form-group">
                    <label>Tên người thụ hưởng:</label>
                    <input type="text" id="editAccountHolder" required value="${b.accountHolder}">
                </div>
                <div class="form-group">
                    <label>Logo ngân hàng hiện tại:</label>
                    ${b.bankLogo ? `<img src="${API_CONFIG.BASE_URL}${b.bankLogo}" style="width:50px;height:50px;object-fit:contain;margin-bottom:10px;">` : '<p>Chưa có logo</p>'}
                    <input type="file" id="editBankLogo" accept="image/*">
                </div>
                <div class="form-group">
                    <label>Mã QR hiện tại:</label>
                    ${b.qrCode ? `<img src="${API_CONFIG.BASE_URL}${b.qrCode}" style="width:100px;height:100px;object-fit:contain;margin-bottom:10px;">` : '<p>Chưa có QR</p>'}
                    <input type="file" id="editQrCode" accept="image/*">
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="editBankActive" ${b.active ? 'checked' : ''}> Hoạt động</label>
                </div>
                <button type="submit" class="submit-btn">Cập nhật</button>
            </form>
        `;
        document.getElementById('modal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateBank(event, id) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('bankName', document.getElementById('editBankName').value);
    formData.append('accountNumber', document.getElementById('editAccountNumber').value);
    formData.append('accountHolder', document.getElementById('editAccountHolder').value);
    formData.append('active', document.getElementById('editBankActive').checked);
    
    const bankLogoFile = document.getElementById('editBankLogo').files[0];
    if (bankLogoFile) formData.append('bankLogo', bankLogoFile);
    
    const qrCodeFile = document.getElementById('editQrCode').files[0];
    if (qrCodeFile) formData.append('qrCode', qrCodeFile);
    
    try {
        await banksAPI.update(id, formData);
        showToast('Đã cập nhật tài khoản ngân hàng');
        closeModal();
        loadAdminBanks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteBank(id) {
    if (!confirm('Bạn có chắc muốn xóa tài khoản ngân hàng này?')) return;
    try {
        await banksAPI.delete(id);
        showToast('Đã xóa tài khoản ngân hàng');
        loadAdminBanks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteCoupon(id) {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try {
        await couponsAPI.delete(id);
        showToast('Đã xóa mã');
        loadAdminCoupons();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toggleCouponBookSelect() {
    const scope = document.getElementById('couponScope').value;
    const wrap = document.getElementById('couponBookIdsWrap');
    if (wrap) wrap.style.display = scope === 'ALL' ? 'none' : 'block';
}

async function openCouponModal() {
    const data = await booksAPI.getAll(0, 500);
    const books = data.books || [];
    const bookOpts = books.map((b) => `<option value="${b._id}">${b.title}</option>`).join('');
    document.getElementById('modalBody').innerHTML = `
        <h2>Thêm mã giảm giá</h2>
        <form onsubmit="saveCoupon(event)">
            <div class="form-group">
                <label>Mã (code):</label>
                <input type="text" id="couponCode" required placeholder="VD: SALE10">
            </div>
            <div class="form-group">
                <label>Mô tả:</label>
                <input type="text" id="couponDesc" placeholder="Ghi chú nội bộ">
            </div>
            <div class="form-group">
                <label>Giảm %:</label>
                <input type="number" id="couponPercent" required min="0" max="100" step="1" value="10">
            </div>
            <div class="form-group">
                <label>Phạm vi áp dụng:</label>
                <select id="couponScope" onchange="toggleCouponBookSelect()">
                    <option value="ALL">Tất cả sách (mặc định)</option>
                    <option value="ONLY_BOOKS">Chỉ áp dụng cho sách được chọn</option>
                </select>
            </div>
            <div class="form-group" id="couponBookIdsWrap" style="display:none">
                <label>Chọn sách (Ctrl+Click để chọn nhiều):</label>
                <select id="couponBookIds" multiple size="8" style="width:100%">${bookOpts}</select>
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="couponActive" checked> Kích hoạt</label>
            </div>
            <div class="form-group">
                <label>Có hiệu từ (tuỳ chọn):</label>
                <input type="datetime-local" id="couponValidFrom">
            </div>
            <div class="form-group">
                <label>Hết hạn (tuỳ chọn):</label>
                <input type="datetime-local" id="couponValidTo">
            </div>
            <button type="submit" class="submit-btn">Lưu</button>
        </form>
    `;
    document.getElementById('modal').classList.add('show');
}

async function saveCoupon(event) {
    event.preventDefault();
    const scope = document.getElementById('couponScope').value;
    const sel = document.getElementById('couponBookIds');
    const bookIds = scope === 'ALL' ? [] : Array.from(sel.selectedOptions).map((o) => o.value);
    if (scope !== 'ALL' && bookIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một sách', 'error');
        return;
    }
    const vf = document.getElementById('couponValidFrom').value;
    const vt = document.getElementById('couponValidTo').value;
    const data = {
        code: document.getElementById('couponCode').value,
        description: document.getElementById('couponDesc').value,
        discountPercent: parseFloat(document.getElementById('couponPercent').value),
        active: document.getElementById('couponActive').checked,
        scope,
        bookIds,
        validFrom: vf ? new Date(vf).toISOString() : null,
        validTo: vt ? new Date(vt).toISOString() : null
    };
    try {
        await couponsAPI.create(data);
        showToast('Đã tạo mã');
        closeModal();
        loadAdminCoupons();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toDatetimeLocalValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function editCoupon(id) {
    try {
        const c = await couponsAPI.getById(id);
        const data = await booksAPI.getAll(0, 500);
        const books = data.books || [];
        const selected = new Set((c.bookIds || []).map((x) => (x && x._id ? x._id : x).toString()));
        const bookOpts = books.map((b) =>
            `<option value="${b._id}" ${selected.has(b._id.toString()) ? 'selected' : ''}>${b.title}</option>`
        ).join('');
        document.getElementById('modalBody').innerHTML = `
            <h2>Sửa mã giảm giá</h2>
            <form onsubmit="updateCoupon(event, '${id}')">
                <div class="form-group">
                    <label>Mã (code):</label>
                    <input type="text" id="editCouponCode" required value="${c.code}">
                </div>
                <div class="form-group">
                    <label>Mô tả:</label>
                    <input type="text" id="editCouponDesc" value="${(c.description || '').replace(/"/g, '&quot;')}">
                </div>
                <div class="form-group">
                    <label>Giảm %:</label>
                    <input type="number" id="editCouponPercent" required min="0" max="100" value="${c.discountPercent}">
                </div>
                <div class="form-group">
                    <label>Phạm vi:</label>
                    <select id="editCouponScope" onchange="toggleEditCouponBookSelect()">
                        <option value="ALL" ${c.scope === 'ALL' ? 'selected' : ''}>Tất cả sách (mặc định)</option>
                        <option value="ONLY_BOOKS" ${c.scope === 'ONLY_BOOKS' ? 'selected' : ''}>Chỉ áp dụng cho sách được chọn</option>
                        <option value="EXCEPT_BOOKS" ${c.scope === 'EXCEPT_BOOKS' ? 'selected' : ''}>Trừ các sách được chọn (dữ liệu cũ)</option>
                    </select>
                </div>
                <div class="form-group" id="editCouponBookIdsWrap" style="display:${c.scope === 'ALL' ? 'none' : 'block'}">
                    <label>Chọn sách:</label>
                    <select id="editCouponBookIds" multiple size="8" style="width:100%">${bookOpts}</select>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="editCouponActive" ${c.active ? 'checked' : ''}> Kích hoạt</label>
                </div>
                <div class="form-group">
                    <label>Có hiệu từ:</label>
                    <input type="datetime-local" id="editCouponValidFrom" value="${toDatetimeLocalValue(c.validFrom)}">
                </div>
                <div class="form-group">
                    <label>Hết hạn:</label>
                    <input type="datetime-local" id="editCouponValidTo" value="${toDatetimeLocalValue(c.validTo)}">
                </div>
                <button type="submit" class="submit-btn">Cập nhật</button>
            </form>
        `;
        document.getElementById('modal').classList.add('show');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toggleEditCouponBookSelect() {
    const scope = document.getElementById('editCouponScope').value;
    const wrap = document.getElementById('editCouponBookIdsWrap');
    if (wrap) wrap.style.display = scope === 'ALL' ? 'none' : 'block';
}

async function updateCoupon(event, id) {
    event.preventDefault();
    const scope = document.getElementById('editCouponScope').value;
    const sel = document.getElementById('editCouponBookIds');
    const bookIds = scope === 'ALL' ? [] : Array.from(sel.selectedOptions).map((o) => o.value);
    if (scope !== 'ALL' && bookIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một sách', 'error');
        return;
    }
    const vf = document.getElementById('editCouponValidFrom').value;
    const vt = document.getElementById('editCouponValidTo').value;
    const data = {
        code: document.getElementById('editCouponCode').value,
        description: document.getElementById('editCouponDesc').value,
        discountPercent: parseFloat(document.getElementById('editCouponPercent').value),
        active: document.getElementById('editCouponActive').checked,
        scope,
        bookIds,
        validFrom: vf ? new Date(vf).toISOString() : null,
        validTo: vt ? new Date(vt).toISOString() : null
    };
    try {
        await couponsAPI.update(id, data);
        showToast('Đã cập nhật mã');
        closeModal();
        loadAdminCoupons();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
