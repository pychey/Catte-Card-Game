const RoomActionCard = ({ title, placeholder, value, onChange, transform, onClick, buttonMessage, buttonColor = 'green' }) => {

  const variantStyles = {
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">{title}</h2>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (transform) val = transform(val);
          onChange(val);
        }}
        className="w-full p-2 sm:p-3 border rounded mb-4 placeholder-gray-400"
      />
      <button
        onClick={onClick}
        className={`w-full text-white py-2 sm:py-3 rounded ${variantStyles[buttonColor]}`}
      >
        {buttonMessage}
      </button>
    </div>
  );
};

export default RoomActionCard;