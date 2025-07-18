export default function Button({ icon, children, onClick, className, variant }) {
  return (
    <button
      className={`rounded-full py-2 px-4 flex items-center gap-1 cursor-pointer ${className} ${variant === "outline"
        ? "border border-gray-200 hover:border-gray-600 bg-background hover:bg-accent text-muted-foreground hover:text-accent-foreground"
        : "bg-gray-800 text-white "
        }`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}
