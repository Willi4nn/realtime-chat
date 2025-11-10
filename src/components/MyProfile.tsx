import { List, SignOut } from 'phosphor-react';
import { useEffect, useState } from 'react';
import defaultLogo from "../assets/profile-icon.png";
import { useLogout } from '../hooks/useLogout';
import useUserStore from '../store/useSlice';
import { User } from '../types/User';

interface MyProfileProps {
  isMobile: boolean;
}

export default function MyProfile({ isMobile }: MyProfileProps) {
  const currentUser = useUserStore((state) => state.user) as User | null;
  const logout = useLogout();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`flex flex-col bg-slate-800 h-full p-4 items-start transition-all duration-300 gap-4 ${isExpanded ? 'w-60' : 'w-18'
      }`}>
      <button
        onClick={toggleSidebar}
        className="text-white w-10 h-10 flex items-center justify-center rounded-full
                   active:bg-slate-700 duration-100 ease-in-out"
        title={isExpanded ? "Encolher sidebar" : "Expandir sidebar"}
      >
        <List size={32} />
      </button>

      <div className="flex items-center w-full">
        <img
          src={currentUser?.photo || defaultLogo}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div
          className={`
            flex flex-col ml-4 overflow-hidden
            transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}
          `}
        >
          <h1 className="text-xl font-medium truncate whitespace-nowrap text-white">{currentUser?.name || "Usuário"}</h1>
          <h1 className="text-sm truncate whitespace-nowrap text-gray-400">{currentUser?.email || "Usuário"}</h1>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-white w-10 h-10 flex items-center justify-center rounded-full
                  active:bg-slate-700 duration-100 ease-in-out"
        title="Sair"
      >
        <SignOut size={28} weight="bold" />
      </button>
    </div >
  )
}
