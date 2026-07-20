import { LegalPageLayout } from "../components/LegalPageLayout";

export function PoliticaPrivacidade() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      paragraphs={[
        "A empresa GRUPO SBS S.A. respeita a privacidade de seus usuários e adota medidas técnicas e administrativas para proteger os dados pessoais tratados por meio desta plataforma.",
        "As informações eventualmente coletadas durante a utilização do sistema destinam-se exclusivamente à autenticação de usuários, controle de acesso, segurança da informação, auditoria das operações e melhoria contínua dos serviços oferecidos.",
        "Os dados pessoais não são comercializados e somente poderão ser compartilhados quando houver obrigação legal, determinação de autoridade competente ou necessidade operacional relacionada à prestação dos serviços disponibilizados.",
        "A organização adota práticas de segurança compatíveis com a natureza das informações tratadas, buscando prevenir acessos não autorizados, alteração, divulgação ou destruição indevida dos dados.",
        "O titular dos dados poderá exercer os direitos previstos na Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD), entrando em contato pelos canais oficiais da organização.",
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
      closing="Esta Política de Privacidade poderá ser atualizada periodicamente para refletir alterações legais, operacionais ou tecnológicas. Recomenda-se sua consulta sempre que utilizar a plataforma."
    />
  );
}
