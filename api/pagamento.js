export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;

    // Substitua pela sua chave real da AnovaPay
    const API_KEY = 'cms0q5i6j000elp019xciyps3'; 
    
    const response = await fetch('https://api.anovapay.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        amount: total,
        description: 'Pedido Central Lanches',
        customer: cliente
      })
    });

    const data = await response.json();
    return res.status(200).json({ link: data.checkout_url });

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
}
