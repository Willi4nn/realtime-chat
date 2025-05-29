import { arrayUnion, doc, getDoc, onSnapshot, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { PaperPlaneTilt } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import BackgroundImg from "../assets/background.jpg";
import { db } from "../firebase";
import { User } from "../types/User";
import { formatTime } from "../utils/formatTime";
import UserProfile from "./UserProfile";

interface Message {
  text: string;
  senderId: string | undefined;
  timestamp: Timestamp;
}

interface ChatsProps {
  selectedUserId: string;
  currentUserId: string | undefined;
  selectedUser: User | null;
}

export default function Chats({ selectedUserId, currentUserId, selectedUser }: ChatsProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const chatId = selectedUserId && currentUserId
    ? [selectedUserId, currentUserId].sort().join("_")
    : null;

  useEffect(() => {
    if (!chatId) return;
    const chatDocRef = doc(db, "chats", chatId);
    const unSubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setMessages(data.messages || []);
      }
      else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar mensagens:", error);
      setLoading(false);
    }
    );
    return () => {
      unSubscribe();
    }
  }, [chatId]);


  const sendMessage = async () => {
    if (newMessage.trim() === "" || !chatId || !currentUserId) return;

    const chatDocRef = doc(db, "chats", chatId);
    try {
      const docSnapshot = await getDoc(chatDocRef);

      const message: Message = {
        text: newMessage,
        senderId: currentUserId,
        timestamp: Timestamp.now(),
      };
      if (docSnapshot.exists()) {
        await updateDoc(chatDocRef, {
          messages: arrayUnion(message)
        })
      } else {
        await setDoc(chatDocRef, {
          messages: [message],
        })
      }
      setNewMessage("");
    }
    catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <UserProfile user={selectedUser} />
      <div className="flex flex-col  flex-1 w-full min-h-0 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${BackgroundImg})`,
          opacity: 1
        }}
      >
        <div
          className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar"
          style={{
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center w-full h-full">
              <BeatLoader color="#F8FAFC" size={15} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-2xl">Sem mensagens</h2>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                className={`max-w-[40%] p-2 my-2 mx-4 rounded-2xl shadow 
                ${message.senderId === currentUserId
                    ? 'bg-blue-600 text-white self-end rounded-br-none'
                    : 'bg-gray-200 text-gray-900 self-start rounded-bl-none'
                  }`}
                style={{ wordBreak: 'break-word' }}
                key={index}
              >
                {message.text}
                <span className={`block text-xs pl-3 ${message.senderId === currentUserId ? "text-blue-200" : "text-gray-500"}`} style={{ textAlign: "right" }}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex-shrink-0 border-t border-gray-300/20 backdrop-blur-[2px]">
          <form
            className="flex items-center gap-2 p-4"
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem"
              className="w-full p-2 pl-5 rounded-full border text-black bg-gray-200 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              disabled={!selectedUserId}
              autoComplete="off"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-full flex items-center disabled:opacity-50"
              disabled={!newMessage.trim() || !selectedUserId}
              title="Enviar"
            >
              <PaperPlaneTilt size={26} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
