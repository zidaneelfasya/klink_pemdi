import Image from "next/image";
import Link from "next/link";

export function Header() {
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
          <Link 
            href="/auth/login"
            className="bg-[#003867] text-white px-6 py-2 rounded-md hover:bg-[#003867] transition-colors "
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
