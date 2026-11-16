import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

const CHART_COLORS = ["#243f6b", "#536887", "#8b9ab3", "#c4ccda"];

export type ChartType = "line" | "bar" | "horizontal-bar" | "composed" | "doughnut";
export type ChartDataPoint = Record<string, string | number>;

export interface ChartLegendItem {
  dataKey: string;
  label: string;
  color?: string;
  value?: string;
  percentage?: string;
}

interface ChartPanelProps {
  title: string;
  description?: string;
  chartType: ChartType;
  chartData: ChartDataPoint[];
  dataKeys: string[];
  legend?: ChartLegendItem[];
  showLegend?: boolean;
  showTooltip?: boolean;
  lineDataKey?: string;
  barLabelDataKey?: string;
  barLabelFormatter?: (value: string | number | boolean) => string;
  valueFormatter?: (value: string | number) => string;
  centerValue?: string;
  centerLabel?: string;
  headerAction?: ReactNode;
}

export default function ChartPanel({
  title,
  description,
  chartType,
  chartData,
  dataKeys,
  legend = [],
  showLegend = false,
  showTooltip = false,
  lineDataKey,
  barLabelDataKey,
  barLabelFormatter,
  valueFormatter,
  centerValue,
  centerLabel,
  headerAction,
}: ChartPanelProps) {
  const labelKey = Object.keys(chartData[0] ?? {}).find(
    (key) => !dataKeys.includes(key),
  ) ?? "name";
  const isDoughnut = chartType === "doughnut";
  const legendItems: ChartLegendItem[] = legend.length > 0
    ? legend
    : dataKeys.map((dataKey, index) => ({
      dataKey,
      label: dataKey,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const tooltip = showTooltip ? (
    <Tooltip
      contentStyle={{
        border: "1px solid #dce2ef",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(30, 50, 90, 0.12)",
      }}
      labelStyle={{ color: "#172033", fontWeight: 700 }}
      formatter={(value) => {
        if (value == null) {
          return "";
        }

        if (typeof value !== "string" && typeof value !== "number") {
          return value.map(String).join(" - ");
        }

        return valueFormatter?.(value) ?? value;
      }}
    />
  ) : null;

  const renderChart = () => {
    if (isDoughnut) {
      const dataKey = dataKeys[0];

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {tooltip}
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`${String(entry[labelKey])}-${index}`}
                  fill={legendItems[index]?.color ?? CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "composed") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7ebf2" />
            <XAxis dataKey={labelKey} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={42} tickFormatter={valueFormatter} />
            {tooltip}
            {dataKeys.map((dataKey, index) => (
              <Bar
                key={dataKey}
                dataKey={dataKey}
                fill={legendItems.find((item) => item.dataKey === dataKey)?.color ?? CHART_COLORS[index % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
            {lineDataKey && (
              <Line
                type="monotone"
                dataKey={lineDataKey}
                stroke={legendItems.find((item) => item.dataKey === lineDataKey)?.color ?? "#7654c7"}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    const isHorizontalBar = chartType === "horizontal-bar";
    const Chart = chartType === "line" ? LineChart : BarChart;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <Chart
          data={chartData}
          layout={isHorizontalBar ? "vertical" : "horizontal"}
          margin={isHorizontalBar ? { top: 8, right: 16, left: 16, bottom: 0 } : { top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#e7ebf2" />
          <XAxis dataKey={isHorizontalBar ? undefined : labelKey} type={isHorizontalBar ? "number" : "category"} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis dataKey={isHorizontalBar ? labelKey : undefined} type={isHorizontalBar ? "category" : "number"} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={isHorizontalBar ? 76 : 42} tickFormatter={isHorizontalBar ? undefined : valueFormatter} />
          {tooltip}
          {dataKeys.map((dataKey, index) => {
            const color = legendItems.find((item) => item.dataKey === dataKey)?.color
              ?? CHART_COLORS[index % CHART_COLORS.length];

            return chartType === "line" ? (
              <Line
                key={dataKey}
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 5 }}
              />
            ) : (
              <Bar key={dataKey} dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
                {isHorizontalBar && barLabelDataKey && (
                  <LabelList
                    dataKey={barLabelDataKey}
                    position="right"
                    fill="#475569"
                    fontSize={11}
                    formatter={(value) => value == null ? "" : barLabelFormatter?.(value) ?? value}
                  />
                )}
              </Bar>
            );
          })}
        </Chart>
      </ResponsiveContainer>
    );
  };

  return (
    <section className={`chart-panel ${isDoughnut ? "chart-panel-doughnut" : ""}`}>
      <header className="chart-panel-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {headerAction}
      </header>

      <div className="chart-panel-content">
        <div className="chart-visualization">
          {renderChart()}
          {isDoughnut && centerValue && (
            <div className="chart-doughnut-center">
              <strong>{centerValue}</strong>
              {centerLabel && <span>{centerLabel}</span>}
            </div>
          )}
        </div>

        {showLegend && legendItems.length > 0 && (
          <ul className="chart-legend" aria-label={`${title} legend`}>
            {legendItems.map((item, index) => (
              <li key={item.dataKey}>
                <span
                  className="chart-legend-swatch"
                  style={{ backgroundColor: item.color ?? CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span>{item.label}</span>
                {item.value && <strong>{item.value}</strong>}
                {item.percentage && <em>{item.percentage}</em>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
