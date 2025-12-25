import { MagnifyingGlass } from 'phosphor-react';
import { BeatLoader } from 'react-spinners';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  loading: boolean;
}

export function SearchBar({ value, onChange, loading }: SearchBarProps) {
  return (
    <div className="relative w-full mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome ou e-mail..."
        className="w-full p-2 pl-10 pr-4 rounded-full border border-gray-700 bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 transition outline-none"
        autoComplete="off"
      />
      <MagnifyingGlass
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      {loading && (
        <BeatLoader
          size={5}
          color="#3b82f6"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}
