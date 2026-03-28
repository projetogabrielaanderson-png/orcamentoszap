const PrivacidadePage = () => (
  <div className="mx-auto max-w-3xl px-6 py-12">
    <h1 className="text-3xl font-bold mb-6">Política de Privacidade (LGPD)</h1>
    <div className="prose prose-sm text-gray-700 space-y-4">
      <p>Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

      <h2 className="text-xl font-semibold mt-6">1. Dados Coletados</h2>
      <p>Coletamos os seguintes dados através do formulário de contato:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Nome completo</li>
        <li>Número de telefone/WhatsApp</li>
        <li>Mensagem descritiva da solicitação</li>
        <li>Dados de origem (URL do site, parâmetros UTM)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">2. Finalidade do Tratamento</h2>
      <p>Seus dados são tratados para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Responder à sua solicitação de orçamento</li>
        <li>Encaminhar sua demanda ao profissional adequado</li>
        <li>Entrar em contato via WhatsApp ou telefone</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3. Base Legal</h2>
      <p>O tratamento dos dados é baseado no seu consentimento expresso, fornecido ao aceitar estes termos e enviar o formulário (Art. 7º, I da LGPD).</p>

      <h2 className="text-xl font-semibold mt-6">4. Compartilhamento</h2>
      <p>Seus dados podem ser compartilhados apenas com os profissionais cadastrados na plataforma para fins de atendimento da sua solicitação.</p>

      <h2 className="text-xl font-semibold mt-6">5. Armazenamento e Segurança</h2>
      <p>Os dados são armazenados em servidores seguros com criptografia e controle de acesso. Mantemos seus dados apenas pelo tempo necessário para cumprir a finalidade descrita.</p>

      <h2 className="text-xl font-semibold mt-6">6. Seus Direitos</h2>
      <p>Conforme a LGPD, você tem direito a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Acessar seus dados pessoais</li>
        <li>Solicitar correção de dados incompletos ou incorretos</li>
        <li>Solicitar a exclusão dos seus dados</li>
        <li>Revogar o consentimento a qualquer momento</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">7. Contato</h2>
      <p>Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados, entre em contato conosco através dos canais disponíveis na plataforma.</p>
    </div>
  </div>
);

export default PrivacidadePage;
