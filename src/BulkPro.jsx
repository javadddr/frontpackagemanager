import React, { useState } from 'react';
import { Modal, Button, Upload, message, Select, Typography } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useHubs } from "./HubsContext";
import { TbCircleNumber1Filled ,TbCircleNumber2Filled} from "react-icons/tb";
const { Option } = Select;
const { Link } = Typography;
import { Button as Don,useDisclosure,Divider } from "@nextui-org/react";

const BulkPro = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedHub, setSelectedHub] = useState(''); // State for the selected hub
  const { hubs, fetchProducts } = useHubs(); // Using the hubs from context
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (fileList.length === 0) {
      message.error('Please upload a file.');
      return;
    }
    if (!selectedHub) {
      message.error('Please select a hub.');
      return;
    }
    
    readFile(fileList[0].originFileObj);
  };

  const handleCancel = () => {
    setFileList([]);
    setSelectedHub('');
    setIsModalVisible(false);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // Check for empty file here
    if (newFileList.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length <= 1) { // Only headers or no data at all
          message.error('The Excel file is empty. Please download the sample Excel file and enter your product information.');
          setFileList([]); // Clear the file list
        }
      };
      reader.readAsBinaryString(newFileList[0].originFileObj);
    }
  };

  const handleHubSelect = (value) => {
    setSelectedHub(value);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Check if there's any data beyond headers
      if (jsonData.length <= 1) {
        message.error('The Excel file is empty. Please download the sample Excel file and enter your product information.');
        return;
      }

      // Assuming the first row are headers, remove it or handle accordingly
      const headers = jsonData[0];
      const products = jsonData.slice(1).map(row => ({
        ...headers.reduce((acc, header, index) => {
          acc[header] = row[index];
          return acc;
        }, {}),
        hub: selectedHub // Add the selected hub to each product
      }));

      handleBulkInsert(products);
      setFileList([]); // Clear the file list
      setSelectedHub(''); // Clear the hub selection
      setIsModalVisible(false); // Close modal
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkInsert = async (products) => {
    try {
      const response = await fetch(`${backendUrl}/api/products/bulk-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'owner': localStorage.getItem("key") // Assuming owner ID is stored here
        },
        body: JSON.stringify({ products }) // Convert JS object to JSON string
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      await fetchProducts();
      message.success(`${result.inserted} products inserted successfully!`);
    } catch (error) {
      message.error('Failed to insert products: ' + error.message);
    }
  };

  return (
    <div>
      <Don  color="warning" variant="ghost" style={{ width: '170px',height:'35px' }} onClick={showModal}>
        Bulk Upload Products
      </Don>
      <Modal 
        title="Bulk Upload" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="Create the Products" // Change the text of the OK button
      >
     <div className='flex items-center mb-3'>
        <TbCircleNumber1Filled className="text-2xl mr-2" /> 
        Select a Hub:
      </div>
        <Select
          showSearch
          placeholder="Select a Hub"
          optionFilterProp="children"
          onChange={handleHubSelect}
          value={selectedHub}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          {hubs.map(hub => (
            <Option key={hub._id} value={hub.name}>{hub.name}</Option>
          ))}
        </Select>
       
        <div className='flex items-center mb-3 mt-3 '>
        <TbCircleNumber2Filled className="text-2xl mr-2" /> 
        Upload Your Products Using an Excel File:
      </div>
        <Upload
          accept=".xlsx, .xls"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false} // Prevent auto upload
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <div style={{ marginTop: '60px' }}>
        Just download the sample file below, fill it out with your product details, and upload it to get started:<br></br>
          <Link href={`${backendUrl}/sample.xlsx`} download> 
            <Button icon={<DownloadOutlined />} style={{ backgroundColor: '#98FB98', borderColor: '#98FB98' }}>Download Sample Excel</Button>
          </Link>
        </div>
      </Modal>
    </div>
  );
};

export default BulkPro;