import React, { useState, useEffect } from 'react';
import { useHubs } from "../HubsContext";
import { Select } from 'antd';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';

const { Option } = Select;

function OrderShip({ setSelectedProducts, selectedOrder, setSelectedOrder, selectedCustomerId, setSelectedCustomerId }) {
  const { orders, products, customers } = useHubs();

  // Filter out orders with tracking_numbers field
  const filteredOrders = orders.filter(order => order.tracking_numbers == null || order.tracking_numbers.length === 0);
console.log("orders",orders)
  const formatOption = (order) => `${order.orderId} - ${order.internalPO || 'N/A'}`;

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

  return (
    <div className="flex flex-col md:flex-row justify-center items-start p-4 space-y-4 md:space-y-0 md:space-x-4">
      <div className="w-full md:w-1/3">
        <div className='text-gray-900 pb-6 pt-16'>
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
      </div>
      {selectedOrder && (
        <motion.div 
          className="w-full md:w-2/3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg  h-[280px]">
            <CardBody>
              <h2 className="text-base font-semibold mb-0 text-gray-900 dark:text-gray-100">{selectedOrder.orderId}</h2>
              <p className="text-gray-600 m-0 p-0"><strong>Customer:</strong> {getCustomerName(selectedOrder.customer)}</p>
              {/* ... other order details ... */}
              <p className="text-gray-600 m-0 p-0"><strong>Internal PO:</strong> {selectedOrder.internalPO || 'N/A'}</p>
              <p className="text-gray-600 m-0 p-0"><strong>Customer PO:</strong> {selectedOrder.customerPO || 'N/A'}</p>
              <p className="text-gray-600 m-0 p-0"><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
              <p className="text-gray-600 m-0 p-0"><strong>Fulfillment Time:</strong> {formatDate(selectedOrder.fulfillmentTime)}</p>
              <p className="text-gray-600 m-0 p-0"><strong>Status:</strong> {selectedOrder.status}</p>
              <p className="text-gray-600 m-0 p-0"><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
              <div className="mb-2">
                <strong className="text-gray-600 ">Items:</strong>
                <ul className="list-disc pl-4">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="text-gray-600">
                      {getProductName(item.item)} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Add more fields as needed */}
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default OrderShip;