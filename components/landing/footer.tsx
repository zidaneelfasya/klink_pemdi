import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">K</span>
              </div>
              <span className="font-semibold">Komdigi</span>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              Kementerian Komunikasi dan Digital Republik Indonesia
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-secondary-foreground transition-colors text-secondary-foreground/70">
                  Tentang
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-foreground transition-colors text-secondary-foreground/70">
                  Dokumentasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-foreground transition-colors text-secondary-foreground/70">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-foreground transition-colors text-secondary-foreground/70">
                  Tim Developer
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-foreground/70">Jl. Medan Merdeka Barat No. 9, Jakarta Pusat</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-secondary-foreground/70">info@komdigi.go.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-secondary-foreground/70">+62 21 3456 7890</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 pt-8">
          <p className="text-center text-sm text-secondary-foreground/60">
            Copyright © {new Date().getFullYear()} Kementerian Komunikasi dan Digital RI. Semua hak dilindungi
            undang-undang.
          </p>
        </div>
      </div>
    </footer>
  )
}
