import useAuthViewModel from './viewmodel/useAuthViewModel';

const Auth = ({ setToken, setPlayer, message, setMessage }) => {
  const {
    authMode,
    setAuthMode,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleAuth,
  } = useAuthViewModel({ setToken, setPlayer, setMessage });

  return (
    <div className="min-h-screen bg-green-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-120 mx-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
          Catte Tam Phumi
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
              authMode === 'register' ? 'bg-green-600 text-white' : 'bg-gray-200'
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
              className="w-full p-3 border rounded mb-3 placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-4 placeholder-gray-400"
            />
            <button
              onClick={() => handleAuth(authMode)}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 mb-3"
            >
              {loading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Register'}
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