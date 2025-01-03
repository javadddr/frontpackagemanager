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
import { Pagination } from "@nextui-org/react";
import logo40 from "./pen.png"
import logo3 from "./cancel.png"
import Loading from "./Loading";
import { DatePicker, Space, theme,ConfigProvider } from 'antd';
import {Input} from "@nextui-org/react";
import {SearchIcon} from "./SearchIcon";
import logo4 from "./noship.jpg"
import { DeleteIcon } from "./DeleteIcon";
import Calender from './component/Calenderi';
import { EditIcon } from "./EditIcon";
import {CheckboxGroup, Checkbox} from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
function ShipDown2({shipments,returnVen,fetchShipments}) {


  const { backendShipments2,fetchBackendShipments2 } = useHubs();
  const [checkedShipments, setCheckedShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shipments && backendShipments2) {
      const validShipments = shipments.filter(shipment => {
        const shipmentTrackingNumber = shipment.tracking_number;
        return backendShipments2.some(backendShipment => {
          return backendShipment.tracking_numbers.some(trackObj => trackObj.trackingNumber === shipmentTrackingNumber);
        });
      });
      setCheckedShipments(validShipments);
    }
  }, [shipments, backendShipments2]);
  const [selected, setSelected] = useState(["Transit", "Delivered","Exception", "Pending","Created"]);
  const [shippingDates, setShippingDates] = useState(new Set());
  const [selectedRange, setSelectedRange] = useState(null); // State to hold selected range
  const [filteredShipments, setFilteredShipments] = useState(checkedShipments);
  const [finalShipments, setFinalShipments] = useState(filteredShipments);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [deliveredCount, setDeliveredCount] = useState();
  const [tranCount, settranCount] = useState();
  const [exCount, setexCount] = useState();
  const [creaCount, setcreaCount] = useState();
  const [penCount, setpenCount] = useState();
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
  useEffect(() => {
    fetchShipments();
    fetchBackendShipments2();
  }, []);
  useEffect(() => {
    // Filter shipments based on selected statuses
    if (checkedShipments) {
      const filtered = checkedShipments.filter(shipment => selected.includes(shipment.delivery_status));
      setFilteredShipments(filtered);
    }
  }, [checkedShipments, selected]);



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
///for calender 
useEffect(() => {
  if (filteredShipments && filteredShipments.length > 0) {
    const dates = filteredShipments
      .map(shipment => shipment.shipping_date ? new Date(shipment.shipping_date) : null)
      .filter(date => date !== null);
    setShippingDates(new Set(dates.map(date => 
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    )));
  }
}, [filteredShipments,selectedRange]);

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
  if (selectedRange && filteredShipments.length > 0) {
    // If selectedRange is empty or contains empty strings, show all filtered shipments
    if (selectedRange.length === 2 && (selectedRange[0] === "" || selectedRange[1] === "")) {
      setFinalShipments(filteredShipments);
    } else {
      const [startDate, endDate] = selectedRange.map(dateString => new Date(dateString));
      
      const finalShipments = filteredShipments.filter(shipment => {
        if (!shipment.shipping_date) return false;
        const shippingDate = new Date(shipment.shipping_date);
        return shippingDate >= startDate && shippingDate <= endDate;
      });

      setFinalShipments(finalShipments);
    }
  } else {
    // If no range is selected, show all filtered shipments
    setFinalShipments(filteredShipments);
  }
}, [selectedRange, filteredShipments]);

useEffect(() => {
  if (searchTerm.length === 0) {
    // If the search term is empty, show all final shipments
    setFinalShipments(filteredShipments);
  } else {
    const searchTermLower = searchTerm.toLowerCase();
    const searchedShipments = filteredShipments.filter(shipment => {
      // Fields to search within
      const fields = [
        shipment.tracking_number.toLowerCase(), 
        shipment.courier_code.toLowerCase(), 
        shipment.origin ? shipment.origin.toLowerCase() : '', 
        shipment.shipping_info?.shipper_address?.city ? shipment.shipping_info.shipper_address.city.toLowerCase() : '',
        shipment.shipping_info?.recipient_address?.city ? shipment.shipping_info.recipient_address.city.toLowerCase() : '',
        shipment.delivery_status.toLowerCase()
      ];
      // If any field matches the search term, include the shipment
      return fields.some(field => field.includes(searchTermLower));
    });
    setFinalShipments(searchedShipments);
  }
  const deliveredCount = returnVen.reduce((count, shipment) => {
    // Note: JavaScript is case-sensitive, so make sure the comparison matches exactly
    if (shipment.delivery_status && shipment.delivery_status === 'Delivered') {
      return count + 1;
    }
    return count;
  }, 0);
  const tranCount = returnVen.reduce((count, shipment) => {
    // Note: JavaScript is case-sensitive, so make sure the comparison matches exactly
    if (shipment.delivery_status && shipment.delivery_status === 'Transit') {
      return count + 1;
    }
    return count;
  }, 0);
  const exCount = returnVen.reduce((count, shipment) => {
    // Note: JavaScript is case-sensitive, so make sure the comparison matches exactly
    if (shipment.delivery_status && shipment.delivery_status === 'Exception') {
      return count + 1;
    }
    return count;
  }, 0);
  const creaCount = returnVen.reduce((count, shipment) => {
    // Note: JavaScript is case-sensitive, so make sure the comparison matches exactly
    if (shipment.delivery_status && shipment.delivery_status === 'Created') {
      return count + 1;
    }
    return count;
  }, 0);
  const penCount = returnVen.reduce((count, shipment) => {
    // Note: JavaScript is case-sensitive, so make sure the comparison matches exactly
    if (shipment.delivery_status && shipment.delivery_status === 'Pending') {
      return count + 1;
    }
    return count;
  }, 0);

  settranCount(tranCount)
  setexCount(exCount)
  setcreaCount(creaCount) 
  setpenCount(penCount)
  setDeliveredCount(deliveredCount)
}, [searchTerm, filteredShipments]);
const handleDelete = (shipment) => {
  setShipmentToDelete(shipment);
  onOpen();
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
        fetchShipments();
      } else {
        throw new Error('Failed to archive shipment');
      }
    } catch (error) {
      console.error('Error archiving shipment:', error);
    }

    // Close the modal after the operation
    onClose();
  }
};

