// components/SendNotificationModal.jsx
import React, { useState } from "react";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../lib/authStore";

export const SendNotificationModal = ({ isOpen, onClose }) => {
  const { user, restaurant } = useAuthStore();
  const [formData, setFormData] = useState({
    type: "general",
    title: "",
    message: "",
    priority: "normal",
    selectedRoles: [],
    selectedUsers: [],
  });
  const [sending, setSending] = useState(false);

  const roles = ["waiter", "kitchen", "bartender", "cashier", "admin"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      let result;

      switch (formData.type) {
        case "general":
          result = await notificationService.sendGeneralNotification(
            restaurant.id,
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
            restaurant.id,
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
            restaurant.id,
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

      if (result.success) {
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
          {/* Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="general">General (All Staff)</option>
              <option value="role">Role Specific</option>
              <option value="user">Specific Users</option>
            </select>
          </div>

          {/* Role Selection */}
          {formData.type === "role" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Roles
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedRoles: [...formData.selectedRoles, role],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedRoles: formData.selectedRoles.filter(
                              (r) => r !== role
                            ),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter notification title"
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter notification message"
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
