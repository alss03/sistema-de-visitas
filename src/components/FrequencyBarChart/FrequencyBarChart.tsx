import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";
import type { LabelFormatter } from "recharts/types/component/Label";

import styles from "./FrequencyBarChart.module.scss";

// props do componente FrequencyBarChart
interface Props {
  data: { range: string; count: number }[];
}

// formatador de labels para exibir apenas valores maiores que zero
const labelFormatter: LabelFormatter = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "";
  return String(num);
};

// componente FrequencyBarChart
export const FrequencyBarChart: React.FC<Props> = ({ data }) => {
  const hasData = data.some((d) => d.count > 0);

  // renderizar grafico de barras de frequencia
  return (
    // container do grafico
    <section className={styles.card}>
      <h2 className={styles.title}>Próximas visitas por período</h2>
      <p className={styles.subtitle}>
        Considera apenas pessoas ativas. Visitas já vencidas entram em{" "}
        <strong>“Hoje / em atraso”.</strong>
      </p>

      {/* verificar se ha dados para exibir no grafico */}
      {!hasData ? (
        <div className={styles.empty}>
          Sem dados suficientes para exibir o gráfico.
        </div>
      ) : (
        <div className={styles.chartContainer}>
          {/* grafico de barras responsivo */}
          <ResponsiveContainer width="100%" height={260}>
            {/* grafico de barras */}
            <BarChart
              data={data}
              margin={{ top: 16, right: 10, bottom: 24, left: 0 }}
            >
              {/* grade do grafico */}
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              {/* eixo X */}
              <XAxis dataKey="range" tick={{ fontSize: 12 }} interval={0} />
              {/* eixo Y */}
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              {/* tooltip ao passar o mouse */}
              <Tooltip
                formatter={(value) => [
                  `${value} pessoa${Number(value) === 1 ? "" : "s"}`,
                  "Quantidade",
                ]}
              />
              {/* barra do grafico */}
              <Bar dataKey="count" fill="#02758A" radius={[4, 4, 0, 0]}>
                {/* labels acima das barras */}
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: 12, fill: "#02758A", fontWeight: 600 }}
                  formatter={labelFormatter}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