useEffect(() => {
  setTimeout(() => setIsLoading(false), 500);
}, [shipments]);
const handleEdit = (id) => {
  // Logic to edit shipment with id
  console.log("Editing shipment with id:", id);
  // Implement actual edit logic or navigate to an edit page
};
  return (
    <div >
    {isLoading ? (
  <Loading />
) : (
  <>
       <div className='flex justify-between pt-4'>
         
        <div className="flex justify-center items-center ml-4">
              
              <div className='flex mb-3'>
              <CheckboxGroup
          size="md"
              orientation="horizontal"
              color="secondary"
              value={selected}
              onValueChange={setSelected}
              className='dark' 
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
        colorBgContainer: '#18181B',
      },
    }}
  >
                <Space size={12} direction="vertical">
                <DatePicker.RangePicker 
                  cellRender={cellRender} 
                  onChange={handleDateChange}
                />

              </Space>
              </ConfigProvider>
              </div>
            </div>
            <div className='mr-4'> 
            <Input
        isClearable
        radius="lg"
        classNames={{
          label: "text-black/50 dark:text-white/90 ",
          input: [
            "bg-gray",
            "text-black/90 dark:text-white/90",
            "placeholder:text-default-50/50 dark:placeholder:text-white/90",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            "shadow-md",
            "bg-default-800/50",
            "dark:bg-default/60",
            "backdrop-blur-xl",
            "backdrop-saturate-200",
        
            "group-data-[focus=true]:bg-default-200/50",
            "dark:group-data-[focus=true]:bg-default/60",
            "group-data-[hover=true]:bg-default-200/50",
            "dark:group-data-[hover=true]:bg-default/60",
            "!cursor-text",
          ],
        }}
          placeholder="Type to search..."
          onClear={() => setSearchTerm('')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={
            <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
          }
        />
    
          </div>
        </div>
        {returnVen.length>0 && <Calender otherShipments={returnVen}/>}
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
              <Card className='border border-gray-700 dark '>
              <CardBody className=''>
    <div className="grid grid-cols-[30%_30%_30%_10%] gap-4">
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

        <p className="flex items-center"><User size={20} className="mr-2 text-gray-600" /><span className='text-gray-500 mr-1'>Customer:  </span>{shipment.customer || 'No data available'}</p>
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
                <CardFooter className="flex justify-between dark items-center">
                  <Accordion isCompact  >
                  <AccordionItem
                      aria-label="Travel History"
                      title={<span className="font-light text-sm text-lime-100 hover:cursor-pointer">Click here to see the travel history</span>} 
                
                      className=" border-1 border-slate-400 pl-2 text-sm rounded-lg shadow-md  "
                    >
                {shipment.travel_history && shipment.travel_history.length > 0 ? (
                  <ol className="relative border-l border-gray-300 pl-4">
                    {shipment.travel_history.map((event, eventIndex) => {
                      let statusColor = "text-gray-500";
                      const lowercaseStatus = event.status.toLowerCase();
                      let IconComponent = FaTruck;

                      if (lowercaseStatus.includes('exception') || lowercaseStatus.includes('delay')) {
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
                            backgroundColor: lowercaseStatus.includes('delivered') ? 'green' : (lowercaseStatus.includes('delay') || lowercaseStatus.includes('Exception')|| lowercaseStatus.includes('return to sender') ? 'red' : 'blue')
                          }}
                          animate={lowercaseStatus.includes('delivered') ? {
                            opacity: 1,
                            y: '0%'
                          } : lowercaseStatus.includes('Exception') || lowercaseStatus.includes('delay')|| lowercaseStatus.includes('return to sender') ? {
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
        {/* <Button 
          isIconOnly 
          variant="light" 
          color="primary" 
          aria-label="Edit"
          onClick={() => handleEdit(shipment._id)}
        >
          <EditIcon />
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
        <img src={logo4} alt="No vendors available" className="w-[500px] h-[500px] object-cover rounded-full" />
        <p className="text-center text-lg text-gray-300">No shipment found. Create your first return or change the filters!</p>
      </div>
        )}
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
        </>
    )}
    </div>
  );
}

export default ShipDown2;