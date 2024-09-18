import { CardList } from "@repo/models";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

interface ReferenceCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({ isOpen, onClose }) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Card Reference</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <ul className="space-y-4">
        {CardList.map(([, card]) => (
          <li key={card.value} className="border-b pb-2">
            <h3 className="font-semibold">
              {card.name} ({card.value}) x{card.quantity}
            </h3>
            <p className="text-sm text-gray-600">{card.shortDescription}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
