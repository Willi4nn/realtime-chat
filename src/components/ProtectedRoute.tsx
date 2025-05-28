import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../store/useSlice";

interface Props {
  children: ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
  const { user } = useUserStore();
  return user ? children : <Navigate to='/login' replace />;
}