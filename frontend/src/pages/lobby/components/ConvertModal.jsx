const ConvertModal = ({
  convertUsername,
  setConvertUsername,
  convertPassword,
  setConvertPassword,
  convertLoading,
  handleConvertAccount,
  onClose,
  message,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-800">Upgrade Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">Convert your guest account to a full account to save your progress and access more features.</p>
          <input
            type="text"
            placeholder="Choose Username"
            value={convertUsername}
            onChange={(e) => setConvertUsername(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <input
            type="password"
            placeholder="Choose Password"
            value={convertPassword}
            onChange={(e) => setConvertPassword(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <button
            onClick={handleConvertAccount}
            disabled={convertLoading}
            className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {convertLoading ? 'Upgrading...' : 'Upgrade Account'}
          </button>
          {message && (
            <div className={`p-3 rounded text-center ${
              message.includes('error') || message.includes('failed')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvertModal;