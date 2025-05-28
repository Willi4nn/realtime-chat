import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import defaultLogo from "../assets/profile-icon.png";
import Chats from "../components/Chats";
import MyProfile from "../components/MyProfile";
import { db } from "../firebase";
import useUserStore from "../store/useSlice";

interface ChatUser {
  id: string;
  displayName: string;
  photo: string | null;
  email: string;
}

export default function ChatView() {
  const currentUser = useUserStore((state) => state.user);
  const [usersList, setUsersList] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedUserId = useUserStore((state) => state.selectedUserId);
  const setSelectedUserId = useUserStore((state) => state.setSelectedUserId);
  const [searchText, setSearchText] = useState("");
  const selectedUser = usersList.find(user => user.id === selectedUserId) || null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
          photo: doc.data().photo || defaultLogo,
          email: doc.data().email,
        }));
        setUsersList(users);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchText) return usersList;

    return usersList.filter(user =>
      user.displayName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, usersList]);

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
            <ul className="w-full flex flex-col justify-start gap-2 items-center mt-4">
              {loading ? (
                <span className="text-white">Carregando...</span>
              ) : (
                filteredData
                  .filter((user) => user.id !== currentUser?.id)
                  .map((user) => (
                    <li key={user.id}
                      style={{ backgroundColor: selectedUserId === user.id ? '#1e293b' : 'transparent' }}
                      className={"flex items-center p-2 justify-start gap-2 h-12 w-full rounded-md cursor-pointer"}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <img
                        src={user.photo || defaultLogo}
                        alt={`Foto de ${user.displayName}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.displayName}</span>
                    </li>
                  ))
              )}
            </ul>
          </div>
          <div className="flex flex-1 w-full min-h-0 bg-slate-800">
            {selectedUserId && <Chats selectedUserId={selectedUserId} currentUserId={currentUser?.id} selectedUser={selectedUser} />}
          </div>
        </div>
      </div>
    </div>
  );
} 