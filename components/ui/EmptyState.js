// Shown when a list has nothing yet: icon in a tinted circle, title, one sentence, optional action.
export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="mb-2 grid size-22 place-items-center rounded-pill bg-primary-tint text-on-primary-tint">
        <Icon className="size-icon-xl" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className="card-title">{title}</p>
      {children && <p className="max-w-90 text-ink-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
