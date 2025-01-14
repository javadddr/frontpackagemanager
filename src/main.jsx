import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Add BrowserRouter here

import { CustomProvider } from 'rsuite';
import './index.css';
import App from './App.jsx';
import 'rsuite/dist/rsuite.min.css'; 
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <NextUIProvider theme={{ type: 'dark' }}>
    <CustomProvider >
      <Router> 
        <App />
      </Router>
      </CustomProvider>
    </NextUIProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
