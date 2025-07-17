import mercadopago from 'mercadopago';
import fs from 'fs';
import path from 'path';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Método não permitido');
  }

  try {
    const id = req.body.data?.id;
    if (!id) return res.status(400).end('ID ausente');

    const pagamento = await mercadopago.payment.findById(id);
    const { status, metadata, transaction_amount } = pagamento.body;

    if (status === "approved") {
      const simbolo = metadata.simbolo;
      const pontos = Math.floor(transaction_amount) * 2;

      const filePath = path.resolve('./public/jogadores.json');
      const dados = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      dados[simbolo] = (dados[simbolo] || 0) + pontos;
      fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));

      return res.status(200).end('OK');
    } else {
      return res.status(200).end('Pagamento não aprovado');
    }
  } catch (e) {
    console.error(e);
    return res.status(500).end('Erro no Webhook');
  }
}
