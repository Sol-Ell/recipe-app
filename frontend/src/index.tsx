import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Le "as HTMLElement" dit à TS : "T'inquiète, je sais que cet ID existe dans l'index.html"
const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);