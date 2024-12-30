import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '@nextui-org/react';

const Loading = () => {
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center h-screen w-full "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        variants={spinnerVariants}
        initial="initial"
        animate="animate"
      >
        <Spinner label="Loading..." color="primary" size="lg" />
      </motion.div>
    </motion.div>
  );
};

export default Loading;