// ==========================================
// ملف: link_manager.js
// وظيفته: ربط الموقع ولوحة التحكم بدون قاعدة بيانات
// ==========================================

// 1. إنشاء القناة (الرابط) بين الصفحتين
// اسم القناة يجب أن يكون مطابقاً في كل الملفات
const channel = new BroadcastChannel('support_project_channel');

// ==========================================
// في صفحة الموقع (إرسال الطلب)
// ==========================================

function sendOrderToAdmin(orderData) {
    // إرسال البيانات عبر القناة
    channel.postMessage({
        type: 'new_order',
        data: orderData
    });

    // اختياري: حفظ في LocalStorage كنسخة احتياطية لعدم ضياع البيانات عند التحديث
    saveLocal(orderData);
}

// ==========================================
// في صفحة لوحة التحكم (استقبال الطلب)
// ==========================================

// الاستماع لأي رسالة قادمة من الموقع
channel.onmessage = (event) => {
    const message = event.data;

    if (message.type === 'new_order') {
        // عند استلام طلب جديد
        console.log('طلب جديد تم استلامه:', message.data);
        
        // إضافة الطلب للواجهة فوراً
        addOrderToUI(message.data);
        
        // إشعار صوتي أو مرئي
        alert('تم استلام طلب جديد!');
    }
};

// ==========================================
// وظائف مساعدة (لعرض البيانات)
// ==========================================

function addOrderToUI(order) {
    const container = document.getElementById('ordersContainer');
    
    // التأكد من وجود الحاوية (في صفحة التحكم)
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.border = '2px solid #10b981'; // حدود خضراء للطلب الجديد
    card.innerHTML = `
        <div class="card-header">
            <span class="order-id">#${order.id}</span>
            <span class="order-date">${order.date}</span>
        </div>
        <div class="customer-info">
            <h3>${order.clientName}</h3>
            <p><i class="fa-solid fa-phone"></i> ${order.clientPhone}</p>
        </div>
        <div class="package-info">
            <span class="package-name">${order.packageName}</span>
            <span class="package-price">${order.price.toLocaleString()} ج.م</span>
        </div>
        <div style="text-align: left;">
            <span class="status-badge status-paid">جديد</span>
        </div>
    `;
    
    // إضافة الكرت في بداية القائمة
    container.prepend(card);
}

function saveLocal(order) {
    const orders = JSON.parse(localStorage.getItem('projectOrders')) || [];
    orders.push(order);
    localStorage.setItem('projectOrders', JSON.stringify(orders));
}