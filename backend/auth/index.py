"""
Business: Аутентификация пользователей с проверкой кода из Email
Args: event - HTTP запрос с методом POST/GET, body содержит email, password, verification_code
      context - контекст выполнения с request_id
Returns: HTTP ответ с токеном сессии или ошибкой
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get('DATABASE_URL')

def hash_password(password: str) -> str:
    """Простое хеширование пароля (в продакшене использовать bcrypt)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля"""
    return hash_password(password) == password_hash

def create_session(user_id: int, ip_address: str, user_agent: str) -> str:
    """Создание сессии пользователя"""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (%s, %s, %s, %s, %s)",
        (user_id, token, ip_address, user_agent, expires_at)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return token

def log_activity(user_id: Optional[int], user_email: str, action: str, ip_address: str, user_agent: str, entity_type: Optional[str] = None):
    """Логирование активности"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO activity_logs (user_id, user_email, action, entity_type, ip_address, user_agent) VALUES (%s, %s, %s, %s, %s, %s)",
        (user_id, user_email, action, entity_type, ip_address, user_agent)
    )
    
    conn.commit()
    cur.close()
    conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
            user_agent = event.get('headers', {}).get('user-agent', '')
            
            if action == 'login':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                verification_code = body_data.get('verification_code', '')
                
                if not email or not password or not verification_code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email, пароль и код подтверждения обязательны'})
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                cur.execute(
                    "SELECT id FROM verification_codes WHERE email = %s AND code = %s AND purpose = 'login' AND used = false AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
                    (email, verification_code)
                )
                verification = cur.fetchone()
                
                if not verification:
                    log_activity(None, email, 'login_failed_invalid_code', ip_address, user_agent)
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный или истекший код подтверждения'})
                    }
                
                cur.execute("SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = %s", (email,))
                user = cur.fetchone()
                
                if not user or not user['is_active']:
                    log_activity(None, email, 'login_failed', ip_address, user_agent)
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                if not verify_password(password, user['password_hash']):
                    log_activity(user['id'], email, 'login_failed', ip_address, user_agent)
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                cur.execute("UPDATE verification_codes SET used = true WHERE id = %s", (verification['id'],))
                cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
                conn.commit()
                
                cur.close()
                conn.close()
                
                token = create_session(user['id'], ip_address, user_agent)
                log_activity(user['id'], email, 'login_success', ip_address, user_agent)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'full_name': user['full_name'],
                            'role': user['role']
                        }
                    })
                }
            
            elif action == 'verify':
                token = body_data.get('token', '')
                
                if not token:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Токен отсутствует'})
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                cur.execute(
                    "SELECT s.user_id, u.email, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > CURRENT_TIMESTAMP",
                    (token,)
                )
                session = cur.fetchone()
                
                cur.close()
                conn.close()
                
                if not session:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недействительный токен'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': session['user_id'],
                            'email': session['email'],
                            'full_name': session['full_name'],
                            'role': session['role']
                        }
                    })
                }
            
            elif action == 'logout':
                token = body_data.get('token', '')
                
                if token:
                    conn = psycopg2.connect(DATABASE_URL)
                    cur = conn.cursor()
                    cur.execute("UPDATE sessions SET expires_at = CURRENT_TIMESTAMP WHERE token = %s", (token,))
                    conn.commit()
                    cur.close()
                    conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Выход выполнен'})
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