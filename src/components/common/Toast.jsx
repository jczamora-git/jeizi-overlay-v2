import { useEffect } from "react";

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button type="button" className="button-ghost" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export default Toast;
