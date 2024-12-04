'use client';

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import supabase from "../../supabase";
import { Check, Close, ArrowBack, ArrowForward } from "@mui/icons-material";

const RecentOrders = () => {
  const { restaurante } = useAuth(); // Obtém os dados do restaurante do contexto
  const [orders, setOrders] = useState([]); // Estado para armazenar os pedidos
  const [currentPage, setCurrentPage] = useState(1); // Controle de paginação
  const [selectedOrder, setSelectedOrder] = useState(null); // Armazena os detalhes do pedido selecionado
  const recordsPerPage = 7; // Número de pedidos por página

  const totalPages = Math.ceil(orders.length / recordsPerPage); // Calcula o total de páginas
  const currentOrders = orders.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  ); // Fatiar os pedidos para exibir apenas os da página atual

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const fetchOrders = async () => {
    if (!restaurante || !restaurante.id) return;

    try {
      const { data, error } = await supabase
        .from("Pedido")
        .select("id, id_produto, quantidade, forma_pagto, status, Produto!inner(nome, descricao)")
        .eq("Produto.id_restaurante", restaurante.id)
        .order("id", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurante]);

  const handleViewDetails = async (orderId) => {
    // Encontrar o pedido com base no ID
    const selectedOrder = orders.find((order) => order.id === orderId);
    setSelectedOrder(selectedOrder); // Armazenar o pedido completo no estado
  };

  if (selectedOrder) {
    return (
      <div className="order-details">
        <h2>Detalhes do Pedido</h2>
        <p><strong>Produto:</strong> {selectedOrder.Produto?.nome}</p>
        <p><strong>Descrição:</strong> {selectedOrder.Produto?.descricao}</p>
        <p><strong>Quantidade:</strong> {selectedOrder.quantidade}</p>
        <p><strong>Método de Pagamento:</strong> {selectedOrder.forma_pagto}</p>
        <p><strong>Status:</strong> {selectedOrder.status}</p>
        <button onClick={() => setSelectedOrder(null)}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="recent-order">
      <h2>Pedidos Recentes</h2>
      <table id="table-order">
        <thead>
          <tr>
            <th>Nome do Produto</th>
            <th>Quantidade</th>
            <th>Método de Pagamento</th>
            <th>Status</th>
            <th>Ações</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.Produto?.nome || "Produto desconhecido"}</td>
                <td>{order.quantidade}</td>
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
                  {order.status === "Pendente" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Confirmado")}
                      >
                        <Check />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Negado")}
                      >
                        <Close />
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <button onClick={() => handleViewDetails(order.id)}>
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Nenhum pedido encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
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
