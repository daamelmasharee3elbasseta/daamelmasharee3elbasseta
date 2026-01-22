<?php
// ملف: fawry_pay.php

// 1. بياناتك الخاصة من فوري
 $merchant_code = "YOUR_MERCHANT_CODE"; // ضع كود التاجر هنا
 $security_key   = "YOUR_SECURITY_KEY"; // ضع مفتاح الأمان هنا

// 2. بيانات الطلب (يمكن استلامها من Form أو قاعدة البيانات)
 $order_id  = uniqid(); // رقم طلب عشوائي
 $amount    = 100.00;   // المبلغ
 $desc      = "طلب تصميم موقع"; // وصف المنتج

// 3. حساب الـ Signature (التوقيع) المطلوب
// ملاحظة: الترتيب مهم جداً: Code + OrderID + Key
 $signature = hash('sha512', $merchant_code . $order_id . $security_key);

// 4. تجهيز البيانات لتمريرها للـ JavaScript
// سنستخدم JSON لإرسال البيانات للكود في الأسفل
 $json_data = [
    "merchantCode" => $merchant_code,
    "merchantRefNum" => $order_id,
    "amount" => $amount,
    "paymentMethod" => "CARD", // أو PAYATFAWRY للدفع كاش
    "description" => $desc,
    "signature" => $signature,
    "fawryLink" => "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge" // الرابط الذي أرسلته لي
];

// تخزين البيانات في متغير يمكن للـ JavaScript قراءته
?>