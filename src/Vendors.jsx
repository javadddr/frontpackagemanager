import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button,useDisclosure,Tabs,Tab,CheckboxGroup,Checkbox } from "@nextui-org/react";
import {   Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input, Button as AntButton } from "antd";
import { useHubs } from "./HubsContext";
import { Select, Spin } from "antd";
import { useMemo } from "react";
import { EditIcon } from "./EditIcon";
import { KeyOutlined } from '@ant-design/icons';
import Loading from "./Loading";
import { DeleteIcon } from "./DeleteIcon";
import { Info } from 'react-feather';
import { Link } from 'react-router-dom';
import logo from "./ven.jpg"
import ChatVen2 from "./ChatVen2";
import {Tooltip} from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";
import ChatVen from "./ChatVen";
import { 
  UserOutlined, 
  HomeOutlined, 
  MailOutlined, 
  BellOutlined, 
  PhoneOutlined, 
  CommentOutlined 
} from "@ant-design/icons";
import SendRetuCus from './SendRetuCus';
const MotionButton = motion(Button);

function Vendors() {

  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSendModalOpen, setSendModalOpen] = useState(false);
const [activeTab, setActiveTab] = useState('settings');
  const { vendors, fetchVendors,setVendors ,backendShipments,backendShipments2} = useHubs();
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure(); 
  const { isOpen: isVendorDetailsOpen, onOpen: onVendorDetailsOpen, onClose: onVendorDetailsClose } = useDisclosure();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletionId, setDeletionId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false); // State for loading state during deletion
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [editedAlert, setEditedAlert] = useState(false);
  const [isEditingContactPoint, setIsEditingContactPoint] = useState(false);
  const [editedContactPoint, setEditedContactPoint] = useState("");
  const [isEditingPassvendor, setIsEditingPassvendor] = useState(false);
  const [editedPassvendor, setEditedPassvendor] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    if (selectedVendor) {
      setEditedAddress(selectedVendor.address || "");
      setEditedEmail(selectedVendor.email || "");
      setEditedAlert(selectedVendor.alert || false);
      setEditedContactPoint(selectedVendor.contactPoint || "");
      setEditedPassvendor(selectedVendor.passvendor || "");
    }
  }, [selectedVendor]);
 // Keep a local state for the selected days to manage UI state
 const [localSelectedDays, setLocalSelectedDays] = useState([]);

 useEffect(() => {
   // Update local state when selectedVendor changes or when modal opens
   if (selectedVendor) {
     setLocalSelectedDays(selectedVendor.selectedDays || []);
   }
 }, [selectedVendor]);
 
 const InlineEditField = ({ value, setValue, onSave, onCancel }) => {
  const inputRef = React.useRef(null);

  useEffect(() => {
    // Focus on the input when it enters edit mode
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex items-center ">
      <input 
        ref={inputRef} // Use ref to focus on the input
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        className="mr-2 bg-transparent border-b border-gray-300 text-gray-400"
     
      />
      <Button size="sm" color="success" variant="flat" onPress={onSave}   style={{ width: '30px',height:'20px' }}>✓</Button>
      <Button size="sm" color="default" variant="flat" onPress={onCancel} style={{ width: '30px',height:'20px' }}>✕</Button>
    </div>
  );
};

const InlineTextField = ({ text, onEdit }) => (
  <>
    <span className="text-gray-500 cursor-pointer " onClick={onEdit}>{text}</span>

  </>
);
  const countTrackingNumbersForCustomer = (customerId) => {

    return backendShipments.reduce((total, shipment) => {
   
      if (shipment.vendor && shipment.vendor === customerId) {
        const trackingNumbersCount = shipment.tracking_numbers ? 
          shipment.tracking_numbers.map(tracking => tracking.trackingNumber).length 
          : 0;
        return total + trackingNumbersCount;
      }
      return total;
    }, 0);
  };
  const countTrackingNumbersForCustomer2 = (customerId) => {
 
    return backendShipments2.reduce((total, shipment) => {
   
      if (shipment.vendor && shipment.vendor === customerId) {
        const trackingNumbersCount = shipment.tracking_numbers ? 
          shipment.tracking_numbers.map(tracking => tracking.trackingNumber).length 
          : 0;
        return total + trackingNumbersCount;
      }
      return total;
    }, 0);
  };
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  useEffect(() => {
 
    fetchVendors();
  }, []);

  const capitalizeFirstLetter = (message) => {
    if (!message) return "";
    return message.charAt(0).toUpperCase() + message.slice(1);
  };

  const handleUpdateField = async (vendorId, field, newValue, setEditState) => {
    try {
      const response = await fetch(`${backendUrl}/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: newValue }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update ${field}`);
      }
  
      const updatedVendor = await response.json();
      console.log(`${field} updated:`, updatedVendor);
      
      // Update the local state immediately
      setSelectedVendor(prevVendor => ({
        ...prevVendor,
        [field]: newValue
      }));
  
      // Optionally fetchVendors for global state update
      await fetchVendors();
  
      setEditState(false); // Exit edit mode
    } catch (error) {
      console.error(`Error updating ${field}:`, error.message);
      // Optionally show error to the user
    }
  };
  const handleUpdateSelectedDays = async (vendorId, newSelectedDays) => {
    try {
      const response = await fetch(`${backendUrl}/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedDays: newSelectedDays }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update selected days');
      }
  
      const updatedVendor = await response.json();
      console.log('Vendor updated:', updatedVendor);
      await fetchVendors(); // Refresh the list to show updated data
    } catch (error) {
      console.error("Error updating selected days:", error.message);
      // Optionally show error to the user
    }
  };
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
  const handleFormSubmit = async (values) => {
    setLoading(true);
    setErrorMessage(""); // Clear previous errors
  
    // Transform the comment
    if (values.comment) {
      const currentDate = new Date().toISOString();
      values.comment = [{
        text: values.comment,
        creationdate: currentDate
      }];
    } else {
      // If no comment was entered, set it to an empty array
      values.comment = [];
    }
  
    // Convert alert string to boolean
    values.alert = values.alert === "yes";
  
    const owner = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!owner) {
      setErrorMessage("Owner key is missing from local storage.");
      setLoading(false);
      return;
    }
  
    // Add owner to the values before sending
    values.owner = owner;
 

  
    try {
      const response = await fetch(`${backendUrl}/api/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create new vendor");
        
      }
  
      const data = await response.json();

  
      // Update the hubs state if necessary (assuming this context might include vendors)
      setVendors(prevHubs => [...prevHubs, data]);
  
      // Fetch updated data or update UI state
      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating vendor:", error.message);
      setErrorMessage(error.message); // Trigger the error popup
      setTimeout(() => setErrorMessage(""), 5000); // Auto-close after 5 seconds
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCustomer = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/vendors/${deletionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete vendor");
      }

      // Update state or refetch customers
      await fetchVendors();
      setErrorMessage("vendor deleted successfully.");
    } catch (error) {
      console.error("Error deleting vendor:", error.message);
      setErrorMessage(error.message);
    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };

const dodi = (vendor) => {
console.log("vendor",vendor)

}
  return (
 
    <div className="pt-6 pl-4 pr-4 bg-zinc-900" style={{ minHeight: "100vh"}}>
    <div className="flex justify-end">
      <div>
       <MotionButton
         color="primary"
         variant="shadow"
         animate={{ scale: 1.02 }}
         transition={{ duration: 0.09 }}
         onClick={handleOpenModal}
         style={{ width: '170px',height:'35px' }}
       >
         Add New Vendor
       </MotionButton>
       </div>
  
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
     New Vendor was created!
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
            rules={[{ required: false }]}
          >
            <div className="flex items-center">
             
              <span className="ml-2">Please enter vendor's password.</span>
              <Tooltip className="w-[300px] text-gray-800" size="sm" color="default" variant="flat" content={`You can share a webpage with a vendor where they can send packages directly to you. To access that page, they will need to enter this password.`}>
                <Info size={17} className="inline  text-gray-800 cursor-pointer"/>
              </Tooltip>
            </div>
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
              {loading ? "Submitting..." : "Add New Vendor"}
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
                <p>Are you sure you want to delete this vendor? This action cannot be undone.</p>
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
  {vendors.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {vendors.map((vendor, index) => {
        const totalShipped = countTrackingNumbersForCustomer(vendor._id);;
        const totalReturned =  countTrackingNumbersForCustomer2(vendor._id);;
        const totalValue = 0; // Calculate if needed based on your data structure

        return (
          <motion.div
            key={vendor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="col-span-1"
          >
            
            <Card 
                disableRipple={true} 
                isPressable 
                onPress={() => {
                  setSelectedVendor(vendor);
                  onVendorDetailsOpen();
                }}
                className="w-full dark border h-[160px]"
              >
              <CardBody style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="flex">
                  <div style={{ flex: 2 }}>
                    <h3><strong className="text-base text-amber-700">{vendor.name}</strong> </h3>
                    <p>Address: <span className="text-gray-500">{vendor.address}</span></p>
                    <p>Email: <span className="text-gray-500">{vendor.email}</span></p>
                    <p>Alert: <span className="text-gray-500">{vendor.alert ? "Yes" : "No"}</span></p>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
                      {/* Circle for Shipped */}
                      <p className="mb-1">You Shipped</p>
                      <Button color="primary" variant="flat" >
                        <span>{totalShipped.toFixed(0)}</span>
                      </Button>
                    </div>
                    <div className="ml-10" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
                      {/* Circle for Returned */}
                      <p className="mb-1">They Returned</p>
                      <Button color="danger" variant="flat" >
                        <span>{totalReturned.toFixed(0)}</span>
                      </Button>
                    </div>
                 
                  </div>
                </div>
                {/* <div className="absolute bottom-2 right-2">
                <Link to={{
                    pathname: '/return',
                    state: { bypassPassword: true }  // This will pass state
                  }}>
                    <Button size="sm" color="warning" variant="flat">Connect to vendor</Button>
                  </Link>
                </div> */}
                <div className="absolute bottom-2 right-2">
                  <DeleteIcon 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setDeletionId(vendor._id); 
                    onDeleteOpen(); // Changed from onOpen to onDeleteOpen
                  }} 
                  className="cursor-pointer text-red-500 w-5 h-5"
                />
                </div>
              </CardBody>
            </Card>
            <AnimatePresence>
  {isVendorDetailsOpen && (
    <Modal isOpen={isVendorDetailsOpen} onClose={onVendorDetailsClose} className="dark" size="4xl">
      <ModalContent>
        {selectedVendor && (
          <>
            <ModalHeader>
              <h2 className="text-base">{selectedVendor.name}</h2>
            </ModalHeader>
            <ModalBody style={{ minHeight: '600px' }}>
              {/* Here you implement your tab logic for settings and messages */}
              <div className="flex flex-col justify-center mb-4">
                <Tabs 
                  selectedKey={activeTab} 
                  onSelectionChange={(key) => setActiveTab(key)}
                  className="w-full  flex justify-center"
                >
                  <Tab key="settings" title="Settings">
                   <div className="text-base text-orange-800 font-bold mb-3">General Info:</div> 
                   <div className="">
  <div className="flex text-gray-400 mb-2 item-center">
    <p className="text-gray-200 mr-1">Address:</p>
    {isEditingAddress ? (
      <InlineEditField 
        value={editedAddress} 
        setValue={setEditedAddress} 
        onSave={() => handleUpdateField(selectedVendor._id, 'address', editedAddress, setIsEditingAddress)}
        onCancel={() => setIsEditingAddress(false)}
    
      />
    ) : (
      <InlineTextField 
        text={selectedVendor.address || "No Address"} 
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
        onSave={() => handleUpdateField(selectedVendor._id, 'email', editedEmail, setIsEditingEmail)}
        onCancel={() => setIsEditingEmail(false)}
      />
    ) : (
      <InlineTextField 
        text={selectedVendor.email || "No Email"} 
        onEdit={() => setIsEditingEmail(true)}
      />
    )}
  </div>
  <div className="flex text-gray-400 mb-2">
    <p className="text-gray-200 mr-1">Alert:</p>
    {isEditingAlert ? (
      <select 
        value={editedAlert ? "true" : "false"} 
        onChange={(e) => setEditedAlert(e.target.value === "true")}
        className="ml-2 bg-transparent border-b border-gray-300 text-gray-400"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    ) : (
      <span 
        className="text-gray-500 cursor-pointer ml-2"
        onClick={() => setIsEditingAlert(true)}
      >
        {selectedVendor.alert ? "Yes" : "No"}
      </span>
    )}
    {isEditingAlert && (
      <div className="ml-2">
        <Button 
          size="sm" 
          color="success" 
          variant="flat" 
          style={{ width: '30px',height:'20px' }}
          onPress={() => handleUpdateField(selectedVendor._id, 'alert', editedAlert, setIsEditingAlert)}
        >
          ✓
        </Button>
        <Button 
          size="sm" 
          color="default" 
          variant="flat" 
          style={{ width: '30px',height:'20px' }}
          onPress={() => setIsEditingAlert(false)}
        >
          ✕
        </Button>
      </div>
    )}
  </div>
  <div className="flex text-gray-400 mb-2">
    <p className="text-gray-200 mr-1">Contact Point:</p>
    {isEditingContactPoint ? (
      <InlineEditField 
        value={editedContactPoint} 
        setValue={setEditedContactPoint} 
        onSave={() => handleUpdateField(selectedVendor._id, 'contactPoint', editedContactPoint, setIsEditingContactPoint)}
        onCancel={() => setIsEditingContactPoint(false)}
      />
    ) : (
      <InlineTextField 
        text={selectedVendor.contactPoint || "No Contact"} 
        onEdit={() => setIsEditingContactPoint(true)}
      />
    )}
  </div>
  <div className="flex text-gray-400 mb-2">
    <p className="text-gray-200 mr-1">Password:</p>
    {isEditingPassvendor ? (
      <InlineEditField 
        value={editedPassvendor} 
        setValue={setEditedPassvendor} 
        onSave={() => handleUpdateField(selectedVendor._id, 'passvendor', editedPassvendor, setIsEditingPassvendor)}
        onCancel={() => setIsEditingPassvendor(false)}
      />
    ) : (
      <InlineTextField 
        text={selectedVendor.passvendor || "No Password"} 
        onEdit={() => setIsEditingPassvendor(true)}
      />
    )}
  </div>
</div>
                    <div>
                    <div className="mt-10 mb-2">
                    <CheckboxGroup 
                        label={<span className="text-base text-orange-800 font-bold">Weekdays Schedule:</span>}
                        orientation="horizontal"
                        value={localSelectedDays}
                        onChange={(newSelectedDays) => {
                          setLocalSelectedDays(newSelectedDays);
                          handleUpdateSelectedDays(selectedVendor._id, newSelectedDays); // Pass newSelectedDays here
                        }}
                        color="danger"
                        size="sm"
                      >
                      <Checkbox value="Monday">Monday</Checkbox>
                      <Checkbox value="Tuesday">Tuesday</Checkbox>
                      <Checkbox value="Wednesday">Wednesday</Checkbox>
                      <Checkbox value="Thursday">Thursday</Checkbox>
                      <Checkbox value="Friday">Friday</Checkbox>
                      <Checkbox value="Saturday">Saturday</Checkbox>
                      <Checkbox value="Sunday">Sunday</Checkbox>
                    </CheckboxGroup>
                  </div>
                    <MotionButton
                      color="warning"
                      variant="shadow"
                      className="mt-[24%]"
                      animate={{ scale: 1.02 }}
                      transition={{ duration: 0.09 }}
                      onClick={() => setSendModalOpen(true)}
                      style={{ width: '170px',height:'35px' }}
                    >
                      Send New Return
                    </MotionButton>

                    <SendRetuCus isOpen={isSendModalOpen} selectedVendor={selectedVendor} onClose={() => setSendModalOpen(false)} /> 
                  </div>
                  </Tab>
                  <Tab key="messages" title="Messages">
                  <div className="p-4">
                    <ChatVen chats={[]} owner={localStorage.getItem("key")} vendorId={selectedVendor._id} vendor={selectedVendor} />
                    <div className="text-gray-400 mt-2">
                      
                    All chats and messages are encrypted, ensuring your communication remains private. This means that <span className="text-white">if you delete a message, it will be permanently erased and cannot be recovered.</span>
                    </div>
                  </div>
                  </Tab>
                </Tabs>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )}
</AnimatePresence>
          </motion.div>
        );
      })}
   
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center w-full ">
      <img src={logo} alt="No vendors available" className="w-[500px] h-[500px] object-cover" />
      <p className="text-center text-lg text-gray-500">No Vendors found. Why not start by adding your first one?</p>
    </div>
  )}
</div>
    </div>
      
  )
}

export default Vendors
