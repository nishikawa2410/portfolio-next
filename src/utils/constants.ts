export const BASE_URL = "https://api.binance.com/api/v3/klines";

export const WS_URL = "wss://stream.binance.com:9443/ws";

export const condleStickDefaultConfig = {
  borderDownColor: "#cf304a",
  borderUpColor: "#00c176",
  downColor: "#cf304a",
  upColor: "#00c176",
  wickDownColor: "#838ca1",
  wickUpColor: "#838ca1",
};

export const histogramDefaultConfig = {
  base: 0,
  lineWidth: 2,
  overlay: true,
  priceFormat: {
    type: "volume",
  },
  scaleMargins: {
    bottom: 0,
    top: 0.8,
  },
};

export const defaultChartLayout = {
  crosshair: {
    mode: 0,
  },
  grid: {
    horzLines: {
      color: "rgba(197, 203, 206, 0.1)",
    },
    vertLines: {
      color: "rgba(197, 203, 206, 0.1)",
    },
  },
  layout: {
    backgroundColor: "#131722",
    textColor: "rgba(255, 255, 255, 0.9)",
  },
  priceScale: {
    borderColor: "rgba(197, 203, 206, 0.8)",
  },
  timeScale: {
    borderColor: "rgba(197, 203, 206, 0.8)",
    secondsVisible: false,
    timeVisible: true,
  },
};
