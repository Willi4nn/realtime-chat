import { MagnifyingGlass } from "phosphor-react";
import { useEffect, useMemo, useState } from "react";
import { BeatLoader } from "react-spinners";
import logoImg from "../assets/logo.png";
import defaultLogo from "../assets/profile-icon.png";
import Chats from "../components/Chats";
import MyProfile from "../components/MyProfile";
import { useUsers } from "../hooks/useUsers";
import useUserStore from "../store/useSlice";

export default function ChatView() {
  const currentUser = useUserStore((state) => state.user);
  const selectedUserId = useUserStore((state) => state.selectedUserId);
  const setSelectedUserId = useUserStore((state) => state.setSelectedUserId);
  const { users, loading } = useUsers();
  const selectedUser = users.find(user => user.id === selectedUserId) || null;
  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 840);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 840;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filteredUsers = useMemo(() => {
    const availableUsers = users.filter(user => user.id !== currentUser?.id);

    if (!searchText) return availableUsers;

    return availableUsers.filter(user =>
      user.name && user.name.toLowerCase().includes(searchText.trim().toLowerCase())
    );
  }, [searchText, users, currentUser?.id]);

  return (
    <div className="flex h-screen justify-center items-center">
      <MyProfile />
      <div className="bg-slate-700 w-full flex flex-col items-center h-full">
        <div className="flex flex-1 w-full min-h-0">

          {(!isMobile || !selectedUserId) && (
            <div className={`flex-col h-full ${isMobile ? "w-full" : "w-70"} bg-slate-950 p-4`}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Pesquisar usuário..."
                  className="w-full p-2 pl-10 pr-4 rounded-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  autoComplete="off"
                />
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              <div className="flex-1 min-h-0 mt-4 overflow-y-auto max-h-[calc(100vh-100px)]
              custom-scrollbar"
                style={{
                  scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                }}
              >
                <ul className="w-full flex flex-col justify-start gap-2 items-center">
                  {loading ? (
                    <div className="flex justify-center items-center w-full h-full">
                      <BeatLoader color="#F8FAFC" size={15} />
                    </div>
                  ) : (
                    filteredUsers
                      .map((user) => (
                        <li
                          key={user.id}
                          className={`
                          flex items-center p-2 justify-start gap-2 h-12 w-full rounded-md cursor-pointer
                          relative overflow-hidden group
                          transition-all duration-200 ease-in-out
                          ${selectedUserId === user.id ? 'bg-sky-700 animate-selecting' : 'hover:bg-slate-800/70'}
                          `}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            if (isMobile) setSelectedUserId(user.id);
                          }}
                        >
                          <img
                            src={user.photo || defaultLogo}
                            alt={`Foto de ${user.name}`}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="truncate overflow-hidden whitespace-nowrap">
                            {user.name}
                          </span>
                        </li>
                      ))
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
                  selectedUser={selectedUser}
                  isMobile={isMobile}
                  onBack={() => setSelectedUserId(null)}
                />
              ) : (
                !isMobile && <img src={logoImg} alt="Logo" style={{ width: 500, height: 500 }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}