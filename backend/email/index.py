"""
Business: Отправка Email с кодами подтверждения
Args: event - HTTP запрос с email и назначением кода
      context - контекст выполнения с request_id
Returns: HTTP ответ с результатом отправки
"""
import json
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get('DATABASE_URL')
SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

def generate_code() -> str:
    """Генерация 6-значного кода"""
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def send_email(to_email: str, code: str, purpose: str) -> bool:
    """Отправка email с кодом"""
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD]):
        return True
    
    try:
        subject = 'Код подтверждения для входа' if purpose == 'login' else 'Код восстановления пароля'
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        
        text = f"""
Ваш код подтверждения: {code}

Код действителен в течение 10 минут.
Если вы не запрашивали этот код, проигнорируйте это письмо.

--
СтройМонитор
Система управления инфраструктурными проектами
        """
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">{subject}</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Ваш код подтверждения:</p>
            <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #2563eb; letter-spacing: 8px;">{code}</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Код действителен в течение 10 минут</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
            Если вы не запрашивали этот код, проигнорируйте это письмо.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
            <strong>СтройМонитор</strong><br>
            Система управления инфраструктурными проектами
        </p>
    </div>
</body>
</html>
        """
        
        part1 = MIMEText(text, 'plain', 'utf-8')
        part2 = MIMEText(html, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'send_code':
                email = body_data.get('email', '').strip().lower()
                purpose = body_data.get('purpose', 'login')
                
                if not email:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email обязателен'})
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                cur.execute("SELECT id FROM users WHERE email = %s AND is_active = true", (email,))
                user = cur.fetchone()
                
                if not user:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден или неактивен'})
                    }
                
                code = generate_code()
                expires_at = datetime.now() + timedelta(minutes=10)
                
                cur.execute(
                    "INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES (%s, %s, %s, %s)",
                    (email, code, purpose, expires_at)
                )
                conn.commit()
                
                cur.close()
                conn.close()
                
                email_sent = send_email(email, code, purpose)
                
                if not email_sent:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Ошибка отправки email', 'code': code})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Код отправлен на email'})
                }
            
            elif action == 'verify_code':
                email = body_data.get('email', '').strip().lower()
                code = body_data.get('code', '').strip()
                purpose = body_data.get('purpose', 'login')
                
                if not email or not code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и код обязательны'})
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                cur.execute(
                    "SELECT id FROM verification_codes WHERE email = %s AND code = %s AND purpose = %s AND used = false AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
                    (email, code, purpose)
                )
                verification = cur.fetchone()
                
                if not verification:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный или истекший код'})
                    }
                
                cur.execute("UPDATE verification_codes SET used = true WHERE id = %s", (verification['id'],))
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Код подтвержден', 'valid': True})
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
        
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }
