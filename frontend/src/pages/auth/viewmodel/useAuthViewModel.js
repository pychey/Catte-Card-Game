import { useState } from 'react';
import { login, register, guestLogin } from '../../../services/authService';

const useAuthViewModel = ({ setToken, setPlayer, setMessage }) => {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (mode) => {
    setLoading(true);
    setMessage('');

    try {
      let result;

      if (mode === 'guest') {
        result = await guestLogin();
      } else if (mode === 'register') {
        result = await register(username, password);
      } else {
        result = await login(username, password);
      }

      if (result.ok) {
        setToken(result.data.data.token);
        localStorage.setItem('token', result.data.data.token);
        setPlayer(result.data.data.player);
        setMessage('Authentication successful!');
      } else {
        setMessage(result.data.message);
      }
    } catch (error) {
      setMessage('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return {
    authMode,
    setAuthMode,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleAuth,
  };
};

export default useAuthViewModel;