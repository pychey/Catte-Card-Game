const Notification = ({ message, setMessage }) => {
  if (!message) return null;

  return (
    <div className="fixed top-30 right-6 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out animate-slide-in">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 text-center">{message.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={() => setMessage('')}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">&times;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;