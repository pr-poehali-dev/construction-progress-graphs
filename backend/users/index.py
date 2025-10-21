"""
Business: Управление пользователями и логами активности
Args: event - HTTP запрос с методом GET/POST, headers содержит X-Auth-Token
      context - контекст выполнения с request_id
Returns: HTTP ответ со списком пользователей, логами или результатом операции
"""
import json
import os
import hashlib
from typing import Dict, Any, Optional, List
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get('DATABASE_URL')

def hash_password(password: str) -> str:
    """Простое хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_session(token: str) -> Optional[Dict[str, Any]]:
    """Проверка сессии и получение данных пользователя"""
    if not token:
        return None
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cur.execute(
        "SELECT s.user_id, u.email, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > CURRENT_TIMESTAMP",
        (token,)
    )
    session = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return dict(session) if session else None

def log_activity(user_id: int, user_email: str, action: str, entity_type: Optional[str], entity_id: Optional[str], old_values: Optional[Dict], new_values: Optional[Dict], ip_address: str, user_agent: str):
    """Логирование активности"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO activity_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (user_id, user_email, action, entity_type, entity_id, 
         json.dumps(old_values) if old_values else None,
         json.dumps(new_values) if new_values else None,
         ip_address, user_agent)
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    token = event.get('headers', {}).get('x-auth-token', '')
    user_session = verify_session(token)
    
    if not user_session:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    user_agent = event.get('headers', {}).get('user-agent', '')
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'list_users')
        
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            if action == 'list_users':
                if user_session['role'] != 'admin':
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Доступ запрещен'})
                    }
                
                cur.execute(
                    "SELECT id, email, full_name, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC"
                )
                users = [dict(row) for row in cur.fetchall()]
                
                for user in users:
                    if user.get('created_at'):
                        user['created_at'] = user['created_at'].isoformat()
                    if user.get('last_login'):
                        user['last_login'] = user['last_login'].isoformat()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users})
                }
            
            elif action == 'activity_logs':
                if user_session['role'] != 'admin':
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Доступ запрещен'})
                    }
                
                limit = int(query_params.get('limit', 100))
                offset = int(query_params.get('offset', 0))
                
                cur.execute(
                    "SELECT id, user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address, created_at FROM activity_logs ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (limit, offset)
                )
                logs = [dict(row) for row in cur.fetchall()]
                
                for log in logs:
                    if log.get('created_at'):
                        log['created_at'] = log['created_at'].isoformat()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'logs': logs})
                }
            
            cur.close()
            conn.close()
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    elif method == 'POST':
        if user_session['role'] != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Доступ запрещен'})
            }
        
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            if action == 'create_user':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                full_name = body_data.get('full_name', '')
                role = body_data.get('role', 'user')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'})
                    }
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (email, password_hash, full_name, role) VALUES (%s, %s, %s, %s) RETURNING id",
                    (email, password_hash, full_name, role)
                )
                new_user_id = cur.fetchone()['id']
                conn.commit()
                
                log_activity(
                    user_session['user_id'],
                    user_session['email'],
                    'user_created',
                    'user',
                    str(new_user_id),
                    None,
                    {'email': email, 'full_name': full_name, 'role': role},
                    ip_address,
                    user_agent
                )
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_user_id, 'message': 'Пользователь создан'})
                }
            
            elif action == 'update_user':
                user_id = body_data.get('user_id')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ID пользователя обязателен'})
                    }
                
                cur.execute("SELECT email, full_name, role, is_active FROM users WHERE id = %s", (user_id,))
                old_user = cur.fetchone()
                
                if not old_user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'})
                    }
                
                full_name = body_data.get('full_name', old_user['full_name'])
                role = body_data.get('role', old_user['role'])
                is_active = body_data.get('is_active', old_user['is_active'])
                
                cur.execute(
                    "UPDATE users SET full_name = %s, role = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (full_name, role, is_active, user_id)
                )
                conn.commit()
                
                log_activity(
                    user_session['user_id'],
                    user_session['email'],
                    'user_updated',
                    'user',
                    str(user_id),
                    dict(old_user),
                    {'full_name': full_name, 'role': role, 'is_active': is_active},
                    ip_address,
                    user_agent
                )
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Пользователь обновлен'})
                }
            
            elif action == 'change_password':
                user_id = body_data.get('user_id')
                new_password = body_data.get('new_password', '')
                
                if not user_id or not new_password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ID пользователя и новый пароль обязательны'})
                    }
                
                password_hash = hash_password(new_password)
                
                cur.execute("UPDATE users SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (password_hash, user_id))
                conn.commit()
                
                log_activity(
                    user_session['user_id'],
                    user_session['email'],
                    'password_changed',
                    'user',
                    str(user_id),
                    None,
                    None,
                    ip_address,
                    user_agent
                )
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Пароль изменен'})
                }
            
            cur.close()
            conn.close()
            
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
