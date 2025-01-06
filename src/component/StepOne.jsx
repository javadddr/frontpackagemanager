import React, { useState ,useEffect} from "react";

import { Select, Spin } from "antd";
import LogoR from "./arrows.svg"
import { Button, Modal } from "@nextui-org/react";
import { FiUploadCloud } from "react-icons/fi"; // Using a cloud upload icon
import { FaBoxOpen } from "react-icons/fa"; // Package icon
import { motion } from "framer-motion";
import { Spreadsheet } from "react-spreadsheet"; 
import updone from "./sds.mov";
const { Option } = Select;
// Custom Button component with icon
const UploadButton = (props) => (
  <Button
    {...props}
    startContent={<FiUploadCloud className="text-2xl w-[50px] h-[50px]" />}
    isIconOnly
    radius="full"
    variant="flat"
    color="warning"
  
    className="text-3xl p-3 hover:bg-blue-100 transition-colors duration-900 w-[170px] h-[170px]"
  >
    <span className="sr-only">Upload</span> {/* Screen reader hint */}
  </Button>
);

// Create a component for the rotating boxes
const SpinningBoxes = () => {
  const boxVariants = {
    rotate: {
      rotate: [0, 90],
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <motion.div
      style={{ width: '200px', height: '200px', position: 'absolute' }}
      variants={boxVariants}
      animate="rotate"
    >
      {[0, 90, 180, 270].map((angle, index) => (
        <motion.div 
          key={index}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${angle}deg) translate(25px)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <FaBoxOpen className="text-4xl text-blue-300" />
        </motion.div>
      ))}
    </motion.div>
    
  );
};



