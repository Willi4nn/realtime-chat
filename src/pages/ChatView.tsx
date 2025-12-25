import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { UserPlus } from 'phosphor-react';
import { useEffect, useMemo, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import logoImg from '../assets/logo.png';
import defaultLogo from '../assets/profile-icon.png';
import { db } from '../firebase';

import Chats from '../components/Chats';
import MyProfile from '../components/MyProfile';
import { SearchBar } from '../components/SearchBar';
import { useUsers } from '../hooks/useUsers';
import useUserStore from '../store/useSlice';
import { User } from '../types/User';

export default function ChatView() {
  const currentUser = useUserStore((state) => state.user);
  const selectedUserId = useUserStore((state) => state.selectedUserId);
  const setSelectedUserId = useUserStore((state) => state.setSelectedUserId);

  const { users, loading } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);

  const isEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm.trim());
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (isEmail && searchTerm.trim() !== currentUser?.email) {
        setIsSearchingGlobal(true);
        try {
          const q = query(
            collection(db, 'users'),
            where('email', '==', searchTerm.trim())
          );
          const snap = await getDocs(q);

          if (!snap.empty) {
            const userData = {
              id: snap.docs[0].id,
              ...snap.docs[0].data(),
            } as User;
            if (!users.some((u) => u.id === userData.id)) {
              setSearchResult(userData);
            } else {
              setSearchResult(null);
            }
          } else {
            setSearchResult(null);
          }
        } catch (error) {
          console.error('Erro na procura global:', error);
        } finally {
          setIsSearchingGlobal(false);
        }
      } else {
        setSearchResult(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isEmail, users, currentUser?.email]);

  const handleStartChat = async (targetUser: User) => {
    if (!currentUser) return;
    const chatId = [currentUser.id, targetUser.id].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);

    try {
      await setDoc(
        chatRef,
        {
          participants: [currentUser.id, targetUser.id],
          messages: [],
        },
        { merge: true }
      );

      setActiveChatUser(targetUser);
      setSelectedUserId(targetUser.id);
      setSearchTerm('');
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchTerm || isEmail) return users;
    return users.filter((u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users, isEmail]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 840);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 840);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex h-screen  justify-center items-center overflow-hidden">
      <MyProfile isMobile={isMobile} />
      <div className="bg-slate-700 w-full flex flex-col items-center h-full">
        <div className="flex flex-1 w-full min-h-0">
          {(!isMobile || !selectedUserId) && (
            <div
              className={`flex flex-col h-full ${
                isMobile ? 'w-full' : 'w-80'
              } bg-slate-950 p-4`}
            >
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                loading={isSearchingGlobal}
              />

              <div className="flex-1 overflow-y-auto custom-scrollbar text-left">
                {searchResult && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2 px-2 uppercase font-bold tracking-wider">
                      Novo contacto
                    </p>
                    <div
                      onClick={() => handleStartChat(searchResult)}
                      className="flex items-center p-3 gap-3 bg-blue-600/20 border border-blue-500/30 rounded-lg cursor-pointer hover:bg-blue-600/30 transition"
                    >
                      <img
                        src={searchResult.photo || defaultLogo}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {searchResult.name}
                        </p>
                        <p className="text-xs text-blue-300 truncate">
                          {searchResult.email}
                        </p>
                      </div>
                      <UserPlus size={20} className="text-blue-400" />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-2 px-2 uppercase font-bold tracking-wider">
                  {searchTerm && !isEmail ? 'Resultados' : 'Conversas Recentes'}
                </p>
                <ul className="space-y-1">
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <BeatLoader color="#fff" size={8} />
                    </div>
                  ) : (
                    filteredContacts.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setActiveChatUser(user);
                        }}
                        className={`flex items-center p-3 gap-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUserId === user.id
                            ? 'bg-slate-800'
                            : 'hover:bg-slate-800'
                        }`}
                      >
                        <img
                          src={user.photo || defaultLogo}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-white truncate">{user.name}</span>
                      </li>
                    ))
                  )}
                  {!loading &&
                    filteredContacts.length === 0 &&
                    !searchResult && (
                      <p className="text-center text-gray-500 text-sm mt-4">
                        Parece que você ainda não selecionou uma conversa.
                        Pesquise um amigo ja cadastrado nessa aplicação pelo
                        e-mail na barra lateral para começar a papear!
                      </p>
                    )}
                </ul>
              </div>
            </div>
          )}

          {(!isMobile || selectedUserId) && (
            <div className="flex flex-1 w-full min-h-0 bg-slate-800 justify-center items-center relative">
              {selectedUserId ? (
                <Chats
                  selectedUserId={selectedUserId}
                  currentUserId={currentUser?.id}
                  selectedUser={
                    activeChatUser ||
                    users.find((u) => u.id === selectedUserId) ||
                    null
                  }
                  isMobile={isMobile}
                  onBack={() => {
                    setSelectedUserId(null);
                    setActiveChatUser(null);
                  }}
                />
              ) : (
                !isMobile && (
                  <img src={logoImg} alt="Logo" className="w-96 opacity-20" />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
