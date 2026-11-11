import React from "react";

const formatSavedAt = (savedAt) =>
  new Date(savedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const AutosaveHint = ({ lastSavedAt, className = "" }) => {
  return (
    <span
      className={`self-center text-xs text-slate-500 dark:text-slate-400 ${className}`}
      title="Saved in this browser so a logout or refresh does not lose your work. Click Save to store it in the CRM."
    >
      {lastSavedAt
        ? `Draft auto-saved at ${formatSavedAt(lastSavedAt)}`
        : "Changes auto-save in this browser"}
    </span>
  );
};

export default AutosaveHint;
