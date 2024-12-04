import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrando os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopViewedProductsChart = ({ products }) => {
  // Preparando os dados para o gráfico
  const data = {
    labels: products.map(product => product.nome),
    datasets: [
      {
        label: "Visualizações",
        data: products.map(product => product.visualizacoes),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
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
        text: "Top 5 Produtos Mais Visualizados"
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="top-viewed-products-chart">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopViewedProductsChart;
