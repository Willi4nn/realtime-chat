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
import { toast } from 'react-toastify';
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
  const {
    user: currentUser,
    selectedUserId,
    setSelectedUserId,
  } = useUserStore();

  const { users, loading } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 840);

  const isEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm.trim()),
    [searchTerm]
  );

  const filteredContacts = useMemo(() => {
    if (!searchTerm || isEmail) return users;
    return users.filter((u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users, isEmail]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 840);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isEmail || searchTerm.trim() === currentUser?.email) {
      setSearchResult(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
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
          const alreadyInList = users.some((u) => u.id === userData.id);
          setSearchResult(alreadyInList ? null : userData);
        } else {
          setSearchResult(null);
        }
      } catch (error) {
        console.error('Erro na procura global:', error);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isEmail, users, currentUser?.email]);

  const handleStartChat = async (targetUser: User) => {
    if (!currentUser) return;
    const chatId = [currentUser.id, targetUser.id].sort().join('_');

    try {
      await setDoc(
        doc(db, 'chats', chatId),
        {
          participants: [currentUser.id, targetUser.id],
          messages: [],
        },
        { merge: true }
      );

      const isNewContact = !users.some((u) => u.id === targetUser.id);
      if (isNewContact) {
        toast.success('Contato adicionado à sua lista');
      }

      setActiveChatUser(targetUser);
      setSelectedUserId(targetUser.id);
      setSearchTerm('');
    } catch (error) {
      console.error('Erro ao iniciar conversa', error);
      toast.error('Não foi possível adicionar o contato');
    }
  };

  const renderEmptyState = () => {
    if (loading || searchResult) return null;
    if (filteredContacts.length === 0) {
      return (
        <p className="text-center text-gray-500 text-sm mt-8 px-4">
          {searchTerm.length > 0
            ? 'Nenhum contato encontrado.'
            : 'Pesquise acima um amigo pelo e-mail para começar a conversar!'}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-slate-900 justify-center items-center overflow-hidden">
      <MyProfile isMobile={isMobile} />

      <main className="flex flex-1 h-full min-h-0">
        {(!isMobile || !selectedUserId) && (
          <aside
            className={`${
              isMobile ? 'w-full' : 'w-80'
            } flex flex-col bg-slate-950 p-4 border-r border-white/5`}
          >
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              loading={isSearchingGlobal}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar mt-4">
              {searchResult && (
                <div className="mb-6">
                  <p className="sidebar-label">Novo contato</p>
                  <div
                    onClick={() => handleStartChat(searchResult)}
                    className="flex items-center p-3 gap-3 bg-blue-600/10 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-600/20 transition group"
                  >
                    <img
                      src={searchResult.photo || defaultLogo}
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {searchResult.name}
                      </p>
                      <p className="text-xs text-blue-400 truncate">
                        {searchResult.email}
                      </p>
                    </div>
                    <UserPlus
                      size={20}
                      className="text-blue-400 group-hover:scale-110 transition"
                    />
                  </div>
                </div>
              )}

              <p className="sidebar-label">
                {searchTerm && !isEmail ? 'Resultados' : 'Conversas Recentes'}
              </p>

              <ul className="space-y-1">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <BeatLoader color="#3b82f6" size={8} />
                  </div>
                ) : (
                  filteredContacts.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setActiveChatUser(user);
                      }}
                      className={`flex items-center p-3 gap-3 rounded-xl cursor-pointer transition-all ${
                        selectedUserId === user.id
                          ? 'bg-slate-800 shadow-lg'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <img
                        src={user.photo || defaultLogo}
                        className="w-10 h-10 rounded-full bg-slate-700"
                        alt=""
                      />
                      <span className="text-slate-200 font-medium truncate">
                        {user.name}
                      </span>
                    </li>
                  ))
                )}
                {renderEmptyState()}
              </ul>
            </div>
          </aside>
        )}

        {(!isMobile || selectedUserId) && (
          <section className="flex-1 flex bg-slate-800 justify-center items-center relative">
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
                <img
                  src={logoImg}
                  alt="Logo"
                  className="w-80 opacity-10 select-none"
                />
              )
            )}
          </section>
        )}
      </main>
    </div>
  );
}
