import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import defaultLogo from "../assets/profile-icon.png";
import { db } from "../firebase";
import { User } from "../types/User";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          photo: doc.data().photo || defaultLogo,
          email: doc.data().email,
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading };
};
