import defaultLogo from "../assets/profile-icon.png";
import { User } from "../types/User";

interface UserProfileProps {
  user: User | null;
  isTyping?: boolean;
}
export default function UserProfile({ user, isTyping }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3 h-15 p-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <img
          src={user?.photo || defaultLogo}
          alt={`Foto de ${user?.name}`}
          className="w-8 h-8 rounded-full"
        />
      </div>
      <div>
        <h3 className="text-white text-sm font-medium">
          {user?.name || 'Usuário'}
        </h3>
        <p className="text-white/60 text-xs">{isTyping ? "Digitando..." : ""}</p>
      </div>
    </div>
  )
}
