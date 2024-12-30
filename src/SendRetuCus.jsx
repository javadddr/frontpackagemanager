import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Input } from "@nextui-org/react";
import { useHubs } from "./HubsContext";

function SendRetuCus({ isOpen, onClose,selectedVendor }) {
  const { customers, products,vendors } = useHubs();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [CUSRETURN, setCUSRETURN] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [custEmail, setCustEmail] = useState(selectedVendor.email);
  const [isSuccess, setIsSuccess] = useState(false); // New state for success message
  const [returnLink, setReturnLink] = useState(''); // New state for the link
  const backendUrl2 = import.meta.env.VITE_FRONTEND_URL;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
      setCUSRETURN(file);
    } else {
      alert("Please upload a PDF file not exceeding 5MB.");
    }
  };

  const handleSendReturn = async () => {
    if (selectedVendor && selectedVendor.email) { // Only check for customer and email
      setIsSending(true);
      
      const formData = new FormData();
      formData.append('customerId', selectedVendor._id);
      if (selectedProduct) formData.append('productId', selectedProduct); // Optional
      formData.append('customerEmail', selectedVendor.email);
      if (CUSRETURN) formData.append('file', CUSRETURN); // Optional
  
      try {
        const owner = localStorage.getItem("key"); // Retrieve owner from local storage
        const response = await fetch(`${backendUrl}/api/returns`, {
          method: "POST",
          headers: {
            'owner': owner, // Send the owner in the headers
          },
          body: formData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send return.");
        }
  
        const data = await response.json();
        console.log("Return sent successfully:", data);
  
        // Generate the link
        const randomLetters = () => Math.random().toString(36).substring(2, 6).toUpperCase();
        const link = `${backendUrl2}/return/${randomLetters()}${owner}${randomLetters()}/${selectedVendor._id}/${selectedProduct ? selectedProduct : 'no-product'}/${data.returnId}`;  // Handle case where product might not be selected
        setReturnLink(link);
        setIsSuccess(true);
      } catch (error) {
        console.error("Error sending return:", error);
        alert("Error sending return: " + error.message);
      } finally {
        setIsSending(false);
      }
    } else {
      alert("Please select a customer and ensure the email is available before sending.");
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReturnLink('');
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setCUSRETURN(null);
    setCustEmail(''); // Resetting this since it's derived from selectedCustomer
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="3xl" className='dark'>
      <ModalContent className='dark'>
        {(onClose) => (
          <>
            {isSuccess ? (
              <>
                <ModalHeader>Return Sent Successfully</ModalHeader>
                <ModalBody>
                  <p>Your vendor can access the webpage using the link below. They need to open the link, enter the password you created for them (the password is: {selectedVendor.passvendor}), log in, and send the return.</p>
                  <div className='w-[200px]'>
                    <a href={returnLink} className="text-blue-600" target="_blank" rel="noopener noreferrer">
                      {returnLink}
                    </a>
                  </div>
              
                </ModalBody>
                <ModalFooter>
               
                <Button 
                    color="secondary" 
                    variant="light"
                   
                    onClick={() => {
                      navigator.clipboard.writeText(returnLink).then(() => {
                        alert('Link copied to clipboard!');
                      });
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button color="primary" onPress={handleClose}>Close</Button>
              
                </ModalFooter>
              </>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1 dark">Send New Return to</ModalHeader>
                <ModalBody>
                  <Select 
                    label="Confirm The Vendor"
                    placeholder="Choose a customer"
                    className="max-w-xs mb-4 dark "
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value);
                    }}
                  >
                  
                      <SelectItem key={selectedVendor._id} value={selectedVendor._id} textValue={selectedVendor.name} className='bg-gray-700'> 
                        {selectedVendor.name} <br></br> <span className='text-gray-700 '>{selectedVendor.address}</span>
                      </SelectItem>
                 
                  </Select>

                  <Input 
                    value={selectedVendor.email}
                    readOnly
                    label="Vendor's Email"
                    className="max-w-xs mb-4"
                  />
                  <Select 
                    label="Select a Product"
                    placeholder="Choose a product"
                    className="max-w-xs dark "
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                    }}
                  >
                    {products && products.map(product => (
                      <SelectItem key={product._id} value={product._id} textValue={product.name} className='dark bg-gray-700' >
                        {product.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <p>Shipping label:</p>
                  <Input 
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="mb-4"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={handleSendReturn} isLoading={isSending}>
                    {isSending ? "Sending..." : "Send Return"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SendRetuCus;