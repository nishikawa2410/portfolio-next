/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import { createChart } from "lightweight-charts";
import { useCallback, useEffect, useRef, useState } from "react";
import { CandleStickSocketData } from "utils/adaptor";
import {
  condleStickDefaultConfig,
  defaultChartLayout,
  histogramDefaultConfig,
} from "utils/constants";

type CandleStickConfig = {
  borderDownColor?: string;
  borderUpColor?: string;
  downColor?: string;
  upColor?: string;
  wickDownColor?: string;
  wickUpColor?: string;
};

type HistogramConfig = {
  base?: number;
  lineWidth?: number;
  overlay?: boolean;
  priceFormat?: {
    type: string;
  };
  scaleMargins?: {
    bottom?: number;
    top?: number;
  };
};

type ApplyOptions = {
  height?: number;
  priceFormat: {
    minMove: number;
    precision: number;
    type: string;
  };
  width?: number;
};

type ChartSeries = {
  applyOptions: (data: ApplyOptions) => void;
  setData: (data: CandleStickSocketData[]) => ChartSeries;
  update: (data: CandleStickSocketData) => ChartSeries;
};

type TradeViewChart = {
  addCandlestickSeries: (config: CandleStickConfig) => ChartSeries;
  addHistogramSeries: (config: HistogramConfig) => ChartSeries;
  applyOptions: (data: ApplyOptions) => void;
};

type FinancialChartComponentProps = {
  candleStickConfig?: CandleStickConfig;
  // eslint-disable-next-line @typescript-eslint/ban-types
  chartLayout?: {};
  containerStyle?: {
    [x: string]: any;
  };
  histogramConfig?: HistogramConfig;
  initialChartData: CandleStickSocketData[];
  updatedata: CandleStickSocketData | null;
};

export default function FinancialChartComponent({
  candleStickConfig = condleStickDefaultConfig,
  histogramConfig = histogramDefaultConfig,
  chartLayout = defaultChartLayout,
  containerStyle = {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    maxHeight: "100vh",
    maxWidth: "100%",
  },
  initialChartData,
  updatedata,
}: FinancialChartComponentProps): JSX.Element {
  const [isRender, setIsRender] = useState(false);
  const resizeObserver = useRef<ResizeObserver>();
  const chartContainerRef = useRef<any>();
  const chart = useRef<TradeViewChart>();
  const candleSeries = useRef<ChartSeries>();
  const volumeSeries = useRef<ChartSeries>();
  const setInitialData = useCallback(() => {
    if (!chart || !candleSeries || !volumeSeries) return;

    candleSeries.current =
      chart.current?.addCandlestickSeries(candleStickConfig);
    candleSeries.current?.setData(initialChartData);
    volumeSeries.current = chart.current?.addHistogramSeries(histogramConfig);
    volumeSeries.current?.setData(initialChartData);
    candleSeries.current?.applyOptions({
      priceFormat: {
        minMove: 0.001,
        precision: 5,
        type: "price",
      },
    });
  }, [candleStickConfig, histogramConfig, initialChartData]);

  useEffect(() => {
    if (updatedata?.open) {
      candleSeries?.current?.update(updatedata);
      volumeSeries?.current?.update(updatedata);
    }
  }, [updatedata]);

  useEffect(() => {
    if (isRender || !chart || !chartContainerRef.current) return;

    console.log("useEffect");
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    chart.current = createChart(chartContainerRef.current, {
      height: window.innerHeight - 180,
      width: window.innerWidth - 300,
      ...chartLayout,
    });
    /* eslint-enable */
    setInitialData();
    setIsRender(true);
  }, [chartLayout, isRender, setInitialData]);

  // Resize chart on container resizes.
  useEffect(() => {
    if (!chart || !resizeObserver || !chartContainerRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      const { height, width } = entries[0].contentRect;

      chart.current?.applyOptions({
        height,
        width,
        priceFormat: {
          minMove: 0.001,
          precision: 5,
          type: "price",
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    resizeObserver.current?.observe(chartContainerRef.current);

    return () => resizeObserver.current?.disconnect();
  }, []);

  return (
    <div
      className="chartContainer"
      ref={chartContainerRef}
      style={containerStyle}
    />
  );
}
