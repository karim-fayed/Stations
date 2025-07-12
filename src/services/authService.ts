import express from 'express';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

app.post('/api/change-password', async (req, res) => {
  const { user_id, old_password, new_password } = req.body;

  try {
    await sql.connect(dbConfig);

    const result = await sql.query`
      SELECT TOP 1 * FROM user_passwords
      WHERE user_id = ${user_id}
      ORDER BY changed_at DESC
    `;

    const currentPassword = result.recordset[0]?.password;

    if (!currentPassword) {
      return res.status(404).json({ message: 'لا توجد كلمة مرور محفوظة' });
    }

    if (currentPassword !== old_password) {
      return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
    }

    await sql.query`
      INSERT INTO user_passwords (user_id, password, changed_by)
      VALUES (${user_id}, ${new_password}, ${user_id})
    `;

    res.json({ message: 'تم تغيير كلمة المرور' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

app.listen(3001, () => {
  console.log('🚀 API تعمل على http://localhost:3001');
});
