import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Add BrowserRouter here

import { CustomProvider } from 'rsuite';
import './index.css';
import App from './App.jsx';
import 'rsuite/dist/rsuite.min.css'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
const CLIENT_ID="780460562757-c8haartfknsrf431s28kseis3dlv2efa.apps.googleusercontent.com"
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
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
