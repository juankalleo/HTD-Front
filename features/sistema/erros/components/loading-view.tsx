export function LoadingView() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3" role="status" aria-live="polite" aria-busy="true">
      <span className="loading loading-spinner loading-md text-primary" />
      <p className="text-sm text-base-content/60">Carregando...</p>
    </div>
  );
}
