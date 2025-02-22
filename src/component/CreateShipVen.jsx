import React, { useState,useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { motion, AnimatePresence } from "framer-motion";
import StepOne from './StepOne';
import StepTwoVen from './StepTwoVen';
import { useHubs } from "../HubsContext";
import { Progress } from "@nextui-org/react";
import StepThreeVen from './StepThreeVen';
const CreateShipVen = ({ handleCloseModal,fetchShipments,fetchBackendShipments,setOpen, setProgress,setMessages,fetchBackendShipments1,fetchBackendShipments2,setShipments, setTrackingNumbers, trackingNumbers, couriers, filteredCarriers, setFilteredCarriers }) => {
  const [selectedCarrier, setSelectedCarrier] = useState(null); // Manage selected carrier
  const [finalTrack, setFinalTrack] = useState([]);
  const [sheetstrackingNumbers, setSheetsTrackingNumbers] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [notify, setNotify] = useState({
    shipper: false,
    receiver: false
  });

  const [notifyWhen, setNotifyWhen] = useState({
    now: false,
    delivered: false,
    exception: false,
    transitExceeded: '0'

  });

  const [popupVisible, setPopupVisible] = useState(false);


  useEffect(() => {
    // Only update if we have both tracking numbers and a selected carrier
    if (trackingNumbers.length > 0 && selectedCarrier) {
      const formattedTrack = trackingNumbers.map(number => ({
        "tracking number": number,
        "courier": selectedCarrier
      }));
      setFinalTrack(formattedTrack);
    } else {
      // If either is missing, reset finalTrack to an empty array
      setFinalTrack([]);
    }
  }, [trackingNumbers, selectedCarrier]);

  // New state for final submission data
  const [finalSubmit, setFinalSubmit] = useState({
    tracking_numbers: finalTrack, // Assuming finalTrack is an array of objects with tracking info
    hub: selectedHubId,
    vendor: selectedVendorId,
    customer: selectedCustomerId,
    products: selectedProducts,
    notify:notify,
    notifyWhen:notifyWhen,
  
  });

 
  useEffect(() => {
    // Update finalSubmit when any of these states change
    setFinalSubmit({
      tracking_numbers: finalTrack,
      hub: selectedHubId,
      vendor: selectedVendorId,
      customer: selectedCustomerId,
      products: selectedProducts,
      notify:notify,
      notifyWhen:notifyWhen,
    });
  }, [finalTrack, selectedHubId,notifyWhen,notify, selectedVendorId, selectedCustomerId, selectedProducts]);


  const steps = [
    {
      title: 'Enter the tracking numbers.',
      content: (
        <StepOne
          setTrackingNumbers={setTrackingNumbers}
          trackingNumbers={trackingNumbers}
          couriers={couriers}
          filteredCarriers={filteredCarriers}
          setFilteredCarriers={setFilteredCarriers}
          selectedCarrier={selectedCarrier} // Pass the selected carrier
          setSelectedCarrier={setSelectedCarrier}
          setFinalTrack={setFinalTrack}
          sheetstrackingNumbers={sheetstrackingNumbers}
          setSheetsTrackingNumbers={setSheetsTrackingNumbers} // Pass the state setter
        />
      ),
    },
    {
      title: 'Assign hubs, customers, and products',
      content: <StepTwoVen
      selectedVendorId={selectedVendorId}
      selectedCustomerId={selectedCustomerId}
      selectedHubId={selectedHubId}
      selectedProducts={selectedProducts}
      setSelectedVendorId={setSelectedVendorId}
      setSelectedCustomerId={setSelectedCustomerId}
      setSelectedHubId={setSelectedHubId}
      setSelectedProducts={setSelectedProducts}

      />,
    },
    // {
    //   title: 'Alerts and Notifications',
    //   content: <StepThreeVen
    //   notify={notify}
    //   setNotify={setNotify}
    //   notifyWhen={notifyWhen}
    //   setNotifyWhen={setNotifyWhen}

    //   />,
    // },
  ];

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === 0) { // Assuming we're only checking this logic for the first step
      if (trackingNumbers.length > 0) {
        if (!selectedCarrier) {
          message.error("Please select your carrier name from the dropdown menu.");
          return;
        } else {
          // Both trackingNumbers and selectedCarrier exist, proceed
          setCurrent(current + 1);
        }
      } else if (sheetstrackingNumbers.length > 0) {
        // Check if all entries in sheetstrackingNumbers have both fields filled
        const invalidEntries = sheetstrackingNumbers.some(
          entry => !entry["tracking number"] || !entry["courier code"]
        );
        if (invalidEntries) {
          message.error(`Click on "Upload Again", then enter the carrier codes in your Excel sheet.`);
          return;
        } else {
          // All entries are valid, proceed
          setCurrent(current + 1);
        }
      } else {
        // If neither trackingNumbers nor sheetstrackingNumbers have entries
        message.error("Enter tracking numbers and carrier names either by pasting them directly or uploading them in bulk.");
        return;
      }
    } else {
      // For other steps, just increment current
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    if (current === 0) return;
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));

  const contentStyle = {
   
    textAlign: 'center',
    color: token.colorTextTertiary,

    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };




  const handleSubmit = async () => {
    const key = localStorage.getItem("key");
    const total = finalTrack.length;
    let submitted = 0;
  
    setPopupVisible(true);
    setOpen(true)
    handleCloseModal();
    setMessages([]); // Clear previous messages
  
    try {
      // Create shipment first
      const shipmentResponse = await fetch(`${backendUrl}/api/shipments2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'owner': key // Send the key as owner in the header
        },
        body: JSON.stringify(finalSubmit)
      });
  
      if (!shipmentResponse.ok) {
        const errorData = await shipmentResponse.json();
        throw new Error(errorData.message || 'Failed to create shipment');
      }
  
      // Process tracking numbers
      for (let trackInfo of finalTrack) {
        setMessages(prev => [...prev, `Submitting tracking: ${trackInfo["tracking number"]}`]);
    
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'key': key, // Direct use of key without "Bearer" prefix
          },
          body: JSON.stringify({
            tracking_number: trackInfo["tracking number"],
            courier_code: trackInfo["courier"]
          }),
        };
    
        try {
          const response = await fetch('https://api2.globalpackagetracker.com/shipment/create', requestOptions);
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || 'Failed to submit tracking');
          }
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 
              ? `Successfully submitted tracking: ${trackInfo["tracking number"]}` 
              : msg
          ));
          submitted++;
          setProgress(Math.floor((submitted / total) * 100));
        } catch (error) {
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 
              ? `Error submitting tracking: ${trackInfo["tracking number"]}, ${error.message}` 
              : msg
          ));
        }
      }
         // Update product inventory for each selected product
         if (selectedProducts.length > 0) {
          const currentDate = new Date().toISOString();
          const recipient = [selectedCustomerId, selectedVendorId].filter(Boolean).join('&');
    
          for (let product of selectedProducts) {
            const moveResponse = await fetch(`${backendUrl}/api/products/${product.id}/move`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'owner': key
              },
              body: JSON.stringify({
                "date": currentDate,
                "value": product.quantity,
                "status": "in",
                "recipient": selectedCustomerId ? selectedCustomerId : selectedVendorId ? selectedVendorId : "none"
              })
            });
    
            if (!moveResponse.ok) {
              const errorData = await moveResponse.json();
              console.error(`Failed to update inventory for product ${product.id}:`, errorData.message);
              // Optionally, add this error to your messages or handle it as you see fit
            }
          }
        }
      const updatedShipments = await fetchShipments();
      setShipments(updatedShipments);
      await fetchBackendShipments();
      await fetchBackendShipments1();
      await fetchBackendShipments2();
      setFinalTrack([]);
      setTrackingNumbers([]);
      setProgress(100); // Ensure progress is at 100%
      setMessages(prev => [...prev, 'All tracking numbers processed!']);
    
      setTimeout(() => {
        setPopupVisible(false);
        handleCloseModal();
      }, 2000); // Show success message for 2 seconds
  
    } catch (error) {
      // Handle the error from shipment creation
      console.error("Shipment creation error:", error);
      setMessages(prev => [...prev, `Error creating shipment: ${error.message}`]);
      setProgress(100); // Set progress to 100% to indicate process is finished, even on error
      setTimeout(() => {
        setPopupVisible(false);
        handleCloseModal();
      }, 2000); // Show error message for 2 seconds
    }
  };








  return (
    <div className="m-6 ">
      <>
        <Steps current={current} items={items} />
        <div style={contentStyle}>{steps[current].content}</div>
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            style={{
              marginRight: 'auto',
              visibility: current > 0 ? 'visible' : 'hidden',
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>

          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
        {current === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleSubmit}  // Changed from an inline function to handleSubmit
            >
              Done
            </Button>
          )}
        </div>
  
      </>
    </div>
  );
};

export default CreateShipVen;
