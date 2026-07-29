// api/gerar-pix.js
export default async function handler(req, res) {
  // Permite CORS para o frontend acessar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { total, nome } = req.body;

  if (!total || !nome) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Usa as variáveis corretas da Anova Pay configuradas na Vercel
  const clientId = process.env.ANOVA_CLIENT_ID;
  const clientSecret = process.env.ANOVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Variáveis ANOVA_CLIENT_ID ou ANOVA_CLIENT_SECRET faltando');
    return res.status(500).json({ error: 'Configuração do servidor inválida' });
  }

  try {
    // Endpoint correto da Anova Pay para criar cobrança
    const response = await fetch('https://api.anovapay.com.br/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ci': clientId,
        'cs': clientSecret
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Anova geralmente usa centavos
        description: `Pedido Central Lanches - ${nome}`,
        payment_method: 'pix' // Especifica o método de pagamento
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Anova Pay:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao gerar PIX' });
    }

    // Retorna o QR Code e o CopyPaste para o frontend
    // Ajuste os campos 'qr_code' e 'pix_copy_paste' conforme o retorno real da Anova
    return res.status(200).json({
      qr_code: data.qr_code || data.qr_code_base64,
      pix_copy_paste: data.pix_copy_paste || data.emv
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Falha ao comunicar com o gateway' });
  }
}
