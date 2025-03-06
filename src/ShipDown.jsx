import React, { useEffect,useState } from 'react';
import { useHubs } from "./HubsContext";
import { Button,Chip } from "@nextui-org/react";
import { Card, CardBody, CardFooter, Accordion, AccordionItem } from '@nextui-org/react';
import { MapPin, Package, Truck, Calendar, Clock, User, Tag, DollarSign } from 'lucide-react'; // Changed to lucide-react
import { motion } from 'framer-motion';
import { FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa'; 
import { TbSquareArrowRight } from "react-icons/tb";
import logo from "./dil.png"
import logo1 from "./tran.png"
import logo2 from "./cer.png"
import logo3 from "./cancel.png"
import logo40 from "./pen.png"
import { DatePicker, Space, theme,ConfigProvider } from 'antd';
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./SearchIcon";
import logo4 from "./noship.jpg"
import { DeleteIcon } from "./DeleteIcon";
import Loading from "./Loading";
import { EditIcon } from "./EditIcon";
import { FaMapLocationDot } from "react-icons/fa6";
import { Pagination } from "@nextui-org/react";
import {CheckboxGroup, Checkbox} from "@nextui-org/react";
import Calender from './component/Calenderi';
import Map from './Map';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
function ShipDown({shipments,isDark,shipped,otherShipments, fetchShipments,backendShipments, showcal = true}) {

  const { customers,vendors,hubs,fetchBackendShipments,orders,io} = useHubs();

  const [checkedShipments, setCheckedShipments] = useState([]);


  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (otherShipments && backendShipments) {
      const validShipments = otherShipments.filter(shipment => {
        const shipmentTrackingNumber = shipment.tracking_number;
        return backendShipments.some(backendShipment => {
          return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
        });
      });
      setCheckedShipments(validShipments);
    }
  
  }, [otherShipments, backendShipments,fetchShipments]);
  const [selected, setSelected] = useState(["Transit", "Delivered","Exception", "Pending", "Created"]);
  const [shippingDates, setShippingDates] = useState(new Set());
  const [selectedRange, setSelectedRange] = useState(null); // State to hold selected range

  const [filteredShipments, setFilteredShipments] = useState(
    io.filter(shipment => shipment.status === "shipped")
  );
  const [finalShipments, setFinalShipments] = useState(filteredShipments);
  const [totali, setTotali] = useState();
  const [deliveredCount, setDeliveredCount] = useState();
  const [tranCount, settranCount] = useState();
  const [exCount, setexCount] = useState();
  const [creaCount, setcreaCount] = useState();
  const [penCount, setpenCount] = useState();
 
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen,onClose, onOpenChange: onDeleteOpenChange } = useDisclosure();
const { isOpen: isMapOpen, onOpen: onMapOpen, onOpenChange: onMapOpenChange } = useDisclosure();
  const [shipmentToMap, setShipmentToMap] = useState([]);
  const [coordinates, setCoordinates] = useState();
  console.log("coordinates",coordinates)
const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const { token } = theme.useToken();
  const style = {
    border: `2px solid ${token.colorPrimary}`,
    borderRadius: '50%',
    backgroundColor: token.colorPrimary,
    color: token.colorWhite
  };

  const capitalizeFirstLetter = (string) => {
    if (typeof string !== 'string') return string;
    return string.split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                 .join(' ');
  };



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  function findCustomerByTrackingNumber(backendShipments, trackingNumber) {
    // Find the shipment that has the specified tracking number
    const shipment = backendShipments.find(shipment => 
      shipment.tracking_numbers.some(tn => tn.trackingNumber === trackingNumber)
    );
  
    if (shipment && shipment.customer) {
      // Find the customer by matching the ID
      const customer = customers.find(cust => cust._id === shipment.customer);
      return customer ? customer.name : "Customer not found";
    }
  
    // No matching shipment or no customer in the shipment
    return "No customer found";
  }




  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

