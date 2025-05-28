import { List, SignOut } from 'phosphor-react';
import { useState } from 'react';
import defaultLogo from "../assets/profile-icon.png";
import { useLogout } from '../hooks/useLogout';
import useUserStore from '../store/useSlice';
import { User } from '../types/User';

export default function MyProfile() {
  const currentUser = useUserStore((state) => state.user) as User | null;
  const logout = useLogout();
  const [isExpanded, setIsExpanded] = useState(true);

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
          className="text-white w-10 h-10 flex items-center justify-center hover:bg-slate-700 rounded-full"
          title={isExpanded ? "Encolher sidebar" : "Expandir sidebar"}
        >
          <List size={32}/>
        </button>
      <div className="flex items-center">
        <img
          src={currentUser?.photo || defaultLogo}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full"
        />
        <div className='flex flex-col ml-4'>
          <h1 className="text-1xl font-medium">{currentUser?.name || "Usuário"}</h1>
          <h1 className="text-1xl">{currentUser?.email || "Usuário"}</h1>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className=" text-white w-10 h-10 flex items-center justify-center rounded-full"
        title="Sair"
      >
        <SignOut size={28} weight="bold" />
      </button>
    </div >
  )
}
