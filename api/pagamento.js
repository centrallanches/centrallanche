export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;

    if (!total || !cliente) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const API_KEY = process.env.ANOVA_API_KEY;
    if (!API_KEY) {
      throw new Error('Chave da API não configurada');
    }

    // Tente esta URL. Se falhar, troque para /v1/transactions ou /pix
    const API_URL = 'https://api.anovapay.com/v1/charges'; 

    const body = {
      amount: Math.round(total * 100),
      description: `Pedido Central Lanches`,
      payment_method: 'pix',
      customer: {
        name: cliente.nome,
        email: cliente.email || 'cliente@email.com',
        document: cliente.cpf || '00000000000' // CPF fictício se não tiver
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Anova:', data);
      throw new Error(data.message || 'Erro ao criar cobrança');
    }

    // Tenta encontrar o código PIX em vários lugares possíveis da resposta
    const pixCode = data.pix?.qr_code || data.payload || data.qr_code || data.charge?.pix?.qr_code;

    if (!pixCode) {
      console.error('Resposta da API:', data);
      throw new Error('Código PIX não encontrado na resposta');
    }

    res.status(200).json({ payload: pixCode });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
