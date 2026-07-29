export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { total, nome } = req.body;

  // Validação básica de entrada
  if (!total || !nome) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const apiKey = process.env.NOVA_PAY_SECRET;
  if (!apiKey) {
    console.error('NOVA_PAY_SECRET não configurada');
    return res.status(500).json({ error: 'Configuração do servidor inválida' });
  }

  try {
    const response = await fetch('https://api.novapay.com.br/v1/pix/cobranca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        amount: total,
        customer: nome
      })
    });

    const data = await response.json();

    // Se a API externa retornar erro, repasse o status correto
    if (!response.ok) {
      console.error('Erro Nova Pay:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro ao gerar Pix' });
  }
}
