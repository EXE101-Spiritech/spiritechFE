import { Link } from 'react-router';
import { Shield } from 'lucide-react';

interface AdminBadgeProps {
  onNavigate?: () => void;
  mobile?: boolean;
}

/** Reusable admin badge/button for navigation. */
export function AdminBadge({ onNavigate, mobile }: AdminBadgeProps) {
  const baseClass = 'inline-flex items-center gap-1.5 transition-all active:scale-95';

  if (mobile) {
    return (
      <Link
        to="/admin"
        onClick={onNavigate}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}
      >
        <Shield className="w-4 h-4" />
        Quản trị
      </Link>
    );
  }

  return (
    <Link
      to="/admin"
      className={`${baseClass} text-white/90 hover:text-white transition-colors p-2`}
      title="Quản trị"
    >
      <Shield className="w-5 h-5" />
    </Link>
  );
}
