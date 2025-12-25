interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'google' | 'ghost';
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  loading,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20',
    google:
      'bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-800 text-indigo-400 font-bold',
  };

  return (
    <button
      {...props}
      className={`w-full py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 ${
        variants[variant]
      } ${props.className || ''}`}
    >
      {loading ? 'Processando...' : children}
    </button>
  );
}
