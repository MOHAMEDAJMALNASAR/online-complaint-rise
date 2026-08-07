import { statusMeta } from "../utils/helpers.js";

export default function StatusBadge({ status }) {
  const meta = statusMeta(status);
  return (
    <span className={`badge border ${meta.color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}