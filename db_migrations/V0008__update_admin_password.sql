-- Обновление пароля для пользователя admin
UPDATE users 
SET password_hash = '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121'
WHERE email = 'karkavanidi@gmail.ru';