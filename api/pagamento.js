export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;

    if (!total || !cliente) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Pega a chave das variáveis de ambiente da Vercel
    const API_KEY = process.env.ANOVA_API_KEY;
    
    // Endpoint oficial da AnovaPay para criar transação
    const API_URL = 'https://api.anovapay.com/v1/transactions'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // AnovaPay costuma usar centavos (ex: 10.50 vira 1050)
        description: `Pedido Central Lanches - ${cliente.nome}`,
        payment_method: 'pix',
        customer: {
          name: cliente.nome,
          email: cliente.email || 'cliente@exemplo.com', // Email opcional, mas algumas APIs exigem
          document: cliente.cpf || '00000000000' // CPF opcional, ajuste se tiver no form
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao comunicar com AnovaPay');
    }

    // Ajuste aqui conforme a resposta real da AnovaPay. 
    // Geralmente o código PIX vem em 'payment.qr_code' ou 'payload'
    const pixPayload = data.payment?.qr_code || data.payload || data.qr_code;

    if (!pixPayload) {
      throw new Error('Payload do PIX não encontrado na resposta');
    }

    res.status(200).json({ payload: pixPayload });

  } catch (error) {
    console.error("Erro backend:", error);
    res.status(500).json({ error: error.message });
  }
}
