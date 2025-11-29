// components/NotificationToastContent.jsx
import React from "react";

const NotificationToastContent = ({ title, message, type }) => {
  const getTypeIcon = () => {
    switch (type) {
      case "order":
        return "🍽️";
      case "payment":
        return "💰";
      case "general":
        return "📢";
      case "role":
        return "👥";
      case "user":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{getTypeIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
      </div>
    </div>
  );
};

export default NotificationToastContent;
