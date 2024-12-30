import React, { useState, useEffect } from 'react';
import { Select, Input, Button } from 'antd';
import { Option } from 'antd/lib/mentions'; // Import Option from antd for Select component

import logo4 from "../noship.jpg"
import logo5 from "../nore.png"
import { Chip, Card, CardBody } from '@nextui-org/react';
function ReturnCusShow({ returnInfo,trackings,selectedDays,owner,vendorId }) {
  const [couriers, setCouriers] = useState([]);
  const [filteredCarriers, setFilteredCarriers] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [trackingInfos, setTrackingInfos] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("show",show)
const updateShowState = () => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()]; // Get current day of the week

  // Check if the current day is not in the selected days
  if (!selectedDays.includes(currentDay)) {
    setShow(true);
  } else {
    setShow(false); // Optionally, set to true if you want to show when the day matches
  }
};
function DisplaySchedule({ selectedDays }) {
  return (
    <Card className="w-full max-w-md mb-4 dark">
      <CardBody>
        <div className="flex flex-wrap gap-2">
          {selectedDays.length > 0 ? (
            selectedDays.map((day, index) => (
              <Chip key={index} color="primary" variant="flat">
                {day}
              </Chip>
            ))
          ) : (
            <p className="text-center text-gray-500">No schedule selected</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
// Call this function when selectedDays changes or on component mount/update
useEffect(() => {
  updateShowState();
}, [selectedDays]);
  const handleSearch = (value) => {
    const filtered = couriers.filter((carrier) =>
      carrier.courierName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCarriers(filtered);
  };

  const handleChange = (value) => {
    setSelectedCarrier(value);
  };

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await fetch(`${backendUrl}/couriers`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch couriers");
        }

        setCouriers(data.documents);
        setFilteredCarriers(data.documents);
      } catch (err) {
        console.error("Error fetching couriers:", err);
      }
    };
    const fetchTrackingInfo = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/venreturns/${vendorId}`, {
          headers: {
            'owner': owner
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tracking info");
        }
        setTrackingInfos(data);
      } catch (error) {
        console.error("Error fetching tracking info:", error);
      }
    };


    fetchTrackingInfo();

    fetchCouriers();
  }, [returnInfo]);

  // Check if PDF file path exists
  const pdfUrl = returnInfo && returnInfo.file && returnInfo.file.path ? `${backendUrl}/${returnInfo.file.path}` : null;

  const handleSubmit = async () => {
    if (!selectedCarrier || !trackingNumber) {
      setErrorMessage("Please select a carrier and enter a tracking number.");
      return;
    }
  
    setIsSubmitting(true);
    setErrorMessage('');
  
    try {
      
      // First API call to track
      const trackResponse = await fetch(`${backendUrl}/api/venreturns/track`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'owner': owner
        },
        body: JSON.stringify({
          courier_code: selectedCarrier,
          tracking_number: trackingNumber
        })
      });
  
      if (!trackResponse.ok) {
        const errorData = await trackResponse.json();
        throw new Error(errorData.message || "Failed to save tracking info.");
      }
  
      const trackData = await trackResponse.json();
      console.log("Tracking info saved successfully:", trackData);
  
      // Second API call to save tracking info with customer details
      const saveResponse = await fetch(`${backendUrl}/api/venreturns`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'owner': owner
        },
        body: JSON.stringify({
          customerId: vendorId,
          carrier: selectedCarrier,
          trackingNumber: trackingNumber
        })
      });
  
      if (!saveResponse.ok) {
        const saveError = await saveResponse.json();
        throw new Error(saveError.message || "Failed to save additional tracking details.");
      }
  
      const saveData = await saveResponse.json();
      console.log("Additional tracking details saved successfully:", saveData);
  
      // Clear form and show success message
      setTrackingNumber('');
      setSelectedCarrier(null);
      alert("Tracking information saved successfully!");
  
    } catch (error) {
      console.error("Error saving tracking info:", error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col w-full items-center justify-center'>
     
      {show ? (
        <>
         <div className="flex flex-col items-center justify-center w-full -mt-16 min-h-[100vh]">
         
            <img src={logo5} alt="No shipments available" className="w-[500px] h-[500px] object-cover shadow-3xl" />
            <p className="text-center text-lg text-gray-300">Today, returns can NOT be accepted. Please ensure to try on the scheduled return day.</p>
        
            <Button className='text-blue-600 mb-3 mt-3'>Your schedule :</Button>
            <DisplaySchedule selectedDays={selectedDays} />
          </div>
       
        </>
      ) : (
        <div className='flex flex-col w-full items-center justify-center'>
           <h2 className='text-lg mb-5 mt-5'>Send a Package</h2>
        <div className="w-full  max-w-md">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter Tracking Number"
            className="mb-4"
          />
          <Select
            value={selectedCarrier}
            showSearch
            placeholder="Select a courier"
            optionFilterProp="children"
            onSearch={handleSearch}
            onChange={handleChange}
            filterOption={false}
            allowClear
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {filteredCarriers.map((carrier) => (
              <Option key={carrier.courierCode} value={carrier.courierCode}>
                {carrier.courierName}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSubmit} loading={isSubmitting} style={{ width: '100%' }}>
            Submit Tracking Info
          </Button>
          {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
        </div>
        <div className='w-full  max-w-md'>
      
         </div>
        </div>
      )}
    </div>
  );
}

export default ReturnCusShow;