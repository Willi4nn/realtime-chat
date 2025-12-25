import { Eye, EyeSlash } from 'phosphor-react';
import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isPassword?: boolean;
}

export function Input({ label, isPassword, ...props }: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1 w-full text-left">
      {label && (
        <label className="text-xs font-medium text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={isPassword ? (show ? 'text' : 'password') : props.type}
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all placeholder:text-slate-500"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
