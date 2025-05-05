
import React from 'react';
import { motion } from 'framer-motion';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;
  
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center bg-[#25d366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.87.116-.174.240-.075.366.101.126.449.535.964.971.66.556 1.218.73 1.39.811.144.07.289.043.376-.039.087-.087.378-.447.478-.607.101-.16.202-.134.339-.08.144.053.906.427 1.064.5.159.07.269.101.304.159.035.059.035.344-.08.677zM18.967 6.957C17.25 5.185 14.733 4.275 12.03 4.275c-5.982 0-10.851 4.87-10.853 10.853 0 1.91.497 3.783 1.44 5.432l-1.53 5.589 5.724-1.5c1.587.862 3.379 1.318 5.215 1.32 5.979 0 10.85-4.87 10.852-10.854-.001-2.899-.963-5.597-2.81-7.768z"/>
        </svg>
      </a>
    </motion.div>
  );
};

export default WhatsAppButton;
