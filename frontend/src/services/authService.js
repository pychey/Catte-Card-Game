const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const register = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const guestLogin = async () => {
  const response = await fetch(`${BASE_URL}/auth/guest`, {
    method: 'POST',
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const fetchHistory = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const convertAccount = async (token, username, password) => {
  const response = await fetch(`${BASE_URL}/auth/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
};