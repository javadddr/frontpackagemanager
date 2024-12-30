import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Add BrowserRouter here

import { CustomProvider } from 'rsuite';
import './index.css';
import App from './App.jsx';
import 'rsuite/dist/rsuite.min.css'; 
// <CustomProvider theme="dark">

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NextUIProvider theme={{ type: 'dark' }}>
    <CustomProvider >
      <Router> {/* Wrap App with Router here */}
        <App />
      </Router>
      </CustomProvider>
    </NextUIProvider>
  </StrictMode>
);
