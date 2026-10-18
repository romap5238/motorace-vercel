const { Pool } = require('pg');

// Создаем пул соединений с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Разрешаем CORS (чтобы сайт мог обращаться к серверу)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  // Обработка входа
  if (url === '/login' && method === 'POST') {
    const { password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM players WHERE password = $1', [password]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Неверный пароль' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  // Обработка сохранения (на будущее)
  if (url === '/save' && method === 'POST') {
    const { password, coins, speedLevel } = req.body;
    try {
      await pool.query(
        'UPDATE players SET coins = $1, speed_level = $2 WHERE password = $3',
        [coins, speedLevel, password]
      );
      return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка сохранения' });
    }
  }

  // Если запрос не распознан
  return res.status(404).json({ error: 'Not found' });
};
