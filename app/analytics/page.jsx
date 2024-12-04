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
  Legend,
} from "chart.js";
import { useAuth } from "@/context/authContext";
import supabase from "@/supabase";

// Registrar os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductComparisonCharts = () => {
  const { restaurante } = useAuth(); // Obtém o restaurante do contexto
  const [topOrderedProducts, setTopOrderedProducts] = useState([]);
  const [topViewedProducts, setTopViewedProducts] = useState([]);

  // Buscar os produtos mais vendidos
  const fetchTopOrderedProducts = async () => {
    if (!restaurante) return;

    try {
      const { data, error } = await supabase
        .from("Pedido")
        .select("quantidade, Produto!inner(id, nome, id_restaurante)")
        .eq("Produto.id_restaurante", restaurante.id)
        .in("status", ["Confirmado", "Em Preparo", "A Caminho", "Entregue"]);

      if (error) {
        console.error("Erro ao buscar produtos mais vendidos:", error.message);
        return;
      }

      if (data) {
        const aggregatedProducts = data.reduce((acc, order) => {
          const { nome } = order.Produto;
          if (!acc[nome]) {
            acc[nome] = { nome, quantidade: 0 };
          }
          acc[nome].quantidade += order.quantidade;
          return acc;
        }, {});

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
      .select("nome, visualizacoes")
      .eq("id_restaurante", restaurante.id)
      .order("visualizacoes", { descending: true })
      .limit(5); // Limita aos 5 mais visualizados

    if (error) {
      console.error("Erro ao buscar produtos mais visualizados:", error.message);
      return;
    }

    if (data) {
      console.log("Produtos mais visualizados:", data); // Verifique os dados no console
      setTopViewedProducts(data);
    }
  } catch (error) {
    console.error("Erro ao buscar produtos mais visualizados:", error.message);
  }
};


  useEffect(() => {
    fetchTopOrderedProducts();
    fetchTopViewedProducts();
  }, [restaurante]);

  // Dados para o gráfico de produtos mais vendidos
  const orderedProductsData = {
    labels: topOrderedProducts.map((product) => product.nome),
    datasets: [
      {
        label: "Quantidade Vendida",
        data: topOrderedProducts.map((product) => product.quantidade),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de produtos mais visualizados
  const viewedProductsData = {
    labels: topViewedProducts.map((product) => product.nome),
    datasets: [
      {
        label: "Visualizações",
        data: topViewedProducts.map((product) => product.visualizacoes),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Configuração dos gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="product-comparison-charts mt-10 px-4">
      {/* Gráfico de produtos mais vendidos */}
      <div className="chart-section">
        <h2 className="text-xl font-semibold mb-4">Produtos Mais Vendidos</h2>
        <Bar
          data={orderedProductsData}
          options={{
            ...chartOptions,
            plugins: { ...chartOptions.plugins, title: { text: "Produtos Mais Vendidos" } },
          }}
        />
      </div>
  
      {/* Gráfico de produtos mais visualizados */}
      <div className="chart-section mt-8">
        <h2 className="text-xl font-semibold mb-4">Produtos Mais Visualizados</h2>
        <Bar
          data={viewedProductsData}
          options={{
            ...chartOptions,
            plugins: { ...chartOptions.plugins, title: { text: "Produtos Mais Visualizados" } },
          }}
        />
      </div>
    </div>
  );
};  

export default ProductComparisonCharts;
