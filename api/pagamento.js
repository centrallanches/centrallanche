export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;

    if (!total || !cliente) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const CLIENT_ID = process.env.ANOVA_CLIENT_ID;
    const CLIENT_SECRET = process.env.ANOVA_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Credenciais da Anova não configuradas');
    }

    const API_URL = 'https://api.anovapay.com.br/charges';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'ci': CLIENT_ID,
        'cs': CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Confirme se a Anova quer centavos ou reais. Se errar, tire o * 100
        description: `Pedido Central Lanches - ${cliente.nome}`,
        payment_method: 'pix',
        customer: {
          name: cliente.nome,
          email: cliente.email || 'cliente@centrallanches.com',
          document: cliente.cpf || '00000000000' // CPF fictício se não tiver
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Anova:', data);
      throw new Error(data.message || 'Falha na API de pagamento');
    }

    // Tentativa de encontrar o QR Code/Copia e Cola na resposta
    const pixCode = data.payload || data.qr_code || data.pix?.copiar_colar || data.charge?.pix?.code;

    if (!pixCode) {
      console.error('Resposta completa:', JSON.stringify(data));
      throw new Error('Código PIX não gerado');
    }

    res.status(200).json({ payload: pixCode });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
