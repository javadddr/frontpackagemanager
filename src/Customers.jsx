import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {   Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Button,useDisclosure } from "@nextui-org/react";
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input, Button as AntButton } from "antd";
import { useHubs } from "./HubsContext";
import { Select, Spin } from "antd";
import Loading from "./Loading";
import { KeyOutlined } from '@ant-design/icons';
import { DeleteIcon } from "./DeleteIcon";
import logo from "./cus.png"
import { Card, CardBody } from "@nextui-org/react";
import { Tabs,Tab,CheckboxGroup,Checkbox } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
} from "@nextui-org/react";
import Street from "./Street";
import { 
  UserOutlined, 
  HomeOutlined, 
  MailOutlined, 
  BellOutlined, 
  PhoneOutlined, 
  CommentOutlined 
} from "@ant-design/icons";
import Map from "./Map";
import MapGE from "./MapGE";
import MapWO from "./MapWO";
const MotionButton = motion(Button);
function Customers() {
  const { customers,backendShipments,backendShipments1,products,hubs, fetchCustomers,setCustomers,shipments } = useHubs();


  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [errorMessage, setErrorMessage] = useState("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Products');

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [editedAlert, setEditedAlert] = useState(false);
  const [isEditingContactPoint, setIsEditingContactPoint] = useState(false);
  const [editedContactPoint, setEditedContactPoint] = useState("");
  const {isOpen, onOpen, onClose} = useDisclosure(); // For opening customer details
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure(); // For delete confirmation
  const [deletionId, setDeletionId] = useState(null); // State to hold the ID of the customer to be deleted
  const [isDeleting, setIsDeleting] = useState(false); // State for loading state during deletion
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { isOpen: isCustomerDetailsOpen, onOpen: onCustomerDetailsOpen, onClose: onCustomerDetailsClose } = useDisclosure();
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  useEffect(() => {
    if (selectedCustomer) {
      setEditedAddress(selectedCustomer.address || "");
      setEditedEmail(selectedCustomer.email || "");
      setEditedAlert(selectedCustomer.alert || false);
      setEditedContactPoint(selectedCustomer.contactPoint || "");
      // Initialize other fields if they exist
    }
  }, [selectedCustomer]);
  const InlineEditField = ({ value, setValue, onSave, onCancel }) => {
    const inputRef = React.useRef(null);
  
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
  
    return (
      <div className="flex items-center ">
        <input 
          ref={inputRef}
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          className="mr-2 bg-transparent border-b border-gray-300 text-gray-400"
        />
        <span 
          role="button" 
          onClick={onSave}
          className="cursor-pointer text-green-500 ml-1" 
          style={{ width: '30px', height:'20px', display: 'inline-block', textAlign: 'center' }}>
          ✓
        </span>
        <span 
          role="button" 
          onClick={onCancel}
          className="cursor-pointer text-gray-500 ml-1" 
          style={{ width: '30px', height:'20px', display: 'inline-block', textAlign: 'center' }}>
          ✕
        </span>
      </div>
    );
  };
  
  const InlineTextField = ({ text, onEdit }) => (
    <>
      <span className="text-gray-500 cursor-pointer " onClick={onEdit}>{text}</span>
    </>
  );

  const handleUpdateField = async (customerId, field, newValue, setEditState) => {
    try {
      const response = await fetch(`${backendUrl}/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: newValue }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update ${field}`);
      }
  
      const updatedCustomer = await response.json();
      console.log(`${field} updated:`, updatedCustomer);
      
      // Update the local state immediately
      setSelectedCustomer(prevCustomer => ({
        ...prevCustomer,
        [field]: newValue
      }));
  
      // Optionally fetchCustomers for global state update
      await fetchCustomers();
  
      setEditState(false); // Exit edit mode
    } catch (error) {
      console.error(`Error updating ${field}:`, error.message);
      // Optionally show error to the user, for example:
      setErrorMessage(`Error updating ${field}: ${error.message}`);
    }
  };

  const countTrackingNumbersForCustomer = (customerId) => {

    return backendShipments.reduce((total, shipment) => {
  
      if (shipment.customer && shipment.customer === customerId) {
        const trackingNumbersCount = shipment.tracking_numbers ? 
          shipment.tracking_numbers.map(tracking => tracking.trackingNumber).length 
          : 0;
        return total + trackingNumbersCount;
      }
      return total;
    }, 0);
  };
  const countTrackingNumbersForCustomer2 = (customerId) => {

    return backendShipments1.reduce((total, shipment) => {
   
      if (shipment.customer && shipment.customer === customerId) {
        const trackingNumbersCount = shipment.tracking_numbers ? 
          shipment.tracking_numbers.map(tracking => tracking.trackingNumber).length 
          : 0;
        return total + trackingNumbersCount;
      }
      return total;
    }, 0);
  };

  const findMatchingShipments = (customerId) => {
    // Step 1: Collect tracking numbers and related info from backendShipments
    const shipmentsInfo = backendShipments.reduce((acc, shipment) => {
      if (shipment.customer && shipment.customer === customerId) {
        const trackingNumbers = shipment.tracking_numbers ? 
          shipment.tracking_numbers.map(tracking => tracking.trackingNumber) 
          : [];
        
        trackingNumbers.forEach(trackingNumber => {
          acc.push({
            trackingNumber,
            products: shipment.products ? shipment.products.map(p => {
              const product = products.find(prod => prod._id === p.id);
              return {
                id: p.id,
                name: product ? product.name : 'Unknown Product', // Fetch product name or use a default
                quantity: p.quantity
              };
            }) : [],
            hub: shipment.hub ? (hubs.find(hub => hub._id === shipment.hub)?.name || 'Unknown Hub') : null,
            vendor: shipment.vendor ? shipment.vendor : null,
            createdAt: shipment.createdAt,
            // Note: Here we're assuming we'll find a match in the shipments array later
          });
        });
      }
      return acc;
    }, []);
  
    // Step 2: Find matching shipments from the 'shipments' array and merge with backendShipments info
    const matchingShipments = shipments.reduce((result, shipment) => {
      const matchedInfo = shipmentsInfo.find(info => info.trackingNumber === shipment.tracking_number);
      if (matchedInfo) {
        result.push({
          ...matchedInfo,
          delivery_status: shipment.delivery_status
        });
      }
      return result;
    }, []);
  
    return matchingShipments;
  };
  
  const capitalizeFirstLetter = (message) => {
    if (!message) return "";
    return message.charAt(0).toUpperCase() + message.slice(1);
  };
  useEffect(() => {
    // Fetch the hubs data when the component mounts
    fetchCustomers();
  }, []);
  const ErrorPopup = ({ message, onClose }) => {
  
    return (
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 20,
              right: "10px",
              transform: "translateX(-50%)",
              background: "#ff4d4f",
              color: "black",
              padding: "10px 20px",
              borderRadius: "5px",
              zIndex: 1000,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              fontWeight:"bold"
            }}
          >
            {message}
            <button
              onClick={onClose}
              style={{
                marginLeft: "10px",
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const handleDeleteCustomer = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/customers/${deletionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete customer");
      }

      // Update state or refetch customers
      await fetchCustomers();
      onCustomerDetailsClose
      setErrorMessage("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error.message);
      setErrorMessage(error.message);
    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };
  const handleFormSubmit = async (values) => {
    setLoading(true);
    setErrorMessage("");
    const existingHub = customers.find(hub => hub.name.toLowerCase() === values.name.toLowerCase());
  if (existingHub) {
    setErrorMessage("A customer with this name already exists.");
    setLoading(false);
    return;
  }
    if (values.comment) {
      const currentDate = new Date().toISOString();
      values.comment = [{
        text: values.comment,
        creationdate: currentDate
      }];
    } else {
      values.comment = [];
    }
    
    const owner = localStorage.getItem("key"); 
    if (!owner) {
      setErrorMessage("Owner key is missing from local storage.");
      setLoading(false);
      return;
    }
  
    values.owner = owner;

    try {
      const response = await fetch(`${backendUrl}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create new customer");
      }
  
      const data = await response.json();

      setCustomers(prevHubs => [...prevHubs, data]);
      fetchCustomers()
      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating customer:", error.message);
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const [newNote, setNewNote] = useState(""); // State to hold the new note text

  const handleAddNote = async () => {
    if (!newNote.trim()) return; // Prevent adding empty notes

    try {
      const response = await fetch(`${backendUrl}/api/customers/${selectedCustomer._id}/add-note`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newNote }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const data = await response.json();
      // Update the local state to reflect the new note
      setSelectedCustomer(prev => ({
        ...prev,
        comment: [...prev.comment, { text: newNote, creationdate: new Date() }]
      }));
      setNewNote(""); // Clear the input after adding the note
    } catch (error) {
      console.error("Error adding note:", error);
      // Optionally show an error message to the user
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page
  const matchingShipmentsForCustomer = findMatchingShipments(selectedCustomer?._id);
  const totalPages = Math.ceil((matchingShipmentsForCustomer?.length || 0) / itemsPerPage);

  const paginatedShipments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return matchingShipmentsForCustomer?.slice(startIndex, endIndex);
  }, [matchingShipmentsForCustomer, currentPage]);
  return (

  <div className="pt-6 pl-4 pr-4 bg-zinc-900" style={{ minHeight: "100vh"}}>
     <div className="flex justify-end">
       <MotionButton
         color="primary"
         variant="shadow"
         animate={{ scale: 1.02 }}
         transition={{ duration: 0.09 }}
         onClick={handleOpenModal}
         style={{ width: '170px',height:'35px' }}
       >
         Add New Customer
       </MotionButton>
       </div>
       {/* Modal */}
       <AnimatePresence>
         {isModalOpen && (
           <motion.div
             className="modal-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               backgroundColor: "rgba(0, 0, 0, 0.5)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               zIndex: 1000,
             }}
             onClick={handleCloseModal}
           >
             <motion.div
               className="modal-content"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.8, opacity: 0 }}
               transition={{ duration: 0.1 }}
               style={{
                 backgroundColor: "#fff",
                 padding: "20px",
                 borderRadius: "10px",
                 maxWidth: "500px",
                 width: "90%",
                 boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                 position: "relative", // For positioning the close icon
               }}
               onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
             >
               {/* Close "X" Button */}
               <CloseOutlined
                 style={{
                   position: "absolute",
                   top: "10px",
                   right: "10px",
                   fontSize: "20px",
                   cursor: "pointer",
                   color: "#333",
                 }}
                 onClick={handleCloseModal}
               />
 
 {success ? (
   <motion.div
   initial={{ scale: 0.8, opacity: 0 }}
   animate={{ scale: 1, opacity: 1 }}
   exit={{ scale: 0.8, opacity: 0 }}
   style={{
     display: "flex",
     flexDirection: "column",
     alignItems: "center",
     justifyContent: "center",
     textAlign: "center",
     padding: "20px",
   }}
 >
   {/* Modern SVG Checkmark */}
   <motion.div
     initial={{ scale: 0.6 }}
     animate={{ scale: 1 }}
     transition={{ duration: 1.2, ease: "easeInOut" }} // Slower animation
     style={{ marginBottom: "20px" }}
   >
     <svg
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24"
       fill="none"
       stroke="green"
       strokeWidth="3"
       strokeLinecap="round"
       strokeLinejoin="round"
       style={{
         width: "100px", // Twice the size
         height: "100px", // Twice the size
         color: "green",
       }}
     >
       <circle cx="12" cy="12" r="10" stroke="currentColor" />
       <path d="M9 12l2 2 4-4" stroke="currentColor" />
     </svg>
   </motion.div>
 
   {/* Success Text */}
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ delay: 0.5, duration: 1.2 }} // Matches slower animation timing
     style={{
       fontSize: "18px",
       fontWeight: "bold",
       color: "#333",
     }}
   >
     New Customer was created!
   </motion.div>
 </motion.div>
 
 
 ) : (
               <Form
                 layout="vertical"
                 onFinish={handleFormSubmit}
                 style={{ marginTop: "20px" }}
               >
            <Form.Item
   label="Name"
   name="name"
   rules={[{ required: true, message: "Please enter a name!" }]}
 >
   <Input 
     placeholder="Enter name" 
     prefix={<UserOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} 
   />
 </Form.Item>
 
 <Form.Item
   label="Address"
   name="address"
   rules={[{ required: false }]}
   theme="dark"
 >
   <Input 
     placeholder="Enter address" 
     theme="dark"
     prefix={<HomeOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} 
   />
 </Form.Item>
 
 <Form.Item
   label="Email"
   name="email"
   rules={[{ required: false }]}
 >
   <Input 
     placeholder="Enter email" 
     prefix={<MailOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} 
   />
 </Form.Item>
 
 <Form.Item
   label="Alert"
   name="alert"
   rules={[{ required: false }]}
 >
   <Select 
     placeholder="Please choose"
     prefix={<BellOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} // Select doesn't have a direct prefix, but prefixIcon mimics this style
   >
     <Select.Option value="yes">Yes</Select.Option>
     <Select.Option value="no">No</Select.Option>
   </Select>
 </Form.Item>
 
 <Form.Item
   label="Contact Point"
   name="contactPoint"
   rules={[{ required: false }]}
 >
   <Input 
     placeholder="Enter contact point" 
     prefix={<PhoneOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} 
   />
 </Form.Item>
 <Form.Item
  name="passvendor"
  label="Please enter customer's password."
  rules={[{ required: false}]}
>
  <Input 
    placeholder="Enter passvendor" 
    prefix={<KeyOutlined style={{ color: "#62420E" }} className="mr-1 text-lg"/>} 
  />
</Form.Item>
 <Form.Item
  label="Comment"
  name="comment"
  rules={[{ required: false }]}
>
  <Input.TextArea 
    placeholder="Enter comment" 
    rows={3} 
  />
</Form.Item>
 
 
                 <Form.Item>
                 <AntButton
                     type="primary"
                     htmlType="submit"
                     style={{ width: "100%" }}
                     loading={loading} // Show spinner on button
                   >
                     {loading ? "Submitting..." : "Add New Customer"}
                   </AntButton>
 
                 </Form.Item>
               </Form>
               )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
       <AnimatePresence>
        {isDeleteOpen && (
          <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose} className="dark">
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onDeleteClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteCustomer} isLoading={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
       <ErrorPopup 
         message={capitalizeFirstLetter(errorMessage)} 
         onClose={() => setErrorMessage("")} 
       />

<div className="pt-10">
  {customers.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       {customers.map((customer, index) => {
              const totalShipped = countTrackingNumbersForCustomer(customer._id);;
              const totalReturned =  countTrackingNumbersForCustomer2(customer._id);;
              const totalValue = 0; // Calculate if needed based on your data structure
             
              console.log("matchingShipmentsForCustomer",matchingShipmentsForCustomer)


        return (
          <motion.div
            key={customer._id} // Use customer._id for key
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }}
            className="col-span-1"
          >
           <Card 
            disableRipple={true} 
            isPressable 
            onPress={() => {
              setSelectedCustomer(customer);
              onCustomerDetailsOpen();
            }}
            className="w-full dark border "
          >
  <CardBody style={{ display: "flex", justifyContent: "space-between" }}>
    <div className="flex">
      <div style={{ flex: 2 }}>
        <h3><strong className="text-base text-amber-700">{customer.name}</strong> </h3>
        <p>Address: <span className="text-gray-500">{customer.address}</span></p>
        <p>Email: <span className="text-gray-500">{customer.email}</span></p>
        <p>Alert: <span className="text-gray-500">{customer.alert ? "Yes" : "No"}</span></p>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
          {/* Circle for Shipped */}
          <p className="mb-1">You Shipped</p>
          <Button color="primary" variant="flat" >
            <span>{totalShipped.toFixed(0)}</span>
          </Button>
        </div>
        <div className="ml-6" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
          {/* Circle for Returned */}
          <p className="mb-1">They Returned</p>
          <Button color="danger" variant="flat" >
            <span>{totalReturned.toFixed(0)}</span>
          </Button>
        </div>
      
      </div>
    </div>
    {/* Delete Icon positioned at the bottom right */}
    {/* <div className="absolute bottom-2 right-2">
    <DeleteIcon 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeletionId(customer._id); 
                            onDeleteOpen(); // Changed from onOpen to onDeleteOpen
                          }} 
                          className="cursor-pointer text-red-500 w-5 h-5"
                        />
    </div> */}
  </CardBody>
</Card>
<AnimatePresence>
  {isCustomerDetailsOpen  && (
    <Modal isOpen={isCustomerDetailsOpen} onClose={onCustomerDetailsClose} className="dark" size="4xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-base">{selectedCustomer.name}</h2>
            <div className="absolute bottom-8 right-2">
              <Button 
                color="danger"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setDeletionId(selectedCustomer._id); 
                  onDeleteOpen(); 
                }} 
                className="cursor-pointer z-50"
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </ModalHeader>
        <ModalBody style={{ minHeight: '600px' }}>
          <div className="flex flex-col justify-center mb-4">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(key) => setActiveTab(key)}
              className="w-full flex justify-center"
            >
              <Tab key="products" title="Products">
          
                <div>
                <div className="flex text-gray-400 mb-2 item-center">
  <p className="text-gray-200 mr-1">Address:</p>
  {isEditingAddress ? (
    <InlineEditField 
      value={editedAddress} 
      setValue={setEditedAddress} 
      onSave={() => handleUpdateField(selectedCustomer._id, 'address', editedAddress, setIsEditingAddress)}
      onCancel={() => setIsEditingAddress(false)}
    />
  ) : (
    <InlineTextField 
      text={selectedCustomer.address || "No Address"} 
      onEdit={() => setIsEditingAddress(true)}
    />
  )}
</div>
<div className="flex text-gray-400 mb-2">
  <p className="text-gray-200 mr-1">Email:</p>
  {isEditingEmail ? (
    <InlineEditField 
      value={editedEmail} 
      setValue={setEditedEmail} 
      onSave={() => handleUpdateField(selectedCustomer._id, 'email', editedEmail, setIsEditingEmail)}
      onCancel={() => setIsEditingEmail(false)}
    />
  ) : (
    <InlineTextField 
      text={selectedCustomer.email || "No Email"} 
      onEdit={() => setIsEditingEmail(true)}
    />
  )}

</div>
<div className="mt-6">
{matchingShipmentsForCustomer && matchingShipmentsForCustomer.length > 0 ? (
   <>
                              <Table 
                                aria-label="Shipments for Customer"
                                classNames={{
                                  wrapper: "min-h-[200px]", // Adjust height as needed
                                }}
                              >
                                <TableHeader>
                                  <TableColumn key="trackingNumber">Tracking Number</TableColumn>
                                  <TableColumn key="products">Products</TableColumn>
                                  <TableColumn key="hub">Hub</TableColumn>
                                  <TableColumn key="vendor">Vendor</TableColumn>
                                  <TableColumn key="createdAt">Created At</TableColumn>
                                  <TableColumn key="delivery_status">Delivery Status</TableColumn>
                                </TableHeader>
                                <TableBody items={matchingShipmentsForCustomer}>
                                  {(item) => (
                                    <TableRow key={item.trackingNumber}>
                                      <TableCell>{item.trackingNumber}</TableCell>
                                      <TableCell>
                                        {item.products.map((product) => (
                                          <div key={product.id}>{`${product.name} (Qty: ${product.quantity})`}</div>
                                        ))}
                                      </TableCell>
                                      <TableCell>{item.hub}</TableCell>
                                      <TableCell>{item.vendor || 'No Vendor'}</TableCell>
                                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                      <TableCell>{item.delivery_status}</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                                <div className="flex justify-center mt-4">
                                <Pagination
                                  total={totalPages}
                                  page={currentPage}
                                  onChange={(page) => setCurrentPage(page)}
                                  showControls
                                  showShadow
                                  color="warning"
                                  variant="flat"
                                />
                              </div>
                                 </>
                            ) : (
                              <p>No shipments found for this customer.</p>
                            )}
</div>       
                </div>
              </Tab>
              <Tab key="notes" title="Notes">
  <div className="p-4">
    <div className="mb-4">
      <Input 
        value={newNote}
        
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note..."
        onPressEnter={handleAddNote} // Add note on Enter key press
        endContent={
          <Button 
            color="waring" 
            variant="solid" 
            size="sm" 
            onClick={handleAddNote}
          >
            Add
          </Button>
        }
      />
    </div>
    <div className="overflow-y-auto max-h-[380px] pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {selectedCustomer && selectedCustomer.comment && selectedCustomer.comment.length > 0 ? (
        selectedCustomer.comment
          .sort((a, b) => new Date(b.creationdate) - new Date(a.creationdate))
          .map((comment, index) => (
            <div key={index} className="mb-2 border rounded-xl p-3 bg-zinc-950">
              <p className="text-gray-200">{comment.text}</p>
              <p className="text-xs text-gray-500">{new Date(comment.creationdate).toLocaleString()}</p>
            </div>
          ))
      ) : (
        <p className="text-gray-400">No comments available.</p>
      )}
    </div>
  </div>
</Tab>
            </Tabs>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )}
</AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center w-full pt-16   ">
      <img src={logo} alt="No customers available" className="mb-4 mt-[7%] w-[450px] h-[450px] mb-10 object-cover" />
      <p className="text-center text-lg text-gray-300">No Customers found. Why not start by adding your first one?</p>
    </div>
  )}
</div>

    </div>
  

  )
}

export default Customers
