import {
  AuthError,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { auth, db } from '../firebase';
import useUserStore from '../store/useSlice';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();

  const updateOrCreateUserData = async (user: FirebaseUser): Promise<void> => {
    const userRef = doc(db, 'users', user.uid);
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        name: user.displayName || user.email || 'Usuário',
        email: user.email,
        photo: user.photoURL || null,
      });
      userDoc = await getDoc(userRef);
    }

    const data = userDoc.data();
    login({
      id: user.uid,
      name: data?.name || user.displayName || user.email || 'Usuário',
      email: data?.email || user.email || '',
      photo: data?.photo || user.photoURL || null,
    });
  };

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateOrCreateUserData(user);
      toast.success('Login realizado com sucesso!');
      navigate('/chats');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error(
        `Erro ao fazer login: ${
          (error as AuthError).message || 'Tente novamente.'
        }`
      );
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await updateOrCreateUserData(user);

      toast.success('Login com Google realizado com sucesso!');
      navigate('/chats');
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      const authError = error as AuthError;
      toast.error(
        `Erro ao fazer login com Google: ${
          authError.message || 'Tente novamente.'
        }`
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100dvh] w-full bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="flex flex-col p-8 rounded-2xl items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Bem-vindo</h2>
          <p className="text-slate-400 text-sm">
            Entre na sua conta para continuar
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSignIn}>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            isPassword
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Entrar</Button>
        </form>

        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-4 text-slate-500">Ou</span>
          </div>
        </div>

        <Button variant="google" onClick={handleGoogleSignIn} type="button">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Entrar com Google
        </Button>

        <p className="text-center text-sm text-slate-400">
          Não tem uma conta?{' '}
          <Button
            variant="ghost"
            onClick={() => navigate('/signup')}
            className="inline w-auto p-0 h-auto"
          >
            Cadastre-se
          </Button>
        </p>
      </div>
    </div>
  );
}
