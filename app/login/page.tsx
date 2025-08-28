import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4">
			{/* Main Card Container */}
			<Card className="w-full max-w-6xl border-none rounded-2xl overflow-hidden p-4 bg-[#080808]">
				<div className="flex flex-col lg:flex-row min-h-[700px]">
					
					{/* Increased height */}
					
						<div className="flex-1 relative">
							<div className="absolute inset-0">
								<Image
                  
									src="/images/login-img.png"
									alt="Background Gradient"
									fill
									className="object-cover rounded-2xl"
									priority
								/>
							</div>

							{/* Overlay untuk meningkatkan keterbacaan teks */}
							<div className="absolute inset-0 bg-black/20"></div>

							{/* Konten di atas gambar */}
							<div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-6">
								<h1 className="text-2xl font-bold text-balance">
									Klinik Pemerintah Digital
								</h1>
								<p className="text-sm opacity-90 text-balance max-w-md">
									Ikuti langkah-langkah mudah berikut untuk mulai menggunakan
									layanan digital kami:
								</p>

								<div className="space-y-4 mt-8 w-full max-w-xs">
									<div className="bg-white backdrop-blur-md rounded-lg py-3 px-6 border border-white/20">
										<span className="text-black font-medium">
											1. Daftar akun dengan email
										</span>
									</div>
									<div className="bg-white backdrop-blur-md rounded-lg py-3 px-6 border border-white/20">
										<span className="text-black font-medium">
											2. Verifikasi akun Anda
										</span>
									</div>
									<div className="bg-white backdrop-blur-md rounded-lg py-3 px-6 border border-white/20">
										<span className="text-black font-medium">
											3. Masuk dan mulai menggunakan layanan
										</span>
									</div>
								</div>
							</div>
						</div>
					
					
					{/* Right Panel - Login Form */}
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="w-full max-w-sm space-y-6">
							<div className="text-center space-y-2">
								<h2 className="text-2xl font-bold text-white text-balance">
									Selamat Datang Kembali
								</h2>
								<p className="text-gray-400 text-sm">
									Belum Punya Akun?{" "}
									<button className="text-white hover:underline">Daftar</button>
								</p>
							</div>

							<form className="space-y-4">
								<div>
									<Input
										type="email"
										placeholder="Email address"
										className="bg-[#3b3b3b] border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg"
									/>
								</div>
								<div>
									<Input
										type="password"
										placeholder="Password"
										className="bg-[#3b3b3b] border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg"
									/>
								</div>
								<Button
									type="submit"
									className="w-full h-12 bg-white text-black hover:bg-gray-100 rounded-lg font-medium"
								>
									Masuk
								</Button>
							</form>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
