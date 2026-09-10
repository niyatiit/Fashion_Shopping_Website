import { Link } from "react-router-dom";

const SectionHeader = ({ title, subtitle, viewAllTo }) => (
  <div className="flex items-baseline justify-between mb-8">
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
    {viewAllTo && (
      <Link to={viewAllTo} className="text-sm text-muted hover:text-crimson transition-colors shrink-0 ml-4">
        View all →
      </Link>
    )}
  </div>
);

export default SectionHeader;