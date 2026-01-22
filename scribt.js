// 1. دالة تعمل عند فتح الموقع (للتحقق إذا كان هناك طلب معلق)
window.onload = function() {
    // تحقق من الصفحة الحالية بناءً على URL
    if(window.location.pathname.includes('index.html')) {
        loadOrders(); // إذا كنا في صفحة الأدمن، حمل الطلبات
    } else if (window.location.pathname.includes('payment.html')) {
        loadPaymentInfo(); // إذا كنا في صفحة الدفع، حمل تفاصيل الدفع
    }
};

// --- منطق صفحة الطلب (index.html) ---
const orderForm = document.getElementById('projectForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // جمع البيانات من النموذج
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const packageType = document.getElementById('packageType').value;
        
        // تحديد السعر
        let price = 0;
        let packageName = "";
        if(packageType === 'basic') { price = 10000; packageName = "static_without_style"; }
        else if (packageType=== 'basic-styled') {price = 15000; packageName = "static_with_style";} 
        else if (packageType=== 'pro') {price = 25000; packageName = "dinamic";} 

        // إنشاء كائن الطلب
        const newOrder = {
            id: Date.now(), // رقم تعريفي فريد بناء على الوقت
            clientName: name,
            clientPhone: phone,
            packageName: packageName,
            price: price,
            date: new Date().toLocaleDateString('ar-EG'),
            status: 'pending' // الطلب في انتظار الدفع
        };

        // حفظ الطلب في Local Storage (محاكاة قاعدة البيانات)
        saveOrderToStorage(newOrder);

        // حفظ بيانات الطلب الحالي مؤقتاً لصفحة الدفع
        sessionStorage.setItem('currentOrder', JSON.stringify(newOrder));

        // إظهار رسالة نجاح وتحويل للدفع
        showToast("تم إنشاء الطلب بنجاح، جاري تحويلك...");
        setTimeout(() => {
            window.location.href = 'payment.html';
        }, 1500);
    });
}

// --- منطق صفحة الدفع (payment.html) ---
function loadPaymentInfo() {
    const order = JSON.parse(sessionStorage.getItem('currentOrder'));
    
    if (order) {
        document.getElementById('orderIdDisplay').innerText = `رقم الطلب: ${order.id}`;
        document.getElementById('finalAmount').innerText = `${order.price.toLocaleString()} ج.م`;
    } else {
        document.querySelector('.payment-card').innerHTML = "<h3>لا يوجد طلب نشاط</h3><p>يرجى العودة للصفحة الرئيسية وإنشاء طلب جديد.</p>";
    }
}

function processPayment(method) {
    const order = JSON.parse(sessionStorage.getItem('currentOrder'));
    if(!order) return;

    // محاكاة عملية الدفع (تحديث حالة الطلب)
    order.status = 'paid';
    order.paymentMethod = method;
    
    // تحديث الطلب في قاعدة البيانات (Local Storage)
    updateOrderStatus(order);

    alert(`تم الدفع بنجاح عبر ${method}! شكراً لك.`);
    window.location.href = 'index.html'; // العودة للرئيسية
}

// --- منطق صفحة الأدمن (admin.html) ---
function loadOrders() {
    const orders = getOrdersFromStorage();
    const tbody = document.getElementById('ordersTableBody');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');

    tbody.innerHTML = '';
    let totalRevenue = 0;

    if(orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">لا توجد طلبات حتى الآن</td></tr>';
    } else {
        orders.forEach(order => {
            if(order.status === 'paid') totalRevenue += order.price;

            const statusClass = order.status === 'paid' ? 'paid' : 'pending';
            const statusText = order.status === 'paid' ? 'تم الدفع' : 'قيد الانتظار';

            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.clientName}</td>
                    <td>${order.clientPhone}</td>
                    <td>${order.packageName}</td>
                    <td>${order.date}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // تحديث الإحصائيات
    totalOrdersEl.innerText = orders.length;
    totalRevenueEl.innerText = totalRevenue.toLocaleString();
}

// --- دوال مساعدة (Helper Functions) ---
function saveOrderToStorage(order) {
    const orders = getOrdersFromStorage();
    orders.push(order);
    localStorage.setItem('projectOrders', JSON.stringify(orders));
}

function updateOrderStatus(updatedOrder) {
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if(index !== -1) {
        orders[index] = updatedOrder;
        localStorage.setItem('projectOrders', JSON.stringify(orders));
    }
}

function getOrdersFromStorage() {
    const orders = localStorage.getItem('projectOrders');
    return orders ? JSON.parse(orders) : [];
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}// هذه الدالة موجودة في script.js
function loadOrders() {
    const orders = getOrdersFromStorage(); // جلب البيانات من الذاكرة
    const tbody = document.getElementById('ordersBody');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const pendingOrdersEl = document.getElementById('pendingOrders');

    // إفراغ الجدول
    tbody.innerHTML = '';

    let totalRevenue = 0;
    let pendingCount = 0;

    // التحقق من وجود طلبات
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <p>لا توجد طلبات حتى الآن</p>
                </td>
            </tr>`;
    } else {
        // عرض الطلبات
        orders.forEach((order, index) => {
            // حساب الإحصائيات
            if(order.status === 'paid') {
                totalRevenue += order.price;
            } else {
                pendingCount++;
            }

            // تحديد شكل الحالة
            let statusClass = order.status === 'paid' ? 'paid' : 'pending';
            let statusText = order.status === 'paid' ? 'مدفوع' : 'قيد الانتظار';
            if(order.status === 'failed') { statusClass = 'failed'; statusText = 'مرفوض'; }

            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td><strong>${order.clientName}</strong></td>
                    <td>${order.clientPhone}</td>
                    <td>${order.packageName}</td>
                    <td>${order.price.toLocaleString()} ج.م</td>
                    <td>${order.paymentMethod || 'غير محدد'}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>${order.date}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteOrder(${order.id})" title="حذف الطلب">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    // تحديث أرقام الإحصائيات
    totalOrdersEl.innerText = orders.length;
    totalRevenueEl.innerText = totalRevenue.toLocaleString();
    pendingOrdersEl.innerText = pendingCount;
}

// دالة مساعدة لحذف طلب (أضفها لـ script.js)
function deleteOrder(id) {
    if(confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        let orders = getOrdersFromStorage();
        orders = orders.filter(order => order.id !== id);
        localStorage.setItem('projectOrders', JSON.stringify(orders));
        loadOrders(); // إعادة تحميل الجدول
    }
}