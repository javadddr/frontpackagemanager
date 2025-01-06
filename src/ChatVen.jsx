import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteIcon } from './DeleteIcon'; // Assuming you have this icon component
import { SlCloudUpload } from "react-icons/sl";
import { MdFileDownload as SlDownload } from "react-icons/md";

const ChatVen = ({ chats, owner, vendorId, vendor }) => {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("file",file)
  useEffect(() => {
    if (chats) {
      setMessages(chats);
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && (newMessage.trim() || file)) {
      sendMessage();
    }
  };

  const handleButtonSend = () => {
    if (newMessage.trim() || file) {
      sendMessage();
    }
  };
  useEffect(() => {
 
   const wsUrl = window.location.hostname === 'localhost'
  ? 'ws://localhost:5000'
  : 'wss://api.dynamopackage.com';

ws.current = new WebSocket(wsUrl);


    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'updateMessages') {
        setMessages(data.messages);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.current.close();
    };
  }, [owner, vendorId,messages,newMessage]);
  const sendMessage = async () => {
    const formData = new FormData();
    formData.append('owner', owner);
    formData.append('vendorId', vendorId);
    formData.append('sender', owner); // Assuming owner is sending the message
    formData.append('content', newMessage);
    if (file) {
      formData.append('file', file);
    }
  
    try {
      const response = await fetch(`${backendUrl}/api/chats/`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const result = await response.json();
      // Assuming you want to update local state with the new message
      setMessages(result.messages);
      setNewMessage('');
      setFile(null);
       // Notify WebSocket server of new message
       if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'messageAdded', owner, vendorId }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error
    }
  };
  const handleDeleteMessage = async (id) => {
    if (!chatId) {
      console.error("Chat ID is not available yet");
      return; // Or handle this scenario appropriately
    }
    try {
      const response = await fetch(`${backendUrl}/api/chats/${chatId}/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
  
      // Update local state after successfully deleting from backend
      setMessages(messages.filter(msg => msg._id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
      // Optionally handle error, like showing an error message to the user
    }
  };
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/chats/?owner=${owner}&vendorId=${vendorId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        console.log("datadata", data);
        
        // Since 'data' is an array of messages, you can't directly get chatId from here.
        // Instead, you need to fetch the chat document itself to get the chatId.
        setMessages(data);
  
        // Fetch the chat document to get the _id
        const chatResponse = await fetch(`${backendUrl}/api/chats/chatInfo?owner=${owner}&vendorId=${vendorId}`);
        if (!chatResponse.ok) {
          throw new Error('Failed to fetch chat document');
        }
        const chatInfo = await chatResponse.json();
        setChatId(chatInfo._id);
  
      } catch (error) {
        console.error("Error fetching messages or chat info:", error);
      }
    };
  
    fetchMessages();
  }, [owner, vendorId]);
  // Remove or modify the existing useEffect that was setting messages from props
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
    } else {
      alert('Please select an image or PDF file.');
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...';
    }
    return name;
  };

  return (
    <div className="h-[420px] w-full bg-gray-600 border border-zinc-600 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 flex justify-between h-[50px] pt-9 items-center">
        <div className="flex items-center z-50 shadow-3xl">
          <Avatar 
            isBordered color="secondary"
           
            size="md" 
            icon={<span className="text-lg z-10">{vendor.name.slice(0, 2).toUpperCase()}</span>}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="h-[300px] overflow-y-auto p-4 flex flex-col" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <AnimatePresence initial={false}>
  {messages.map((msg, index) => (
    <motion.div 
      key={msg._id || index}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`max-w-[50%] mb-2 ${msg.sender === owner ? 'self-end bg-zinc-950 text-white' : 'self-start bg-zinc-200 text-white'} rounded-lg relative`}
    >
      <Card 
        className={`mb-2 min-w-[200px] ${msg.sender === owner ? 'bg-slate-950 text-white' : 'bg-zinc-300 text-black'} rounded-lg relative`}

        isPressable={false}
      >
        <CardBody className="p-3">
          <div className="break-words ">
            {msg.content}
          </div>
                  {msg.file && (
  <div className="mt-2">
{msg.file.mimetype.startsWith('image/') ? (
  <div className="relative">
    <img 
      src={`${backendUrl}${msg.file.path}`} 
      alt="message" 
      className="max-w-full cursor-pointer"
      onClick={() => openImageModal(msg.file.path)}
    />
    <a 
      href={`${backendUrl}${msg.file.path}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="absolute top-2 right-2 bg-white rounded-full p-1 text-black hover:bg-gray-200"
    >
      <SlDownload className="w-6 h-6" style={{color:"blue"}} />
    </a>
  </div>
) : (
      <div className="text-center text-gray-400">
        <a 
          href={`${backendUrl}${msg.file.path}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline mr-2"
        >
          View PDF
        </a>
        <button 
          onClick={() => window.open(`${backendUrl}${msg.file.path}`, '_blank')} 
          className="inline-block bg-white rounded-full p-1 text-black hover:bg-gray-200"
        >
          <SlDownload className="w-6 h-6" style={{color:"blue"}} />
        </button>
      </div>
    )}
  </div>
)}
                  <small className="text-xs text-gray-400 mt-1 block">
                    {`${new Date(msg.timestamp).getHours().toString().padStart(2, '0')}:${new Date(msg.timestamp).getMinutes().toString().padStart(2, '0')} ${new Date(msg.timestamp).toLocaleString('default', { month: 'short', day: 'numeric' }).replace(' ', '')}`}
                  </small>
                </CardBody>
               {msg.sender === owner &&  <DeleteIcon 
                  onClick={() => handleDeleteMessage(msg._id)} // Use _id here
                  className="absolute bottom-3 right-1 cursor-pointer text-red-900 w-4 h-4"
                />}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-center">
          <Input 
            fullWidth 
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleSendMessage}
          
          />
          <label htmlFor="file-upload" className="ml-2 cursor-pointer">
            <SlCloudUpload className="text-gray-300 w-8 h-8" />
            <input 
              id="file-upload"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {file && (
            <div className="ml-2">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="File Preview" className="w-8 h-8 object-cover rounded-full" />
              ) : (
                <span>{truncateFileName(file.name)}</span>
              )}
            </div>
          )}
          <Button 
            color="warning" 
            variant='ghost'
            onPress={handleButtonSend}
            className="ml-2"
            size='sm'
          >
            Send
          </Button>
        </div>
      </div>

      {/* Image Modal */}
      <Modal isOpen={isImageModalOpen} onClose={closeImageModal} size="3xl" className=''>
        <ModalContent>
          <ModalHeader className="flex justify-between">
            <span className="text-lg">Image Preview</span>
      
          </ModalHeader>
          <ModalBody>
            {selectedImage && (
              <div className="relative">
                <img src={URL.createObjectURL(selectedImage)} alt="Full Image View" className="w-full h-[600px]" />
                <button 
                  onClick={() => downloadFile(selectedImage)} 
                  className="absolute -top-8 right-2 bg-white rounded-full p-1 text-black hover:bg-gray-200"
                >
                  <SlDownload className="w-6 h-6" style={{color:"blue"}} />
                </button>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ChatVen;