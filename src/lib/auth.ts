const AUTH_API = 'https://functions.poehali.dev/df1703c9-8422-4f5d-97c6-b2b96ab128fb';
const USERS_API = 'https://functions.poehali.dev/72f4a1f3-1475-454e-bd8e-95ba293f5cd9';
const EMAIL_API = 'https://functions.poehali.dev/f2770523-d500-49c0-ae46-1d2c51247691';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const sendVerificationCode = async (email: string, purpose: 'login' | 'password_reset' = 'login'): Promise<void> => {
  const response = await fetch(EMAIL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_code',
      email,
      purpose,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка отправки кода');
  }
};

export const login = async (email: string, password: string, verificationCode: string): Promise<AuthResponse> => {
  const response = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email,
      password,
      verification_code: verificationCode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка входа');
  }

  return response.json();
};

export const verifyToken = async (token: string): Promise<{ user: User }> => {
  const response = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'verify',
      token,
    }),
  });

  if (!response.ok) {
    throw new Error('Недействительный токен');
  }

  return response.json();
};

export const logout = async (token: string): Promise<void> => {
  await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'logout',
      token,
    }),
  });
  
  localStorage.removeItem('auth_token');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const getUsers = async (token: string) => {
  const response = await fetch(`${USERS_API}?action=list_users`, {
    headers: { 'X-Auth-Token': token },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка загрузки пользователей');
  }

  return response.json();
};

export const createUser = async (token: string, userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user';
}) => {
  const response = await fetch(USERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      action: 'create_user',
      ...userData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка создания пользователя');
  }

  return response.json();
};

export const updateUser = async (token: string, userId: number, userData: {
  full_name?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}) => {
  const response = await fetch(USERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      action: 'update_user',
      user_id: userId,
      ...userData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка обновления пользователя');
  }

  return response.json();
};

export const changePassword = async (token: string, userId: number, newPassword: string) => {
  const response = await fetch(USERS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      action: 'change_password',
      user_id: userId,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка изменения пароля');
  }

  return response.json();
};

export const getActivityLogs = async (token: string, limit = 100, offset = 0) => {
  const response = await fetch(`${USERS_API}?action=activity_logs&limit=${limit}&offset=${offset}`, {
    headers: { 'X-Auth-Token': token },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка загрузки логов');
  }

  return response.json();
};