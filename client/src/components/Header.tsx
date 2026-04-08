import React from 'react';
import { Link } from 'wouter';
import { Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenu = false }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 font-display text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline">DyslexiaScreen</span>
            <span className="sm:hidden">DS</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {user && (
            <>
              <Link href="/dashboard">
                <a className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              </Link>
              <Link href="/screening">
                <a className="text-foreground hover:text-primary transition-colors">Screening</a>
              </Link>
              <Link href="/help">
                <a className="text-foreground hover:text-primary transition-colors">Help</a>
              </Link>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                  <span className="text-xs bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/accessibility">
                    <a className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Accessibility
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="cursor-pointer">Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMenu && user && (
        <nav className="md:hidden bg-secondary border-t border-border">
          <div className="container py-4 flex flex-col gap-3">
            <Link href="/dashboard">
              <a className="text-foreground hover:text-primary transition-colors block py-2">Dashboard</a>
            </Link>
            <Link href="/screening">
              <a className="text-foreground hover:text-primary transition-colors block py-2">Screening</a>
            </Link>
            <Link href="/help">
              <a className="text-foreground hover:text-primary transition-colors block py-2">Help</a>
            </Link>
            <Link href="/accessibility">
              <a className="text-foreground hover:text-primary transition-colors block py-2">Accessibility</a>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};
