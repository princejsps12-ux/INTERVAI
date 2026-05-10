'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview/new', label: 'New Interview', icon: PlusCircle },
  { href: '/history', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 border-r border-neural-border bg-neural-bg z-40 flex flex-col">
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-rajdhani tracking-wide transition-all duration-200',
                active
                  ? 'bg-neural-cyan/10 text-neural-cyan border border-neural-cyan/30 shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                  : 'text-neural-text-muted hover:text-neural-text-primary hover:bg-neural-surface'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-neural-cyan' : '')} />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neural-cyan shadow-[0_0_6px_#00f5ff]" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-neural-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neural-purple/10 border border-neural-purple/20">
          <Zap className="w-4 h-4 text-neural-purple" />
          <span className="text-xs font-rajdhani text-neural-purple tracking-wide">
            Upgrade to PRO
          </span>
        </div>
      </div>
    </aside>
  );
}
