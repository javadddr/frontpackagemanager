import React, { useState, useEffect } from 'react';
import { useHubs } from "../HubsContext";
import { Select } from 'antd';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';
import {  InputNumber } from 'antd'; 
const { Option } = Select;

function OrderShip({ setSelectedProducts, selectedOrder,setUpdatedItems, setSelectedOrder, selectedCustomerId, setSelectedCustomerId }) {
  const { orders, products, customers } = useHubs();

  // Filter out orders with tracking_numbers field
  const filteredOrders = orders.filter(order => {
    return !order.items.every(item => item.quantity === item.shipped);
  });
console.log("orders",orders)
  const formatOption = (order) => `${order.orderId} - ${order.internalPO || 'No PO'}`;

  const handleQuantityChange = (value, item) => {

 
  
    // Update the state with new quantity for this specific item
    setUpdatedItems(prevItems => {
      const updatedItem = {
        ...item,
        shipped: value  // Assuming 'value' is the new quantity
      };
      const newItems = prevItems.filter(i => i._id !== item._id);
      return [...newItems, updatedItem];
    });
  };
  const handleSelectChange = (value) => {
    const foundOrder = filteredOrders.find(order => formatOption(order) === value);
    setSelectedOrder(foundOrder);
    if (foundOrder) {
      // Update products
      const productsFromOrder = foundOrder.items.map(item => ({
        id: item.item,
        quantity: item.quantity
      }));
      setSelectedProducts(productsFromOrder);

      // Update customer
      if (foundOrder.customer) {
        setSelectedCustomerId(foundOrder.customer);
      } else {
        setSelectedCustomerId(null); // or some default behavior if customer is not specified
      }
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Product not found';
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    return customer ? customer.name : 'Customer not found';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };
  const onChange = (value) => {
    console.log('changed', value);
    console.log('item._id', item._id);
    console.log('changed', item.quantity);
    
    
  };



  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 ">
      <div className="w-full md:w-1/3 mr-32 mt-6">
        <div className='text-gray-900 pb-6 '>
          Select your order (You need to first create an order. If you don’t have an order, click "Previous," then "Next," and choose "Not an order").
        </div>
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Select an Order"
          optionFilterProp="children"
          onChange={handleSelectChange}
          filterOption={(input, option) => 
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filteredOrders.map((order) => (
            <Option key={order._id} value={formatOption(order)}>
              {formatOption(order)}
            </Option>
          ))}
        </Select>
       
         {selectedOrder && 
         <div className='flex flex-col'>
         <div>Customer: {getCustomerName(selectedOrder.customer)}  </div>
         <div>Internal PO: {selectedOrder.internalPO || 'No PO'}  </div>
         <div>Order Date: {formatDate(selectedOrder.orderDate)}  </div>
         <div>Payment Status: {selectedOrder.paymentStatus}  </div>
         
         </div>
         }
          
        
      </div>
  
        { selectedOrder && <div className="mb-2 md:w-1/3">
                <strong className="text-gray-600 ">Items:</strong>
                <ul className="list-disc pl-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="text-gray-600">
                     <spnan className="font-semibold text-yellow-600"> {getProductName(item.item)}</spnan> - Quantity: {item.quantity}<br></br>
                      Already Shipped: {item.shipped}
                      <br></br>
                      How many do you want to send now?
                      <InputNumber 
                        min={0} 
                        max={item.quantity-item.shipped} 
                        defaultValue={item.quantity-item.shipped} 
                        onChange={(value) => handleQuantityChange(value, item)}
                      />
                      <br></br>-------------------------
                    </div>
                  ))}
                </ul>
              </div>}
    </div>
  );
}

export default OrderShip;