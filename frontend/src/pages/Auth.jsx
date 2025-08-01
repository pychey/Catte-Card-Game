import { useState } from 'react';

const Auth = ({ setToken, setPlayer, message, setMessage, LAN_HOST }) => {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (mode) => {
    setLoading(true);
    setMessage('');

    try {
      let endpoint = '';
      let body = {};

      if (mode === 'guest') {
        endpoint = '/auth/guest';
      } else if (mode === 'register') {
        endpoint = '/auth/register';
        body = { username, password };
      } else {
        endpoint = '/auth/login';
        body = { username, password };
      }

      const response = await fetch(`${LAN_HOST}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: mode === 'guest' ? undefined : JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        setPlayer(data.data.player);
        setMessage('Authentication successful!');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
          Catte Card Game
        </h1>

        <div className="flex mb-4">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 px-4 rounded-l ${
              authMode === 'login' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 px-4 rounded-r ${
              authMode === 'register'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        {authMode !== 'guest' && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={() => handleAuth(authMode)}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 mb-3"
            >
              {loading
                ? 'Loading...'
                : authMode === 'login'
                ? 'Login'
                : 'Register'}
            </button>
          </>
        )}

        <button
          onClick={() => handleAuth('guest')}
          disabled={loading}
          className="w-full bg-gray-600 text-white py-3 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Play as Guest
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded text-center ${
              message.includes('error') || message.includes('failed')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;