const cellRender = (current, info) => {
  if (info.type !== 'date') return info.originNode;
  const dateString = `${current.year()}-${current.month() + 1}-${current.date()}`;
  if (shippingDates.has(dateString)) {
    return (
      <div className="ant-picker-cell-inner" style={style}>
        {current.date()}
      </div>
    );
  }
  return (
    <div className="ant-picker-cell-inner">
      {current.date()}
    </div>
  );
};

const handleDateChange = (dates, dateStrings) => {
  // `dates` is an array with two moment objects for the start and end date
  // `dateStrings` is an array with two string representations of the dates
  setSelectedRange(dateStrings);

};



useEffect(() => {
  let tempShipments = filteredShipments ? checkedShipments.filter(shipment => 
    selected.includes(shipment.delivery_status)) : [];

  // Apply date range filtering if a range is selected
  if (selectedRange && tempShipments.length > 0) {
    if (selectedRange.length === 2 && (selectedRange[0] === "" || selectedRange[1] === "")) {
      // If range is empty or contains empty strings, show all filtered shipments
    } else {
      const [startDate, endDate] = selectedRange.map(dateString => new Date(dateString));
      tempShipments = tempShipments.filter(shipment => {
        if (!shipment.shipping_date) return false;
        const shippingDate = new Date(shipment.shipping_date);
        return shippingDate >= startDate && shippingDate <= endDate;
      });
    }
  }

  // Apply search term filtering if a search term exists
  if (searchTerm.length > 0) {
    const searchTermLower = searchTerm.toLowerCase();
    tempShipments = tempShipments.filter(shipment => {
      const matchingOrder = orders.find(order => 
        order.tracking_numbers && order.tracking_numbers.some(tn => tn.trackingNumber === shipment.tracking_number)
      );

      const fields = [
        shipment.tracking_number.toLowerCase(), 
        shipment.courier_code.toLowerCase(), 
        shipment.origin ? shipment.origin.toLowerCase() : '', 
        shipment.shipping_info?.shipper_address?.city ? shipment.shipping_info.shipper_address.city.toLowerCase() : '',
        shipment.shipping_info?.recipient_address?.city ? shipment.shipping_info.recipient_address.city.toLowerCase() : '',
        shipment.delivery_status.toLowerCase(),
        findCustomerByTrackingNumber(backendShipments, shipment.tracking_number).toLowerCase(),
        // Add new fields for filtering:
        matchingOrder ? matchingOrder.invoiceNumber?.toLowerCase() : '',
        matchingOrder ? matchingOrder.internalPO?.toLowerCase() : '',
        matchingOrder ? matchingOrder.orderId?.toLowerCase() : ''
      ];

      return fields.some(field => field && typeof field === 'string' && field.includes(searchTermLower));
    });
  }
  
  // Update counts and filtered shipments
  const deliveredCount = tempShipments.reduce((count, shipment) => 
    shipment.delivery_status === 'Delivered' ? count + 1 : count, 0);
  const tranCount = tempShipments.reduce((count, shipment) => 
    shipment.delivery_status === 'Transit' ? count + 1 : count, 0);
  const exCount = tempShipments.reduce((count, shipment) => 
    shipment.delivery_status === 'Exception' ? count + 1 : count, 0);
  const creaCount = tempShipments.reduce((count, shipment) => 
    shipment.delivery_status === 'Created' ? count + 1 : count, 0);
  const penCount = tempShipments.reduce((count, shipment) => 
    shipment.delivery_status === 'Pending' ? count + 1 : count, 0);

  settranCount(tranCount)
  setexCount(exCount)
  setcreaCount(creaCount) 
  setpenCount(penCount)
  setDeliveredCount(deliveredCount)
  setFilteredShipments(tempShipments);
  setFinalShipments(tempShipments);

  // Calendar part - Update shipping dates
  if (tempShipments.length > 0) {
    const dates = tempShipments
      .map(shipment => shipment.shipping_date ? new Date(shipment.shipping_date) : null)
      .filter(date => date !== null);
    setShippingDates(new Set(dates.map(date => 
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    )));
  } else {
    // Reset shipping dates if no shipments match
    setShippingDates(new Set());
  }

}, [checkedShipments, selected, selectedRange, searchTerm, orders,deliveredCount,tranCount,exCount,creaCount,penCount, backendShipments]);



