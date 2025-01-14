import React,{useState} from "react";
import { useHubs } from "./HubsContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  useDisclosure,
} from "@nextui-org/react";
import { TbGrid3X3 } from "react-icons/tb";
import { Card, CardBody } from "@nextui-org/react";
import { FaBox } from "react-icons/fa"; // Example icon, adjust as needed
import { RiUserReceived2Line } from "react-icons/ri";
import { FaSitemap } from "react-icons/fa";
import { FaHourglassEnd } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { VscReferences } from "react-icons/vsc";
import { Form, Input, Button as AntButton } from "antd";
function OrderModal({ order, isOpen, onOpenChange,setSelectedOrder,fetchOrders }) {
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure(); // For delete confirmation
  const { isOpen: isCustomerDetailsOpen, onOpen: onCustomerDetailsOpen, onClose: onCustomerDetailsClose } = useDisclosure();
  const { products,customers } = useHubs();
  const [newNote, setNewNote] = useState(""); 
  const [isDeleting, setIsDeleting] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const handleAddNote = async () => {
    if (!newNote.trim()) return; // Prevent adding empty notes

    try {
      const response = await fetch(`${backendUrl}/api/orders/${order._id}/add-note`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newNote }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const data = await response.json();
    // Update the local state for this order
    setSelectedOrder(prev => ({
      ...prev,
      comment: [...prev.comment, { text: newNote, creationdate: new Date() }]
    }));

    // Optionally re-fetch orders to ensure global state sync if other parts of your app rely on it
    fetchOrders();
    
      setNewNote(""); // Clear the input after adding the note
    } catch (error) {
      console.error("Error adding note:", error);
      // Optionally show an error message to the user
    }
  };
  const [deletionId, setDeletionId] = useState(null);

  const handleDeleteCustomer = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${backendUrl}/api/orders/${deletionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete customer");
      }

      // Update state or refetch customers
      await fetchOrders();
      onOpenChange(false); 
  
    } catch (error) {
      console.error("Error deleting customer:", error.message);

    } finally {
      setIsDeleting(false);
      onDeleteClose();
    }
  };



  const getCustomerName = (customerId) => {
    const customer = customers.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Customer not loaded';
  };
  const getCustomerName2 = (customerId) => {
    const customer = products.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Customer not loaded';
  };



  return (
    <div>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}   className="dark " size="4xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col p-2 pl-4 pt-4 text-base "><div className="reletive">Order Details <p className={`absolute left-32 top-4 ${order.orderPriority==="Normal"?"text-green-500":"text-red-900"}`}>{order.orderPriority}</p></div> </ModalHeader>
            <ModalBody style={{ minHeight: '520px' }}>
  <Tabs aria-label="Order Tabs" className="flex justify-center">
    <Tab key="general" title="General">
      <div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <TbGrid3X3 className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Order ID:</span>
        <span className="text-yellow-500 ml-1">{order.orderId}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <VscReferences className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Internal PO:</span>
        <span className="text-yellow-500 ml-1">{order.internalPO}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Invoice Number:</span>
        <span className="text-yellow-500 ml-1">{order.invoiceNumber}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <RiUserReceived2Line className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Customer:</span> 
        <span className="text-yellow-500">{getCustomerName(order.customer)}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaHourglassEnd className="mr-1 text-blue-500" size={14} />
        <span className="text-gray-100 font-semibold">Fulfillment Time:</span> 
        <span className="text-yellow-500">{new Date(order.fulfillmentTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || 'Not given'}</span>
        <span className="mx-2">--</span>
        <span className="text-gray-100 font-semibold">Order Creation Date:</span> 
        <span className="text-yellow-500">{new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) || 'Not given'}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Payment Status:</span>
        <span className="text-yellow-500 ml-1">{order.paymentStatus}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
        <span className="text-gray-100 font-semibold">Paymen Method:</span>
        <span className="text-yellow-500 ml-1">{order.paymentMethod}</span>
      </div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaSitemap className="mr-1 text-blue-500" size={16} />
          <span className="text-gray-100 font-semibold">Items:</span>
        </div>
        {order.items && order.items.length > 0 ? (
          <Card className="bg-gray-800 text-white rounded-lg shadow-lg mb-4">
            <CardBody>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium">{getCustomerName2(item.item)}</span>
                    <span className="text-sm text-gray-400">Quantity: {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ) : (
          <p className="text-gray-400 text-sm">No items found.</p>
        )}

      </div>
    </Tab>
    <Tab key="notes" title="Notes">
   
    <div className="mb-4 flex">
      <Input 
        value={newNote}
        
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note..."
        onPressEnter={handleAddNote} // Add note on Enter key press
     
      />
           <Button 
            color="secondary" 
            variant="flat" 
            size="sm" 
            onClick={handleAddNote}
            className="ml-2"
          >
            Add Note
          </Button>
    </div>
    <div className="overflow-y-auto max-h-[380px] pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {order && order.comment && order.comment.length > 0 ? (
        order.comment
          .sort((a, b) => new Date(b.creationdate) - new Date(a.creationdate))
          .map((comment, index) => (
            <div key={index} className="mb-2 border rounded-xl p-3 bg-zinc-950">
              <p className="text-gray-200">{comment.text}</p>
              <p className="text-xs text-gray-500">{new Date(comment.creationdate).toLocaleString()}</p>
            </div>
          ))
      ) : (
        <p className="text-gray-400">No comments available.</p>
      )}
    </div>
 
    </Tab>
  </Tabs>
</ModalBody>
            <ModalFooter>
              <Button color="danger"    onClick={(e) => { 
                  e.stopPropagation(); 
                  setDeletionId(order._id); 
                  onDeleteOpen(); 
                }} >
                Delete Order
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>

    {isDeleteOpen && (
          <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose} className="dark">
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this order? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onDeleteClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteCustomer} isLoading={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
    </div>


  );
}

export default OrderModal;