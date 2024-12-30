// Layout.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // If you're on the login or register page, disable scrolling
    if (location.pathname === '/login' || location.pathname === '/register') {
      document.body.style.overflow = 'hidden';
    } else {
      // For any other route, enable scrolling
      document.body.style.overflow = '';
    }
    // Cleanup function to reset on component unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [location]);

  return children;
};

export default Layout;