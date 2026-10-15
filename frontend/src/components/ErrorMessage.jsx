import { AlertTriangle } from "lucide-react";

function ErrorMessage({
  message = "Something went wrong. Please try again.",
}) {
  return (
    <div className="error-message">
      <AlertTriangle size={20} />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;