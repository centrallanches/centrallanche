export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { total, nome } = req.body;

  if (!total || !nome) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const apiKey = process.env.NOVA_PAY_SECRET;
  if (!apiKey) {
    console.error('Variável de ambiente NOVA_PAY_SECRET não encontrada');
    return res.status(500).json({ error: 'Configuração do servidor inválida' });
  }

  try {
    // URL corrigida para Anova Pay
    const response = await fetch('https://api.anovapay.com.br/v1/pix/cobranca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey // Verifique na doc se é x-api-key ou Authorization
      },
      body: JSON.stringify({
        amount: total, // Verifique se a Anova exige 'amount' ou 'value'
        customer: {
          name: nome // Verifique se a estrutura exige um objeto customer
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na Anova Pay:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Erro interno no servidor:', error);
    res.status(500).json({ error: 'Falha ao comunicar com o gateway de pagamento' });
  }
}
