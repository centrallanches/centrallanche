// api/gerar-pix.js
export default async function handler(req, res) {
  // Permite apenas POST para segurança
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { total, cliente } = req.body;
    
    // Pega as credenciais do servidor (Vercel Environment Variables)
    const CLIENT_ID = process.env.ANOVA_CLIENT_ID;
    const CLIENT_SECRET = process.env.ANOVA_CLIENT_SECRET;

    // Verifica se a chave secreta está carregada
    if (!CLIENT_SECRET) {
      console.error('Erro: ANOVA_CLIENT_SECRET não configurada');
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    // Endpoint da AnovaPay
    const API_URL = 'https://api.anovapay.com.br/charges'; 

    // Chama a API externa
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIENT_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Converte reais para centavos
        currency: 'BRL',
        payment_method: 'pix',
        description: `Pedido Central Lanches`,
        customer: {
          name: cliente.nome || 'Cliente',
          email: cliente.email || 'contato@centrallanches.com',
          document: cliente.telefone ? cliente.telefone.replace(/\D/g, '') : '00000000000'
        }
      })
    });

    const data = await response.json();

    // Tratamento de erro da API externa
    if (!response.ok) {
      console.error('Erro AnovaPay:', data);
      return res.status(response.status).json({ error: data.message || 'Falha ao gerar cobrança' });
    }

    // Extrai o código PIX (ajuste o campo conforme a resposta real da Anova)
    // Campos comuns: pix_code, qr_code, payload, copy_and_paste
    const pixCode = data.pix_code || data.qr_code || data.payload || data.copy_and_paste;
    
    if (!pixCode) {
      console.error('Resposta sem código PIX:', data);
      return res.status(500).json({ error: 'Erro interno: Código PIX não gerado' });
    }

    // Retorna sucesso para o frontend
    return res.status(200).json({ payload: pixCode });

  } catch (error) {
    console.error('Erro crítioco no backend:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
