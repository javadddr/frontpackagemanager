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
  const { customers,backendShipments,backendShipments1, fetchCustomers,setCustomers } = useHubs();


  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [errorMessage, setErrorMessage] = useState("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [isLoading, setIsLoading] = useState(true);
  const {isOpen, onOpen, onClose} = useDisclosure(); // For opening customer details
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure(); // For delete confirmation
  const [deletionId, setDeletionId] = useState(null); // State to hold the ID of the customer to be deleted
  const [isDeleting, setIsDeleting] = useState(false); // State for loading state during deletion
 
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
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


        return (
          <motion.div
            key={customer._id} // Use customer._id for key
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }}
            className="col-span-1"
          >
           <Card disableRipple={true}  onPress={() => {
  setSelectedHubId(customer._id);

}}
className="w-full dark border relative" // Add `relative` to position the delete icon absolutely
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
    <div className="absolute bottom-2 right-2">
    <DeleteIcon 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeletionId(customer._id); 
                            onDeleteOpen(); // Changed from onOpen to onDeleteOpen
                          }} 
                          className="cursor-pointer text-red-500 w-5 h-5"
                        />
    </div>
  </CardBody>
</Card>
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
