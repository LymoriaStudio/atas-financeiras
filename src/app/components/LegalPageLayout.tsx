import { useNavigate } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface InfoItem {
  label: string;
  value: string;
}

interface LegalPageLayoutProps {
  title: string;
  paragraphs: string[];
  orgInfo: InfoItem[];
  sysInfo: InfoItem[];
  closing: string;
}

function InfoBlock({ heading, items }: { heading: string; items: InfoItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{heading}</h3>
      <dl className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <dt className="text-xs font-semibold text-gray-400">{item.label}</dt>
            <dd className="text-sm text-gray-700 break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function LegalPageLayout({ title, paragraphs, orgInfo, sysInfo, closing }: LegalPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar onAdminClick={() => navigate("/login")} isContato />

      <main className="flex-1 bg-gray-50 py-16 mt-15">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
              {title}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 text-sm leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <InfoBlock heading="Informações da Organização" items={orgInfo} />
            <InfoBlock heading="Informações do Sistema" items={sysInfo} />
          </div>

          <p className="text-gray-400 text-xs text-center leading-relaxed">{closing}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
