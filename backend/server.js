const express = require('express');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(express.json());

// إعداد الاتصال بقاعدة البيانات
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // إذا كانت محلية
    trustServerCertificate: true
  }
};

// API لتغيير كلمة المرور
app.post('/api/change-password', async (req, res) => {
  const { user_id, old_password, new_password } = req.body;

  try {
    await sql.connect(dbConfig);

    const result = await sql.query`
      SELECT * FROM user_passwords 
      WHERE user_id = ${user_id} 
      ORDER BY changed_at DESC
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'لا توجد كلمة مرور محفوظة.' });
    }

    const currentPassword = result.recordset[0].password;

    if (currentPassword !== old_password) {
      return res.status(401).json({ message: 'كلمة المرور الحالية غير صحيحة.' });
    }

    await sql.query`
      INSERT INTO user_passwords (user_id, password, changed_by)
      VALUES (${user_id}, ${new_password}, ${user_id})
    `;

    res.json({ message: 'تم تغيير كلمة المرور بنجاح.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

app.listen(3001, () => {
  console.log('🚀 API تعمل على http://localhost:3001');
});
