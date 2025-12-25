import { PaperPlaneTilt } from 'phosphor-react';

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
}: MessageInputProps) {
  return (
    <form
      className="flex items-center gap-2 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite sua mensagem"
        className="w-full p-2 pl-5 rounded-full border text-black bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        disabled={disabled}
      />
      <button
        type="submit"
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
        disabled={!value.trim() || disabled}
      >
        <PaperPlaneTilt size={26} />
      </button>
    </form>
  );
}
