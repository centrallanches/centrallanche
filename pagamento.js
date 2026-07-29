const ANOVA_CONFIG = {
    clientId: "cms0q5i6j000elp019xciyps3",
    clientSecret: "e56d84d7f23cb682b20e980281e8f51fce70de7b7cff63a933e1ce5a3e17f30b",
    apiUrl: "https://api.anovapay.com.br/charges"
};

async function criarCobranca(valor, descricao) {
    const response = await fetch(ANOVA_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'ci': ANOVA_CONFIG.clientId,
            'cs': ANOVA_CONFIG.clientSecret,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: Math.round(valor * 100),
            description: descricao
        })
    });

    const data = await response.json();

    if (data.checkout_url) {
        window.location.href = data.checkout_url;
    } else {
        console.log('Resposta API:', data);
        alert('Erro: verifique o console (F12)');
    }
}
