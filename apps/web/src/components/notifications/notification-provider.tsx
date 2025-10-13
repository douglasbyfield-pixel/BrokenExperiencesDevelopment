"use client";

import { createContext, useContext, ReactNode } from "react";
import toast, { Toaster } from "react-hot-toast";

// Notification types
export interface NotificationOptions {
  title?: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notify: (options: NotificationOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notify = (options: NotificationOptions) => {
    const { title, message, type = "info", duration = 4000, action } = options;
    
    const content = (
      <div className="flex flex-col gap-1">
        {title && <div className="font-semibold text-sm">{title}</div>}
        <div className="text-sm">{message}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1 text-left"
          >
            {action.label}
          </button>
        )}
      </div>
    );

    switch (type) {
      case "success":
        toast.success(content, { duration });
        break;
      case "error":
        toast.error(content, { duration });
        break;
      case "warning":
        toast(content, {
          duration,
          icon: "⚠️",
          style: {
            border: "1px solid #f59e0b",
            backgroundColor: "#fffbeb",
            color: "#92400e",
          },
        });
        break;
      case "info":
      default:
        toast(content, {
          duration,
          icon: "ℹ️",
          style: {
            border: "1px solid #3b82f6",
            backgroundColor: "#eff6ff",
            color: "#1e40af",
          },
        });
        break;
    }
  };

  const success = (message: string, title?: string) => {
    notify({ message, title, type: "success" });
  };

  const error = (message: string, title?: string) => {
    notify({ message, title, type: "error" });
  };

  const info = (message: string, title?: string) => {
    notify({ message, title, type: "info" });
  };

  const warning = (message: string, title?: string) => {
    notify({ message, title, type: "warning" });
  };

  const value = {
    notify,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            maxWidth: "400px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}