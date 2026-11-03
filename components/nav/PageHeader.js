// Page title (one h1 per page) with an optional subtitle and actions on the right.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-2">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
