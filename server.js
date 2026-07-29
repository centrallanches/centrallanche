const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;
const CLIENTE_ID = '9d799d33ca573a9c018e0ced6645f582308a64d6c5ac42512f680728518c69b2';

// Lista de IPs (deixei vazio para liberar geral por enquanto, ajuste depois se quiser)
const ALLOWED_IPS = []; 

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/pix/qrcode' && req.method === 'GET') {
    const { valor, descricao } = parsedUrl.query;

    if (!valor || !descricao) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Faltam params' }));
    }

    try {
      const valorCentavos = Math.round(parseFloat(valor) * 100);
      const targetUrl = `https://sandbox.orendapay.com.br/pix/qrcode/gerar/${CLIENTE_ID}?valor=${valorCentavos}&descricao=${encodeURIComponent(descricao)}`;

      const apiResponse = await fetch(targetUrl);
      if (!apiResponse.ok) throw new Error('Erro API');

      const data = await apiResponse.json();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));

    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Falha no Pix' }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
