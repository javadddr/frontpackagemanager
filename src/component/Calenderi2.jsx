import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, CardFooter, Accordion, AccordionItem } from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,Button,Chip } from "@nextui-org/react";
import { MapPin, Package, Truck, Calendar, Clock, User, Tag, DollarSign } from 'lucide-react'; // Changed to lucide-react
import { Select, ConfigProvider } from 'antd';
const { Option } = Select;
import { useHubs } from "../HubsContext";
import { CgArrowRightO ,CgArrowLeftO} from "react-icons/cg";
import logo from "../dil.png"
import logo1 from "../tran.png"
import logo2 from "../cer.png"
import logo3 from "../cancel.png"
import logo40 from "../pen.png"
import logo4 from "../noship.jpg"
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

import { FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa'; 
import { TbSquareArrowRight } from "react-icons/tb";

import { DeleteIcon } from "../DeleteIcon";

import { EditIcon } from "../EditIcon";
import { Pagination } from "@nextui-org/react";


function Calendari2({otherShipments2,returnedCus,returnVen,shipments}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { fetchShipments,backendShipments,setShipments,setBackendShipments,fetchBackendShipments,fetchBackendShipments1,fetchBackendShipments2 } = useHubs();
  const [sortedShipments, setSortedShipments] = useState({});
  const [dateType, setDateType] = useState('shipping_date');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
const [dayShipments, setDayShipments] = useState([]);
const [allShipmentsByDate, setAllShipmentsByDate] = useState({});
const [selectedDate, setSelectedDate] = useState(null);
const [shipmentType, setShipmentType] = useState('All');
const [otherShipments, setOtherShipments] = useState(shipments); // Use otherShipments as state



  const capitalizeFirstLetter = (string) => {
    if (typeof string !== 'string') return string;
    return string.split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                 .join(' ');
  };



  useEffect(() => {
    let newShipments;

    switch(shipmentType) {
      case 'All':
        newShipments = shipments;
        break;
      case 'Shipped Packages':
        newShipments = otherShipments2;
        break;
      case 'Customer Return':
        newShipments = returnedCus;
        break;
      case 'Vendor Return':
        newShipments = returnVen;
        break;
      default:
        newShipments = shipments; // Default to all if an unexpected value is set
    }

    setOtherShipments(newShipments); // Update the state with the selected shipments
  }, [shipmentType,dateType, shipments, otherShipments2, returnedCus, returnVen]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  useEffect(() => {
    if (otherShipments) {
      // Function to get the date to use for sorting
      const getDateForShipment = (shipment) => {
        let date;
        if (dateType === 'shipping_date') {
          date = shipment.shipping_date ? new Date(shipment.shipping_date) : new Date(shipment.createdAt);
        } else { // 'delivery_date'
          if (shipment.delivery_date) {
            date = new Date(shipment.delivery_date);
          } else if (shipment.time_metrics && shipment.time_metrics.estimated_delivery_date) {
            date = shipment.time_metrics.estimated_delivery_date.from 
                 ? new Date(shipment.time_metrics.estimated_delivery_date.from)
                 : (shipment.time_metrics.estimated_delivery_date.to 
                    ? new Date(shipment.time_metrics.estimated_delivery_date.to)
                    : null); // If neither 'from' nor 'to' is available, return null
          } else {
            return null; // If no delivery date or estimated delivery date, ignore this shipment
          }
        }
        return date;
      };
  
      // Group shipments by date and count statuses
      const groupedShipments = otherShipments.reduce((acc, shipment) => {
        const date = getDateForShipment(shipment);
        if (date) { // Check if date is not null before proceeding
          const dateString = date.toISOString().split('T')[0]; // Get date string in 'YYYY-MM-DD' format
          if (!acc[dateString]) {
            acc[dateString] = {
              'Transit': 0,
              'Delivered': 0,
              'Exception': 0,
              'Pending': 0,
              'Created': 0,
            };
          }
  
          const status = shipment.delivery_status || 'Unknown'; // Fallback to 'Unknown' if status is undefined
          if (acc[dateString][status] !== undefined) {
            acc[dateString][status]++;
          }
        }
        return acc;
      }, {});

      const shipmentsByDate = {};
      otherShipments.forEach(shipment => {
        const date = getDateForShipment(shipment);
        if (date) {
          const dateString = date.toISOString().split('T')[0];
          if (!shipmentsByDate[dateString]) shipmentsByDate[dateString] = [];
          shipmentsByDate[dateString].push(shipment);
        }
      });
  
      setSortedShipments(groupedShipments);
      setAllShipmentsByDate(shipmentsByDate);
    }
  }, [otherShipments, dateType]);
  const handleDayClick = (day) => {
    const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setDayShipments(allShipmentsByDate[dateString] || []);
    setSelectedDate(new Date(dateString)); // Set the selected date
    onOpen();
  };
  // Helper function to get the number of days in the month
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get the day of the week the month starts on
  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate the days for the current month
  const monthDays = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1);
  
  // Add padding for the first week
  const paddingDays = Array(firstDayOfMonth(currentDate)).fill(null);

  // Combine padding and actual days
  const allDays = [...paddingDays, ...monthDays];

  // Function to get count of shipments by status for a day
  const getShipmentStatusCount = (day) => {
    const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayData = sortedShipments[dateString] || {};
    return Object.entries(dayData)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => `${count} ${status}`);
  };

const determineCellColor = (day) => {
  const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const dayData = sortedShipments[dateString] || {};

  // Check if there's any exception
  if (dayData['Exception'] > 0) return 'bg-red-300'; // Red if exception exists

  // For cases without exceptions:
  const statusCounts = Object.values(dayData).filter(count => count > 0);
  const hasOnlyDelivered = statusCounts.length === 1 && dayData['Delivered'] > 0;
  const hasOnlyTransitAndDelivered = statusCounts.length === 1 && dayData['Transit'] > 0 || 
                                     (statusCounts.length === 2 && dayData['Transit'] > 0 && dayData['Delivered'] > 0);

  if (hasOnlyDelivered) return 'bg-emerald-500'; // Green if only delivered
  if (hasOnlyTransitAndDelivered) return 'bg-blue-500'; // Blue if only transit, or transit and delivered
  if (statusCounts.length > 0) return 'bg-orange-500'; // Yellow for any other combination

  return ''; // No color if no shipments
};

  return (
    <div className="p-3 m-5 mb-0 mt-0 mb-4 border rounded-lg border-slate-800 shadow-xl flex flex-col justify-center bg-zinc-950">
      <div className="flex  justify-between items-center mb-4">
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
          className="p-2  text-white rounded-lg"
        >
          <CgArrowLeftO className="text-black w-8 h-8 text-gray-100" />
        </button>
     
        <h2 className="text-lg font-bold ml-40 pl-40 text-gray-100">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <div className='flex justify-center items-center'>
        <div className="">
        <ConfigProvider
    theme={{
      token: {
        // Seed Token
        colorPrimary: 'white',
   
  


        // Alias Token
        colorBgContainer: '#18181B',
      },
    }}
  >
    <Select 
      value={dateType} 
      onChange={value => setDateType(value)} 
      style={{ width: 160 }}
    >
      <Option value="shipping_date">Shipping Date</Option>
      <Option value="delivery_date">Delivery Date</Option>
    </Select>
    </ConfigProvider>
  </div>
  <div className="ml-2"> 
  <ConfigProvider
    theme={{
      token: {
        // Seed Token
        colorPrimary: 'white',
   
  


        // Alias Token
        colorBgContainer: '#18181B',
      },
    }}
  >
            <Select 
              value={shipmentType} 
              onChange={value => setShipmentType(value)} 
              style={{ width: 170 }}
            >
              <Option value="All">All</Option>
              <Option value="Shipped Packages">Shipped Packages</Option>
              <Option value="Customer Return">Customer Return</Option>
              <Option value="Vendor Return">Vendor Return</Option>
            </Select>
            </ConfigProvider>
          </div>
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
          className="p-2  text-white rounded-lg"
        >
          <CgArrowRightO className="text-black w-8 h-8 text-gray-100" />
        </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 w-full">
        {days.map(day => (
          <div key={day} className="text-center font-semibold  text-gray-500 ">{day}</div>
        ))}
        {allDays.map((day, index) => (
          <div 
            key={index} 
            onClick={() => handleDayClick(day)}
            className={`flex  justify-center  border border-neutral-800 items-center rounded-md h-16 text-xs cursor-pointer ${day ? '' : 'text-gray-100'} 
            ${day ? determineCellColor(day) : ''}`}
          >
            {day ? (
     
              
              <>
  <div className="flex h-full w-full ">  {/* Flex container */}
    <div className="flex-[0_0_20%] flex items-start justify-start text-left ml-2 mt-1">  {/* 30% width, align content to the top-left */}
      <span className="text-gray-500 " style={{fontSize:"10px"}}>{day}</span>
    </div>
    <div className="flex-[0_0_80%] flex items-center justify-start ">
  {getShipmentStatusCount(day).length > 0 && 
    <div className="text-xs text-gray-900 whitespace-pre-line">
      {getShipmentStatusCount(day).join('\n')}
    </div>}
</div>
  </div>
</>
          
            ) : ''}
          </div>
        ))}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" className="max-h-[90vh] dark">
      <ModalContent>
        <ModalHeader>
        <span className='text-base'>{selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Shipments'}</span>
        </ModalHeader>
        <ModalBody className="max-h-[550px] min-h-[550px] font-thin overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
        {dayShipments && dayShipments.length > 0 ? (
           <>
          {dayShipments
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((shipment, index) => (
            <motion.div 
              key={shipment._id} 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
               <Card className='border border-gray-700 dark '>
              <CardBody>
    <div className="grid grid-cols-[30%_30%_30%_10%] gap-4">
      <div>
        <h3 className=" flex items-center">
          <Package size={20} className="mr-2 text-gray-600  " /><span className='text-sm'>{shipment.tracking_number}</span>
        </h3>
        <p className="flex items-center"><Truck size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Courier:</span> {shipment.courier_code}</p>
        <p className="flex items-center"><Calendar size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Shipping Date: </span> {formatDate(shipment.shipping_date)}</p>
        <p className="flex items-center"><Calendar size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Last Update:</span> {formatDate(shipment.latest_event_time)}</p>
      </div>
      <div className="flex flex-col pl-4">
      <p className="flex items-center">
        <User size={20} className="mr-2 text-gray-600" />
        <span className='text-gray-500 mr-1'>ETA:</span> {formatDate(shipment.time_metrics?.estimated_delivery_date?.from) || 
              formatDate(shipment.time_metrics?.estimated_delivery_date?.to) || 
              'No data available'}
      </p>

        <p className="flex items-center"><Clock size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Transit Time: </span> {shipment.transit_time ? `${shipment.transit_time} days` : 'No data available'}</p>
        <p className="flex items-center"><MapPin size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Route:</span>  {shipment.origin || 'Not available'}   {shipment.origin ? <TbSquareArrowRight className='ml-1 mr-1' />:""} {shipment.destination || ''}</p>
      </div>
      <div>

        <p className="flex items-center"><User size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Customer:  </span>{shipment.customer || 'No data available'}</p>
        <p className="flex items-center">
          <Tag size={20} className="mr-2 text-gray-600" />
          <span className='text-gray-500 mr-1'>Shipped From: </span>
          {shipment.shipping_info?.shipper_address?.city 
            ? capitalizeFirstLetter(shipment.shipping_info.shipper_address.city) 
            : 'No data available'}
        </p>
        <p className="flex items-center">
          <Tag size={20} className="mr-2 text-gray-600" />
          <span className='text-gray-500 mr-1'>Shipped To: </span>
          {shipment.shipping_info?.recipient_address?.city 
            ? capitalizeFirstLetter(shipment.shipping_info.recipient_address.city) 
            : 'No data available'}
        </p>
      </div>
    
  <div className="w-[40%] flex flex-col justify-center items-center">
  <p className="flex items-center -ml-4 ">{shipment.delivery_status || '-'}</p>
    {shipment.delivery_status === 'Transit' && (
      <img src={logo1} alt="In Transit" className="w-full h-auto" />
    )}
    {shipment.delivery_status === 'Exception' && (
      <img src={logo3} alt="Exception" className="w-full h-auto" />
    )}
    {shipment.delivery_status === 'Delivered' && (
      <img src={logo} alt="Delivered" className="w-full h-auto" />
    )}
    {shipment.delivery_status === 'Pending' && (
      <img src={logo40} alt="Pending" className="w-full h-auto" />
    )}
    {shipment.delivery_status !== 'Transit' && shipment.delivery_status !== 'Exception' && shipment.delivery_status !== 'Pending' && shipment.delivery_status !== 'Delivered' && (
      <img src={logo2} alt="Other Status" className="w-full h-auto" />
    )}
  </div>
    </div>
  </CardBody>
                <CardFooter className="flex justify-between  items-center">
                  <Accordion isCompact  >
                  <AccordionItem
                      aria-label="Travel History"
                      title={<span className="font-light text-sm text-lime-100 hover:cursor-pointer">Click here to see the travel history</span>} 
                
                      className=" border-1 border-slate-400 pl-2 text-sm rounded-lg shadow-md "
                    >
                {shipment.travel_history && shipment.travel_history.length > 0 ? (
                  <ol className="relative border-l border-gray-300 pl-4">
                    {shipment.travel_history.map((event, eventIndex) => {
                      let statusColor = "text-gray-500";
                      const lowercaseStatus = event.status.toLowerCase();
                      let IconComponent = FaTruck;

                      if (lowercaseStatus.includes('exception') || lowercaseStatus.includes('delay') || lowercaseStatus.includes('return to sender')) {
                        statusColor = "text-red-500";
                      } else if ((lowercaseStatus.includes('out for delivery') || lowercaseStatus.includes('delivered')) 
                      && !lowercaseStatus.includes('will be delivered')) {
                        statusColor = "text-green-500";
                        IconComponent = FaCheckCircle;
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
                  <div className="flex">
                
     
      </div>
                </CardFooter>
              </Card>
            </motion.div>
         
          ))}
          <div className="flex justify-center mt-4">
          <Pagination
            total={Math.ceil(dayShipments.length / itemsPerPage)}
            initialPage={1}
            onChange={(page) => setCurrentPage(page)}
            color="primary"
            size="lg"
          />
        </div>
      </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full -mt-16  min-h-[100vh] ">
        <img src={logo4} alt="No vendors available" className="w-[500px] h-[500px] object-cover " />
        <p className="text-center text-lg text-gray-600">No shipment found. Create your first one or change the filters!</p>
      </div>
        )}
      </div>
        </ModalBody>
       
      </ModalContent>
    </Modal>
    </div>
  );
}

export default Calendari2;