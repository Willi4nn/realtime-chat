# Realtime Chat (React + Firebase)

Chat em tempo real com React (Vite) e Firebase.

### Recursos
* Autenticação (Email/Google)
* Firestore (Mensagens, Perfis)
* Realtime Database (Status de Presença/Digitando)
* Responsivo (Desktop/Mobile)

---

## 🚀 Quick Start

1.  **Clone e instale:**
    ```bash
    cd realtime-chat
    npm install
    ```

2.  **Configure o Firebase:**
    * Crie um projeto no [Console Firebase](https://console.firebase.google.com/).
    * Ative **Authentication**, **Firestore** e **Realtime Database**.
    * Obtenha as credenciais do SDK (Web App).
    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione as credenciais ao `.env` com o prefixo `VITE_`:

    ```env
    VITE_FIREBASE_API_KEY=
    VITE_FIREBASE_AUTH_DOMAIN=
    VITE_FIREBASE_PROJECT_ID=
    VITE_FIREBASE_STORAGE_BUCKET=
    VITE_FIREBASE_MESSAGING_SENDER_ID=
    VITE_FIREBASE_APP_ID=
    VITE_FIREBASE_MEASUREMENT_ID=
    ```

3.  **Execute (exposto na rede local):**
    ```bash
    npm run dev -- --host
    ```

---

## 🛠️ Scripts

* `npm run dev`: Inicia o servidor (apenas localhost).
* `npm run dev -- --host`: Expõe o servidor na rede local.
* `npm run build`: Gera o build de produção.
* `npm run preview`: Visualiza o build de produção localmente.