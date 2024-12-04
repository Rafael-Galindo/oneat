"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useAuth } from "@/context/authContext.js"; // Certifique-se de importar o contexto de autenticação
import supabase from "@/supabase"; // Certifique-se de que seu supabase está configurado

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { restaurante } = useAuth(); // Obtendo o restaurante do contexto de autenticação
  const [topOrderedProducts, setTopOrderedProducts] = useState([]); // Estado para os produtos mais vendidos
  const [topViewedProducts, setTopViewedProducts] = useState([]); // Estado para os produtos mais visualizados

  // Função para buscar os produtos mais vendidos
  const fetchTopOrderedProducts = async () => {
    if (!restaurante) return;

    try {
      const { data, error } = await supabase
        .from("Pedido")
        .select("id, quantidade, Produto!inner(id, nome, id_restaurante)")
        .eq("Produto.id_restaurante", restaurante.id)
        .in("status", ["Confirmado", "Em Preparo", "A Caminho", "Entregue"]);

      if (error) {
        console.error("Erro ao buscar produtos mais vendidos:", error.message);
        return;
      }

      if (data) {
        // Agrupar produtos por nome e somar as quantidades
        const aggregatedProducts = data.reduce((acc, order) => {
          const { nome } = order.Produto;
          if (!acc[nome]) {
            acc[nome] = { nome, quantidade: 0 };
          }
          acc[nome].quantidade += order.quantidade;
          return acc;
        }, {});

        // Ordenar os produtos pela quantidade e limitar a 5
        const topProducts = Object.values(aggregatedProducts)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);

        setTopOrderedProducts(topProducts);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos mais vendidos:", error.message);
    }
  };

  // Função para buscar os produtos mais visualizados
  const fetchTopViewedProducts = async () => {
    if (!restaurante) return;

    try {
      const { data, error } = await supabase
        .from("Produto")
        .select("id, nome, visualizacoes")
        .eq("id_restaurante", restaurante.id)
        .limit(5);

      if (error) {
        console.error("Erro ao buscar produtos mais visualizados:", error.message);
        return;
      }

      if (data) {
        setTopViewedProducts(data);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos mais visualizados:", error.message);
    }
  };

  useEffect(() => {
    fetchTopOrderedProducts(); // Carrega os produtos mais vendidos
    fetchTopViewedProducts(); // Carrega os produtos mais visualizados
  }, [restaurante]);

  // Preparando os dados para o gráfico comparativo
  const chartData = {
    labels: topOrderedProducts.map(product => product.nome),
    datasets: [
      {
        label: "Mais Pedidos",
        data: topOrderedProducts.map(product => product.quantidade),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      },
      {
        label: "Mais Visualizados",
        data: topViewedProducts.map(product => product.visualizacoes),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1
      }
    ]
  };

  // Configuração do gráfico comparativo
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Comparação entre Produtos Mais Pedidos e Mais Visualizados"
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="analytics">
      {/* Gráfico comparativo entre os 5 produtos mais pedidos e mais visualizados */}
      {topOrderedProducts.length > 0 && topViewedProducts.length > 0 && (
        <div className="comparison-chart">
          <h2>Comparação entre Produtos Mais Pedidos e Mais Visualizados</h2>
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