const handleDelete = (shipment) => {
  setShipmentToDelete(shipment);
  onDeleteOpen();
};

const confirmDelete = async () => {
  const key = localStorage.getItem("key");
  
  if (shipmentToDelete) {
    const requestOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'key': key
      },
      body: JSON.stringify({
        tracking_number: shipmentToDelete.tracking_number,
        courier_code: shipmentToDelete.courier_code
      }),
    };

    try {
      const response = await fetch('https://api2.globalpackagetracker.com/shipment/archive', requestOptions);
      if (response.ok) {
        const data = await response.json();
        console.log('Shipment archived successfully:', data);
        // You might want to refresh your shipments list here
        await fetchShipments();
      } else {
        throw new Error('Failed to archive shipment');
      }
    } catch (error) {
      console.error('Error archiving shipment:', error);
    } finally {
  
  }
    // Close the modal after the operation
    onClose();
  }
};

useEffect(() => {
  setTimeout(() => setIsLoading(false), 500);
}, [otherShipments]);

// const API_KEY = "dd";
// const BASE_URL = "https://api.openweathermap.org/geo/1.0/direct";

// const handleEditMap = async (id) => {
//   const travelHistory = id.travel_history;
//   const deliveryStatus = id.delivery_status;

//   console.log("travelHistory", travelHistory);

//   if (travelHistory && travelHistory.length > 0) {
//     // Convert travel history into the route format and filter out null postal codes
//     const route = travelHistory
//       .map((event) => {
//         let cityOrState = event.location
//           ? event.location.split(",").pop().trim()
//           : event.state || "Unknown";

//         if (cityOrState.length > 2) {
//           cityOrState = event.state || "Unknown"; // Use state if location is not just the state
//         }

//         return {
//           name: cityOrState,
//           postalCode: event.postal_code || null,
//           location: event.location,
//         };
//       })
//       .filter((event) => event.postalCode !== null) // Filter out events with null postal codes
//       .reverse();

//     // Set isStart and isFinish/isTransit
//     if (route.length > 0) {
//       route[0].isStart = true;

//       switch (deliveryStatus) {
//         case "Delivered":
//           route[route.length - 1].isFinish = true;
//           break;
//         case "Transit":
//           route[route.length - 1].isTransit = true;
//           break;
//         case "Exception":
//           route[route.length - 1].isException = true;
//           break;
//         default:
//           route[route.length - 1].isTransit = true; // Default to Transit
//       }
//     }

//     const routes = [route];

//     // Fetch coordinates
//     const locationCoordinates = [];
//     for (const entry of travelHistory) {
//       const location = entry.location;

//       // Skip duplicates
//       if (locationCoordinates.some((item) => item.location === location)) {
//         continue;
//       }

//       try {
//         const response = await fetch(
//           `${BASE_URL}?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
//         );
//         const data = await response.json();

//         if (data && data.length > 0) {
//           const { lat, lon } = data[0];
//           locationCoordinates.push({ location, coordinates: [lon, lat] });
//         } else {
//           console.warn(`No coordinates found for ${location}`);
//         }
//       } catch (error) {
//         console.error(`Error fetching coordinates for ${location}:`, error);
//       }
//     }

//     // Log final coordinates and set state
//     console.log("Coordinates for locations:", locationCoordinates);

