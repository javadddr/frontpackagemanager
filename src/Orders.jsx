
import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button,useDisclosure,Tabs,Tab,CheckboxGroup,Checkbox } from "@nextui-org/react";
import {   Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input, Button as AntButton } from "antd";
import { useHubs } from "./HubsContext";
import { Select, Spin } from "antd";
import {  DatePicker, InputNumber,ConfigProvider } from "antd";
import OrderDown from "./OrderDown";

const { Option } = Select;


const MotionButton = motion(Button);








function Orders() {

  const [form] = Form.useForm();
  const { customers,products,orders,setOrders, fetchOrders} = useHubs();
console.log("Orders",orders)

  const [isModalOpen, setModalOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);

const [formValues, setFormValues] = useState({
  orderId: '',
  internalPO: '',
  customerPO: '',
  orderDate: null,
  fulfillmentTime: '',
  status: '',
  paymentStatus: '',
  items: [], // Changed from itemsList to an array of objects
  quantity: 0,
  paymentMethod: '',
  invoiceNumber: '',
  discounts: '',
  orderPriority: '',
  notes: '',
  customer:''
});
const handleOpenModal = () => {
  setModalOpen(true);
  setSuccess(false); // Reset success state when opening modal
};
console.log(products)
const handleCloseModal = () => {
  setModalOpen(false);
  setSuccess(false); // Reset success state when closing modal
  form.resetFields(); // Reset form fields
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const handleFormSubmit = async (values) => {
  setLoading(true);
  
  try {
    // Check if orderId already exists
    if (orders.some(order => order.orderId === values.orderId)) {
      form.setFields([
        {
          name: 'orderId',
          errors: ['This Order ID already exists. Please use a different one.']
        }
      ]);
      return; // Stop the form submission
    }
    
    // Convert DatePicker values to string for API
    values.orderDate = values.orderDate ? values.orderDate.format("DD.MM.YYYY") : null;
    values.fulfillmentTime = values.fulfillmentTime ? values.fulfillmentTime.format("DD.MM.YYYY") : null;

    // Parse the quantity string
    const quantities = values.quantity.split('-').map(Number);
    
    // Ensure the number of quantities matches the number of items selected
    if (quantities.length !== values.items.length) {
      form.setFields([
        {
          name: 'quantity',
          errors: ['The number of quantities must match the number of items selected.']
        }
      ]);
      return;
    }

    // Format items for backend submission with correct quantities
    const itemsForBackend = values.items.map((item, index) => ({
      item: item.itemId,
      quantity: quantities[index] || 1, // Use 1 as default if quantity can't be parsed
      shipped: item.shipped || 0
    }));

    // Get owner from localStorage
    const owner = localStorage.getItem("key");

    // Make API call to create order
    const response = await fetch(`${backendUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-owner': owner 
      },
      body: JSON.stringify({ ...values, items: itemsForBackend, owner })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    // Update local state with form values and server response
    setFormValues(values);
    setSuccess(true); // Mark form submission as successful

    await fetchOrders();
  } catch (error) {
    console.error("Error creating order:", error);
    // Here you might want to show an error to the user or handle it appropriately
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="pt-6 pl-4 pr-4 bg-zinc-900" style={{ minHeight: "100vh"}}>
    <div className="flex justify-end">
      <div>
       <MotionButton
         color="primary"
         variant="shadow"
         animate={{ scale: 1.02 }}
         transition={{ duration: 0.09 }}
         onClick={handleOpenModal}
         style={{ width: '170px',height:'35px' }}
       >
         Add New Order
       </MotionButton>
       </div>
  
        </div>
       {/* Modal */}
       <AnimatePresence>
         {isModalOpen && (
           <motion.div
             className="modal-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               backgroundColor: "rgba(0, 0, 0, 0.5)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               zIndex: 1000,
             }}
             onClick={handleCloseModal}
           >
             <motion.div
               className="modal-content"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.8, opacity: 0 }}
               transition={{ duration: 0.1 }}
               style={{
                 backgroundColor: "#fff",
                 padding: "20px",
                 borderRadius: "10px",
                 maxWidth: "500px",
                 width: "90%",
                 boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                 position: "relative", // For positioning the close icon
               }}
               onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
             >
            
               <CloseOutlined
                 style={{
                   position: "absolute",
                   top: "10px",
                   right: "10px",
                   fontSize: "20px",
                   cursor: "pointer",
                   color: "#333",
                 }}
                 onClick={handleCloseModal}
               />
 
 {success ? (
   <motion.div
   initial={{ scale: 0.8, opacity: 0 }}
   animate={{ scale: 1, opacity: 1 }}
   exit={{ scale: 0.8, opacity: 0 }}
   style={{
     display: "flex",
     flexDirection: "column",
     alignItems: "center",
     justifyContent: "center",
     textAlign: "center",
     padding: "20px",
   }}
 >
   {/* Modern SVG Checkmark */}
   <motion.div
     initial={{ scale: 0.6 }}
     animate={{ scale: 1 }}
     transition={{ duration: 1.2, ease: "easeInOut" }} // Slower animation
     style={{ marginBottom: "20px" }}
   >
     <svg
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24"
       fill="none"
       stroke="green"
       strokeWidth="3"
       strokeLinecap="round"
       strokeLinejoin="round"
       style={{
         width: "100px", // Twice the size
         height: "100px", // Twice the size
         color: "green",
       }}
     >
       <circle cx="12" cy="12" r="10" stroke="currentColor" />
       <path d="M9 12l2 2 4-4" stroke="currentColor" />
     </svg>
   </motion.div>
 
   {/* Success Text */}
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ delay: 0.5, duration: 1.2 }} // Matches slower animation timing
     style={{
       fontSize: "18px",
       fontWeight: "bold",
       color: "#333",
     }}
   >
     New Order was created!
   </motion.div>
 </motion.div>
 
 
 ) : (
  <Form
  form={form}
  layout="horizontal"
  onFinish={handleFormSubmit}
  style={{ marginTop: "20px" }}
>
  <Form.Item
    label="Order ID"
    name="orderId"
    rules={[{ required: true, message: "Please input the Order ID!" }]}
    style={{ marginBottom: 8 }}

  >
    <Input style={{ width: '75%',marginLeft:"100px" }} placeholder="Enter Order ID" />
  </Form.Item>

  <Form.Item
    label="Internal PO"
    name="internalPO"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Input style={{ width: '76%',marginLeft:"94px" }} placeholder="Enter Internal Purchase Order" />
  </Form.Item>

  <Form.Item
    label="Customer PO"
    name="customerPO"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Input style={{ width: '78.7%',marginLeft:"80px" }} placeholder="Enter Customer Purchase Order" />
  </Form.Item>

  <Form.Item
    label="Order Date"
    name="orderDate"
    rules={[{ required: true, message: "Please select the Order Date!" }]}
    style={{ marginBottom: 8 }}
  >
    <DatePicker 
      style={{ width: '77.8%',marginLeft:"85px" }}
      format="DD.MM.YYYY"
    />
  </Form.Item>

  <Form.Item
    label="Fulfillment Time"
    name="fulfillmentTime"
    rules={[{ required: true, message: "Please select the Fulfillment Time!" }]}
    style={{ marginBottom: 8 }}
  >
    <DatePicker 
       style={{ width: '85%',marginLeft:"54px" }}
      format="DD.MM.YYYY"
    />
  </Form.Item>

  <Form.Item
    label="Status"
    name="status"
    rules={[{ required: true, message: "Please select a Status!" }]}
    style={{ marginBottom: 8 }}
  >
    <Select  style={{ width: '72%',marginLeft:"114px" }} placeholder="Select Status">
      <Option value="Pending">Pending</Option>
      <Option value="Processing">Processing</Option>
      <Option value="Shipped" disabled >Shipped</Option>
      <Option value="Delivered" disabled>Delivered</Option>
      <Option value="Canceled">Canceled</Option>
    </Select>
  </Form.Item>

  <Form.Item
    label="Payment Status"
    name="paymentStatus"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Select style={{ width: '82%',marginLeft:"65px" }} placeholder="Select Payment Status">
      <Option value="Paid">Paid</Option>
      <Option value="Unpaid">Unpaid</Option>
      <Option value="Partially Paid">Partially Paid</Option>
    </Select>
  </Form.Item>

  <Form.Item
  label="Items"
  name="items"
  rules={[{ required: true, message: 'Please select at least one item!' }]}
  style={{ marginBottom: 8 }}
>
  {products ? (
    <ConfigProvider theme={{ token: { colorPrimary: 'white' } }}>
      <Select
        mode="multiple"
        showSearch
        style={{ width: '70%', marginLeft: "121px" }}
        placeholder="Select Items"
        optionFilterProp="children"
        filterOption={(input, option) => 
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={(_, selectedOptions) => {
          form.setFieldsValue({
            items: selectedOptions.map(option => ({
              itemId: option.value, // Use the value as item ID
              quantity: 1, // Default quantity to 1
              shipped: 0 // Default shipped to 0
            }))
          });
        }}
      >
        {products.map((product) => (
          <Option key={product._id} value={product._id}>
            {`${product.name}-Left ${product.currentInventory}`}
          </Option>
        ))}
      </Select>
    </ConfigProvider>
  ) : (
    <Spin />
  )}
</Form.Item>






  <Form.Item
    label="Quantity"
    name="quantity"
    rules={[{ required: true }]}
    style={{ marginBottom: 8 }}
  >
    <Input style={{ width: '74%',marginLeft:"102px" }} placeholder="Enter Quantity-separate them with -" min={0} />
  </Form.Item>
  <Form.Item
  label="Customer"
  name="customer"
  rules={[{ required: true }]}
  style={{ marginBottom: 8 }}
>
  {customers ? (
    <Select
      showSearch
      style={{ width: '75.3%', marginLeft: "94px" }}
      placeholder="Search Customer"
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {customers.map((customer) => (
        <Option key={customer._id} value={customer._id}>
          {`${customer.name}`}
        </Option>
      ))}
    </Select>
  ) : (
    <Spin /> // or any other loading indicator
  )}
</Form.Item>


  <Form.Item
    label="Payment Method"
    name="paymentMethod"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Select style={{ width: '83%',marginLeft:"60px" }} placeholder="Select Payment Method">
      <Option value="Credit Card">Credit Card</Option>
      <Option value="Bank Transfer">Bank Transfer</Option>
      <Option value="Cash on Delivery">Cash on Delivery</Option>
    </Select>
  </Form.Item>

  <Form.Item
    label="Invoice Number"
    name="invoiceNumber"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Input style={{ width: '81%',marginLeft:"69px" }} placeholder="Enter Invoice Number" />
  </Form.Item>

  <Form.Item
    label="Discounts/Promotions"
    name="discounts"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Select style={{ width: '92%',marginLeft:"29px" }} placeholder="Select Discount">
      <Option value="yes">Yes</Option>
      <Option value="no">No</Option>
    </Select>
  </Form.Item>

  <Form.Item
    label="Order Priority"
    name="orderPriority"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Select style={{ width: '78%',marginLeft:"84px" }} placeholder="Select Order Priority">
      <Option value="Normal">Normal</Option>
      <Option value="High">High-Priority</Option>
    </Select>
  </Form.Item>

  <Form.Item
    label="Notes/Comments"
    name="notes"
    rules={[{ required: false }]}
    style={{ marginBottom: 8 }}
  >
    <Input.TextArea style={{ width: '84%',marginLeft:"59px" }} rows={2} placeholder="Enter Notes or Comments" />
  </Form.Item>

  <Form.Item style={{ marginTop: 8 }}>
    <AntButton
      type="primary"
      htmlType="submit"
      style={{ width: "100%" }}
      loading={loading}
    >
      {loading ? "Submitting..." : "Add New Order"}
    </AntButton>
  </Form.Item>
</Form>
        )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>


       <div>
       <OrderDown/>
       </div>
       </div>
  )
}

export default Orders
