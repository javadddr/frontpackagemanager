import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { HubsProvider } from "./HubsContext"; // Import HubsProvider
import MainPage from "./MainPage";
import Login from "./Login";
import Register from "./Register";
import CusShare from "./CusShare";
import Layout from "./Layout"; 
import InitializeApp from "./InitializeApp"; // Import InitializeApp

const App = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'return' && pathParts.length >= 6) {
      // Save each part to a different key in localStorage
      localStorage.setItem('returnOwner', pathParts[2]);
      localStorage.setItem('returnCustomer', pathParts[3]);
      localStorage.setItem('returnProduct', pathParts[4]);
      
      // Get current time
      const now = new Date();
      const minute = (now.getMinutes() + 1) % 60; // Add 1 to minute and ensure it wraps around to 0 at 60
      const hour = now.getHours();
      
      // Format minute and hour to two digits
      const minuteStr = minute.toString().padStart(2, '0');
      const hourStr = hour.toString().padStart(2, '0');
      
      // Combine minute and hour with pathParts[5]
      const returnCode = `${minuteStr}${hourStr}${pathParts[5]}`;
      localStorage.setItem('returncode', returnCode);
      
      // Redirect to /return
      navigate('/return', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Get the current pathname (path)
    const path = window.location.pathname;

    // Skip authentication check for public routes
    if (path !== "/register" && path !== "/login" && !path.startsWith("/return")) {
      const token = localStorage.getItem("token");
      if (!token) {
        // If there's no token, redirect to the login page
        navigate("/login");
      }
    }
  }, [navigate]);

  // Conditionally wrap the Routes with HubsProvider
  const shouldWrapWithHubsProvider = location.pathname !== "/login" && location.pathname !== "/register" && !location.pathname.startsWith("/return");

  return (
    <>
      <InitializeApp /> {/* Add InitializeApp at the root level */}
      <Layout>
        {shouldWrapWithHubsProvider ? (
          <HubsProvider> {/* Wrap with HubsProvider if not on login/register/return page */}
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/return" element={<CusShare />} />
              <Route path="/return/*" element={<RedirectToReturn />} />
            </Routes>
          </HubsProvider>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/return" element={<CusShare />} />
            <Route path="/return/*" element={<RedirectToReturn />} />
          </Routes>
        )}
      </Layout>
    </>
  );
};

// Helper component to handle navigation
const RedirectToReturn = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/return', { replace: true });
  }, [navigate]);
  return null;
};

export default App;
