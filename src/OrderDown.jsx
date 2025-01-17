import React, { useState, useEffect, useRef } from "react";
import { useHubs } from "./HubsContext";
import { Card, CardBody, CardFooter, Button, Input, useDisclosure } from "@nextui-org/react";
import {SearchIcon} from "./SearchIcon";
import OrderModal from "./OrderModal";
const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];

function OrderDown() {
  const { orders, setOrders,products,shipments, fetchOrders,customers } = useHubs();
  const [statusPipelines, setStatusPipelines] = useState({
    'Pending': [],
    'Processing': [],
    'Shipped': [],
    'Delivered': [],
    'Canceled': []
  });
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  useEffect(() => {
    const processOrders = async () => {
      const newStatusPipelines = statusOrder.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {});
  
      for (const order of orders) {
        // Check if the order has any tracking numbers
        if (order.tracking_numbers && order.tracking_numbers.length > 0) {
          const trackingNumber = order.tracking_numbers[0].trackingNumber; // Assuming we check the first tracking number
          const matchedShipment = shipments.find(s => s.tracking_number === trackingNumber);
          
          if (matchedShipment) {
            // If the shipment exists and is delivered, update order status to 'Delivered'
            if (matchedShipment.delivery_status === 'Delivered') {
              await updateOrderStatus(order._id, 'Delivered');
            } else {
              // If not delivered but has a tracking number, update to 'Shipped'
              await updateOrderStatus(order._id, 'Shipped');
            }
          }
        }
        // After potentially updating the order, place it in its correct pipeline
        newStatusPipelines[order.status].push(order);
       
      }
      setStatusPipelines(newStatusPipelines);
      setNeedsUpdate(false);
    };
  
    if (needsUpdate) {
      processOrders();
    }
  }, [orders,needsUpdate, shipments]);
  
  // Helper function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner': localStorage.getItem("key")
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update order status');
      // Update local state instead of fetching all orders
      setOrders(prevOrders => prevOrders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      setNeedsUpdate(true);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  useEffect(() => {
    const newStatusPipelines = statusOrder.reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status);
      return acc;
    }, {});
  
    setStatusPipelines(newStatusPipelines);
  }, [orders]);

  // Function to get customer name from customer ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Customer not loaded';
  };
  const getCustomerName2 = (customerId) => {
    const customer = products.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Customer not loaded';
  };
  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.setData('text/plain', order._id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const orderId = e.dataTransfer.getData('text');
    const orderToMove = draggedOrder;

    if (orderToMove && !['Shipped', 'Delivered'].includes(newStatus)) {
      const oldStatus = orderToMove.status;
      const newPipelines = { ...statusPipelines };
      newPipelines[oldStatus] = newPipelines[oldStatus].filter(o => o._id !== orderId);
      newPipelines[newStatus].push({ ...orderToMove, status: newStatus });
      setStatusPipelines(newPipelines);

      // Update the order status in the backend
      // This part assumes you have an endpoint to update order status
      fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner': localStorage.getItem("key") // Assume this is how you pass owner info
        },
        body: JSON.stringify({ status: newStatus })
      })

      .catch(error => console.error("Error updating order status:", error));
    }
    setDraggedOrder(null);
  };
 // Function to filter cards based on search term
 const filterCards = (order) => {
  const searchContent = [
    order.orderId,
    getCustomerName(order.customer),
    new Date(order.fulfillmentTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    getCustomerName2(order.itemsList),
    order.quantity,
    order.orderPriority
  ].join(' ').toLowerCase();
  return searchContent.includes(searchTerm.toLowerCase());
};


const handleCardClick = (order) => {
  console.log("order",order)
  setSelectedOrder(order);
  onOpen();
};



  return (
    <div>
         <div className="mb-4 mt-4 flex justify-end items-end ml-[85%]">
          <Input
  isClearable
  radius="lg"
  style={{color:"white"}}
  classNames={{
  
    input: [
      "bg-gray-800",
      "text-base", // Changed to white and larger text
  "flex",
 
    ],
    innerWrapper: "bg-transparent",
    inputWrapper: [
      "shadow-md",
      "bg-default-800/50",
      "dark:bg-default/60",
      "backdrop-blur-xl",
      "backdrop-saturate-200",
      
      "group-data-[focus=true]:bg-default-600/50",
      "dark:group-data-[focus=true]:bg-default/60",
      "group-data-[hover=true]:bg-default-600/50",
      "dark:group-data-[hover=true]:bg-default/60",
      "!cursor-text",
      "max-w-[240px]",

    ],
  }}
  placeholder="Type to search..."
  onClear={() => setSearchTerm('')}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  startContent={
    <SearchIcon className="w-5 h-5 text-white pointer-events-none flex-shrink-0" />
  }
/>
      

      </div>
    <div className="bg-zinc-900  p-1">
  
      <div className="flex justify-between mb-1 ">
        {statusOrder.map((status) => (
          <Button 
            key={status}
        variant="flat"
            color={ 
              status === 'Pending' ? 'primary' :
              status === 'Processing' ? 'warning' :
              status === 'Shipped' ? 'secondary' :
              status === 'Delivered' ? 'success' :
              'danger' // Canceled
            }
            
            className="w-[90%]"
          >
             {status} ({statusPipelines[status].length})
          </Button>
        ))}
      </div>

      {/* Pipelines */}
      <div className="flex overflow-x-auto space-x-4 p-4">
        {statusOrder.map((status) => (
          <div 
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
       
            className="flex-1 min-w-[200px] bg-gray-800 rounded-lg border border-gray-600 h-[620px] overflow-y-auto overflow-x-hidden p-1 scrollbar-hide"
          >
            {statusPipelines[status].filter(filterCards).map((order) => (
              <div  onClick={() => handleCardClick(order)}>
              <Card 
                key={order._id} 
                draggable={status !== 'Shipped' && status !== 'Delivered'}
                onDragStart={(e) => handleDragStart(e, order)}
                radius="sm"
                className={`dark mt-2 shadow-3xl z-50 relative ${new Date(order.fulfillmentTime) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && order.status !== 'Canceled' ? 'bg-red-200  text-black' : ''} `}
                style={{
                  userSelect: "none",
                  cursor: status !== 'Shipped' && status !== 'Delivered' ? 'pointer' : 'default',
                }}
              >
                <div className={`absolute top-1 right-1 z-10 text-xs font-bold p-1  shadow-3xl  ${order.orderPriority === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                  {order.orderPriority === 'High' ? 'High' : 'Normal'}
                </div>
                <CardBody>
                  <h5 className="text-xs"><span className={`${new Date(order.fulfillmentTime) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && order.status !== 'Canceled' ? 'text-gray-600' : 'text-gray-400'}`}>Order ID:</span> {order.orderId}</h5>
                  <p className="p-0 m-0" ><span className={`${new Date(order.fulfillmentTime) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && order.status !== 'Canceled' ? 'text-gray-600' : 'text-gray-400'}`}>Customer:</span> {getCustomerName(order.customer)}</p>
                  <p className="p-0 m-0 "><span className={`${new Date(order.fulfillmentTime) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && order.status !== 'Canceled' ? 'text-gray-600' : 'text-gray-400'}`}>Fulfillment Time: </span>{new Date(order.fulfillmentTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || 'Not given'}</p>

                </CardBody>
               
              </Card>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    {selectedOrder && <OrderModal order={selectedOrder} isOpen={isOpen} onOpenChange={onOpenChange} setSelectedOrder={setSelectedOrder} fetchOrders={fetchOrders}/>}
    </div>
  );
}

export default OrderDown;