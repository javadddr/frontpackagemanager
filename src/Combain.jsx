import { useEffect, useState } from 'react';

function Combain() {
    const [io, setIo] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage

    useEffect(() => {
        async function fetchShipments() {
            try {
              const response = await fetch(`${backendUrl}/api/combined-shipments/combined?startDate=2025-01-01&endDate=2025-12-31`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'owner': ownerKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setIo(data);
            } catch (error) {
                console.error('There was an error fetching the shipments:', error);
            }
        }

        fetchShipments();
    }, [backendUrl, ownerKey]); // Dependencies for useEffect

    // Render your shipments data here
    return (
        <div>
        ccc
        </div>
    );
}



export default Combain
