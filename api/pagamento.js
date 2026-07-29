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

    const API_URL = 'https://api.anovapay.com/v1/charges'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        description: `Pedido Central Lanches`,
        payment_method: 'pix',
        customer: {
          name: cliente.nome,
          document: cliente.cpf || '00000000000',
          email: cliente.email || 'cliente@exemplo.com'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar cobrança');
    }

    const pixCode = data.pix?.qr_code || data.payload || data.qr_code;

    if (!pixCode) {
      throw new Error('Código PIX não gerado');
    }

    res.status(200).json({ payload: pixCode });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
