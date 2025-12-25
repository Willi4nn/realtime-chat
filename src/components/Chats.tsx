import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { ArrowLeft } from 'phosphor-react';
import { useEffect, useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import BackgroundImg from '../assets/background.jpg';
import { db } from '../firebase';
import { User } from '../types/User';
import { formatTime } from '../utils/formatTime';
import { MessageInput } from './MessageInput';
import UserProfile from './UserProfile';

interface Message {
  text: string;
  senderId: string | undefined;
  timestamp: Timestamp;
}

interface ChatsProps {
  selectedUserId: string;
  currentUserId: string | undefined;
  selectedUser: User | null;
  isMobile?: boolean;
  onBack?: () => void;
}

export default function Chats({
  selectedUserId,
  currentUserId,
  selectedUser,
  isMobile,
  onBack,
}: ChatsProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const chatId =
    selectedUserId && currentUserId
      ? [selectedUserId, currentUserId].sort().join('_')
      : null;

  useEffect(() => {
    if (!chatId || !currentUserId) return;
    const chatDocRef = doc(db, 'chats', chatId);
    const unSubscribe = onSnapshot(
      chatDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (
            Array.isArray(data.participants) &&
            data.participants.includes(currentUserId)
          ) {
            setMessages(data.messages || []);
            setIsOtherTyping(data.typing === selectedUserId);
          } else {
            setMessages([]);
            setIsOtherTyping(false);
          }
        } else {
          setMessages([]);
          setIsOtherTyping(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar mensagens:', error);
        setLoading(false);
      }
    );
    return () => {
      unSubscribe();
    };
  }, [chatId, selectedUserId, currentUserId]);

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    if (chatId && currentUserId) {
      const chatDocRef = doc(db, 'chats', chatId);
      updateDoc(chatDocRef, { typing: currentUserId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        updateDoc(chatDocRef, { typing: false });
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !chatId || !currentUserId) return;

    const chatDocRef = doc(db, 'chats', chatId);
    try {
      const docSnapshot = await getDoc(chatDocRef);

      const message: Message = {
        text: newMessage,
        senderId: currentUserId,
        timestamp: Timestamp.now(),
      };

      setNewMessage('');

      if (docSnapshot.exists()) {
        await updateDoc(chatDocRef, {
          messages: arrayUnion(message),
        });
      } else {
        await setDoc(chatDocRef, {
          messages: [message],
        });
      }
      updateDoc(chatDocRef, { typing: false });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {isMobile && onBack && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 backdrop-blur-sm p-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-700/50 text-white"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={selectedUser?.photo || undefined}
              alt={selectedUser?.name || 'Usuário'}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="text-white text-sm font-medium">
                {selectedUser?.name || 'Usuário'}
              </div>
              <div className="text-white/60 text-xs">
                {isOtherTyping ? 'Digitando...' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <UserProfile user={selectedUser} isTyping={isOtherTyping} />
      )}

      <div
        className="flex flex-col  flex-1 w-full min-h-0 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${BackgroundImg})`,
          opacity: 1,
          paddingTop: isMobile ? 56 : 0,
        }}
      >
        <div
          className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar"
          style={{
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
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
                ${
                  message.senderId === currentUserId
                    ? 'bg-blue-600 text-white self-end rounded-br-none'
                    : 'bg-gray-200 text-gray-900 self-start rounded-bl-none'
                }`}
                style={{ wordBreak: 'break-word' }}
                key={index}
              >
                {message.text}
                <span
                  className={`block text-xs pl-3 ${
                    message.senderId === currentUserId
                      ? 'text-blue-200'
                      : 'text-gray-500'
                  }`}
                  style={{ textAlign: 'right' }}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex-shrink-0 border-t border-gray-300/20 backdrop-blur-[2px] bg-slate-800/40">
          <MessageInput
            value={newMessage}
            onChange={handleInputChange}
            onSend={sendMessage}
            disabled={!selectedUserId}
          />
        </div>
      </div>
    </div>
  );
}
