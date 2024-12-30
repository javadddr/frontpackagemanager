import React, { useState, useEffect } from 'react';
import ReturnCusShow from './component/ReturnCusShow';
import { useLocation } from 'react-router-dom';
import ChatVen2 from './ChatVen2';
import { Tabs, Tab, Button } from '@nextui-org/react';
import { TbSquareArrowRight } from "react-icons/tb";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import logo from "./dil.png"
import logo1 from "./tran.png"
import logo2 from "./cer.png"
import logo3 from "./cancel.png"
import logo40 from "./pen.png"
import logo4 from "./noship.jpg"
import { motion } from 'framer-motion';
import { Package, Truck, Calendar, User, Clock, MapPin, Tag } from 'react-feather';
import { FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import { DeleteIcon } from './DeleteIcon'; // Assuming you have this icon component
import { Pagination } from '@nextui-org/react';
import { Accordion, AccordionItem } from '@nextui-org/react';
function CusShare() {
  const [returnData, setReturnData] = useState({});
  const [password, setPassword] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [error, setError] = useState('');
  const [returnInfo, setReturnInfo] = useState(null); 
  const [trackings, setTrackings] = useState([]); // New state for tracking information
  const [resultsTracking, setResultsTracking] = useState({});
  const [selectedTab, setSelectedTab] = useState('requests');
  const [vendor, setVendor] = useState(null);
  const [owner, setOwner] = useState(null);
  const [customerReturns, setCustomerReturns] = useState([]);
  const [trackingInfos, setTrackingInfos] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const location = useLocation();
  const [bypassPassword, setBypassPassword] = useState(false);

  useEffect(() => {
    // Check if the state includes bypassPassword or if there's a query parameter
    const searchParams = new URLSearchParams(location.search);
    if (location.state && location.state.bypassPassword || searchParams.get('bypassPassword') === 'true') {
      setBypassPassword(true);
    }
  }, [location]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const formatDate = (dateString) => {
    if (!dateString) return 'No data available';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  // Function to handle delete action, you need to define this based on your needs
  const handleDelete = (shipment) => {
    console.log('Delete shipment:', shipment);
    // Implement delete logic here
  };



  const handlePasswordSubmit = async (e) => {
    
    e.preventDefault();
    const VENDORID = localStorage.getItem('returnCustomer');
    try {
      const response = await fetch(`${backendUrl}/api/vendors/${VENDORID}?passvendor=${password}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vendor');
      }

      const data = await response.json();
      setVendor(data);
      setError(null);
      setShowContent(true);
setOwner(data.owner)
    } catch (err) {
      setError(err.message);
    }
  };





   
    const fetchTrackingInfo = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/venreturns/${vendor._id}`, {
          headers: {
            'owner': owner
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tracking info");
        }
        console.log("data",data)
        setTrackingInfos(data);
      } catch (error) {
        console.error("Error fetching tracking info:", error);
      }
    };

 
  

  


  useEffect(() => {
    fetchTrackingInfo();
  }, []);
 
  const handleLogout = () => {
    setShowContent(false);
    setPassword(''); 
    setError(''); 
    setReturnInfo(null); 
    setTrackings([]); // Clear tracking info on logout
  };

  return (
    <div>
      {!showContent ? (
        <div>
          <h1>CusShare</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter Password"
            />
            <button type="submit">Send Return</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
          </form>
        </div>
      ) : (
        <div>
        <div className="">

          <div className='h-[98vh] bg-gray-800 items-center justify-center p-4'>
            <Tabs 
              selectedKey={selectedTab} 
              onSelectionChange={setSelectedTab}
              variant="underlined"
              color='warning'
              classNames={{
                base: "w-full", // Ensure tabs take full width
                tabList: "gap-4", // Space between tabs
                tab: "px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800",
                cursor: "bg-blue-400" // Color of the underline
              }}
            >
              <Tab key="requests" title="Requests" >
                <ReturnCusShow returnInfo={returnInfo} vendorId={vendor._id} trackings={trackings} resultsTracking={resultsTracking} owner={owner} selectedDays={vendor.selectedDays} />
              </Tab>
              <Tab key="messages" title="Messages">
                <div className='px-32 mx-32 pt-10 flex flex-col justify-center  '>
                <ChatVen2 vendorId={vendor._id} owner={vendor.owner}/>
                <div className="text-gray-400 mt-2">
                      
                      All chats and messages are encrypted, ensuring your communication remains private. This means that <span className="text-white">if you delete a message, it will be permanently erased and cannot be recovered.</span>
                      </div>
                </div>
              </Tab>
              <Tab key="shipments" title="Shipments" onPress={{fetchTrackingInfo}}>
                <div> {/* Placeholder for shipments content */}
                <>
   

      <div className="flex flex-col justify-center m-5 gap-4 justify-center items-center content-center mb-0 mt-3">
        {trackingInfos && trackingInfos.length > 0 ? (
          <>
            {trackingInfos
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((shipment, index) => (
                <motion.div 
                  key={shipment._id} 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className='border border-gray-700 dark'>
                    <CardBody className='dark'>
                      <div className="grid grid-cols-[30%_30%_30%_10%] gap-4">
                        <div>
                          <h3 className="flex items-center">
                            <Package size={20} className="mr-2 text-gray-600" />
                            <span className='text-sm font-light'>{shipment.apiData?.tracking_number || shipment.trackingNumber}</span>
                          </h3>
                          <p className="flex items-center">
                            <Truck size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Courier:</span> {shipment.apiData?.courier_code || shipment.carrier}
                          </p>
                          <p className="flex items-center">
                            <Calendar size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Shipping Date:</span> {formatDate(shipment.apiData?.shipping_date || shipment.createdAt)}
                          </p>
                          <p className="flex items-center">
                            <Calendar size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Last Update:</span> {formatDate(shipment.apiData?.latest_event_time)}
                          </p>
                        </div>
                        <div className="flex flex-col pl-4">
                          <p className="flex items-center">
                            <User size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>ETA:</span> 
                            {formatDate(shipment.apiData?.time_metrics?.estimated_delivery_date?.from) || 
                             formatDate(shipment.apiData?.time_metrics?.estimated_delivery_date?.to) || 
                             'No data available'}
                          </p>
                          <p className="flex items-center">
                            <Clock size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Transit Time:</span> 
                            {shipment.apiData?.transit_time ? `${shipment.apiData.transit_time} days` : 'No data available'}
                          </p>
                          <p className="flex items-center">
                            <MapPin size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Route:</span> 
                            {shipment.apiData?.origin || 'Not available'}  
                            {shipment.apiData?.origin ? <TbSquareArrowRight className='ml-1 mr-1' /> : ""} 
                            {shipment.apiData?.destination || ''}
                          </p>
                        </div>
                        <div>
                          <p className="flex items-center">
                            <User size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Customer:</span> {shipment.apiData?.customer || 'No data available'}
                          </p>
                          <p className="flex items-center">
                            <Tag size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Shipped From:</span> 
                            {shipment.apiData?.shipping_info?.shipper_address?.city 
                              ? capitalizeFirstLetter(shipment.apiData.shipping_info.shipper_address.city) 
                              : 'No data available'}
                          </p>
                          <p className="flex items-center">
                            <Tag size={20} className="mr-2 text-gray-600" />
                            <span className='text-gray-500 mr-1'>Shipped To:</span> 
                            {shipment.apiData?.shipping_info?.recipient_address?.city 
                              ? capitalizeFirstLetter(shipment.apiData.shipping_info.recipient_address.city) 
                              : 'No data available'}
                          </p>
                        </div>
                        <div className="w-[40%] flex flex-col justify-center items-center">
                          <p className="flex items-center -ml-4">{shipment.apiData?.delivery_status || '-'}</p>
                            {shipment.apiData?.delivery_status === 'Transit' && (
                              <img src={logo1} alt="In Transit" className="w-full h-auto" />
                            )}
                            {shipment.apiData?.delivery_status === 'Exception' && (
                              <img src={logo3} alt="Exception" className="w-full h-auto" />
                            )}
                            {shipment.apiData?.delivery_status === 'Delivered' && (
                              <img src={logo} alt="Delivered" className="w-full h-auto" />
                            )}
                            {shipment.apiData?.delivery_status === 'Pending' && (
                              <img src={logo40} alt="Pending" className="w-full h-auto" />
                            )}
                            {shipment.apiData?.delivery_status !== 'Transit' && shipment.apiData?.delivery_status !== 'Exception' && shipment.apiData?.delivery_status !== 'Pending' && shipment.apiData?.delivery_status !== 'Delivered' && (
                              <img src={logo2} alt="Other Status" className="w-full h-auto" />
                            )}
                        </div>
                      </div>
                    </CardBody>
                    <CardFooter className="flex justify-between dark items-center">
                      <Accordion isCompact>
                        <AccordionItem
                          aria-label="Travel History"
                          title={<span className="font-light text-sm text-lime-100 hover:cursor-pointer">Click here to see the travel history</span>} 
                          className="border-1 border-slate-700 pl-2 text-sm rounded-lg shadow-md"
                        >
                          {shipment.apiData?.travel_history && shipment.apiData.travel_history.length > 0 ? (
                            <ol className="relative border-l border-gray-300 pl-4">
                              {shipment.apiData.travel_history.map((event, eventIndex) => {
                                let statusColor = "text-gray-500";
                                const lowercaseStatus = event.status.toLowerCase();
                                let IconComponent = FaTruck;

                                if (lowercaseStatus.includes('exception') || lowercaseStatus.includes('delay') || lowercaseStatus.includes('return to sender')) {
                                  statusColor = "text-red-500";
                                } else if ((lowercaseStatus.includes('out for delivery') || lowercaseStatus.includes('delivered')) 
                                && !lowercaseStatus.includes('will be delivered')) {
                                  statusColor = "text-green-500";
                                  IconComponent = FaCheckCircle;
                                } else if (lowercaseStatus.includes('Return to Sender')) {
                                  statusColor = "text-red-500";
                                } else if (lowercaseStatus.includes('arrived') || lowercaseStatus.includes('departed')) {
                                  IconComponent = FaClock;
                                }

                                return (
                                  <li 
                                    key={eventIndex} 
                                    className="mb-2 ml-4"
                                    style={{ order: -eventIndex }}
                                  >
                                    <motion.div 
                                      className="absolute"
                                      initial={{ y: '100%', scaleY: 0 }}
                                      animate={(lowercaseStatus.includes('delivered') && !lowercaseStatus.includes('will be delivered')) ? {
                                        y: '0%',
                                        scaleY: 1,
                                        transition: { duration: 1.5, delay: eventIndex * 0.1 }
                                      } : {
                                        y: '0%',
                                        scaleY: 1,
                                        transition: { duration: 1.5, delay: eventIndex * 0.1 }
                                      }}
                                      style={{
                                        left: '-5px',
                                        width: '10px',
                                        height: '100%',
                                        zIndex: 1
                                      }}
                                    >
                                      <motion.div 
                                        className="rounded-full"
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          transform: 'rotate(45deg) translateY(50%)',
                                          backgroundColor: lowercaseStatus.includes('delivered') ? 'green' : (lowercaseStatus.includes('delay') || lowercaseStatus.includes('Exception') || lowercaseStatus.includes('return to sender') ? 'red' : 'blue')
                                        }}
                                        animate={lowercaseStatus.includes('delivered') ? {
                                          opacity: 1,
                                          y: '0%'
                                        } : lowercaseStatus.includes('Exception') || lowercaseStatus.includes('delay') || lowercaseStatus.includes('return to sender') ? {
                                          opacity: 1,
                                          x: [-1, 1, -1],
                                          transition: { duration: 0.2, repeat: Infinity, repeatType: 'mirror' }
                                        } : {
                                          opacity: [1, 0, 1],
                                          y: ['0%', '100%', '0%'],
                                          transition: { duration: 1.5, delay: 0, repeat: Infinity, repeatDelay: 0 }
                                        }}
                                      />
                                      <motion.div 
                                        className="bg-green-500" 
                                        style={{
                                          width: '2px',
                                          height: lowercaseStatus.includes('delivered') ? '100%' : '0%',
                                          position: 'absolute',
                                          top: '10px',
                                          left: '4px'
                                        }}
                                        animate={{ opacity: 1, height: lowercaseStatus.includes('delivered') ? '100%' : '0%' }}
                                        transition={{ duration: 1.5, delay: eventIndex * 0.1 }}
                                      />
                                    </motion.div>
                                    <div className="flex items-center mb-1">
                                      <IconComponent size={20} className={`${statusColor} mr-2`} />
                                      <time className="text-sm font-semibold leading-none text-gray-900">{formatDate(event.datetime)}</time>
                                    </div>
                                    <p className={`text-xs font-normal ${statusColor}`}>{event.status}</p>
                                    <p className="text-xs font-normal text-gray-500">{event.location}</p>
                                  </li>
                                );
                              })}
                            </ol>
                          ) : (
                            'No travel history available'
                          )}
                        </AccordionItem>
                      </Accordion>
                   
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            <div className="flex justify-center mt-4">
              <Pagination
                total={Math.ceil(trackingInfos.length / itemsPerPage)}
                initialPage={1}
                onChange={(page) => setCurrentPage(page)}
                color="primary"
                size="lg"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full -mt-16 min-h-[100vh]">
            <img src={logo4} alt="No shipments available" className="w-[500px] h-[500px] object-cover rounded-full shadow-3xl" />
            <p className="text-center text-lg text-gray-600">No shipments found. Create your first one or change the filters!</p>
          </div>
        )}
      </div>
    </>
                </div>
              </Tab>
            </Tabs>
           
          </div>
        
          <Button 
            onClick={handleLogout} 
            color="danger" 
            variant="bordered"
            className="absolute top-6 right-14"
            size='sm'
          >
            Logout
          </Button>
        </div>
          <div className="bg-zinc-900 ml-[10%] text-white" style={{ textAlign: "center" }}>
          Dynamo Package ©{new Date().getFullYear()} Created by DyamoChart
       
        </div>
        </div>
      )}
    </div>
  );
}

export default CusShare;