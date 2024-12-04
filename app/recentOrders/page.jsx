"use client";

import { Check, Close, ArrowBack, ArrowForward } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importa o hook para navegação
import supabase from "../../supabase";
import { useAuth } from "../../context/authContext";
import Link from 'next/link'; // Import correto do Next.js

const RecentOrders = () => {

  const { restaurante } = useAuth(); // Obtendo o restaurante do contexto
  const router = useRouter(); // Inicializando o roteador
  const [orders, setOrders] = useState([]); // Estado para armazenar todos os pedidos
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const recordsPerPage = 7; // Número de registros por página
  

  const totalPages = Math.ceil(orders.length / recordsPerPage); // Total de páginas calculado
  const currentOrders = orders.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  ); // Fatiar os pedidos para exibir apenas os da página atual

  // Funções para navegação entre páginas
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Função para buscar pedidos do restaurante logado com detalhes do produto e quantidade
  const fetchOrders = async () => {
    try {
      if (!restaurante || !restaurante.id) return;

      const { data, error } = await supabase
        .from("Pedido")
        .select("id, id_produto, quantidade, forma_pagto, status, Produto!inner(id, nome)") // Inclui quantidade e Produto.nome
        .eq("Produto.id_restaurante", restaurante.id)
        .order("id", { ascending: false }); // Ordena por ID, mais recente primeiro

      if (error) {
        console.error("Erro ao buscar pedidos:", error.message);
        return;
      }

      setOrders(data || []); // Armazena todos os pedidos com os dados do produto
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error.message);
    }
  };

  // Função para atualizar o status do pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("Pedido")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Erro ao atualizar o status do pedido:", error.message);
        return;
      }

      // Atualiza a lista de pedidos localmente após a mudança de status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar o status do pedido:", error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurante]);

  return (
    <div className="recent-order">
      <h2>Pedidos Recentes</h2>
      <table id="table-order">
        <thead>
          <tr>
            <th>Nome do Produto</th>
            <th>ID do Produto</th>
            <th>Quantidade</th>
            <th>Método de Pagamento</th>
            <th>Status</th>
            <th>Ações</th>
            <th>Detalhes</th> {/* Nova coluna */}
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.Produto?.nome || "Produto desconhecido"}</td>
                <td>{order.id_produto}</td>
                <td>{order.quantidade}</td> {/* Exibe a quantidade do produto */}
                <td>{order.forma_pagto}</td>
                <td
                  className={
                    order.status === "Entregue"
                      ? "success"
                      : order.status === "Confirmado"
                      ? "confirmed"
                      : "pending"
                  }
                >
                  {order.status}
                </td>
                <td>
                  {/* Botões para confirmar ou negar o pedido */}
                  {order.status === "Pendente" && (
                    <>
                      <button
                        id="accept-btn"
                        onClick={() => updateOrderStatus(order.id, "Confirmado")}
                        className="confirm-btn"
                      >
                        <Check />
                      </button>
                      <button
                        id="rejept-btn"
                        onClick={() => updateOrderStatus(order.id, "Negado")}
                        className="deny-btn"
                      >
                        <Close />
                      </button>
                    </>
                  )}
                </td>
                <td>
                  {/* Botão para navegar para a página de detalhes */}
                  <Link href={`/genPedidos/${order.id}`} legacyBehavior>
                 <a className="details-btn">Ver Detalhes</a>
                    </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Nenhum pedido encontrado</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Navegação de páginas */}
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={prevPage}>
          <ArrowBack />
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button disabled={currentPage === totalPages} onClick={nextPage}>
          <ArrowForward />
        </button>
      </div>
    </div>
  );
};

export default RecentOrders;
