import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrando os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopOrderedProductsChart = ({ products }) => {
  // Filtrando os 5 produtos mais pedidos
  const topProducts = products.slice(0, 5);
  
  // Preparando os dados para o gráfico
  const data = {
    labels: topProducts.map(product => product.nome),
    datasets: [
      {
        label: "Quantidade Vendida",
        data: topProducts.map(product => product.quantidade),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  };

  // Configuração do gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Top 5 Produtos Mais Pedidos"
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="top-ordered-products-chart">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopOrderedProductsChart;
