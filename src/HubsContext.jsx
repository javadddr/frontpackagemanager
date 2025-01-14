// HubsContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Create a Context for the hubs
const HubsContext = createContext();

// Custom hook to use the Hubs context
export const useHubs = () => {
  return useContext(HubsContext);
};

// HubsProvider component to wrap the app and provide hubs state
export const HubsProvider = ({ children }) => {
  const [hubs, setHubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [backendShipments, setBackendShipments] = useState([]);
  const [backendShipments1, setBackendShipments1] = useState([]);
  const [backendShipments2, setBackendShipments2] = useState([]);
  const [returnVen, setReturnVen] = useState([]);
  const [returnedCus, setReturnedCus] = useState([]);
  const [shipped, setShipped] = useState([]);
  const [otherShipments, setOtherShipments] = useState([]);
  const [totalReturn, setTotalReturn] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch hubs from API
  const fetchHubs = async () => {
    try {
      const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
      if (!ownerKey) {
        throw new Error("Owner key is missing from local storage.");
      }

      const response = await fetch(`${backendUrl}/api/hubs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "key": ownerKey, // Pass owner key in headers
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch hubs");
      }

      const hubsData = await response.json();
      setHubs(hubsData); // Update hubs state
    } catch (error) {
      console.error("Error fetching hubs:", error.message);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
      if (!ownerKey) {
        throw new Error("Owner key is missing from local storage.");
      }

      const response = await fetch(`${backendUrl}/api/products?owner=` + ownerKey, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "key": ownerKey, // Pass owner key in headers
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }

      const productsData = await response.json();
      setProducts(productsData.products); // Update products state
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  };

  // Fetch vendors from API
const fetchVendors = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/vendors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "owner": ownerKey, // Use 'owner' for vendors as per your route setup
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch vendors");
    }

    const vendorsData = await response.json();
    setVendors(vendorsData); // Update vendors state
  } catch (error) {
    console.error("Error fetching vendors:", error.message);
  }
};

// Fetch customers from API
const fetchCustomers = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "owner": ownerKey // Assuming your customer route uses 'owner' in the header
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch customers");
    }

    const customersData = await response.json();
    setCustomers(customersData); // Update customers state
  } catch (error) {
    console.error("Error fetching customers:", error.message);
  }
};
// Fetch shipments from API
const fetchShipments = async () => {
  const key = localStorage.getItem("key");

  try {
    const response = await fetch(
      `https://api2.globalpackagetracker.com/shipment/get`, 
      {
        method: 'GET',
        headers: {
          'key': key,
          'Content-Type': 'application/json',
        }
      }
    );
    
    const data = await response.json();

    if (response.ok) {
     
      setShipments(data.documents || []); 
    } else {
      console.error("Failed to fetch shipments:", data);
    }
  } catch (error) {
    console.error("Error fetching shipments:", error.message);
    setShipments([]); 
  }
};


// Create a new function to fetch shipments from your backend
const fetchBackendShipments = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/shipments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "owner": ownerKey, // Pass owner key in headers
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch shipments");
    }

    const shipmentsData = await response.json();
    setBackendShipments(shipmentsData || []); // Update backend shipments state
  } catch (error) {
    console.error("Error fetching backend shipments:", error.message);
    setBackendShipments([]); 
  }
};
const fetchBackendShipments1 = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/shipments1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "owner": ownerKey, // Pass owner key in headers
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch shipments");
    }

    const shipmentsData = await response.json();
    setBackendShipments1(shipmentsData || []); // Update backend shipments state
  } catch (error) {
    console.error("Error fetching backend shipments:", error.message);
    setBackendShipments1([]); 
  }
};
const fetchBackendShipments2 = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/shipments2`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "owner": ownerKey, // Pass owner key in headers
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch shipments");
    }

    const shipmentsData = await response.json();
    setBackendShipments2(shipmentsData || []); // Update backend shipments state
  } catch (error) {
    console.error("Error fetching backend shipments:", error.message);
    setBackendShipments2([]); 
  }
};

// Function to filter shipments based on backendShipments
const filterShipped = () => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments)) {
    const validShipments = shipments.filter(shipment => {
      const shipmentTrackingNumber = shipment.tracking_number;
      return backendShipments.some(backendShipment => {
        return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
      });
    });
    setShipped(validShipments);
  } else {
    setShipped([]); // Reset to empty array if data isn't ready
  }
};

// New function to filter returned customers based on backendShipments1
const filterReturnedCus = () => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments1)) {
    if (shipments.length > 0 && backendShipments1.length > 0) {
      const validReturnedShipments = shipments.filter(shipment => {
        const shipmentTrackingNumber = shipment.tracking_number;
        return backendShipments1.some(backendShipment => {
          return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
        });
      });
      setReturnedCus(validReturnedShipments);
    } else {
      setReturnedCus([]);
    }
  } else {
    setReturnedCus([]); // If either is not an array, reset to empty
  }
};

// New function to filter returned vendors based on backendShipments2
const filterReturnVen = () => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments2)) {
    if (shipments.length > 0 && backendShipments2.length > 0) {
      const validReturnVendors = shipments.filter(shipment => {
        const shipmentTrackingNumber = shipment.tracking_number;
        return backendShipments2.some(backendShipment => {
          return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
        });
      });
      setReturnVen(validReturnVendors);
    } else {
      setReturnVen([]);
    }
  } else {
    setReturnVen([]); // If either is not an array, reset to empty
  }
};
 // New function to filter shipments not in backendShipments1 or backendShipments2

 const filterOtherShipments = () => {
  if (Array.isArray(shipments)) {
    let allTrackingNumbers = new Set();
  
    if (Array.isArray(backendShipments1)) {
      const trackingNumbers1 = backendShipments1.flatMap(ship => ship.tracking_numbers.map(t => t.trackingNumber));
      allTrackingNumbers = new Set([...allTrackingNumbers, ...trackingNumbers1]);
    }

    if (Array.isArray(backendShipments2)) {
      const trackingNumbers2 = backendShipments2.flatMap(ship => ship.tracking_numbers.map(t => t.trackingNumber));
      allTrackingNumbers = new Set([...allTrackingNumbers, ...trackingNumbers2]);
    }

    const other = shipments.filter(shipment => 
      !allTrackingNumbers.has(shipment.tracking_number)
    );

    setOtherShipments(other);
  } else {
    setOtherShipments([]);
  }
};

// New function to filter total returns based on both backendShipments1 and backendShipments2
const filterTotalReturn = () => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments1) && Array.isArray(backendShipments2)) {
    const allReturns = shipments.filter(shipment => {
      const shipmentTrackingNumber = shipment.tracking_number;
      return backendShipments1.some(backendShipment => {
        return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
      }) || backendShipments2.some(backendShipment => {
        return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
      });
    });
    
    setTotalReturn(allReturns);
  } else {
    setTotalReturn([]); // If any of the arrays are not ready, reset to empty
  }
};

// Function to fetch orders
const fetchOrders = async () => {
  try {
    const ownerKey = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!ownerKey) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-owner": ownerKey, // Pass owner key in headers
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch orders");
    }

    const ordersData = await response.json();
    setOrders(ordersData); // Update orders state
  } catch (error) {
    console.error("Error fetching orders:", error.message);
  }
};
useEffect(() => {
  const fetchData = async () => {
    try {
      await fetchShipments();
      await fetchBackendShipments();
      await fetchBackendShipments1(); 
      await fetchBackendShipments2();
      await fetchHubs();
      await fetchProducts();
      await fetchVendors();
      await fetchCustomers();
      await fetchOrders();
      if (Array.isArray(shipments) && Array.isArray(backendShipments)) filterShipped();
      if (Array.isArray(shipments) && Array.isArray(backendShipments1)) filterReturnedCus();
      if (Array.isArray(shipments) && Array.isArray(backendShipments2)) filterReturnVen();
      if (Array.isArray(shipments) && Array.isArray(backendShipments2) && Array.isArray(backendShipments1)) filterTotalReturn();
      if (Array.isArray(shipments)) filterOtherShipments();
    } catch (error) {
      console.error("Error in initial data fetch:", error);
    }
  };
  fetchData();
}, []);

useEffect(() => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments)) {
    if (shipments.length > 0 && backendShipments.length > 0) {
      filterShipped();
    }
  }
}, [shipments, backendShipments]);

useEffect(() => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments1)) {
    filterReturnedCus();
  }
}, [shipments, backendShipments1]);

useEffect(() => {
  if (Array.isArray(shipments) && Array.isArray(backendShipments2)) {
    filterReturnVen();
  }
}, [shipments, backendShipments2]);

useEffect(() => {
  if (Array.isArray(shipments)) {
    filterOtherShipments();
  }
}, [shipments, backendShipments1, backendShipments2]);
useEffect(() => {
  filterTotalReturn();
}, [shipments, backendShipments1, backendShipments2]);
  return (
    <HubsContext.Provider value={{ 
      hubs, products, vendors, customers, shipments, returnedCus, returnVen,totalReturn, backendShipments,backendShipments1,backendShipments2,shipped, otherShipments,orders, // Add customers here
      fetchHubs, fetchProducts, fetchVendors, fetchCustomers,fetchShipments, fetchBackendShipments,fetchBackendShipments1,fetchBackendShipments2, fetchOrders, // Include fetchCustomers
      setHubs, setProducts, setVendors, setCustomers,setShipments, setBackendShipments, setBackendShipments1, setBackendShipments2, setOrders  // Include setCustomers
    }}>
      {children}
    </HubsContext.Provider>
  );

};