//     // Ensure these functions exist in the parent component
//     setCoordinates(locationCoordinates);
//     setShipmentToMap(routes);
//     onMapOpen();
//   }
// };
const handleEdit = async (id) => {
  const trackingNumber = id.tracking_number;
  console.log('Tracking number to find:', trackingNumber);

  // Find the shipment with the matching tracking number
  const matchingShipment = backendShipments.find(shipment => 
    shipment.tracking_numbers.some(tn => tn.trackingNumber === trackingNumber)
  );

  if (matchingShipment) {
    console.log('Matching shipment found:', matchingShipment);
    setSelectedShipment(matchingShipment); // Store in state
    onMapOpenChange(true);  // Open modal with the shipment details
  } else {
    console.log('No matching shipment found for tracking number:', trackingNumber);
    setSelectedShipment(null); // Reset if no match found
  }
};

const [selectedHub, setSelectedHub] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  useEffect(() => {
    if (selectedShipment) {
      setSelectedHub(selectedShipment.hub || '');
      setSelectedVendor(selectedShipment.vendor || '');
      setSelectedCustomer(selectedShipment.customer || '');
    }
  }, [selectedShipment]);

  // Update this function to include the update logic
  const handleUpdateShipment = async () => {
    if (!selectedShipment) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/shipments/${selectedShipment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'owner': localStorage.getItem("key") // Assuming 'owner' header is used
        },
        body: JSON.stringify({
          hub: selectedHub || null,
          vendor: selectedVendor || null,
          customer: selectedCustomer || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update shipment');
      }

      const updatedShipment = await response.json();
      console.log('Shipment updated:', updatedShipment);

      // Re-fetch shipments or update local state to reflect changes
      await fetchBackendShipments();

      // Optionally close the modal or show success message
      onMapOpenChange(false);
    } catch (error) {
      console.error('Error updating shipment:', error);
      // Show error message to user
    }
  };





  return (
    <div >
    {isLoading ? (
  <Loading />
) : (
 
   <div className={`${isDark?"bg-zinc-900":"bg-white"}`}>
      <div className='flex justify-center pt-4  pr-16 pl-16'>
           
          <div className="flex justify-center items-center ml-4">
            
            <div className='flex mb-3  '>
            <CheckboxGroup
        size="md"
            orientation="horizontal"
            color="secondary"
            value={selected}
            onValueChange={setSelected}
            className={`${isDark?"dark":"light"}`} 
         
          >
          
            <Checkbox value="Transit" style={{color:"blue"}}>In Transit<Chip color='primary' variant='flat' size="sm" className='ml-1'>{tranCount}</Chip></Checkbox>
            <Checkbox value="Delivered">Delivered <Chip color='success' variant='flat' size="sm" className='ml-1'>{deliveredCount}</Chip></Checkbox>
            <Checkbox value="Exception">Exception <Chip color='danger' variant='flat' size="sm" className='ml-1'>{exCount}</Chip></Checkbox>
            <Checkbox value="Pending">Pending<Chip color='default' variant='flat' size="sm" className='ml-1'>{penCount}</Chip></Checkbox>
            <Checkbox value="Created">Created<Chip color='warning' variant='flat' size="sm" className='ml-1'>{creaCount}</Chip></Checkbox>
          
          </CheckboxGroup>
            </div>
            <div className='ml-3 pb-2 '>
            <ConfigProvider
    theme={{
      token: {
        // Seed Token
   
        borderRadius: 7,
    
  

        // Alias Token
        colorBgContainer:isDark? '#18181B':"",
      },
    }}
  >
              <Space size={12} direction="vertical" >
              <DatePicker.RangePicker 
              
                cellRender={cellRender} 
                onChange={handleDateChange}
              />

            </Space>
            </ConfigProvider>
            </div>
          </div>
          <div className="mr-4 ml-4 max-h-[32px]">
            <Input
              isClearable
              radius="lg"
              style={{ color: isDark ? "white" : "black" }}
              classNames={{
                label: "text-white/90 dark:text-black/90 h-[32px]", // Adjusted to match height
                input: [
                  "bg-gray-800",
                  "text-sm", // Reduced from text-base to ensure text fits (16px -> 14px)
                  "flex",
                  "h-[32px]", // Keep input height
                  "leading-[28px]", // Slightly less than height to allow space and prevent overlap
                  "py-0", // No vertical padding
                ],
                innerWrapper: "bg-transparent h-[32px] py-0 flex items-center", // Center content vertically
                inputWrapper: [
                  "shadow-sm",
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "group-data-[focus=true]:bg-default-200/50",
                  "dark:group-data-[focus=true]:bg-default/60",
                  "group-data-[hover=true]:bg-default-400/50",
                  "dark:group-data-[hover=true]:bg-default/60",
                  "!cursor-text",
                  "max-w-[300px]",
                  "h-[32px]", // Wrapper height
                  "min-h-[32px]", // Minimum height
                  "py-0", // No padding
                  "flex items-center", // Ensure vertical centering
                ],
              }}
              placeholder="Type to search..."
              onClear={() => setSearchTerm("")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={
                <SearchIcon
                  className={`w-3 h-3 ${isDark ? "text-white" : "text-black"} pointer-events-none flex-shrink-0`}
                />
              }
            />
          </div>
      </div>
     {otherShipments.length>0 && <Calender isDark={isDark} otherShipments={filteredShipments}/>}
      <div className="flex flex-col justify-center m-5 gap-4  justify-center items-center content-center  mb-0 mt-3">
        {finalShipments && finalShipments.length > 0 ? (
           <>
          {finalShipments
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((shipment, index) => (
            <motion.div 
              key={shipment._id} 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <Card className={` ${isDark?"border border-gray-700 dark":"border border-gray-700 light"}  `}>
              <CardBody className='dark'>
    <div className="grid grid-cols-[20%_20%_20%_25%_5%] gap-5">
      <div>
        <h3 className=" flex items-center">
          <Package size={20} className="mr-2 text-gray-600  " /><span className='text-sm font-light'>{shipment.tracking_number}</span>
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
      <p className="flex items-center"><User size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Customer: </span>{findCustomerByTrackingNumber(backendShipments, shipment.tracking_number)}</p>
        <p className="flex items-center">
          <Tag size={20} className="mr-2 text-gray-600" />
          <span className='text-gray-500 mr-1'>Shipped From: </span>
          {shipment.shipping_info?.shipper_address?.city 
            ? capitalizeFirstLetter(shipment.shipping_info.shipper_address.city) 
            : 'No data available'}
        </p>
        <p className="flex items-center ">
          <Tag size={20} className="mr-2 text-gray-600" />
          <span className='text-gray-500 mr-1'>Shipped To: </span>
          {shipment.shipping_info?.recipient_address?.city 
            ? capitalizeFirstLetter(shipment.shipping_info.recipient_address.city) 
            : 'No data available'}
        </p>
      </div>
      <div className="flex flex-col pl-4">
      <p className="flex items-center">
        <User size={20} className="mr-2 text-gray-600" />
        <span className='text-gray-500 mr-1'>Invoice Number: </span> 
{orders.find(order => 
  order.tracking_numbers && order.tracking_numbers.some(tn => tn.trackingNumber === shipment.tracking_number)
)?.invoiceNumber || 'No Invoice Number'}
      </p>

        <p className="flex items-center"><Clock size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Internal PO:  </span> {orders.find(order => 
  order.tracking_numbers && order.tracking_numbers.some(tn => tn.trackingNumber === shipment.tracking_number)
)?.internalPO || 'No Invoice Number'}</p>
        <p className="flex items-center"><MapPin size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Order ID: </span>  {orders.find(order => 
  order.tracking_numbers && order.tracking_numbers.some(tn => tn.trackingNumber === shipment.tracking_number)
)?.orderId || 'No Invoice Number'}</p>

        
      </div>
        <div className="w-[90%] flex flex-col justify-center items-center">
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
                <CardFooter className="flex justify-between dark items-center">
                  <Accordion isCompact  >
                  <AccordionItem
                      aria-label="Travel History"
                      title={<span className="font-light text-sm text-lime-100 hover:cursor-pointer">Click here to see the travel history</span>} 
                
                      className="  border-1 border-slate-700 pl-2 text-sm rounded-lg shadow-md  "
                    >
                {shipment.travel_history && shipment.travel_history.length > 0 ? (
                  <ol className="relative border-l border-gray-300 pl-4">
                    {shipment.travel_history.map((event, eventIndex) => {
                      let statusColor = "text-gray-500";
                      const lowercaseStatus = event.status.toLowerCase();
                      let IconComponent = FaTruck;

                      if (lowercaseStatus.includes('exception') || lowercaseStatus.includes('delay')|| lowercaseStatus.includes('return to sender')) {
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
                            backgroundColor: lowercaseStatus.includes('delivered') ? 'green' : (lowercaseStatus.includes('delay') || lowercaseStatus.includes('Exception')|| lowercaseStatus.includes('return to sender') ? 'red' : 'blue')
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
                  <Button 
                      isIconOnly 
                      variant="light" 
                      color="danger" 
                      aria-label="Delete"
                      onClick={() => handleDelete(shipment)}
                    >
                      <DeleteIcon className="w-5 h-5"/>
                    </Button>
        <Button 
          isIconOnly 
          variant="light" 
          color="primary" 
          aria-label="Edit"
          onClick={() => handleEdit(shipment)}
        >
          <EditIcon className="w-6 h-6"/>
        </Button>
        {/* <Button 
          isIconOnly 
          variant="light" 
          color="primary" 
          aria-label="Edit"
          onClick={() => handleEdit(shipment)}
        >
          <FaMapLocationDot className="w-6 h-6"  color='#74DFA2'/>
        </Button> */}
      </div>
                </CardFooter>
              </Card>
            </motion.div>
         
          ))}
          <div className="flex justify-center mt-4">
          <Pagination
            total={Math.ceil(finalShipments.length / itemsPerPage)}
            initialPage={1}
            onChange={(page) => setCurrentPage(page)}
            color="primary"
            size="lg"
          />
        </div>
      </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full -mt-16  min-h-[100vh] ">
        <img src={logo4} alt="No vendors available" className="w-[500px] h-[500px] object-cover  rounded-full" />
        <p className="text-center text-lg text-gray-300">No shipment found. Create your first one or change the filters!</p>
      </div>
        )}
      </div>
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} className='dark'>
    <ModalContent>
      <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to delete this shipment?</p>
        <p>Tracking Number: {shipmentToDelete && shipmentToDelete.tracking_number}</p>
      </ModalBody>
      <ModalFooter>
        <Button color="default" variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="danger" onPress={confirmDelete}>
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
      </Modal>
      <Modal isOpen={isMapOpen} onOpenChange={onMapOpenChange} size="xl" className='dark'>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Shipment Details</ModalHeader>
          <ModalBody>
            {selectedShipment && (
              <>
                <p><strong>Tracking Number:</strong> {selectedShipment.tracking_numbers[0].trackingNumber}</p>
                <div className="flex items-center mb-2">
                  <strong>Hub:</strong>
                  <select 
                    className="ml-2 p-1 bg-gray-700 text-white rounded"
                    value={selectedHub}
                    onChange={(e) => setSelectedHub(e.target.value)}
                  >
                    <option value="">{selectedHub || 'Not specified'}</option>
                    {hubs.map(hub => (
                      <option key={hub._id} value={hub._id}>{hub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center mb-2">
                  <strong>Vendor:</strong>
                  <select 
                    className="ml-2 p-1 bg-gray-700 text-white rounded"
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                  >
                    <option value="">{selectedVendor || 'Not specified'}</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center mb-2">
                  <strong>Customer:</strong>
                  <select 
                    className="ml-2 p-1 bg-gray-700 text-white rounded"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">{selectedCustomer || 'Not specified'}</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onMapOpenChange}>
              Cancel
            </Button>
            <Button color="primary" variant="flat" onPress={handleUpdateShipment}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      </div>
    )}
    </div>
  );
}

export default ShipDown;