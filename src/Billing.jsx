import React, { useState,useEffect } from "react";
import { Tabs, Tab, Button } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiArrowGoBackFill } from "react-icons/ri";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {  Input, Textarea } from "@nextui-org/react";
// Sample onetime plans
const onetime = [
  { shipments: 1000, price: 99, billing: 'Year' },
  { shipments: 5000, price: 399, billing: 'Year' },
  { shipments: 10000, price: 699, billing: 'Year' },
  { shipments: 20000, price: 1199, billing: 'Year' },
  { shipments: 50000, price: 2499, billing: 'Year' },
  { shipments: 100000, price: 3999, billing: 'Year' },
];

export default function BillingPage() {
  const [selectedKey, setSelectedKey] = useState("onetime");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedUnlimitedPlan, setSelectedUnlimitedPlan] = useState(null); // To track selected unlimited plan
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const handleTabChange = (key) => setSelectedKey(key);
  const [userEmail, setUserEmail] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [message, setMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      setUserEmail(user.email);
    }
  }, []);
  const handleSelectPlan = (shipments) => {
    // Set the selected one-time plan and reset the unlimited plan to null
    setSelectedPlan(shipments);
    submitTextRecord(`Selected plan: ${shipments} ${localStorage.getItem("user")} shipments-app`);
    setSelectedUnlimitedPlan(null);
  };
  const handleSendRequest = () => {
    setIsLoading(true); // Start loading
    const subject = `Pricing Plan: ${formatShipments(selectedPlan.shipments)} Shipments - $${selectedPlan.price.toFixed(0)}`;
    
    const emailData = {
      email: userEmail,
      subject: subject, // The subject is the selected plan price
      message: message, // The custom message from the user
    };
  
    // Send the email data to the backend API
    fetch(`${backendUrl}/api/email/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsRequestSent(true);
        setIsLoading(false); // Stop loading
        setMessage(""); // Clear the message field
      })
      .catch((error) => {
        console.error("Error sending request:", error);
        setIsLoading(false); // Stop loading
      });
  };
  



  const submitTextRecord = async (text) => {
    const apiUrl = "https://api.dynamopackage.com/api/textrecords";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit text: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Text recorded successfully:", result);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleSelectUnlimitedPlan = (shipments) => {
    // Set the selected one-time plan and reset the unlimited plan to null
    setSelectedUnlimitedPlan("unlimited")
    setSelectedPlan(null);
  };
  // Function to format the shipments as "1k", "5k", etc.
  const formatShipments = (shipments) => {
    if (shipments >= 1000) {
      return (shipments / 1000).toFixed(0) + "k"; // Formats as 1.0k, 5.0k, etc.
    }
    return shipments; // For values under 1000, show the original number
  };

  return (
    <div className="relative bg-gray-900 isolate px-6 pt-0 lg:px-8">
         <Link to="/">
      <Button
        className="w-[220px]"
        color="danger"
        variant="ghost"
        style={{
          position: "fixed",
          top: "30px",
          left: "30px",
          fontSize: "15.8px",
        }}
      >
        <RiArrowGoBackFill size={50} /> Head Back to the App
      </Button>
    </Link>
      <div className="h-[100vh] pt-20 bg-gray-900">
        <div className="mx-auto max-w-7xl px-0 lg:px-8 bg-gray-900">
          <div className="mx-auto max-w-2xl sm:text-center bg-gray-900">
            <h2 className="text-3xl font-bold tracking-tight mb-7 text-gray-100 sm:text-4xl">
              Simple Pricing and Full Access
            </h2>
            <p className="text-center text-gray-100">
              <strong className="text-lime-200">All</strong> plans include{" "}
              <strong className="text-lime-200">complete</strong> access to our
              platform. <br /> The only difference in pricing depends on how
              many shipments you would like to track.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl sm:mt-10 lg:mx-0 lg:flex lg:max-w-none bg-gray-900">
            <div className="p-8 pt-0 sm:p-0 lg:flex-auto">
              <Tabs
                aria-label="Plan Options"
                color="secondary"
                variant="bordered"
                className="flex justify-center mb-5"
                selectedKey={selectedKey}
                onSelectionChange={handleTabChange}
              >
                <Tab key="onetime" title="One-Time Purchase" />
                <Tab key="unlimited" title="Unlimited Tracking" />
              </Tabs>

              {/* One-Time Purchase Plan Details */}
              {selectedKey === "onetime" && (
                <div className="mt-5 bg-slate-950  rounded-3xl">
                  <div className=" text-gray-100 w-full rounded-lg shadow-md p-6 space-y-4 flex justify-between">
                    <div>
                    <div className="font-bold text-lg pt-6 pl-16 w-[440px]">
      Select the number of shipments you’d like to track.
      <br />
      <span className="text-gray-500 text-sm">
        If you are a company, please enter your EIN (VAT) number to exempt yourself from paying the 19% value-added tax.{" "}
        <Tooltip
          content={
            <span className=" text-sm w-[400px] p-3">
              We are a Germany-based company, and the German government requires all private customers and companies 
              within Germany to pay a 19% value-added tax. However, for companies outside of Germany, this tax can be 
              waived if a valid EIN (VAT) number is provided. Please note that the EIN is public information.
            </span>
          }
          placement="top"
          hideArrow
          className="ml-1 dark"
        >
         <InfoCircleOutlined className="text-blue-500 cursor-pointer" />
        </Tooltip>
      </span>
    </div>
                      <div className="grid grid-cols-2 gap-4 p-16 pt-6 pb-3">
                        
                      {onetime.map((plan) => (
                        <Button
                          key={plan.shipments}
                          radius="sm"
                          variant="ghost"
                          color={selectedPlan === plan.shipments ? "primary" : "warning"}
                          className="p-4"
                          size="lg"
                          style={{ fontSize: 18, width: 170, height: 60 }}
                          onClick={() => {
                            handleSelectPlan(plan);  // Select the plan
                            onOpen();  // Open the modal
                          }}
                        >
                          {formatShipments(plan.shipments)} Shipments
                          <br />
                          ${plan.price.toFixed(0)}
                        </Button>
                      ))}

                  
                      </div>
                      </div>
                      <div className=" w-[700px] space-y-3">
                      <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-yellow-100">How Capacity Works?</h3>
                        <p className="text-gray-300 mt-2">
                          Capacity is based on unique tracking numbers. Each unique tracking number will consume one unit of capacity, regardless of how long it takes for the shipment to be delivered or how many updates you request. It will always be counted as a single shipment.
                        </p>
                      </div>

                      <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-yellow-100">Deleting a Tracking Number After Delivery:</h3>
                        <p className="text-gray-300 mt-2">
                          When you track a shipment and delete the tracking number after delivery, it will not restore the used capacity. This is because the API, database, and our system have already processed the tracking number. The capacity will remain unchanged even after deletion.
                        </p>
                      </div>

                      <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-yellow-100">How Long is Capacity Valid?</h3>
                        <p className="text-gray-300 mt-2">
                          Capacity is valid for 12 months from the date of purchase. After 12 months, any unused capacity will expire and cannot be used.
                        </p>
                      </div>
                      </div>

                  </div>
                </div>
              )}

              {/* Unlimited Tracking Plan Details */}
              {selectedKey === "unlimited" && (
                <div className="mt-5 bg-slate-950 rounded-3xl">
                  <div className="max-w-lg mx-auto text-gray-100 rounded-lg shadow-md p-6 space-y-4">
                 
                    <div className="flex flex-col justify-center items-center">
                 <div className="flex justify-center items-center text-lg">Would you like to track unlimited packages from FedEx, UPS, and USPS? Purchase this plan today and enjoy seamless tracking! </div>
                    <Button
                      key="unlimitedTracking"
                      radius="sm"
                      variant="ghost"
                      color={selectedUnlimitedPlan === "unlimited" ? "primary" : "warning"}
                      className="p-4 mt-4"
                      size="lg"
                      style={{ fontSize: 16, width: 170, height: 60 }}
                      onClick={handleSelectUnlimitedPlan}
                    >
                      Unlimited Tracking
                      <br />
                      $2499/ Month
                    </Button>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                 <div className="text-lg"> Would you like to track unlimited packages, but your carriers are not FedEx, UPS, or USPS? Contact us for custom integration options!   </div>
                 <Link to="https://www.dynamopackage.com/contact" target="_blank">
                  <Button
                    key="contactUs"
                    radius="sm"
                    variant="ghost"
                    color="warning"
                    className="p-4"
                    size="lg"
                    style={{ fontSize: 17, width: 170, height: 60 }}
                  >
                    Contact Us
                  </Button>
                </Link>
                  </div>
                   
                  <p className="text-sm text-gray-400">
                      To qualify, you must meet one or both of these two criteria:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-400">
                      <li>Your carriers include FedEx, UPS, USPS, or all three.</li>
                      <li>We need to integrate your carrier portal with our app.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark" size="3xl">
      <ModalContent>
        {(onClose) => (
          <>
            {isRequestSent ? (
              // Success Message
              <ModalBody>
              <div className="text-center text-gray-300 text-lg mt-4">
                Your request was sent to us, we will contact you as soon as possible.
              </div>
        
              {/* Animated Check Mark */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} // Starts with opacity 0 and moves from bottom
                animate={{ opacity: 1, y: 0 }}   // Fades in and moves to normal position
                transition={{ duration: 0.5 }}    // Duration of the animation
                className="flex justify-center mt-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-12 h-12 text-green-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
        
              <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  onClose(); // Close the modal
                  setIsRequestSent(false); // Reset the request sent state
                }}
              >
                Close
              </Button>

              </ModalFooter>
            </ModalBody>
            ) : (
              // Form Content
              <>
                <ModalHeader className="flex text-yellow-600 text-lg">
                  You selected <strong className="px-1">{selectedPlan.shipments}</strong> shipments.
                </ModalHeader>
                <ModalBody>
                  <p>
                    <br />
                    <div className="text-gray-300 -mt-6 p-1 rounded-3xl shadow-3xl text-base">
                      You will be able to track {selectedPlan.shipments} packages in 12 months after purchasing.
                    </div>

                    <div className="text-gray-300 mt-0 p-1 rounded-3xl shadow-3xl text-base">
                      You will be charged a one-time fee of ${selectedPlan.price}. Once your capacity is used up or after
                      12 months, you will need to make a new purchase (there is no subscription).
                    </div>
                  </p>

                  {/* Email Input */}
                  <Input
                    readOnly
                    value={userEmail}
                    label="Email"
                    placeholder="Your email"
                    className="mt-4"
                    fullWidth
                  />

                  {/* Textarea for custom message */}
                  <Textarea
                    label="Message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    className="mt-4"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>

                  <Button color="primary" onPress={handleSendRequest} isLoading={isLoading}>
                    {isLoading ? "Sending..." : "Send The Request"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>

      </div>
    </div>
  );
}
