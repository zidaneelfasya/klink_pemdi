import { AlertCircle, Clock, FileText, Users } from "lucide-react"

export function ProblemStatement() {
  const problems = [
    {
      icon: Users,
      title: "Proses Manual",
      description: "Konsultasi melalui Google Form dan email memakan waktu",
    },
    {
      icon: Clock,
      title: "Respons Lama",
      description: "Waktu tunggu jawaban konsultasi tidak pasti",
    },
    {
      icon: AlertCircle,
      title: "Tidak 24 Jam",
      description: "Layanan terbatas pada jam kerja pemerintah",
    },
    {
      icon: FileText,
      title: "Dokumentasi Tercecer",
      description: "Dokumen resmi sulit diakses dan tidak terpusat",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Kendala Layanan Konsultasi Sebelumnya</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistem konsultasi tradisional menghadapi berbagai tantangan dalam melayani pemerintah daerah
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, idx) => {
            const Icon = problem.icon
            return (
              <div
                key={idx}
                className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
