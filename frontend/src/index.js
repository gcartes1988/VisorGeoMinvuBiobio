import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; 
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/UserContext';

const observerError = 'ResizeObserver loop completed with undelivered notifications.';
const resizeObserverErrMsg = 'ResizeObserver loop limit exceeded';

window.addEventListener('error', (e) => {
  if (e.message === resizeObserverErrMsg || e.message === observerError) {
    e.stopImmediatePropagation();
  }
});
console.log("API KEY:", process.env.REACT_APP_FIREBASE_API_KEY); 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
