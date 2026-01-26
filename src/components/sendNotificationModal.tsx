import React, { useState } from "react";
import { notificationService } from "../services/notificationService";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;

}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();
  const [formData, setFormData] = useState({
    type: "general",
    title: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    selectedRoles: [] as string[],
    selectedUsers: [] as string[],
  });
  const [sending, setSending] = useState(false);

  const roles = ["waiter", "kitchen", "bartender", "cashier", "admin"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !user) return;
    setSending(true);

    try {
      let result: { success: boolean } | undefined;

      switch (formData.type) {
        case "general":
          result = await notificationService.sendGeneralNotification(
            selectedRestaurant.id,
            user.id,
            {
              title: formData.title,
              message: formData.message,
              priority: formData.priority,
            }
          );
          break;
        case "role":
          result = await notificationService.sendRoleNotification(
            selectedRestaurant.id,
            user.id,
            {
              title: formData.title,
              message: formData.message,
              roles: formData.selectedRoles,
              priority: formData.priority,
            }
          );
          break;
        case "user":
          result = await notificationService.sendUserNotification(
            selectedRestaurant.id,
            user.id,
            {
              title: formData.title,
              message: formData.message,
              userIds: formData.selectedUsers,
              priority: formData.priority,
            }
          );
          break;
      }

      if (result?.success) {
        alert("Notification sent successfully!");
        onClose();
        setFormData({
          type: "general",
          title: "",
          message: "",
          priority: "normal",
          selectedRoles: [],
          selectedUsers: [],
        });
      } else {
        alert("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Send Notification</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="general">General (All Staff)</option>
              <option value="role">Role Specific</option>
              <option value="user">Specific Users</option>
            </select>
          </div>
          {formData.type === "role" && (
            <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Select Roles</label>
               <div className="space-y-2">
                 {roles.map((role) => (
                   <label key={role} className="flex items-center">
                     <input
                       type="checkbox"
                       checked={formData.selectedRoles.includes(role)}
                       onChange={(e) => {
                         const updated = e.target.checked 
                            ? [...formData.selectedRoles, role] 
                            : formData.selectedRoles.filter(r => r !== role);
                         setFormData({ ...formData, selectedRoles: updated });
                       }}
                       className="mr-2"
                     />
                     <span className="capitalize">{role}</span>
                   </label>
                 ))}
               </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
               <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
            <button type="submit" disabled={sending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md">{sending ? "Sending..." : "Send"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
