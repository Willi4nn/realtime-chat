import { useMemo, useState } from "react";
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

  const filteredUsers = useMemo(() => {
    const availableUsers = users.filter(user => user.id !== currentUser?.id);

    if (!searchText) return availableUsers;

    return availableUsers.filter(user =>
      user.name && user.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, users, currentUser?.id]);



  return (
    <div className="flex h-screen justify-center items-center">
      <MyProfile />
      <div className="bg-slate-800 w-full flex flex-col items-center h-full">
        <div className="flex flex-1 w-full min-h-0">
          <div className="flex-col h-full w-70 bg-slate-950 p-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Pesquisar usuário..."
              className="w-full p-2 pl-5 rounded-full border border-gray-500"
              disabled={!selectedUserId}
              autoComplete="off"
            />
            <div className="flex-1 min-h-0 mt-4 overflow-y-auto max-h-[calc(100vh-100px)]
            custom-scrollbar"
              style={{
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <ul className="w-full flex flex-col justify-start gap-2 items-center">
                {loading ? (
                  <span className="text-white">Carregando...</span>
                ) : (
                  filteredUsers
                    .map((user) => (
                      <li key={user.id}
                        style={{ backgroundColor: selectedUserId === user.id ? '#1e293b' : 'transparent' }}
                        className={"flex items-center p-2 justify-start gap-2 h-12 w-full rounded-md cursor-pointer"}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <img
                          src={user.photo || defaultLogo}
                          alt={`Foto de ${user.name}`}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{user.name}</span>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
          <div className="flex flex-1 w-full min-h-0 bg-slate-800">
            {selectedUserId && <Chats selectedUserId={selectedUserId} currentUserId={currentUser?.id} selectedUser={selectedUser} />}
          </div>
        </div>
      </div>
    </div>
  );
} 