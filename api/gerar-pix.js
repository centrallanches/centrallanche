// api/gerar-pix.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { total, nome } = req.body;

  // Dados da Elite Pay (Sandbox ou Produção)
  const clientId = process.env.ELITE_CLIENT_ID; 
  const clientSecret = process.env.ELITE_SECRET; 

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Configuração do gateway faltando.' });
  }

  try {
    const response = await fetch('https://api.elitepay.com.br/v1/pix/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'Authorization': `Bearer ${clientSecret}`
      },
      body: JSON.stringify({
        total: total,
        nome: nome,
        descricao: `Pedido Central Lanches - ${nome}`
      })
    });

    const data = await response.json();

    if (response.ok) {
      // A Elite Pay geralmente retorna qrcode_base64 e pix_copy_paste
      return res.status(200).json({
        qr_code: `data:image/png;base64,${data.qrcode}`, // Ajuste conforme a resposta real da API
        pix_copy_paste: data.copia_cola // Ajuste conforme a resposta real da API
      });
    } else {
      return res.status(response.status).json(data);
    }

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao gerar Pix.' });
  }
}
