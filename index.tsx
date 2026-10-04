import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const isMobileHomeRoute =
  window.matchMedia?.('(max-width: 639px)').matches &&
  /^\/(en|ur|ar)\/?$/.test(window.location.pathname);

if (isMobileHomeRoute) {
  void import('./pages/Home');
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
