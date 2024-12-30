import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Divider} from "@nextui-org/react";
import { Button,Chip } from "@nextui-org/react";
import { CloseOutlined } from "@ant-design/icons"; // Import Close icon
import CreateShipVen from "../src/component/CreateShipVen";
import ShipDown2 from "./ShipDown2";
const MotionButton = motion(Button);
import { useHubs } from "./HubsContext";
import { Progress } from "@nextui-org/react";
import { Drawer, ButtonToolbar, IconButton, Placeholder } from 'rsuite';
import { CheckCircleOutlined ,CloseCircleTwoTone} from '@ant-design/icons';

import { AiOutlineCloseCircle } from "react-icons/ai";

function VenReturn() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState([]);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const [couriers, setCouriers] = useState([]);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [placement, setPlacement] = useState();
  const [filteredCarriers, setFilteredCarriers] = useState([]); // Filtered for the dropdown
  const { fetchShipments,shipments,setShipments,returnVen,fetchBackendShipments,fetchBackendShipments1,fetchBackendShipments2 } = useHubs();
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await fetch(`${backendUrl}/couriers`); // Your server URL
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch couriers");
        }

        setCouriers(data.documents);
        setFilteredCarriers(data.documents)
    
      } catch (err) {
       
      } finally {

      }
    };

    fetchCouriers();
  }, [isModalOpen]);



  return (
    <div className="pt-6 bg-zinc-900" style={{ minHeight: "100vh"}}>
      {/* Trigger Button */}
      <div className="flex justify-end mr-5">
      <MotionButton
        color="primary"
        variant="shadow"
        animate={{ scale: 1.02 }}
        transition={{ duration: 0.09 }}
        onClick={handleOpenModal}
        style={{ width: '170px',height:'35px' }}
      >
        Add New Return
      </MotionButton>
      {/* <MotionButton
        color="warning"
        variant="flat"
        className="ml-2"
        animate={{ scale: 1.02 }}
        transition={{ duration: 0.09 }}
        onClick={handleOpenModal}
      >
        Send New Return
      </MotionButton> */}
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
                maxWidth: "1200px",
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

        
              {/* Render the CreateShip component here */}
              <CreateShipVen handleCloseModal={handleCloseModal} setOpen={setOpen} setProgress={setProgress} setMessages={setMessages} fetchBackendShipments2={fetchBackendShipments2} fetchBackendShipments1={fetchBackendShipments1} fetchBackendShipments={fetchBackendShipments} fetchShipments={fetchShipments} setShipments={setShipments} trackingNumbers={trackingNumbers} setTrackingNumbers={setTrackingNumbers} couriers={couriers} filteredCarriers={filteredCarriers} setFilteredCarriers={setFilteredCarriers}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <Drawer size="xs" placement={placement} open={open} onClose={() => setOpen(false)}>
        <Drawer.Header>
          <Drawer.Title>Processing Shipments</Drawer.Title>
        
        </Drawer.Header>
        <Drawer.Body>
        
 
      <div className="bg-white p-0 m-0 overflow-y-auto">

        <div className="mb-4">
          <Progress 
            value={progress} 
            label={`${progress}%`} 
            color="success"
          />
        </div>
        <Divider  />
        <div className="text-left text-black">
        {messages.map((msg, index) => (
  <motion.p 
    key={index}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    style={{ color: msg.includes("Error") ? 'red' : 'inherit' }} // Change text color to red for errors
  >
    {msg.includes("Successfully") ? (
      <CheckCircleOutlined style={{ marginRight: '5px', color: 'green' }} />
    ) : msg.includes("No capacity") ? (
      <AiOutlineCloseCircle style={{ marginRight: '5px', color: 'red' }} />
    ) : msg.includes("Error") ? (
      <AiOutlineCloseCircle style={{ marginRight: '5px', color: 'red' }} />
    ) : null}
    {msg}
  </motion.p>
))}
        </div>
      </div>

        </Drawer.Body>
      </Drawer>
  <ShipDown2 shipments={shipments} returnVen={returnVen} fetchShipments={fetchShipments}/>
    </div>
  );
}

export default VenReturn;

