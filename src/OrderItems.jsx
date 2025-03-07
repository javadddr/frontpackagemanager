import React, { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { EditIcon } from "./EditIcon"; 
import { DeleteIcon } from "./DeleteIcon";
import { FaSitemap } from "react-icons/fa";
import { AutoComplete, Input } from 'antd'; 
import { Check } from "lucide-react"

function OrderItems({ isDark, order, getCustomerName2, products, handleUpdateOrder, setFormData, formData }) {
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [itemInputs, setItemInputs] = useState(order.items.map(() => ''));
  const [localQuantities, setLocalQuantities] = useState(order.items.map(item => item.quantity));
  const [originalItemIds, setOriginalItemIds] = useState(order.items.map(item => item.item)); // Track original item IDs
  const productOptions = products.map(product => ({
    value: product._id,
    label: product.name
  }));
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const startEdit = (index) => {
    setEditingItemIndex(index);
  };

  const updateItem = async (index, updatedItemData) => {
    const ownerKey = localStorage.getItem("key");
    if (!ownerKey) {
      console.error("Owner key is missing in localStorage");
      alert("Please log in to update the order.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/orders/${order._id}/items/index/${index}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'owner': ownerKey
        },
        body: JSON.stringify(updatedItemData),
      });
      console.log("response", response);
      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to update item');
      }

      const updatedOrder = await response.json();
      
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((i, idx) => 
          idx === index ? { ...i, ...updatedItemData } : i
        )
      }));

      setLocalQuantities(prev => prev.map((q, idx) => 
        idx === index ? updatedItemData.quantity : q
      ));

      setEditingItemIndex(null);
      handleUpdateOrder();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item: " + error.message);
    }
  };

  const deleteItem = async (index) => {
    const item = formData.items[index];
    try {
      const response = await fetch(`${backendUrl}/api/orders/${order._id}/items/${item.item}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, idx) => idx !== index)
      }));
      setLocalQuantities(prev => prev.filter((_, idx) => idx !== index));
      setItemInputs(prev => prev.filter((_, idx) => idx !== index));
      setOriginalItemIds(prev => prev.filter((_, idx) => idx !== index));
      handleUpdateOrder();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    if (formData && formData.items) {
      setLocalQuantities(formData.items.map(item => item.quantity));
      setOriginalItemIds(formData.items.map(item => item.item)); // Sync original IDs
    }
  }, [formData]);

  return (
    <div>
      <div className="flex items-center w-full text-gray-300 font-mono text-sm mb-2">
        <FaSitemap className="mr-1 text-blue-500" size={16} />
        <span className={`${isDark?"text-gray-100":"text-gray-400"} font-semibold`}>Items:</span>
      </div>
      {formData.items && formData.items.length > 0 ? (
        <div className="max-h-[200px] overflow-y-auto">
          {formData.items.map((item, index) => (
            <Card
              key={index}
              className={`${isDark?"bg-gray-800 text-white":"bg-gray-300 text-black"} rounded-lg shadow-lg mb-4`}
            >
              <CardBody>
                {editingItemIndex === index ? (
                  <div className="flex justify-between items-center">
                    <div className="flex w-[400px] items-center">
                      <span className="text-sm font-medium mr-3">{getCustomerName2(item.item)}</span>
                      <AutoComplete
                        style={{ width: '40%', height: "25px" }}
                        placeholder="Select or enter item name"
                        options={productOptions}
                        value={itemInputs[index]}
                        onSearch={(value) => setItemInputs(prev => {
                          const newInputs = [...prev];
                          newInputs[index] = value;
                          return newInputs;
                        })}
                        onChange={(value) => {
                          setItemInputs(prev => {
                            const newInputs = [...prev];
                            newInputs[index] = getCustomerName2(value);
                            return newInputs;
                          });
                          setFormData(prev => ({
                            ...prev,
                            items: prev.items.map((i, idx) => 
                              idx === index ? {...i, item: value} : i
                            )
                          }));
                        }}
                        filterOption={(inputValue, option) =>
                          option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <Input
                        className="text-sm font-medium text-black w-20 mr-[300px]"
                        type="number"
                        min={1}
                        value={localQuantities[index]}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          setLocalQuantities(prev => {
                            const newQuantities = [...prev];
                            newQuantities[index] = newQuantity;
                            return newQuantities;
                          });
                          setFormData(prev => ({
                            ...prev,
                            items: prev.items.map((i, idx) => 
                              idx === index ? {...i, quantity: newQuantity} : i
                            )
                          }));
                        }}
                      />
                      <Check
                        className="ml-2 cursor-pointer text-green-500"
                        onClick={() => {
                          updateItem(index, {
                            item: formData.items[index].item, // New product ID
                            quantity: localQuantities[index],
                            shipped: item.shipped
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{getCustomerName2(item.item)}</span>
                    <span className="text-sm text-gray-400">Quantity: {item.quantity}</span>
                    <span className="text-sm text-gray-400">Shipped: {item.shipped}</span>
                    <div className="flex">
                      <EditIcon 
                        className="mr-6 cursor-pointer"
                        onClick={() => startEdit(index)}
                      />
                      <DeleteIcon 
                        className="ml-2 cursor-pointer text-red-500"
                        onClick={() => deleteItem(index)}
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No items found.</p>
      )}
    </div>
  );
}

export default OrderItems;