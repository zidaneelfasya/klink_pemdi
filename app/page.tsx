import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesContentSection } from "@/components/features-content-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesContentSection />
      <Footer />
    </main>
  );
}
