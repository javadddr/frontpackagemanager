import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody, Input } from "@nextui-org/react";
import { useHubs } from "../HubsContext";

function StepTwo({selectedVendorId,selectedCustomerId,selectedHubId,selectedProducts,setSelectedVendorId,setSelectedCustomerId,setSelectedHubId,setSelectedProducts}) {
  const { hubs,vendors,customers,products } = useHubs();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [searchTerm3, setSearchTerm3] = useState('');

    // Filter vendors
    const filteredVendors = vendors.filter(vendor => {
      const searchTermLower = searchTerm2.toLowerCase();
      return (
        vendor.name.toLowerCase().includes(searchTermLower) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchTermLower)) ||
        (vendor.contactPoint && vendor.contactPoint.toString().includes(searchTermLower)) ||
        (vendor.address.toLowerCase().includes(searchTermLower))
      );
    });
  
    // Filter customers
    const filteredCustomers = customers.filter(customer => {
      const searchTermLower = searchTerm2.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTermLower) ||
        (customer.email && customer.email.toLowerCase().includes(searchTermLower)) ||
        (customer.contactPoint && customer.contactPoint.toString().includes(searchTermLower)) ||
        (customer.address.toLowerCase().includes(searchTermLower))
      );
    });
  
      // Filter products
  const filteredProducts = products.filter(product => {
    const searchTermLower = searchTerm3.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTermLower) ||
      (product.unitprice && product.unitprice.toString().includes(searchTermLower)) ||
      (product.value && product.value.toString().includes(searchTermLower))
    );
  });


  const toggleProductSelection = (productId, quantity = 1) => {
    setSelectedProducts(prevProducts => {
      const existingProduct = prevProducts.find(p => p.id === productId);
      if (existingProduct) {
        // If the product exists, remove it
        return prevProducts.filter(p => p.id !== productId);
      } else {
        // If it's new, add it with the quantity
        return [...prevProducts, { id: productId, quantity: parseInt(quantity) }];
      }
    });
  };
  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, quantity: parseInt(quantity) || 0 } : p
      )
    );
  };

  // Animation variants inspired by motion.dev
  const cardVariants = {
    initial: { 
      opacity: 0,
      scale: 0.9,
      rotate: -5,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.2 }
    }
  };

  // Function to filter hubs
  const filteredHubs = hubs.filter(hub => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      hub.name.toLowerCase().includes(searchTermLower) ||
      (hub.email && hub.email.toLowerCase().includes(searchTermLower)) ||
      (hub.contactPoint && hub.contactPoint.toString().includes(searchTermLower))||
      (hub.address.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className='flex min-h-[215px]  justify-between p-3'>
      <div className='flex-1 border-r-2 px-3 '>
        <h3 className='text-gray-900 font-bold mb-0 text-sm'>Shipping hub</h3>
        <Input 
          clearable 
          bordered 
          placeholder="Search hubs..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          css={{ mb: "20px",p:"10px" }}
          classNames={{
           
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
           
            ],}}
        />
        <div className="hub-list overflow-y-auto max-h-[215px] scrollbar-hide  bg-white p-2 pt-3">
          <AnimatePresence>
            {filteredHubs.map((hub) => (
              <motion.div
                key={hub._id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={cardVariants}
                whileHover={{ scale: 1.003 }} 
                onClick={() => setSelectedHubId(hub._id)}
                className={`mb-2 cursor-pointer ${selectedHubId === hub._id ? 'selected' : ''}`}
              >
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between m-1">
                      <div>
                        <h4 className="font-semibold text-xs">{hub.name}</h4>
                        <p className="text-gray-400 text-xs">{hub.address}</p>
                        {hub.alert && <p className="text-red-500">Alert: Active</p>}
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full mr-2 ${selectedHubId === hub._id ? 'bg-blue-500' : 'bg-white-900 border border-slate-600'}`}
                        style={{ transition: 'background-color 0.2s' }}
                      ></div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className='flex-1 border-r-2 px-6'>
      <h3 className='text-gray-900 font-bold mb-0 text-sm'>Receiver (Customer or Vendor)</h3>
        <Input 
          clearable 
          bordered 
          placeholder="Search customers/vendors..." 
          value={searchTerm2} 
          onChange={(e) => setSearchTerm2(e.target.value)}
          css={{ mb: "20px" }}
          classNames={{
           
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
           
            ],}}
        />
        <div className="receiver-list overflow-y-auto max-h-[215px] scrollbar-hide p-2 pt-4">
          <AnimatePresence>
            {filteredVendors.map((vendor) => (
              <motion.div
                key={vendor._id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={cardVariants}
                whileHover={{ scale: 1.003 }} 
                onClick={() => setSelectedVendorId(vendor._id)}
                className={`mb-2 cursor-pointer ${selectedVendorId === vendor._id ? 'selected' : ''}`}
              >
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between m-1">
                      <div>
                        <h4 className="font-semibold text-xs">{vendor.name}</h4>
                        <p className="text-gray-400 text-xs"> <span className='text-lime-800'>vendor</span>-{vendor.address}</p>
                        {vendor.alert && <p className="text-red-500">Alert: Active</p>}
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full mr-2 ${selectedVendorId === vendor._id ? 'bg-blue-500' : 'bg-white-900 border border-slate-600'}`}
                        style={{ transition: 'background-color 0.2s' }}
                      ></div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer._id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={cardVariants}
                whileHover={{ scale: 1.003 }} 
                onClick={() => setSelectedCustomerId(customer._id)}
                className={`mb-2 cursor-pointer ${selectedCustomerId === customer._id ? 'selected' : ''}`}
              >
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between m-1">
                      <div>
                      <h4 className="font-semibold text-xs">{customer.name}</h4>
                      <p className="text-gray-400 text-xs"><span className='text-lime-800'>Customer</span>-{customer.address}</p>
                        {customer.alert && <p className="text-red-500">Alert: Active</p>}
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full mr-2 ${selectedCustomerId === customer._id ? 'bg-blue-500' : 'bg-white-900 border border-slate-600'}`}
                        style={{ transition: 'background-color 0.2s' }}
                      ></div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className='flex-1 px-6'>
      <h3 className='text-gray-900 font-bold mb-0 text-sm'>Product and Quantity</h3>
        <Input 
          clearable 
          bordered 
          placeholder="Search products..." 
          value={searchTerm3} 
          onChange={(e) => setSearchTerm3(e.target.value)}
          css={{ mb: "20px" }}
          classNames={{
           
            input: [
              "bg-transparent",
              "text-black/90 dark:text-white/90",
              "placeholder:text-default-700/50 dark:placeholder:text-white/60",
           
            ],}}
        />
        <div className="product-list overflow-y-auto max-h-[215px] scrollbar-hide  p-2 pt-4">
        <AnimatePresence>
          {filteredProducts.map((product) => (
         
    <motion.div
    key={product._id}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={cardVariants}
    whileHover={{ scale: 1.003 }} 
    onClick={(e) => {
      if (!e.target.closest('input')) {
        toggleProductSelection(product._id);
      }
    }}
    className={`mb-2 cursor-pointer ${selectedProducts.some(p => p.id === product._id) ? 'selected' : ''}`}
  >
    <Card>
      <CardBody>
        <div className="flex items-center justify-between m-1">
          <div>
          <h4 className="font-semibold text-xs">{product.name}</h4>
          <p className="text-gray-400 text-xs">Hub: {product.hub || 'N/A'}</p>
          <p className="text-gray-400 text-xs">Quantity left: {product.currentInventory || 'N/A'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className={`w-5 h-5 rounded-full mb-1 ${selectedProducts.some(p => p.id === product._id) ? 'bg-blue-500' : 'bg-white border border-gray-600'}`}
              style={{ transition: 'background-color 0.2s' }}
            ></div>
            {selectedProducts.some(p => p.id === product._id) && (
              <Input 
                type="number"
                placeholder="Quantity"
                min="1"
                value={selectedProducts.find(p => p.id === product._id)?.quantity || 1}
                onChange={(e) => updateProductQuantity(product._id, e.target.value)}
                className="w-24 px-2 py-1 text-sm  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

export default StepTwo;