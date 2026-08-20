"use client";

type Props = {
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteAccountDialog({ deleting, onCancel, onConfirm }: Props) {
  return (
    <div className="dialog-backdrop">
      <div className="dialog elev-lg">
        <h2 className="dialog-title">Delete your account?</h2>
        <p className="dialog-body">
          This permanently deletes your account and every daily entry you&apos;ve logged.
          This can&apos;t be undone.
        </p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ background: "var(--color-accent-700)" }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, delete everything"}
          </button>
        </div>
      </div>
    </div>
  );
}
