import { LegalPageLayout } from "../components/LegalPageLayout";

export function TermosDeUso() {
  return (
    <LegalPageLayout
      title="Termos de Uso"
      paragraphs={[
        "Ao utilizar esta plataforma, o usuário declara estar ciente e concordar com as condições estabelecidas neste documento.",
        "O sistema é disponibilizado pela empresa GRUPO SBS S.A. exclusivamente para consulta, gerenciamento e disponibilização de documentos corporativos.",
        "É responsabilidade do usuário manter a confidencialidade de suas credenciais de acesso e utilizar a plataforma de forma ética, segura e em conformidade com a legislação vigente.",
        "É proibida qualquer tentativa de acesso não autorizado, alteração indevida de informações, utilização da plataforma para fins ilícitos ou qualquer ação que possa comprometer sua segurança, disponibilidade ou integridade.",
        "A empresa GRUPO SBS S.A. poderá atualizar estes Termos de Uso sempre que necessário, sendo recomendada a consulta periódica desta página.",
      ]}
      orgInfo={[
        { label: "Razão Social", value: "GRUPO SBS S.A." },
        { label: "CNPJ", value: "12.345.678/0001-99" },
        { label: "Site", value: "www.gruposbs.com.br" },
        { label: "E-mail", value: "privacidade@gruposbs.com.br" },
      ]}
      sysInfo={[
        { label: "Sistema", value: "Portal Corporativo de Documentos" },
        { label: "Produto", value: "Lymoria Docs" },
        { label: "Versão", value: "1.0.0" },
        { label: "Última atualização", value: "19/07/2026" },
        { label: "Desenvolvido por", value: "Lymoria Studio" },
      ]}
      closing="Esta página poderá ser atualizada periodicamente para refletir alterações legais, operacionais ou tecnológicas. Recomenda-se sua consulta sempre que utilizar a plataforma."
    />
  );
}
