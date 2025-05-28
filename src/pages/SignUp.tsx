import imageCompression from "browser-image-compression";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeSlash } from "phosphor-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import defaultLogo from "../assets/profile-icon.png";
import { auth, db } from "../firebase";
import useUserStore from "../store/useSlice";

export default function SignUp() {
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState<string>("");
  const [signUpText, setSignUpText] = useState("Cadastrar");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Erro ao comprimir a imagem:", error);
        toast.error("Erro ao processar a imagem. Tente novamente.");
      }
    }
  };

  const handleSignUp = async (): Promise<void> => {
    try {
      setSignUpText("Cadastrando...");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateUserData(userCredential.user.uid, photo);

      login({
        id: userCredential.user.uid,
        name,
        email,
        photo: photo || null,
      });

      setName("");
      setEmail("");
      setPassword("");
      setPhoto("");

      toast.success("Conta criada com sucesso!");
      navigate("/chats");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Erro ao criar conta:", err.message);
        toast.error(`Ocorreu um erro ao criar sua conta: ${err.message}`);
      }
    } finally {
      setSignUpText("Cadastrar");
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const updateUserData = async (userId: string, photo: string) => {
    try {
      await setDoc(doc(db, "users", userId), {
        displayName: name,
        email: email,
        photo: photo || null,
      })
    }
    catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      toast.error("Erro ao atualizar dados do usuário.");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col p-6 rounded-xl justify-between items-center bg-slate-900 shadow-lg shadow-slate-900/50 w-64 space-y-4">
        <h2 className="text-xl font-semibold text-white">Cadastrar</h2>
        <img src={photo || defaultLogo} alt="Foto de perfil" className="w-16 h-16 rounded-full" />
        <div className="w-full space-y-3">
          <div className="w-full">
            <label
              htmlFor="photo-upload"
              className="block w-full p-2 text-center rounded bg-slate-700 text-white border border-slate-600 cursor-pointer hover:bg-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
            >
              Escolher Imagem
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e)}
              className="hidden"
            />
          </div>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
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
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleSignUp}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2 rounded transition-colors">
            {signUpText}
          </button>
          <p className="text-center text-sm text-slate-300">
            Já possui uma conta? <span
              onClick={handleLoginClick}
              className="text-indigo-400 cursor-pointer hover:underline font-medium"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}