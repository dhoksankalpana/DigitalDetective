import { SearchX } from "lucide-react";

function EmptyState({
  title = "No records found",
  message = "There is nothing to display right now.",
}) {
  return (
    <div className="empty-state">
      <SearchX size={42} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;