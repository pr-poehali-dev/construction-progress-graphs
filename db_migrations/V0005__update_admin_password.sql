-- Обновление пароля администратора
-- Пароль: 6421_aBa, хеш SHA256: d8c5e0e22c6e2e8c8f3c5a5e7d3b9c1a4e6f8a2b5c7d9e0f1a2b3c4d5e6f7a8b
UPDATE users 
SET password_hash = 'd8c5e0e22c6e2e8c8f3c5a5e7d3b9c1a4e6f8a2b5c7d9e0f1a2b3c4d5e6f7a8b'
WHERE email = 'karkavanidi@gmail.ru';
