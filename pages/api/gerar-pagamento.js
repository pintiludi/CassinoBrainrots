import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { valencia, simbolo } = req.body;
  const valor = parseFloat(valencia);

  if (!valor || valor < 1 || valor > 100 || !simbolo) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  try {
    const pagamento = await mercadopago.payment.create({
      transaction_amount: valor,
      description: "Compra de pontos no cassino",
      payment_method_id: "pix",
      payer: { email: "comprador@email.com" },
      metadata: { simbolo }
    });

    const { point_of_interaction } = pagamento.body;
    return res.status(200).json({
      link: point_of_interaction.transaction_data.ticket_url,
      qr: point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao criar pagamento' });
  }
}
