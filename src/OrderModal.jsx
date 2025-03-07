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
import OrderItems from "./OrderItems";
import { TbGrid3X3 } from "react-icons/tb";
import { EditIcon } from "./EditIcon";
import { Card, CardBody } from "@nextui-org/react";
import { FaBox } from "react-icons/fa"; // Example icon, adjust as needed
import { RiUserReceived2Line } from "react-icons/ri";
import { FaSitemap } from "react-icons/fa";
import { FaHourglassEnd } from "react-icons/fa6";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { VscReferences } from "react-icons/vsc";
import { Check } from "lucide-react"
import { AutoComplete } from 'antd';
import { Form, Input, Button as AntButton } from "antd";
function OrderModal({ isDark,order, isOpen, onOpenChange,setSelectedOrder,fetchOrders }) {
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure(); // For delete confirmation
  const { isOpen: isCustomerDetailsOpen, onOpen: onCustomerDetailsOpen, onClose: onCustomerDetailsClose } = useDisclosure();
  const { products,customers } = useHubs();
  const [newNote, setNewNote] = useState(""); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingField, setEditingField] = useState(null); // Tracks which field is currently being edited
  const [customerInput, setCustomerInput] = useState('');
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
    await fetchOrders()
    
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
  const options = [
    {
      value: 'Credit Card',
    },
    {
      value: 'Bank Transfer',
    },
    {
      value: 'Cash on Delivery',
    },
  ];
  const options3 = [
    {
      value: 'Paid',
    },
    {
      value: 'Unpaid',
    },
    {
      value: 'Partially Paid',
    },
  ];
  const options2 = customers.map(customer => ({
    value: customer._id,
    label: customer.name // Assuming 'name' is the customer name property
  }));
  
  const [formData, setFormData] = useState({
    orderId: order.orderId,
    internalPO: order.internalPO || '',
    customerPO: order.customerPO || '',
    orderDate: new Date(order.orderDate).toISOString().split('T')[0],
    fulfillmentTime: order.fulfillmentTime ? new Date(order.fulfillmentTime).toISOString().split('T')[0] : '',
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod || '',
    invoiceNumber: order.invoiceNumber || '',
    customer: order.customer || '',
    discounts: order.discounts,
    orderPriority: order.orderPriority,
    items: order.items || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


 
  const handleUpdateOrder = async () => {
    try {
      // Convert dates to string format for sending to server
      const updatedFormData = { ...formData };
      updatedFormData.orderDate = updatedFormData.orderDate ? new Date(updatedFormData.orderDate).toISOString() : null;
      updatedFormData.fulfillmentTime = updatedFormData.fulfillmentTime ? new Date(updatedFormData.fulfillmentTime).toISOString() : null;
  
      // Prepare the request body
      const body = {
        orderId: updatedFormData.orderId, // Note: You might not want to allow updating orderId, check backend logic
        internalPO: updatedFormData.internalPO,
        customerPO: updatedFormData.customerPO,
        orderDate: updatedFormData.orderDate,
        fulfillmentTime: updatedFormData.fulfillmentTime,
        // status: updatedFormData.status, // Status isn't in your formData, so commenting out
        paymentStatus: updatedFormData.paymentStatus,
        items: updatedFormData.items, // Ensure items are in the correct format
        customer: updatedFormData.customer,
        paymentMethod: updatedFormData.paymentMethod,
        invoiceNumber: updatedFormData.invoiceNumber,
        discounts: updatedFormData.discounts,
        orderPriority: updatedFormData.orderPriority,
        // notes: updatedFormData.notes, // Notes isn't in your formData, so commenting out
      };
  
      const response = await fetch(`${backendUrl}/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order");
      }
  
      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder.order); 
      await fetchOrders(); // Refresh the list of orders
    } catch (error) {
      console.error("Error updating order:", error);
      // Optionally, show an error message to the user
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(cust => cust._id === customerId);
    return customer ? customer.name : '';
  };
  const getCustomerName2 = (customerId) => {
    const customer = products.find(cust => cust._id === customerId);
    return customer ? customer.name : 'Customer not loaded';
  };

  const handlePaymentMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };
  const handlePaymentStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentStatus: value
    }));
  };



  return (
    <div>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}  className={` ${isDark?"dark":"light"}`} size="4xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col p-2 pl-4 pt-4 text-base "><div className={`${isDark?"":"text-gray-900"} reletive`}>Order Details <p className={`absolute left-32 top-4 ${order.orderPriority==="Normal"?"text-green-500":"text-red-900"}`}>{order.orderPriority}</p></div> </ModalHeader>
            <ModalBody style={{ minHeight: '520px' }}>
  <Tabs aria-label="Order Tabs" className="flex justify-center">
    <Tab key="general" title="General">
    <div>
  <div className="flex items-center w-full text-gray-300  text-sm mb-2">
    <VscReferences className="mr-1 text-blue-500" size={16} />
    <span className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[80px]">Internal PO:</span>
    {editingField === "internalPO" ? (
      <div className="flex items-center">
        <Input
          name="internalPO"
          value={formData.internalPO}
          onChange={handleChange}
          autoFocus
        />
        <Check
          className="ml-2 cursor-pointer text-green-500"
          onClick={() => {
            handleUpdateOrder();
            setEditingField(null);
          }}
        />
      </div>
    ) : (
      <>
        <span className="text-yellow-500 ml-1">{formData.internalPO || "Not Set"}</span>
        <EditIcon
          className="ml-2 cursor-pointer"
          onClick={() => setEditingField("internalPO")}
        />
      </>
    )}
  </div>

  <div className="flex items-center w-full text-gray-300  text-sm mb-2">
    <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
    <span className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[110px]">Invoice Number:</span>
    {editingField === "invoiceNumber" ? (
      <div className="flex items-center">
        <Input
          name="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={handleChange}
          autoFocus
        />
        <Check
          className="ml-2 cursor-pointer text-green-500"
          onClick={() => {
            handleUpdateOrder();
            setEditingField(null);
          }}
        />
      </div>
    ) : (
      <>
        <span className="text-yellow-500 ml-1">{formData.invoiceNumber || "Not Set"}</span>
        <EditIcon
          className="ml-2 cursor-pointer"
          onClick={() => setEditingField("invoiceNumber")}
        />
      </>
    )}
  </div>

  <div className="flex items-center w-full text-gray-300 text-sm mb-2">
  <RiUserReceived2Line className="mr-1 text-blue-500" size={16} />
  <span className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[70px]">Customer:</span>
  {editingField === "customer" ? (
    <div className="flex items-center">
      <AutoComplete
        style={{
          width: 200,
        }}
        options={options2}
        value={customerInput}  // Use for filtering
        onSearch={(value) => {  // This is where you handle typing
          setCustomerInput(value);
        }}
        onChange={(value) => {  // This is for selection
          setFormData(prev => ({
            ...prev,
            customer: value // Update customer ID
          }));
          setCustomerInput(getCustomerName(value)); // Update input display with name
        }}
        placeholder="Select a customer"
        filterOption={(inputValue, option) =>
          option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }
      />
      <Check
        className="ml-2 cursor-pointer text-green-500"
        onClick={() => {
          handleUpdateOrder();
          setEditingField(null);
        }}
      />
    </div>
  ) : (
    <>
      <span className="text-yellow-500 ml-1">{getCustomerName(formData.customer) || "Not Set"}</span>
      <EditIcon
        className="ml-2 cursor-pointer"
        onClick={() => setEditingField("customer")}
      />
    </>
  )}
</div>

  <div className="flex items-center w-full text-gray-300  text-sm mb-2">
    <FaHourglassEnd className="mr-1 text-blue-500" size={14} />
    <span className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[130px]">Fulfillment Time:</span>
    {editingField === "fulfillmentTime" ? (
      <div className="flex items-center">
        <Input
          name="fulfillmentTime"
          value={formData.fulfillmentTime}
          onChange={handleChange}
          autoFocus
        />
        <Check
          className="ml-2 cursor-pointer text-green-500"
          onClick={() => {
            handleUpdateOrder();
            setEditingField(null);
          }}
        />
      </div>
    ) : (
      <>
        <span className="text-yellow-500 ml-1">
          {new Date(formData.fulfillmentTime).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }) || "Not given"}
        </span>
        <EditIcon
          className="ml-2 cursor-pointer"
          onClick={() => setEditingField("fulfillmentTime")}
        />
      </>
    )}
  </div>

  <div className="flex  w-full text-gray-300 font-mono text-sm mb-2 items-center " style={{alignItems:"ceter",justifyItems:"center"}}>
        <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
        <div className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[130px] " >Payment status:</div>
        {editingField === "paymentStatus" ? (
          <div className="flex items-center">
            <AutoComplete
              style={{
                width: 200,
                height:30
              }}
              options={options3}
              value={formData.paymentStatus}
              onChange={handlePaymentStatusChange}
              placeholder="Enter payment Status"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
            <Check
              className="ml-2 cursor-pointer text-green-500 m-0 p-0"
              onClick={() => {
                handleUpdateOrder();
                setEditingField(null);
              }}
            />
          </div>
        ) : (
          <>
            <div className="text-yellow-500 ml-1">{formData.paymentStatus || "Not Set"}</div>
            <EditIcon
              className="ml-2 cursor-pointer"
              onClick={() => setEditingField("paymentStatus")}
            />
          </>
        )}
      </div>
  <div className="flex  w-full text-gray-300 font-mono text-sm mb-2 items-center " style={{alignItems:"ceter",justifyItems:"center"}}>
        <FaFileInvoiceDollar className="mr-1 text-blue-500" size={16} />
        <div className="text-gray-400 font-semibold h-[35px] pt-2 items-center w-[130px] " >Payment Method:</div>
        {editingField === "paymentMethod" ? (
          <div className="flex items-center">
            <AutoComplete
              style={{
                width: 200,
                height:30
              }}
              options={options}
              value={formData.paymentMethod}
              onChange={handlePaymentMethodChange}
              placeholder="Enter payment method"
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
            <Check
              className="ml-2 cursor-pointer text-green-500 m-0 p-0"
              onClick={() => {
                handleUpdateOrder();
                setEditingField(null);
              }}
            />
          </div>
        ) : (
          <>
            <div className="text-yellow-500 ml-1">{formData.paymentMethod || "Not Set"}</div>
            <EditIcon
              className="ml-2 cursor-pointer"
              onClick={() => setEditingField("paymentMethod")}
            />
          </>
        )}
      </div>

  <div>
  <OrderItems 
                        order={order} 
                        isDark={isDark}
                        getCustomerName2={getCustomerName2} 
                        products={products} 
                        handleUpdateOrder={handleUpdateOrder}
                        setFormData={setFormData}  // Pass this to update item data
                        formData={formData}  // Pass formData to OrderItems
                      />

    </div>
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
            <div key={index} className={`mb-2 border rounded-xl p-3 ${isDark?" bg-zinc-950":" bg-white"}`}>
              <p className={`${isDark?"text-gray-200":"text-gray-800"} `}>{comment.text}</p>
              <p className={`text-xs text-gray-500`}>{new Date(comment.creationdate).toLocaleString()}</p>
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
          <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose} className={` ${isDark?"dark":"light"}`}>
            <ModalContent>
              <ModalHeader className={` ${isDark?"":"text-gray-900"} flex flex-col gap-1`}>Confirm Deletion</ModalHeader>
              <ModalBody className={` ${isDark?"":"text-gray-900"} `}>
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