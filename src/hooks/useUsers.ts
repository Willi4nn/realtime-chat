import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import defaultLogo from '../assets/profile-icon.png';
import { db } from '../firebase';
import useUserStore from '../store/useSlice';
import { User } from '../types/User';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useUserStore((state) => state.user);

  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!currentUserId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      const contactIds = new Set<string>();

      snapshot.forEach((doc) => {
        const participants = doc.data().participants || [];
        participants.forEach((id: string) => {
          if (id !== currentUserId) contactIds.add(id);
        });
      });

      if (contactIds.size === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', Array.from(contactIds))
        );

        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          photo: doc.data().photo || defaultLogo,
          email: doc.data().email,
        }));

        setUsers(usersData);
      } catch (error) {
        console.error('Erro ao buscar detalhes dos contatos:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return { users, loading };
};