function StepOne({
  setTrackingNumbers,
  trackingNumbers,
  couriers,
  filteredCarriers,
  setFilteredCarriers,
  selectedCarrier,
  setFinalTrack,
  sheetstrackingNumbers,
  setSheetsTrackingNumbers,
  setSelectedCarrier, // Props for managing selected carrier
}) {
  const [loading, setLoading] = useState(false); // Loader
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [spreadsheetData, setSpreadsheetData] = useState([
    // Initial data for 20 rows and 7 columns
    ...Array(20).fill().map(() => Array(7).fill({ value: '' }))
  ]);
  const handleSearch = (value) => {
    const filtered = couriers.filter((carrier) =>
      carrier.courierName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCarriers(filtered);
  };
  


  // Handle selection of a carrier
  const handleChange = (value) => {
    setSelectedCarrier(value); // Update parent state with the selected carrier
  };
  const handlePaste = (event) => {
    const text = event.clipboardData.getData("text");
    const newNumbers = text
      .split(/[\s,]+/) // Split by spaces or commas
      .filter((num) => num.trim() !== ""); // Remove empty entries
    setTrackingNumbers((prev) => [...prev, ...newNumbers]);
    event.preventDefault(); // Prevent default paste behavior
  };

  // Handle deleting a single tracking number
  const handleDelete = (index) => {
    setTrackingNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle clearing all tracking numbers
  const handleClearAll = () => {
    setTrackingNumbers([]);
  };



  const handleBulkUpload = () => {
   
    setIsModalOpen(true); // Open the modal when the button is clicked
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const transformData = () => {
    if (!spreadsheetData || spreadsheetData.length === 0) return [];
  
   
  
    return spreadsheetData
      .filter(row => row.length >= 2 && row[0] && (row[0].value || '').trim() !== '')
      .map(row => ({
        "tracking number": (row[0]?.value || '').trim(),
        "courier code": (row[1]?.value || '').trim()
      }));
  };

  // Handler for saving data and closing modal
  const handleSaveAndClose = () => {
    const newData = transformData();
   
    setSheetsTrackingNumbers(newData);
    setFinalTrack(newData);
    handleCloseModal();
  };

  const resetSheetstrackingNumbers = () => {
    setSheetsTrackingNumbers([]);
    
  };
  return (
    <div className="p-2 flex h-[300px]  rounded-md  ">
           <div>
         
          <div className="mb-3 " style={{ display: 'flex', justifyContent: 'flex-center', alignItems: 'flex-center',textAlign:'center', width: 500 }}>
            <div className="flex m-0 p-0 w-[200px] text-gray-900  mt-2">Select your courier:</div> 
            {loading ? (
              <Spin />
            ) : (
              <Select
                value={selectedCarrier} // Set the current value
                showSearch
                placeholder="Select a courier"
                optionFilterProp="children"
                onSearch={handleSearch}
                onChange={handleChange}
                filterOption={false}
                allowClear
                style={{ width: '100%' }}
          
              >
                {filteredCarriers.map((carrier) => (
                  <Option key={carrier.courierCode} value={carrier.courierCode}>
                    {carrier.courierName}
                  </Option>
                ))}
              </Select>
            )}
           </div>
            {/* Paste Area */}
            <div
              onPaste={handlePaste}
              className={`min-h-[200px] max-h-[200px] w-[500px] overflow-y-auto  border border-gray-300 rounded-md`}
            >
              {trackingNumbers.length === 0 ? (
                <span className="flex m-3 text-gray-300 text-sm">
                  Paste your tracking numbers here!
                </span>
              ) : (
                <div>
                  {trackingNumbers.map((number, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-2 py-1 ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      {/* Index and Number */}
                      <span className="text-sm text-gray-800 flex items-center">
                        <span className="font-semibold mr-2">{index + 1}.</span>{" "}
                        {number}
                      </span>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-gray-500 hover:text-red-500 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Action Buttons */}
            {trackingNumbers.length > 0 && (
              <div className="flex justify-between items-center mt-2">
                <Button
                  onClick={handleClearAll}
                  color="danger"
                  radius="sm"
                  variant="flat"
                  size="sm"
            
                >
                  Remove all 
                </Button>
                <Button
                
                  color="success"
                  radius="sm"
                  variant="flat"
                  size="sm"
                >
                <span className="font-bold text-base">{trackingNumbers.length}</span> Tracking Number{trackingNumbers.length>1?"s":""}
                </Button>
              </div>
            )}
           </div>
           {typeof sheetstrackingNumbers !== 'undefined' && sheetstrackingNumbers !== null && sheetstrackingNumbers.length > 0 ? (
              <div className="flex flex-col justify-center items-center text-center self-center h-full w-full">
              <video 
              src={updone} 
              alt="Update Done" 
              className="w-36 rounded-full mb-3" 
              autoPlay 
              muted
              playsInline
              
            />
                <Button color="secondary" variant="flat" onClick={resetSheetstrackingNumbers}>
                        Upload Again!
                      </Button>
                  
              </div>
) : (
         <div className="flex flex-col -mt-14 justify-end  text-right self-center w-full">
                <div className="text-lg  mb-6  text-gray-900 mr-48">
                  Or upload bulk.
                </div>
                <div className="flex flex-grow justify-end relative mr-40">
              
                
                <div className="relative z-10">
                  <UploadButton onClick={handleBulkUpload} />
                </div>
          </div>
      </div>
      )}
      {isModalOpen && (
  <div className="modal fixed w-full h-full top-0 left-0 flex items-center justify-center z-[1000]">
    <div onClick={handleCloseModal} className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div className="modal-container bg-white w-[80%] md:w-[800px] mx-auto rounded shadow-lg z-[1001] overflow-y-auto">
      <div className="modal-content py-4 text-left px-6">
        <div className="modal-header flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Bulk Upload Spreadsheet</h3>
      
        </div>
        <div className="modal-body max-h-[60vh] overflow-y-auto">
          <Spreadsheet
            data={spreadsheetData}
            columnLabels={['Tracking Number', 'Courier', '', '', '', '', '']}
            onChange={setSpreadsheetData}
          />
        </div>
        <div className="modal-footer flex justify-end mt-4">
          <Button onClick={handleCloseModal} color="error" variant="light">
            Close
          </Button>
          <Button onClick={handleSaveAndClose} color="secondary" variant="flat">
                  Save
                </Button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default StepOne;
