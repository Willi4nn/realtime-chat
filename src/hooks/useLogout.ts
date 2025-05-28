import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import useUserStore from "../store/useSlice";

export function useLogout() {
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  return async () => {
    await auth.signOut();
    logout();
    navigate('/login');
  };
}