import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // ✅ Este es tu componente principal
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/UserContext';

console.log("API KEY:", process.env.REACT_APP_FIREBASE_API_KEY); // 👈 aquí

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
