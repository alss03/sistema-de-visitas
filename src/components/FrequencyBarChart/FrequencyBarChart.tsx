import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "./FrequencyBarChart.module.scss";

// props do componente FrequencyBarChart
interface FrequencyBarChartProps {
  data: Array<{ frequency: number; count: number }>;
}

// componente FrequencyBarChart
export const FrequencyBarChart: React.FC<FrequencyBarChartProps> = ({ data }) => {
  // verifica se ha dados a serem exibidos
  const hasData = data.length > 0;

  // renderiza grafico de barras de frequencia
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Distribuição por frequência de visita</h2>

      {!hasData ? (
        <div className={styles.empty}>Sem dados suficientes.</div>
      ) : (
        <div className={styles.chartContainer}>
            {/* renderiza grafico de barras responsivo */}
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                // configurações do grafico
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              {/* eixo X */}
              <XAxis
                dataKey="frequency"
                tick={{ fontSize: 12 }}
                label={{ value: "Frequência (dias)", position: "insideBottom", dy: 10 }}
              />
              {/* eixo Y */}
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Pessoas",
                  angle: -90,
                  position: "insideLeft",
                  dx: -10,
                }}
              />
              {/* tooltip de detalhes */}
              <Tooltip />
              <Bar dataKey="count" fill="#02758A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
