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

  const [needsUpdate, setNeedsUpdate] = useState(true);
  useEffect(() => {
    const processOrders = async () => {
      const newStatusPipelines = statusOrder.reduce((acc, status) => {
        acc[status] = [];
        return acc;
      }, {});
  
      for (const order of orders) {
        let newStatus = order.status;
  
        const allItemsShipped = order.items.every(item => item.quantity === item.shipped);
  
        if (allItemsShipped && order.tracking_numbers && order.tracking_numbers.length > 0) {
          const trackingStatuses = order.tracking_numbers.map(tn => {
            const matchedShipment = shipments.find(s => s.tracking_number === tn.trackingNumber);
            return matchedShipment ? matchedShipment.delivery_status : 'Unknown';
          });
  
          console.log(`Order ${order.orderId}: All Shipped: ${allItemsShipped}, Tracking Statuses:`, trackingStatuses);
  
          if (trackingStatuses.length > 0) {
            const allDelivered = trackingStatuses.every(status => status === 'Delivered');
            const anyTransitOrCreated = trackingStatuses.some(status => 
              status === 'Transit' || status === 'Created'
            );
  
            if (allDelivered) {
              newStatus = 'Delivered';
            } else if (anyTransitOrCreated) {
              newStatus = 'Shipped';
            }
          }
  
          if (newStatus !== order.status) {
            console.log(`Updating order ${order.orderId} from ${order.status} to ${newStatus}`);
            await updateOrderStatus(order._id, newStatus);
          }
        }
  
        newStatusPipelines[newStatus].push(order);
      }
  
      setStatusPipelines(newStatusPipelines);
      setNeedsUpdate(false);
    };
  
    processOrders(); // Run immediately on mount and whenever dependencies change
  }, [orders, shipments, fetchOrders]);
  // Helper function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const owner = localStorage.getItem("key");
  
    try {
      console.log(`PATCHing order ${orderId} with status ${newStatus}, owner: ${owner}`);
      const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner': owner
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Failed to update order status: ${response.status}`);
      }
  
      console.log(`Order ${orderId} updated successfully:`, data.order);
      await fetchOrders(); // Sync with server
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error.message);
      // Optionally revert local state if needed, but fetchOrders should handle it
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

  const handleDrop = async (e, newStatus) => {
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
  
      console.log("orderId", orderId);
      console.log("newStatus", newStatus);
  
      try {
        // Update the order status in the backend
        const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-owner': localStorage.getItem("key")
          },
          body: JSON.stringify({ status: newStatus })
        });
  
        if (!response.ok) {
          throw new Error('Failed to update order status');
        }
  
        // Fetch updated orders from backend to sync frontend state
        await fetchOrders();
      } catch (error) {
        console.error("Error updating order status:", error);
        // Optionally revert UI change on failure
        setStatusPipelines(statusPipelines); // Reset to previous state
      }
    }
    setDraggedOrder(null);
  };
 // Function to filter cards based on search term
 const filterCards = (order) => {
  const searchContent = [
    order.orderId,
    getCustomerName(order.customer),
    new Date(order.fulfillmentTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    order.quantity,
    order.orderPriority
  ].join(' ').toLowerCase();
  return searchContent.includes(searchTerm.toLowerCase());
};

const handleCardClick = (order) => {
  console.log("order", order);
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