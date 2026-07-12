import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.tsx';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
