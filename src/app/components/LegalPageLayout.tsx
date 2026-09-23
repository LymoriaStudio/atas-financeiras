import { useNavigate } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface InfoItem {
  label: string;
  value: string;
}

interface ParagraphItem {
  heading?: string;
  text: string;
}

interface LetterheadItem {
  letterhead: {
    title: string;
    org: string;
    dateLabel: string;
    dateValue: string;
  };
}

interface LegalPageLayoutProps {
  title: string;
  paragraphs: (string | ParagraphItem | LetterheadItem)[];
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
  const hasLetterhead = paragraphs.some((p) => typeof p === "object" && "letterhead" in p);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar onAdminClick={() => navigate("/login")} isContato />

      <main className="flex-1 bg-gray-50 py-16 mt-15">
        <div className="max-w-3xl mx-auto px-6">
          {!hasLetterhead && (
            <div className="text-center mb-12">
              <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
                {title}
              </h2>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <div className="space-y-4">
              {paragraphs.map((p, i) => {
                if (typeof p === "object" && "letterhead" in p) {
                  const { title: lhTitle, org, dateLabel, dateValue } = p.letterhead;
                  return (
                    <div
                      key={i}
                      className={i > 0 ? "pt-6 mt-2 border-t border-gray-100" : ""}
                    >
                      <p style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }} className="uppercase tracking-wide">{lhTitle}</p>
                      <p className="text-base font-semibold text-gray-600 mt-1">{org}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{dateLabel}: {dateValue}</p>
                    </div>
                  );
                }

                const item = typeof p === "string" ? { text: p } : p;
                return (
                  <div key={i}>
                    {item.heading && (
                      <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.heading}</h3>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                );
              })}
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
