import supabase from "../../../supabase";

export default async function handler(req, res) {
  const { orderId } = req.query; // Extrai o ID do pedido da query

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" }); // Permite apenas GET
  }

  try {
    // Busca o pedido pelo ID na tabela Pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from("Pedido")
      .select("id, quantidade, forma_pagto, status, id_cliente")
      .eq("id", orderId)
      .single();

    if (pedidoError) throw pedidoError;

    if (!pedidoData) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Busca os dados do cliente com base no id_cliente
    const { data: clienteData, error: clienteError } = await supabase
      .from("Cliente")
      .select("nome, cpf, telefone, email, id_endereco")
      .eq("id", pedidoData.id_cliente)
      .single();

    if (clienteError) throw clienteError;

    if (!clienteData) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Busca o endereço do cliente com base no id_endereco
    const { data: enderecoData, error: enderecoError } = await supabase
      .from("EnderecoCliente")
      .select("rua, numero, complemento, cidade, estado")
      .eq("id", clienteData.id_endereco)
      .single();

    if (enderecoError) throw enderecoError;

    if (!enderecoData) {
      return res.status(404).json({ error: "Endereço do cliente não encontrado" });
    }

    // Formata os dados do pedido para enviar como resposta
    const pedido = {
      id: pedidoData.id,
      quantidade: pedidoData.quantidade,
      forma_pagto: pedidoData.forma_pagto,
      status: pedidoData.status,
      cliente: {
        nome: clienteData.nome,
        cpf: clienteData.cpf,
        telefone: clienteData.telefone,
        email: clienteData.email,
        endereco: {
          rua: enderecoData.rua,
          numero: enderecoData.numero,
          complemento: enderecoData.complemento,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado,
        },
      },
    };

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
