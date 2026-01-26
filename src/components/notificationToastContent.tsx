import React from "react";

interface NotificationToastContentProps {
  title: string;
  message: string;
  type: string;
}

const NotificationToastContent: React.FC<NotificationToastContentProps> = ({ title, message, type }) => {
  const getTypeIcon = () => {
    switch (type) {
      case "order": return "🍽️";
      case "payment": return "💰";
      case "general": return "📢";
      case "role": return "👥";
      case "user": return "👤";
      default: return "🔔";
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '24px' }}>{getTypeIcon()}</span>
      <div>
        <p style={{ fontWeight: 'bold', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>{message}</p>
      </div>
    </div>
  );
};

export default NotificationToastContent;
