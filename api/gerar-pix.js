// api/gerar-pix.js
export default async function handler(req, res) {
  // Configura CORS
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

  const apiKey = process.env.ELITE_PAY_API_KEY;
  
  if (!apiKey) {
    console.error('Variável ELITE_PAY_API_KEY não encontrada');
    return res.status(500).json({ error: 'Configuração do servidor inválida' });
  }

  try {
    // Endpoint da Elite Pay (ajuste conforme a documentação oficial deles)
    // Geralmente é algo como /v1/charges ou /pix/create
    const response = await fetch('https://api.elitepay.com.br/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Ou 'x-api-key', verifique a doc da Elite
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Valor em centavos
        description: `Pedido Central Lanches - ${nome}`,
        payment_method: 'pix',
        customer: {
          name: nome
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Elite Pay:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao gerar PIX' });
    }

    // Ajuste os campos de retorno conforme a resposta da Elite Pay
    return res.status(200).json({
      qr_code: data.qr_code || data.qr_code_base64,
      pix_copy_paste: data.pix_copy_paste || data.emv || data.payload
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Falha ao comunicar com o gateway' });
  }
}
