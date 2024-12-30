import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@nextui-org/react';
import { useHubs } from '../HubsContext';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
function Hgeneral({ hubid, hub }) {
  // Use the hub prop directly instead of initializing with useState
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hubs, fetchHubs, setHubs } = useHubs();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [deleteError, setDeleteError] = useState(null);
  // useEffect to fetch hubs if needed, but the hub prop should already be the selected hub
  useEffect(() => {
  
    fetchHubs();
  }, []);

  // We'll use the hub prop, but if you want to edit, we'll need to create a local copy to work with
  const [localHub, setLocalHub] = useState(hub);

  // Update localHub when the prop changes

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = useCallback(async (field, value) => {
    setLoading(true);
    const updatedData = { [field]: value };

    try {
      const key = localStorage.getItem("key");
      const hubResponse = await fetch(`${backendUrl}/api/hubs/${hubid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "key": key
        },
        body: JSON.stringify(updatedData),
      });

      if (!hubResponse.ok) {
        const error = await hubResponse.json();
        throw new Error(error.error || "Failed to update hub!");
      }

      // Update the hub in the parent context or state
      setHubs((prevHubs) => prevHubs.map(h => h._id === hubid ? { ...h, [field]: value } : h));

      setEditingField(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating hub:", error);
      // Handle error, maybe show a toast message
    } finally {
      setLoading(false);
    }
  }, [hub, hubid, setHubs]);

  const saveButtonAnimations = {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };


  const handleDelete = useCallback(async () => {
    try {
      const key = localStorage.getItem("key");
      const response = await fetch(`${backendUrl}/api/hubs/${hubid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "key": key
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete hub!");
      }

      // Assuming you have a method in useHubs to refresh hubs list after deletion
      fetchHubs();
      onOpenChange(false); // Close the modal after successful deletion
    } catch (error) {
      setDeleteError(error.message);
    }
  }, [hubid, fetchHubs, onOpenChange]);



  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
    >
      <div className='text-gray-400 mb-5'>
        <b className='text-gray-200'>Created At:</b> {new Date(localHub.createdAt).toLocaleString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit'
        }).replace(',', '')}
      </div>
      <div className='text-gray-400 mb-2'>
        <b className='text-gray-200'>Name:</b> 
        <b className='text-gray-400 ml-3'>{localHub.name}</b> 
      </div>
      {[ 'address', 'email'].map(field => (
        <div key={field} className="mb-2 text-gray-400 ">
          <b className='text-gray-200 mr-3'>{field.charAt(0).toUpperCase() + field.slice(1)}:</b>
          {editingField === field ? (
            <div className="flex items-center space-x-2 ">
              <Input 
                value={localHub[field]} 
                onChange={(e) => setLocalHub({ ...localHub, [field]: e.target.value })} 
              />
              <Button 
                size="sm" 
                color="success" 
                variant="flat" 
                onClick={() => handleSave(field, localHub[field])}
                {...saveButtonAnimations}
              >
                ✔️
              </Button>
              <Button 
                size="sm" 
                color="danger" 
                variant="flat" 
                onClick={() => setEditingField(null)}
                {...saveButtonAnimations}
              >
                ✖️
              </Button>
            </div>
          ) : (
            <span onClick={() => handleEdit(field)}>{localHub[field]}</span>
          )}
        </div>
      ))}

      <div className="mb-4 text-gray-400">
        <b className='mr-3 text-gray-200'>Alert:</b>
        {editingField === 'alert' ? (
          <div className="flex items-center space-x-2 text-gray-300  ">
            <select 
              value={localHub.alert ? 'yes' : 'no'}
              onChange={(e) => {
                const value = e.target.value === 'yes';
                setLocalHub({ ...localHub, alert: value });
                handleSave('alert', value);
              }}
              className='w-[90px] h-[30px] ml-6'
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <Button 
              size="sm" 
              color="success" 
              variant="flat" 
              onClick={() => handleSave('alert', localHub.alert)}
              {...saveButtonAnimations}
            >
              ✔️
            </Button>
            <Button 
              size="sm" 
              color="danger" 
              variant="flat" 
              onClick={() => setEditingField(null)}
              {...saveButtonAnimations}
            >
              ✖️
            </Button>
          </div>
        ) : (
          <span onClick={() => handleEdit('alert')}>{localHub.alert ? 'Yes' : 'No'}</span>
        )}
        <br></br>
          <Button 
        size="lg" 
        color="danger" 
        
        onClick={onOpen}
        style={{ width: '200px',height:'35px',marginTop:'28%' }} // Using inline style for width
      >
        Delete Hub
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='dark'>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-gray-300">Confirm Deletion</ModalHeader>
          <ModalBody>
            <p className='text-gray-400'>Are you sure you want to delete this hub? This action cannot be undone.</p>
            {deleteError && <p className="text-red-500">{deleteError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onOpenChange}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </div>
    </motion.div>
  );
}

export default Hgeneral;