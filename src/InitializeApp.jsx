import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InitializeApp = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");

        if (key) {
            // Save the key to localStorage
            localStorage.setItem("key", key);

            // Redirect to the login page or home page without query params
            navigate("/", { replace: true });
        }
    }, [navigate]);

    return null; // No UI needed here
};

export default InitializeApp;
