"""
Business: Аутентификация пользователей по email и паролю
Args: event - HTTP запрос с методом POST/GET, body содержит email, password
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

def escape_sql_string(value: str) -> str:
    """Экранирование строки для SQL"""
    return value.replace("'", "''")

def create_session(user_id: int, ip_address: str, user_agent: str) -> str:
    """Создание сессии пользователя"""
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.now() + timedelta(days=7)).isoformat()
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    safe_token = escape_sql_string(token)
    safe_ip = escape_sql_string(ip_address)
    safe_ua = escape_sql_string(user_agent)
    
    query = f"INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES ({user_id}, '{safe_token}', '{safe_ip}', '{safe_ua}', '{expires_at}')"
    cur.execute(query)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return token

def log_activity(user_id: Optional[int], user_email: str, action: str, ip_address: str, user_agent: str, entity_type: Optional[str] = None):
    """Логирование активности"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    safe_email = escape_sql_string(user_email)
    safe_action = escape_sql_string(action)
    safe_ip = escape_sql_string(ip_address)
    safe_ua = escape_sql_string(user_agent)
    user_id_str = str(user_id) if user_id else 'NULL'
    entity_type_str = f"'{escape_sql_string(entity_type)}'" if entity_type else 'NULL'
    
    query = f"INSERT INTO activity_logs (user_id, user_email, action, entity_type, ip_address, user_agent) VALUES ({user_id_str}, '{safe_email}', '{safe_action}', {entity_type_str}, '{safe_ip}', '{safe_ua}')"
    cur.execute(query)
    
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
            'body': '',
            'isBase64Encoded': False
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
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                safe_email = escape_sql_string(email)
                query = f"SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = '{safe_email}'"
                cur.execute(query)
                user = cur.fetchone()
                
                if not user or not user['is_active']:
                    log_activity(None, email, 'login_failed', ip_address, user_agent)
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                if not verify_password(password, user['password_hash']):
                    log_activity(user['id'], email, 'login_failed', ip_address, user_agent)
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = {user['id']}")
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
                            'name': user['full_name'],
                            'role': user['role']
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify':
                token = body_data.get('token', '')
                
                if not token:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Токен отсутствует'}),
                        'isBase64Encoded': False
                    }
                
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                safe_token = escape_sql_string(token)
                query = f"SELECT s.user_id, u.email, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = '{safe_token}' AND s.expires_at > CURRENT_TIMESTAMP"
                cur.execute(query)
                session = cur.fetchone()
                
                cur.close()
                conn.close()
                
                if not session:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недействительный токен'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': session['user_id'],
                            'email': session['email'],
                            'name': session['full_name'],
                            'role': session['role']
                        }
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'logout':
                token = body_data.get('token', '')
                
                if token:
                    conn = psycopg2.connect(DATABASE_URL)
                    cur = conn.cursor()
                    safe_token = escape_sql_string(token)
                    cur.execute(f"UPDATE sessions SET expires_at = CURRENT_TIMESTAMP WHERE token = '{safe_token}'")
                    conn.commit()
                    cur.close()
                    conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Выход выполнен'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
        
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Внутренняя ошибка сервера: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
