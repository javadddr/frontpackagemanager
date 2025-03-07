import React, { useState,useEffect } from "react";
import { Form, DatePicker, Upload, Button, message, Input, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useHubs } from "./HubsContext";
import { motion, AnimatePresence } from "framer-motion";
import ProChart from "./ProChart";
import { FaBell } from "react-icons/fa6";
import ProHub from "./ProHub";
import { CloseOutlined } from "@ant-design/icons";
import { Button as Don,useDisclosure,Divider } from "@nextui-org/react";
import { Card, CardBody,CardFooter ,Image} from "@nextui-org/react";
import { CgUnavailable } from "react-icons/cg";
import ProChange from "./ProChange";
import {  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import logo from "./emp.jpeg"
import { FaTrash } from 'react-icons/fa'; // or whatever icon library you're using for the trash icon
import { DeleteIcon } from "./DeleteIcon";
import { EditIcon } from "./EditIcon";
import BulkPro from "./BulkPro";
const { Option } = Select;
const MotionButton = motion(Button);
const Inventory = ({productStats,isDark}) => {
  const { hubs, fetchHubs,setHubs } = useHubs();
  const { vendors, fetchVendors,setVendors } = useHubs();
  const { products, fetchProducts,setProducts } = useHubs();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
const [proName, setProName] = useState([]);

// Loop through the products and save the names in proName state
useEffect(() => {
  // Extract product names from the products array and update proName state
  const productNames = products.map((product) => product.name);
  setProName(productNames);
}, [products]);  // This will run when the products array changes

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [deletionId, setDeletionId] = useState(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => setIsModalVisible(true);
const handleCloseModal = () => setIsModalVisible(false);
const [editingId, setEditingId] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const openEditModal = () => setIsEditModalOpen(true);
const closeEditModal = () => setIsEditModalOpen(false);
const [editFormData, setEditFormData] = useState({
  reorderLevel: 0,
  supplier: '',
  tags: '',
  brand: '',
  weight: 0,
  price: 0
});
useEffect(() => {
  // Fetch the hubs data when the component mounts
  fetchProducts();
}, [isOpen]);
const [success, setSuccess] = useState(false);
  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const validateFile = (file) => {
    const isJPGorPNG = file.type === "image/jpeg" || file.type === "image/png";
    const isSizeValid = file.size / 1024 / 1024 < 1; // less than 1MB
    if (!isJPGorPNG) {
      message.error("You can only upload JPG/PNG file!");
    }
    if (!isSizeValid) {
      message.error("File size must be smaller than 1MB!");
    }
    return isJPGorPNG && isSizeValid;
  };

  const onFinish = async (values) => {
    const owner = localStorage.getItem("key");
    if (!owner) {
      throw new Error("Owner key is missing from local storage.");
    }
    if (proName.includes(values.name)) {
      message.error("The product with this name exists");
      return; // Exit the function early if name exists
    }
  
    const formData = new FormData();
    formData.append("startDate", values.startDate.format("YYYY-MM-DD"));
    formData.append("endDate", values.endDate ? values.endDate.format("YYYY-MM-DD") : "2030-01-01");
    formData.append("name", values.name);
    formData.append("hub", values.hub);
    formData.append("price", values.price || "0");
    formData.append("quantity", values.quantity);
    formData.append("weight", values.weight || "0");
    formData.append("brand", values.brand || "");
    formData.append("condition", values.condition || "new");
    formData.append("reorderLevel", values.reorderLevel || "0");
    formData.append("supplier", values.supplier || "");
    formData.append("tags", values.tags || "");
    formData.append("owner", owner);
  
    if (fileList.length > 0) {
      formData.append("image", fileList[0].originFileObj);
    } else {
      formData.append("image", "");
    }
  
    try {
      // First, create the product
      const productResponse = await fetch(`${backendUrl}/api/products`, {
        method: "POST",
        body: formData,
      });
  
      if (!productResponse.ok) {
        const error = await productResponse.json();
        throw new Error(error.error || "Failed to create product!");
      }
  
      const newProduct = await productResponse.json();
  
      // Now, find the hub ID by matching the hub name
      const matchingHub = hubs.find(hub => hub.name === values.hub);
  
      if (matchingHub) {
        const hubId = matchingHub._id;
        
        // Prepare the data to update the hub with the new product
        const hubUpdateData = {
          "products": [
            {
              "name": values.name,
              "value": values.quantity,
              "unitprice": values.price || 0,
              "stockindate": values.startDate.format("YYYY-MM-DDTHH:mm:ss[Z]")
            }
          ]
        };

        // Update the hub by adding the new product
        const key = localStorage.getItem("key");

        const hubResponse = await fetch(`${backendUrl}/api/hubs/${hubId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "key": key // Adding the key header
          },
          body: JSON.stringify(hubUpdateData),
        });
  
        if (!hubResponse.ok) {
          const error = await hubResponse.json();
          message.error("Failed to update hub with new product: " + (error.error || "Unknown error"));
        } else {
          // If successful, update the local state or context
          setHubs(prevHubs => prevHubs.map(hub => 
            hub._id === hubId 
              ? { ...hub, products: [...hub.products, hubUpdateData.products[0]] } 
              : hub
          ));
        }
      } else {
        message.error("Hub not found!");
      }
  
      // Update UI state
      setProducts(prevProducts => [...prevProducts, newProduct]);
      form.resetFields();
      setFileList([]);
      setSuccess(true);
      await fetchProducts();
      setTimeout(() => {
        setIsModalVisible(false);
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      message.error(error.message || "An error occurred while submitting the form.");
    }
  };

  const handleEdit = async (productId, data) => {
    try {
      const response = await fetch(`${backendUrl}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedProduct = await response.json();
      // Update the product in your local state or refetch all products
      setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      // Optionally refetch to get any server-side changes
      fetchProducts();
 
    } catch (error) {
    
    }
  };
  const handleDelete = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products/${deletionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
          // Add any necessary authentication headers here
        },
      });
  
      if (response.ok) {
        setProducts(currentProducts => currentProducts.filter(p => p._id !== deletionId));
        onClose(); // Close the modal after deletion
        console.log("Product deleted successfully");
      } else {
        const errorText = await response.text();
        console.error('Failed to delete product:', errorText);
        onClose(); // You might want to keep the modal open or show an error message
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      onClose(); // Close the modal on error
    }
  };
  return (
    <div className={`pt-6 pl-4 pr-4 pb-10 ${isDark?"bg-zinc-900":"bg-white"} `} style={{ minHeight: "100vh"}}>
   
   <div className='flex items-end justify-end mb-3  w-full '>
   <div className="flex flex-col  items-center mr-3">
        
         <BulkPro />
      </div>
    <div>
      <Don type="primary" color="primary" variant="shadow" onClick={showModal} style={{ width: '170px',height:'35px' }}>
        Add New Product
      </Don>
      </div>
     
      </div>
          {/* Modal */}
          <AnimatePresence>
        {isModalVisible && (
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
                paddingTop:"50px",
                borderRadius: "10px",
                maxWidth: "500px", // Decrease width
                minHeight: "700px", // Increase height
                width: "90%",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                position: "relative", // For positioning the close icon
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Close "X" Button */}
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
    New hub was created!
  </motion.div>
</motion.div>


) : (
     <Form form={form} onFinish={onFinish} layout="vertical">
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Name<span className="text-red-500">*</span></label>
            <Form.Item
              className="flex-1 mb-0"
              name="name"
              rules={[{ required: true, message: "Please enter the name!" }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1 relative">
              <div className="relative">
                <label className="w-1/4 text-left mr-0 pr-20">Hub<span className="text-red-500">*</span></label>
                <div 
                  className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-8 cursor-help w-4 h-4 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center"
                  onMouseEnter={(e) => {
                    e.target.nextSibling.style.display = 'block';
                  }}
                  onMouseLeave={(e) => {
                    e.target.nextSibling.style.display = 'none';
                  }}
                >
                  ?
                </div>
                <div 
                  className="hidden absolute top-full left-0 bg-gray-800 text-white p-2 rounded shadow-lg text-xs w-64"
                  style={{ zIndex: 1000 }} // Ensure tooltip appears above other elements
                >
                  To create a product, you must first create a hub. Begin by navigating to the Location tab, then select Hubs, and create a new hub. Once the hub is set up, return here to create the product and assign it to the hub.
                </div>
              </div>
              <Form.Item
                className="flex-1 mb-0"
                name="hub"
                rules={[{ required: true, message: "Please select a hub!" }]}
              >
                <Select placeholder="Select Hub">
                  {hubs && hubs.length > 0 ? (
                    hubs.map((hub) => (
                      <Option key={hub._id} value={hub.name}>
                        {hub.name}
                      </Option>
                    ))
                  ) : (
                    <Option value="default-hub">No hubs available</Option>
                  )}
                </Select>
              </Form.Item>
            </div>

          <div className="flex items-center justify-between mb-1 ">
            <label className="w-1/4 text-left pr-2">Date Added<span className="text-red-500">*</span></label>
            <Form.Item
              className="flex-1 mb-0 "
              name="startDate"
              rules={[{ required: true, message: "Please select the start date!" }]}
            >
              <DatePicker className="w-[340px]" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Quantity<span className="text-red-500">*</span></label>
            <Form.Item
              className="flex-1 mb-0"
              name="quantity"
              rules={[{ required: true, message: "Please enter quantity!" }]}
            >
              <Input placeholder="Enter quantity" type="number" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Price/Unit</label>
            <Form.Item
              className="flex-1 mb-0"
              name="price"
              rules={[{ required: false }]}
            >
              <Input
                placeholder="Enter price per unit"
                type="number"
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Weight</label>
            <Form.Item
              className="flex-1 mb-0"
              name="weight"
              rules={[{ required: false }]}
            >
              <Input placeholder="Enter weight (kg)" type="number" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">SKU</label>
            <Form.Item
              className="flex-1 mb-0"
              name="brand"
              rules={[{ required: false}]}
            >
              <Input  placeholder="Enter SKU, brand or manufacturer" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Condition</label>
            <Form.Item
              className="flex-1 mb-0"
              name="condition"
              rules={[{ required: false }]}
            >
              <Select placeholder="Select Condition">
                <Option value="new">New</Option>
                <Option value="refurbished">Refurbished</Option>
                <Option value="used">Used</Option>
              </Select>
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Reorder Level</label>
            <Form.Item
              className="flex-1 mb-0"
              name="reorderLevel"
              rules={[{ required: false }]}
            >
              <Input placeholder="Enter reorder level" type="number" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Vendor</label>
            <Form.Item
      className="flex-1 mb-0"
      name="supplier"
      rules={[{ required: false }]}
    >
      <Select
        showSearch
        placeholder="Select a vendor"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        // If you want to set a default value you can do it here, otherwise leave as is
      >
        {vendors && vendors.length > 0 ? (
          vendors.map(vendor => (
            <Option key={vendor._id} value={vendor.name}>
              {vendor.name}
            </Option>
          ))
        ) : (
          <Option value="" disabled>No vendors available</Option>
        )}
      </Select>
    </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Tags</label>
            <Form.Item
              className="flex-1 mb-0"
              name="tags"
              rules={[{ required: false }]}
            >
              <Input placeholder="Enter tags or subproduct details" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="w-1/4 text-left pr-2">Expiration Date</label>
            <Form.Item
              className="flex-1 mb-0 "
              name="endDate"
              rules={[{ required: false }]}
            >
              <DatePicker className="w-[340px]" />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-1 min-h-[150px]">
              <label className="w-1/4 text-left pr-2">Product Image</label>
              <Form.Item
                className="flex-1 mb-0"
            
                valuePropName="fileList"
                getValueFromEvent={(e) => e && e.fileList}
                rules={[{ required: true, message: "Please upload an image!" }]}
              >
                <Upload
                  listType="picture"
                  className="w-full"
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={validateFile}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Submit
            </Button>
          </Form.Item>

        
          {/* <div className="flex flex-col justify-center items-center">
          Or you can Bulk Upload your productStat
<BulkPro/>
</div> */}
     </Form>
  )}
  </motion.div>
</motion.div>
)}
</AnimatePresence>

{isEditModalOpen && editingId && (
  <Modal isOpen={isEditModalOpen} onOpenChange={closeEditModal}>
    <ModalContent>
      {(onCloseModal) => (
        <>
          <ModalHeader className="flex flex-col gap-1 text-sm">Edit Product Details</ModalHeader>
          <ModalBody>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="reorderLevel">Reorder Level</label>
              <Input 
                id="reorderLevel"
                value={editFormData.reorderLevel}
                onChange={(e) => setEditFormData({...editFormData, reorderLevel: e.target.value})}
                type="number"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="supplier">Supplier</label>
              <Input 
                id="supplier"
                value={editFormData.supplier}
                onChange={(e) => setEditFormData({...editFormData, supplier: e.target.value})}
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="tags">Tags (Campaign)</label>
              <Input 
                id="tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="brand">Brand (SKU)</label>
              <Input 
                id="brand"
                value={editFormData.brand}
                onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="weight">Weight</label>
              <Input 
                id="weight"
                value={editFormData.weight}
                onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}
                type="number"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2" htmlFor="price">Price Per Unit</label>
              <Input 
                id="price"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                type="number"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            
          <Don color="danger" variant="flat" onPress={() => { closeEditModal() }}>
  Cancel
</Don>
<Don color="success" variant="flat" onPress={() => { handleEdit(editingId, editFormData); closeEditModal(); }}>
  Save
</Don>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
)}
<div className="flex justify-center ">
<ProChart/>
<ProChange/>
<ProHub/>
</div>

{products.length === 0 ? 
  <div className="flex flex-col items-center justify-center w-full ">
    <img src={logo} alt="No products available" className="mb-4 mt-[7%] w-96 h-96 object-cover rounded-full" />
    <p className="text-center text-lg text-gray-300">No products found. Why not start by adding your first one?</p>
  </div>
  :
  <div>
  <div className="text-gray-100 font-bold flex justify-center mt-4 text-xl"><Don type="primary" color="danger" variant="flat" style={{ width: '300px',height:'35px' }} >
  Current Products  
      </Don> </div>
      
  <div className="gap-2 grid grid-cols-2 sm:grid-cols-4 pt-10 ml-[7%] mr-[7%]">
   
    {products.map((product, index) => (
           <Card key={product._id} shadow="sm"  className={`${isDark?"dark border":"light"}  `} >
        
        <CardBody className="overflow-visible p-0 relative">
        {productStats.remaining[product.name]?.currentInventory < product.reorderLevel && (
      <motion.div
        className="absolute top-3 right-3 z-30"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <FaBell size={20} className="text-red-500" />
      </motion.div>
    )}
          {product.image ? (
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={product.name} 
              className="w-full object-cover h-[140px]"
              src={`${backendUrl}/${product.image}`}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-[140px]">
              <CgUnavailable size={100} className="text-gray-500" />
            </div>
          )}
        </CardBody>
        <CardFooter className="text-small flex-col justify-between">
 
          <div className="flex justify-between w-full">
            <b>{product.name} </b>
            <p className="text-default-500">
              {productStats.remaining[product.name]?.currentInventory || 0}
            </p>
          </div>
          <div className="text-left w-full">
            <p className="text-default-500 "> {product.hub}</p>
          </div>
          <Divider className="m-1" />
          <div className="flex justify-between w-full">
            <DeleteIcon 
              onClick={() => { setDeletionId(product._id); onOpen(); }} 
              className="cursor-pointer text-red-500 w-5 h-5"
            />
            <EditIcon 
              onClick={() => {
                setEditingId(product._id);
                setEditFormData({
                  reorderLevel: product.reorderLevel || 0,
                  supplier: product.supplier || '',
                  tags: product.tags || '',
                  brand: product.brand || '',
                  weight: product.weight || 0,
                  price: product.price || 0
                });
                openEditModal();
              }} 
              className="cursor-pointer text-blue-500 w-5 h-5"
            />
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
  </div>
}

{/* Modal for deletion */}
{isOpen && (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark">
    <ModalContent>
      {(onCloseModal) => (
        <>
          <ModalHeader className="flex flex-col gap-1 text-gray-300">Confirm Deletion</ModalHeader>
          <ModalBody>
            <p className="text-gray-400">Are you sure you want to delete this product?</p>
          </ModalBody>
          <ModalFooter>
            <Don color="default" variant="light" onPress={onCloseModal}>
              Cancel
            </Don>
            <Don color="danger" onPress={() => { handleDelete(); onCloseModal(); }}>
              Delete
            </Don>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
)}

{/* Modal for editing */}
{isEditModalOpen && (
  <Modal isOpen={isEditModalOpen} onOpenChange={closeEditModal} className="dark">
    <ModalContent>
      {(onCloseEditModal) => (
        <>
          <ModalHeader className="flex flex-col gap-1 text-gray-300">Edit Product Details</ModalHeader>
          <ModalBody>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2  text-gray-400" htmlFor="reorderLevel">Reorder Level:</label>
              <Input 
                id="reorderLevel"
                value={editFormData.reorderLevel}
                onChange={(e) => setEditFormData({...editFormData, reorderLevel: e.target.value})}
                type="number"
                className="bg-gray-600 border-slate-500"

              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2 text-gray-400" htmlFor="supplier">Supplier"</label>
              <Input 
                id="supplier"
                value={editFormData.supplier}
                onChange={(e) => setEditFormData({...editFormData, supplier: e.target.value})}
                className="bg-gray-600 border-slate-500"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2 text-gray-400" htmlFor="tags">Tags (Campaign):</label>
              <Input 
                id="tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                className="bg-gray-600 border-slate-500"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2 text-gray-400" htmlFor="brand">Brand (SKU):</label>
              <Input 
                id="brand"
                value={editFormData.brand}
                onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})}
                 className="bg-gray-600 border-slate-500"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2 text-gray-400" htmlFor="weight">Weight:</label>
              <Input 
                id="weight"
                value={editFormData.weight}
                onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}
                type="number"
                className="bg-gray-600 border-slate-500"
              />
            </div>
            <div className="mb-1">
              <label className="block text-sm font-bold mb-2 text-gray-400" htmlFor="price">Price Per Unit:</label>
              <Input 
                id="price"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                type="number"
                className="bg-gray-600 border-slate-500"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Don color="danger" variant="flat" onPress={closeEditModal}>
              Cancel
            </Don>
            <Don color="success" variant="flat" onPress={() => { handleEdit(editingId, editFormData); closeEditModal(); }}>
              Save
            </Don>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
)}

</div>
  );
};

export default Inventory;
