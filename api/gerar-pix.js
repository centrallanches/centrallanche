export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, nome } = req.body;

    const response = await fetch('https://api.novapay.com.br/v1/pix/cobranca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOVA_PAY_SECRET
      },
      body: JSON.stringify({
        amount: total,
        customer: nome
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar Pix' });
  }
}
