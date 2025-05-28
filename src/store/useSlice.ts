import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/User";

interface UserState {
  user: User | null;
  selectedUserId: string | null;
  login: (userData: User) => void;
  logout: () => void;
  setSelectedUserId: (id: string | null) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      selectedUserId: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null, selectedUserId: null }),
      setSelectedUserId: (id) => set({ selectedUserId: id }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
