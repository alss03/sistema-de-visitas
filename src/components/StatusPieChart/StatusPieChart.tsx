import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

import styles from "./StatusPieChart.module.scss";

// props do componente StatusPieChart
interface StatusPieChartProps {
  emDiaSeguro: number;
  venceHoje: number;
  atrasoLeve: number;
  atrasoGrave: number;
  inativos: number; 
}

// componente StatusPieChart
export const StatusPieChart: React.FC<StatusPieChartProps> = ({
  emDiaSeguro,
  venceHoje,
  atrasoLeve,
  atrasoGrave,
  inativos,
}) => {

  // prepara dados para o grafico de pizza
  const data = [
    {
      name: "Em dia",
      value: emDiaSeguro,
      key: "emDiaSeguro",
    },
    {
      name: "Vence hoje",
      value: venceHoje,
      key: "venceHoje",
    },
    {
      name: "Até 3 dias",
      value: atrasoLeve,
      key: "atrasoLeve",
    },
    {
      name: "Mais de 3 dias",
      value: atrasoGrave,
      key: "atrasoGrave",
    },
    {
      name: "Inativos",
      value: inativos,
      key: "inativos",
    },
  ].filter((item) => item.value > 0); // remove vazios

  // cores para cada status
  const CORES: Record<string, string> = {
    emDiaSeguro: "#2A9D8F",
    venceHoje: "#F4A261",
    atrasoLeve: "#E9C46A",
    atrasoGrave: "#D9534F",
    inativos: "#8A8A8A",
  };

  // verifica se ha dados para exibir
  const hasData = data.some((d) => d.value > 0);

  // renderiza grafico de pizza de status
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Status de atraso das pessoas</h2>

      {!hasData ? (
        <div className={styles.empty}>
          Sem dados para exibir o gráfico.
        </div>
      ) : (
        <div className={styles.chartContainer}>
            {/* renderiza grafico de pizza responsivo */}
          <ResponsiveContainer width="100%" height={220}>
            {/* configurações do grafico */}
            <PieChart>
                {/* configurações da pizza */}
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
              >
                {/* define cores para cada fatia */}
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={CORES[entry.key]}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              {/* tooltip de detalhes */}
              <Tooltip />
              {/* legenda do grafico */}
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
