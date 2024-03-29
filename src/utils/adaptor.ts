import { format } from "date-fns";

/* eslint-disable unused-imports/no-unused-vars */
export type ExchangeHTTPResponse = {
  symbols: [
    {
      baseAsset: string;
      quoteAsset: string;
      status: string;
      symbol: string;
    }
  ];
};

export type KlinesHTTPResponse = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

export type KlinesWSSResponse = {
  k: {
    T: number; // Kline close time
    V: string; // Taker buy base asset volume
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    o: string; // Open price
    v: string; // Base asset volume
  };
};

export type TradesWSSResponse = {
  E: number; // Event time
  M: boolean; // Ignore
  T: number; // Trade time
  a: number; // Seller order ID
  b: number; // Buyer order ID
  e: string; // Event type
  m: boolean; // Is the buyer the market maker?
  p: string; // Price
  q: string; // Quantity
  s: string; // Symbol
  t: number; // Trade ID
};

export type Price24hSocketData = {
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  symbol: string;
};

export type ExchangeSocketData = {
  baseAsset: string;
  quoteAsset: string;
  status: string;
  symbol: string;
};

export type CandleStickSocketData = {
  close: number;
  color: string;
  high: number;
  low: number;
  open: number;
  time: number;
  value: number;
};

export type TradesSocketData = {
  color?: string;
  price: number;
  quantity: number;
  symbol: string;
  time: string;
};

export function exchangeAdaptor(
  data: ExchangeHTTPResponse
): ExchangeSocketData[] {
  const { symbols } = data;

  return symbols;
}

export function candleStickAdaptor(
  data: KlinesHTTPResponse
): CandleStickSocketData {
  const [
    openTime,
    open,
    high,
    low,
    close,
    volume,
    closeTime,
    quoteAssetVolume,
    numberOfTrades,
    takerBuyBaseAssetVolume,
    takerBuyQuotessetVolume,
    ignore,
  ] = data;

  return {
    close: parseFloat(close),
    color: open < close ? "#005a40" : "#82112b",
    high: parseFloat(high),
    low: parseFloat(low),
    open: parseFloat(open),
    time: openTime / 1000,
    value: parseFloat(volume),
  };
}

export function candleSocketAdaptor(
  data: KlinesWSSResponse
): CandleStickSocketData {
  const {
    k: { T, V, c, h, l, o, v },
  } = data;

  return {
    close: parseFloat(c),
    color: o < c ? "#005a40" : "#82112b",
    high: parseFloat(h),
    low: parseFloat(l),
    open: parseFloat(o),
    time: T / 1000,
    value: (parseFloat(v) + parseFloat(V)) / 2,
  };
}

export function tradesSocketAdaptor(data: TradesWSSResponse): TradesSocketData {
  const { T, p, q, s } = data;

  return {
    price: parseFloat(p),
    quantity: parseFloat(q),
    symbol: s,
    time: format(new Date(T), "hh:mm:ss"),
  };
}
