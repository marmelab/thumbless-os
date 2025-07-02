export default function Button({ icon, children, onClick, className }) {
  return (
    <button
      className={`bg-gray-800 text-white rounded-full py-2 px-4 flex items-center gap-1 hover:opacity-90 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}
