import imageCompression from 'browser-image-compression';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Eye } from 'phosphor-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultLogo from '../assets/profile-icon.png';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { auth, db } from '../firebase';
import useUserStore from '../store/useSlice';

export default function SignUp() {
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [signUpText, setSignUpText] = useState('Cadastrar');

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
        console.error('Erro ao comprimir a imagem:', error);
        toast.error('Erro ao processar a imagem. Tente novamente.');
      }
    }
  };

  const handleSignUp = async (): Promise<void> => {
    try {
      setSignUpText('Cadastrando...');

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateUserData(userCredential.user.uid, photo);

      login({
        id: userCredential.user.uid,
        name,
        email,
        photo: photo || null,
      });

      setName('');
      setEmail('');
      setPassword('');
      setPhoto('');

      toast.success('Conta criada com sucesso!');
      navigate('/chats');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Erro ao criar conta:', err.message);
        toast.error(`Ocorreu um erro ao criar sua conta: ${err.message}`);
      }
    } finally {
      setSignUpText('Cadastrar');
    }
  };

  const updateUserData = async (userId: string, photo: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        name: name,
        email: email,
        photo: photo || null,
      });
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      toast.error('Erro ao atualizar dados do usuário.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100dvh] w-full bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="flex flex-col p-8 rounded-2xl items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-white">Criar Conta</h2>

        <div className="relative group">
          <img
            src={photo || defaultLogo}
            className="w-24 h-24 rounded-full border-4 border-slate-800 object-cover shadow-xl group-hover:border-indigo-500 transition-all"
          />
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform"
          >
            <Eye size={20} />
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <form
          className="w-full space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <Input
            label="Nome"
            placeholder="Seu nome"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            isPassword
            placeholder="Sua senha"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={signUpText === 'Cadastrando...'}>
            {signUpText}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Já possui conta?{' '}
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="inline w-auto p-0 h-auto"
          >
            Login
          </Button>
        </p>
      </div>
    </div>
  );
}
