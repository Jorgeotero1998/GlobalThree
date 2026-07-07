/** Full-screen loading state shown while the globe assets stream in. */
export function LoadingScreen() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__orb" aria-hidden="true">
        <span className="loading__ring" />
        <span className="loading__ring loading__ring--2" />
        <span className="loading__core" />
      </div>
      <p className="loading__label">Assembling the globe…</p>
    </div>
  );
}
