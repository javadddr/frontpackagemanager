import React, { useState ,useEffect} from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { useHubs } from '../HubsContext';
import Com from "../cop.jpeg"
function Hcomment({ isDark,hubid, hub }) {
  const [comments, setComments] = useState(hub.comment || []);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { hubs, fetchHubs, setHubs } = useHubs();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const handleAddComment = async () => {
    const now = new Date().toISOString();
    const newCommentObj = {
      comment: [
        {
          text: newComment,
          creationdate: now
        }
      ]
    };

    const key = localStorage.getItem("key");

    try {
      const response = await fetch(`${backendUrl}/api/hubs/${hubid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "key": key
        },
        body: JSON.stringify(newCommentObj),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add comment!");
      }
      setNewComment('');
      // If the comment was successfully added on the server side, update local state
      setComments([newCommentObj.comment[0], ...comments]); // Assuming the server will return the new comment or we can just add it to our state
    
      fetchHubs();
      setIsAddingComment(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      // Handle the error, perhaps by showing a message to the user
    }
  };
  useEffect(() => {
  
    fetchHubs();
  }, []);

  const handleCancelComment = () => {
    setNewComment('');
    setIsAddingComment(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      className="p-4"
    >
      {/* Button to start adding a new comment */}
      <Button 
        color="primary" 
        variant="light" 
        onClick={() => setIsAddingComment(true)}
        className="mb-4 w-full"
      >
        Add New Comment
      </Button>

      {/* New Comment Input */}
      {isAddingComment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`mb-4 p-0 bg-gray-100 rounded-lg ${isDark?"bg-zinc-900":"bg-white"} `}
        >
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full h-20 mb-2 p-2 rounded-lg text-gray-400 border"
          />
          <div className="flex justify-end space-x-2 ">
            <Button 
              size="sm" 
              color="success" 
              variant="flat" 
              onClick={handleAddComment}
            >
              ✔️
            </Button>
            <Button 
              size="sm" 
              color="danger" 
              variant="flat" 
              onClick={handleCancelComment}
            >
              ✖️
            </Button>
          </div>
        </motion.div>
      )}

      {/* Display Sorted Comments */}
      {comments.length > 0 ? (
        comments
          .sort((a, b) => new Date(b.creationdate) - new Date(a.creationdate))
          .map((comment, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`mb-4 p-4 rounded-lg shadow ${isDark?"bg-zinc-400":"bg-zinc-100"} `}
             
            >
              <p className="text-sm text-black">{comment.text}</p>
              <small className="text-xs text-gray-500">
                {new Date(comment.creationdate).toLocaleString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit'
                }).replace(',', '')}
              </small>
            </motion.div>
          ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full  ">
        <img src={Com} alt="No hubs available" className={`${isAddingComment?"w-[0px] h-[0px] object-cover":"w-[300px] rounded-full shadow-5xl h-[300px] object-cover mb-6"} `} />
        <p className="text-center text-lg text-gray-500">{isAddingComment?"":"No Comment. Why not start by adding your first one?"}</p>
      </div>
      )}
    </motion.div>
  );
}

export default Hcomment;