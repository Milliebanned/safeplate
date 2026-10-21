"use client";

import { useState } from "react";
import { dangerButton, secondaryButton } from "./ui";

/** Two-step delete (PRD): "Delete" → "Confirm delete". No browser dialogs. */
export function ConfirmDelete({
  itemName,
  onConfirm,
  disabled,
  testId,
}: {
  itemName: string;
  onConfirm: () => void;
  disabled?: boolean;
  testId: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        className="rounded-full px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-700/10"
        onClick={() => setAsking(true)}
        disabled={disabled}
        data-testid={`delete-${testId}`}
        aria-label={`Delete ${itemName}`}
      >
        Delete
      </button>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        className={dangerButton}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        disabled={disabled}
        data-testid={`confirm-delete-${testId}`}
        aria-label={`Confirm delete ${itemName}`}
      >
        Confirm delete
      </button>
      <button
        type="button"
        className={`${secondaryButton} px-3 py-1.5`}
        onClick={() => setAsking(false)}
        data-testid={`cancel-delete-${testId}`}
      >
        Cancel
      </button>
    </span>
  );
}
