import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button,useDisclosure } from "@nextui-org/react";
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input, Button as AntButton } from "antd";
import { useHubs } from "./HubsContext";
import { Select, Spin } from "antd";
import Loading from "./Loading";
import { useMemo } from "react";
import HubDetail from "./component/HubDetail"
import logo from "./hub.jpeg"
import { Card, CardBody } from "@nextui-org/react";
import { 
  UserOutlined, 
  HomeOutlined, 
  MailOutlined, 
  BellOutlined, 
  PhoneOutlined, 
  CommentOutlined 
} from "@ant-design/icons";

const MotionButton = motion(Button);

function Hubs({isDark}) {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { hubs, fetchHubs,setHubs,backendShipments,backendShipments1,backendShipments2 } = useHubs();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
///ERROR MOTION
const countTrackingNumbersForCustomer = (customerId) => {

  return backendShipments.reduce((total, shipment) => {
    
    if (shipment.hub && shipment.hub === customerId) {
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
  
    if (shipment.hub && shipment.hub === customerId) {
      const trackingNumbersCount = shipment.tracking_numbers ? 
        shipment.tracking_numbers.map(tracking => tracking.trackingNumber).length 
        : 0;
      return total + trackingNumbersCount;
    }
    return total;
  }, 0);
};
const countTrackingNumbersForCustomer3 = (customerId) => {
 
  return backendShipments2.reduce((total, shipment) => {
 
    if (shipment.hub && shipment.hub === customerId) {
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
  const fetchData = async () => {
    await fetchHubs();
    setIsLoading(false);
  };
  fetchData();
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

const sortedHubs = [...hubs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const handleFormSubmit = async (values) => {
  setLoading(true);
  setErrorMessage(""); // Clear previous errors

  const existingHub = hubs.find(hub => hub.name.toLowerCase() === values.name.toLowerCase());
  if (existingHub) {
    setErrorMessage("A hub with this name already exists.");
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
    // If no comment was entered, set it to an empty array
    values.comment = [];
  }
  const nameoftheinput=values.name

  try {
    const owner = localStorage.getItem("key"); // Retrieve owner key from local storage
    if (!owner) {
      throw new Error("Owner key is missing from local storage.");
    }

    const response = await fetch(`${backendUrl}/api/hubs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, owner }), // Include owner in the payload
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add new hub");
    }

    const data = await response.json();
   

    // Optionally, update the hubs state directly:
    setHubs(prevHubs => [...prevHubs, data]);

    // Alternatively, you can refetch hubs if you want the entire list to be up-to-date
    await fetchHubs(); // Make sure this fetches the latest hubs and updates the context

    setSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setSuccess(false);
    }, 3000);
  } catch (error) {
    console.error("Error creating hub:", error.message);
    setErrorMessage(error.message); // Trigger the error popup
    setTimeout(() => setErrorMessage(""), 5000); // Auto-close after 5 seconds
  } finally {
    setLoading(false);
  }
};


const [selectedHubId, setSelectedHubId] = useState(null);

const [comments, setComments] = useState([{ text: '', creationdate: new Date() }]);



  return (
 
    <div className={`pt-6 pl-4 pr-4 ${isDark?"bg-zinc-900":"bg-white"} `} style={{ minHeight: "100vh"}}>
   <div className="flex justify-end">
      <MotionButton
        color="primary"
        variant="shadow"
        animate={{ scale: 1.02 }}
        transition={{ duration: 0.09 }}
        onClick={handleOpenModal}
        style={{ width: '170px',height:'35px' }} // Using inline style for width
      >
        Add New Hub
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
    New hub was created!
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
                    {loading ? "Submitting..." : "Add New Hub"}
                  </AntButton>

                </Form.Item>
              </Form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ErrorPopup 
        message={capitalizeFirstLetter(errorMessage)} 
        onClose={() => setErrorMessage("")} 
      />
{isLoading ? (
    <Loading />
) : (
<div className="pt-10">
  {sortedHubs.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sortedHubs.map((hub, index) => {
        // Calculate total product value
        const totalShipped = countTrackingNumbersForCustomer(hub._id);;
        const totalReturned =  countTrackingNumbersForCustomer2(hub._id);;
        const totalReturned2 =  countTrackingNumbersForCustomer3(hub._id);;
        const totalValue = 0; // Calculate if needed based on your data structure

        return (
          <motion.div
            key={hub._id} // Use hub._id for key to prevent warnings about non-unique keys
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }} // Adjusted delay for smoother animation in grid view
            className="col-span-1" // Ensure each item spans exactly one column
          >
            <Card disableRipple={true} isPressable onPress={() => {
                setSelectedHubId(hub._id);
                onOpen();
              }}
              className={`w-full ${isDark?"dark":"light"} border`}
            >
              <CardBody style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="flex">
                  <div style={{ flex: 2 }}>
                    <h3 ><strong className="text-base text-amber-700">{hub.name}</strong> </h3>
                    <p>Address: <span className="text-gray-500">{hub.address}</span></p>
                    <p>Email: <span className="text-gray-500">{hub.email}</span></p>
                    <p>Alert: <span className="text-gray-500">{hub.alert ? "Yes" : "No"}</span></p>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
                      {/* Circle for Shipped */}
                      <p className="mb-1">Shipped</p>
                      <Button color="primary" variant="flat" >
                        <span>{totalShipped.toFixed(0)}</span>
                      </Button>
                    </div>
                    <div className="ml-2" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> 
                      {/* Circle for Returned */}
                      <p className="mb-1">Returned</p>
                      <Button color="danger" variant="flat" >
                        <span>{(totalReturned+totalReturned2).toFixed(0)}</span>
                      </Button>
                    </div>
                   
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center w-full ">
      <img src={logo} alt="No hubs available" className=" mb-4 mt-[7%] w-[500px] h-[500px] object-cover rounded-full" />
      <p className="text-center text-lg text-gray-300">No Hubs found. Why not start by adding your first one?</p>
    </div>
  )}
</div>
)}
<HubDetail isDark={isDark} isOpen={isOpen} onClose={onClose} hubs={hubs} hubid={selectedHubId}/>
    </div>
    
  );
}

export default Hubs;
