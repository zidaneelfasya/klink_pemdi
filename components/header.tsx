import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function getInitials(fullName?: string, email?: string): string {
  if (fullName) {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }
  
  if (email) {
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  
  return 'U';
}

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  
  // Fetch user profile data
  let userProfile = null;
  if (user?.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.sub)
      .single();
    userProfile = profile;
  }

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Image
              src="/images/klinik_logo.png"
              alt="Klinik Logo"
              width={100}
              height={100}
              className="mr-3"
            />
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  {/* User Avatar with Initials */}
                  <div className="w-10 h-10 bg-[#003867] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {getInitials(userProfile?.full_name, user.email)}
                  </div>
                  {/* User Email */}
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || user.email}
                    </span>
                    <span className="text-xs text-gray-500">
                    {user.email}

                    </span>
                  </div>
                  {/* Dropdown Arrow */}
                  <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                {/* User Info Header */}
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
                
                {/* Menu Items */}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 w-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"/>
                    </svg>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <LogoutButton className="flex items-center gap-2 w-full text-red-600 hover:text-red-700 hover:bg-red-50" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              href="/auth/login"
              className="bg-[#003867] text-white px-6 py-2 rounded-md "
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
