interface CompareToggleProps {
  enabled: boolean;
  count: number;
  onChange: (enabled: boolean) => void;
}

/** Toggle compare mode — pick two countries for side-by-side analysis. */
export function CompareToggle({ enabled, count, onChange }: CompareToggleProps) {
  return (
    <div className="compare-toggle">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Compare mode — select two countries to compare"
        className={`compare-toggle__btn${enabled ? ' is-active' : ''}`}
        onClick={() => onChange(!enabled)}
      >
        <span className="compare-toggle__track" aria-hidden="true">
          <span className="compare-toggle__thumb" />
        </span>
        <span className="compare-toggle__label">
          Compare mode
          {enabled && count > 0 && (
            <span className="compare-toggle__badge" aria-live="polite">
              {count}/2
            </span>
          )}
        </span>
      </button>
      {enabled && (
        <p className="compare-toggle__hint">Click two countries on the globe or list</p>
      )}
    </div>
  );
}
