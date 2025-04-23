"use client";

import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NotificationProps {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissTimeout?: number;
}

export const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  onDismiss, 
  autoDismiss = true, 
  autoDismissTimeout = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(), 300); // Esperar pela animação de fade-out
      }, autoDismissTimeout);
      
      return () => clearTimeout(timeout);
    }
  }, [autoDismiss, autoDismissTimeout, onDismiss]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div 
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <Icon className="h-5 w-5" />
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(), 300);
        }}
        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fechar notificação"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
