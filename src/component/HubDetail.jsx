import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import Hcomment from "./Hcomment";
import Hdashboard from "./Hdashboard";
import Hgeneral from "./Hgeneral";
import Hproduct from "./Hproduct";

export default function HubDetail({isDark, isOpen, onClose, hubs, hubid }) {
  const [activeTab, setActiveTab] = useState("general");

  // Find the hub with the matching ID
  const hub = hubs.find((item) => item._id === hubid);
  if (!hub) return null;

  // Animation variants for content
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <Hgeneral isDark={isDark} hub={hub} hubid={hubid} />;
      case "products":
        return <Hproduct isDark={isDark} hub={hub} hubid={hubid} />;
      case "comments":
        return <Hcomment isDark={isDark} hub={hub} hubid={hubid} />;
      case "dashboard":
        return <Hdashboard isDark={isDark} hub={hub}  hubid={hubid}/>;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="opaque"  motionProps={{
      variants: {
        enter: {
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        },
        exit: {
          y: -20,
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: "easeIn",
          },
        },
      },
    }} size="4xl" className={`${isDark?"dark":"light"}`}>
      <ModalContent>
        <ModalHeader className={`text-center text-lg font ${isDark?"text-gray-300":"text-gray-900"} `}>
          {hub.name}{" "}
          <span
            className={`ml-2 px-0 -leading-1 py-0 rounded-md  ${
              hub.alert ? " text-red-600" : "text-green-600"
            }`}
          >
            - Alert: {hub.alert ? "Yes" : "No"}
          </span>
        </ModalHeader>
        <ModalBody>
          {/* Tab Navigation */}
          <div className="flex justify-center gap-5 text-lg text-gray-600">
            {["general", "products", "comments"].map((tab) => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer  ${
                  activeTab === tab ? "text-blue-500" : "text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            ))}
          </div>

          <Divider className="" />

          {/* Animated Tab Content */}
          <motion.div
            key={activeTab} // Trigger animation when activeTab changes
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            className="h-[470px] overflow-y-auto " // Fixed height and scrollable content
          >
            {renderTabContent()}
          </motion.div>
        </ModalBody>
        <ModalFooter>
       
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
