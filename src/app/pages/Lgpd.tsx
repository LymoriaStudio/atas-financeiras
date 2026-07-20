import { LegalPageLayout } from "../components/LegalPageLayout";

export function Lgpd() {
  return (
    <LegalPageLayout
      title="Proteção de Dados Pessoais (LGPD)"
      paragraphs={[
        "A empresa GRUPO SBS S.A. realiza o tratamento de dados pessoais em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD).",
        "Os dados tratados possuem finalidade específica e são utilizados observando os princípios da legalidade, finalidade, adequação, necessidade, transparência, segurança, prevenção, não discriminação e responsabilização previstos na legislação.",
        "O titular poderá solicitar informações sobre o tratamento de seus dados, bem como exercer os direitos previstos na LGPD, utilizando os canais oficiais disponibilizados pela organização.",
        "A empresa adota medidas técnicas e administrativas para proteger os dados pessoais contra acessos não autorizados, perda, alteração, divulgação ou qualquer forma de tratamento inadequado.",
      ]}
      orgInfo={[
        { label: "Razão Social", value: "GRUPO SBS S.A." },
        { label: "CNPJ", value: "12.345.678/0001-99" },
        { label: "Site", value: "www.gruposbs.com.br" },
        { label: "E-mail", value: "lgpd@gruposbs.com.br" },
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
