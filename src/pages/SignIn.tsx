import { AuthError, User as FirebaseUser, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

  const updateOrCreateUserData = async (user: FirebaseUser): Promise<void> => {
    const userRef = doc(db, "users", user.uid);
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        name: user.displayName || user.email || "Usuário",
        email: user.email,
        photo: user.photoURL || null,
      });
      userDoc = await getDoc(userRef);
    }

    const data = userDoc.data();
    login({
      id: user.uid,
      name: data?.name || user.displayName || user.email || "Usuário",
      email: data?.email || user.email || "",
      photo: data?.photo || user.photoURL || null,
    });
  };

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateOrCreateUserData(user);
      toast.success("Login realizado com sucesso!");
      navigate("/chats");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error(
        `Erro ao fazer login: ${(error as AuthError).message || "Tente novamente."}`
      );
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await updateOrCreateUserData(user);

      toast.success("Login com Google realizado com sucesso!");
      navigate("/chats");
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      const authError = error as AuthError;
      toast.error(
        `Erro ao fazer login com Google: ${authError.message || "Tente novamente."}`
      );
    }
  };

  const handleSignUpClick = (): void => {
    navigate('/signup');
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col p-6 rounded-xl justify-between items-center bg-slate-900 shadow-lg shadow-slate-900/50 w-80 space-y-4">
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
              tabIndex={-1}
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

        <div className="relative w-full my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-400">
              Ou entre com
            </span>
          </div>
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center p-2 rounded bg-white text-black font-medium transition-colors"
            type="button"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </button>
        </div>

        <p className="text-center text-sm text-slate-300">
          Não tem uma conta? <span
            onClick={handleSignUpClick}
            className="text-indigo-400 cursor-pointer hover:underline font-medium"
            role="button"
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}