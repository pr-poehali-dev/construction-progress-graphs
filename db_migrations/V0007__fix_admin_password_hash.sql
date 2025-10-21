-- Установка правильного хеша для пароля Admin123!
-- SHA256 хеш для Admin123!: 241cf9347bb2831222c443f4c87068379ce0b6203857e5c70c5ee0b3c3d2c5e5
UPDATE users 
SET password_hash = '241cf9347bb2831222c443f4c87068379ce0b6203857e5c70c5ee0b3c3d2c5e5'
WHERE email = 'karkavanidi@gmail.ru';
