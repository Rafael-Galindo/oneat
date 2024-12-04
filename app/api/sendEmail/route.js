import nodemailer from 'nodemailer';

export async function POST(req) {
  const body = await req.json(); // Parseia o corpo da requisição JSON
  const { email, senha } = body; // Recebe o email e a senha do frontend

  // Configuração do transportador de email
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'oneat.contato@gmail.com', // Seu email
      pass: 'glvivcfehyvtdjqg' // Senha de app gerada no Gmail
    }
  });

  // Opções de envio de email
  let mailOptions = {
    from: 'oneat.contato@gmail.com',
    to: email,
    subject: 'OnEat Gerenciamento | Primeiro Acesso',
    text: `Sua senha gerada automaticamente é: ${senha}`
  };

  // Tenta enviar o email
  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Email enviado com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return new Response(JSON.stringify({ message: 'Erro ao enviar o email', error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
