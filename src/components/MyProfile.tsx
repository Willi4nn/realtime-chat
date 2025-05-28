import { SignOut } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import defaultLogo from "../assets/profile-icon.png";
import { auth } from "../firebase";
import useUserStore from '../store/useSlice';

export default function UserProfile() {
  const currentUser = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col bg-slate-800 h-full w-60 p-5 items-center">
      <div className='flex items-center justify-center'>
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
        className="mt-4 text-white w-10 h-10 flex items-center justify-center rounded-full"
        title="Sair"
      >
        <SignOut size={28} weight="bold" />
      </button>
    </div >
  )
}
