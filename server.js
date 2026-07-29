const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const ANOVA_SECRET = 'cc1fb9f755f42dee769767b7a335afde243890689c0ee43ab78acb0c58c8f5a4';

app.post('/api/pagamento', async (req, res) => {
    try {
        const { total, cliente } = req.body;
        
        const response = await fetch('https://api.anovapay.com.br/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANOVA_SECRET}`
            },
            body: JSON.stringify({
                value: total,
                description: `Pedido - ${cliente.nome}`
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Falha na integração' });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
