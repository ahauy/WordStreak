export interface MicPermissionBannerProps {
  status: "denied" | "unsupported";
  onRetry?: () => void;
  className?: string;
}

export function MicPermissionBanner({
  status,
  onRetry,
  className = "",
}: MicPermissionBannerProps) {
  if (status === "unsupported") {
    return (
      <div
        className={`p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm ${className}`}
        data-testid="mic-permission-unsupported"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-950">
              Speech Recognition Unavailable
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your browser does not support native speech recognition. We
              recommend Google Chrome, Microsoft Edge, or Safari. You can still
              listen to audio and explore the IPA guide.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 text-sm ${className}`}
      data-testid="mic-permission-denied"
      role="alert"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-neutral-900 font-semibold">
          <span className="text-lg">🔒</span>
          <h4>Microphone Access Required</h4>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">
          To assess pronunciation, WordStreak needs microphone permission. Click
          the lock icon in your browser address bar to allow microphone access,
          then click Retry below.
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            data-testid="mic-retry-button"
            className="self-start px-4 py-1.5 text-xs font-semibold rounded-full bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Retry Microphone Permission
          </button>
        )}
      </div>
    </div>
  );
}
