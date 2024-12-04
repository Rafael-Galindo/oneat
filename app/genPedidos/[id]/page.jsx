"use client";
import { useEffect, useState } from "react";
import supabase from "@/supabase"; // Certifique-se de configurar o cliente do Supabase
import { useRouter } from "next/navigation";

const PedidoDetalhes = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [produto, setProduto] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progresso, setProgresso] = useState(0);

  const etapas = ["Pendente", "Confirmado", "Em Preparo", "A Caminho", "Entregue"];

  useEffect(() => {
    const fetchPedidoDados = async () => {
      try {
        setLoading(true);

        // Fetch do Pedido
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("Pedido")
          .select("id, id_produto, id_cliente, quantidade, status, forma_pagto")
          .eq("id", id)
          .single();

        if (pedidoError) throw pedidoError;
        setPedido(pedidoData);

        // Fetch do Produto
        const { data: produtoData, error: produtoError } = await supabase
          .from("Produto")
          .select("id, nome, preco, descricao, categoria")
          .eq("id", pedidoData.id_produto)
          .single();

        if (produtoError) throw produtoError;
        setProduto(produtoData);

        // Fetch do Cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("Cliente")
          .select("id, nome, email, telefone")
          .eq("id", pedidoData.id_cliente)
          .single();

        if (clienteError) throw clienteError;
        setCliente(clienteData);

        // Atualiza progresso baseado no status
        const progressoAtual = etapas.indexOf(pedidoData.status);
        setProgresso(progressoAtual !== -1 ? progressoAtual : 0);
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError("Erro ao carregar os dados do pedido.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPedidoDados();
  }, [id]);

  const passarParaProximoEstagio = async () => {
    if (progresso < etapas.length - 1) {
      const novoStatus = etapas[progresso + 1];
      try {
        const { error } = await supabase
          .from("Pedido")
          .update({ status: novoStatus })
          .eq("id", pedido.id);

        if (error) throw error;

        setProgresso(progresso + 1);
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
      }
    }
  };

  const voltarParaEstagioAnterior = async () => {
    if (progresso > 0) {
      const novoStatus = etapas[progresso - 1];
      try {
        const { error } = await supabase
          .from("Pedido")
          .update({ status: novoStatus })
          .eq("id", pedido.id);

        if (error) throw error;

        setProgresso(progresso - 1);
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
      }
    }
  };

  const recusarPedido = async () => {
    try {
      const { error } = await supabase
        .from("Pedido")
        .update({ status: "Recusado" })
        .eq("id", pedido.id);

      if (error) throw error;

      router.push("/recentOrders");
    } catch (err) {
      console.error("Erro ao recusar pedido:", err);
    }
  };

  if (loading) return <p className="text-center text-xl">Carregando detalhes do pedido...</p>;
  if (error) return <p className="text-center text-xl text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Progresso */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-5">Progresso</h3>
        <div className="flex justify-between text-sm text-gray-600">
          {etapas.map((etapa, index) => (
            <span
              key={index}
              className={index <= progresso ? "text-green-500" : "text-gray-400"}
            >
              {etapa}
            </span>
          ))}
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 rounded-full h-2.5"
            style={{ width: `${(progresso + 1) * 20}%` }}
          ></div>
        </div>
        {/* Botões */}
        <div className="mt-4 space-x-10">
          <button
            className="bg-gray-400 text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-500 w-[95px] h-[42px]"
            onClick={voltarParaEstagioAnterior}
            disabled={progresso === 0}
          >
            Estágio Anterior
          </button>
          <button
            className="primary-color text-white text-sm py-2 px-4 rounded-lg hover:bg-primary  w-[95px] h-[42px]"
            onClick={passarParaProximoEstagio}
            disabled={progresso === etapas.length - 1}
          >
            Próximo Estágio
          </button>
          <button
            className="bg-red-500 text-white  text-sm py-2 px-4 rounded-lg hover:bg-red-600  w-[95px] h-[42px]"
            onClick={recusarPedido}
          >
            Recusar Pedido
          </button>
        </div>
      </div>
      {/* Detalhes do Pedido */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Detalhes do Pedido</h2>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-2 text-left">Campo</th>
              <th className="border px-2 py-2 text-left">Informação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-2">ID do Pedido</td>
              <td className="border px-2 py-2">{pedido.id}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Quantidade</td>
              <td className="border px-2 py-2">{pedido.quantidade}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Status</td>
              <td className="border px-2 py-2">{pedido.status}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Produto</td>
              <td className="border px-2 py-2">{produto.nome}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Preço</td>
              <td className="border px-2 py-2">R$ {produto.preco}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Forma de Pagamento</td>
              <td className="border px-2 py-2">{pedido.forma_pagto}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Descrição</td>
              <td className="border px-2 py-2">{produto.descricao}</td>
            </tr>
            <tr>
            <td className="border px-2 py-2">Categoria</td>
              <td className="border px-2 py-2">{produto.categoria}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Cliente</td>
              <td className="border px-2 py-2">{cliente.nome}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Email</td>
              <td className="border px-2 py-2">{cliente.email}</td>
            </tr>
            <tr>
              <td className="border px-2 py-2">Telefone</td>
              <td className="border px-2 py-2">{cliente.telefone}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PedidoDetalhes;
