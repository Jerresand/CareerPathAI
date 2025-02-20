'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(auth)/actions';
import { useRouter } from 'next/navigation';
import { Users, Settings, Shield, Activity, Menu, FileText, Briefcase, UserCircle } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">CareerPathAI</span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9">
                  <AvatarImage alt={user.name || ''} />
                  <AvatarFallback>
                    {user.email
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/talent" className="flex w-full items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <form action={handleSignOut} className="w-full">
                  <button type="submit" className="flex w-full">
                    <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/talent/profile', icon: UserCircle, label: 'Profile' },
    { href: '/talent/resume', icon: FileText, label: 'Resume' },
    { href: '/talent/matches', icon: Briefcase, label: 'Job Matches' },
    { href: '/talent/settings', icon: Settings, label: 'Settings' },
    { href: '/talent/security', icon: Shield, label: 'Security' },
  ];

  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
          <div className="flex items-center">
            <span className="font-medium">Menu</span>
          </div>
          <Button
            className="-mr-3"
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden h-full">
          {/* Sidebar */}
          <aside
            className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
              isSidebarOpen ? 'block' : 'hidden'
            } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <nav className="h-full overflow-y-auto p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={`shadow-none my-1 w-full justify-start ${
                      pathname === item.href ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
        </div>
      </div>
    </section>
  );
}
