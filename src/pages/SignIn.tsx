import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeSlash } from "phosphor-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import useUserStore from "../store/useSlice";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      login({
        id: user.uid,
        name: userData.name || user.email || "Usuário",
        email: user.email || "",
        photo: userData.photo || user.photoURL || null,
      });
      toast.success("Login realizado com sucesso!");
      navigate("/chats");
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      console.error("Erro ao fazer login:", error);
    }
  }

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col p-6 rounded-xl justify-between items-center bg-slate-900 shadow-lg shadow-slate-900/50 w-64 space-y-4">
        <h2 className="text-xl font-semibold text-white">Entrar</h2>

        <form className="w-full space-y-3" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
            required
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? (
                <EyeSlash size={20} weight="bold" />
              ) : (
                <Eye size={20} weight="bold" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2 rounded transition-colors"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-slate-300">
          Não tem uma conta? <span
            onClick={handleSignUpClick}
            className="text-indigo-400 cursor-pointer hover:underline font-medium"
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}