export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;
    
    // Use as variáveis de ambiente da Vercel para segurança
    const CLIENT_ID = process.env.ANOVA_CLIENT_ID;
    const CLIENT_SECRET = process.env.ANOVA_CLIENT_SECRET;

    if (!CLIENT_SECRET) {
      throw new Error('Client Secret não configurado no servidor');
    }

    // Endpoint exato da sua documentação (Imagem 3)
    const API_URL = 'https://api.anovapay.com.br/charges'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        // Autenticação via Bearer (Imagem 3)
        'Authorization': `Bearer ${CLIENT_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Valor em centavos
        currency: 'BRL',
        payment_method: 'pix',
        description: `Pedido Central Lanches - ${cliente.nome}`,
        // Dados do cliente (opcional, mas recomendado para rastreio)
        customer: {
          name: cliente.nome,
          email: 'contato@centrallanches.com', // Pode ser fixo se não tiver email do usuário
          document: cliente.telefone.replace(/\D/g, '') // Usa telefone limpo
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Anova:', data);
      throw new Error(data.message || 'Falha ao gerar cobrança');
    }

    // Ajuste aqui: verifique no console.log(data) qual campo volta o código PIX
    // Geralmente é data.pix_code, data.qr_code ou data.payload
    const pixCode = data.pix_code || data.qr_code || data.payload;
    
    if (!pixCode) {
      throw new Error('API retornou sucesso, mas sem código PIX. Verifique o log.');
    }

    return res.status(200).json({ payload: pixCode });

  } catch (error) {
    console.error('Erro no backend:', error);
    return res.status(500).json({ error: error.message });
  }
}
