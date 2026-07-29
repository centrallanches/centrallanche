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

    // Endpoint correto para criar transação PIX na AnovaPay (verifique na doc oficial)
    const API_URL = 'https://api.anovapay.com/v1/charges'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY // Algumas versões usam header adicional
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Valor em centavos
        description: `Pedido Central Lanches - ${cliente.nome}`,
        payment_method: 'pix',
        customer: {
          name: cliente.nome,
          document: cliente.cpf || '00000000000', // CPF é obrigatório em muitos gateways PIX
          email: cliente.email || 'cliente@exemplo.com'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar cobrança');
    }

    // Ajuste conforme a resposta real da Anova: geralmente vem em 'qr_code' ou 'payload'
    // Exemplo: data.pix.qr_code ou data.payload
    const pixCode = data.pix?.qr_code || data.payload || data.qr_code;

    if (!pixCode) {
      throw new Error('Código PIX não gerado pela API');
    }

    res.status(200).json({ payload: pixCode });

  } catch (error) {
    console.error("Erro no backend:", error);
    res.status(500).json({ error: error.message });
  }
}
