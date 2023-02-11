import { Grid, GridItem } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import FinancialChartControlComponent from "components/FinancialChartControl";
import FinancialTradeComponent from "components/FinancialTrade";
import Seo from "components/Seo";
import {
  CandleStickSocketData,
  ExchangeSocketData,
  KlinesWSSResponse,
  TradesSocketData,
  TradesWSSResponse,
  candleSocketAdaptor,
  exchangeAdaptor,
  tradesSocketAdaptor,
} from "utils/adaptor";
import ParseCandleStickData from "utils/candleStickService";
import { BASE_URL, WS_URL } from "utils/constants";

const FinancialChartComponent = dynamic(
  () => import("components/FinancialChart"),
  { ssr: false }
);

export default function FinancialChart(): JSX.Element {
  const searchParams = useSearchParams();
  const symbol = useMemo(
    () => searchParams.get("symbol") || "BTCBUSD",
    [searchParams]
  );
  const interval = useMemo(
    () => searchParams.get("interval") || "1m",
    [searchParams]
  );
  const [exchangeData, setExchangeData] = useState<ExchangeSocketData[]>([]);
  const [candleStickData, setCandleData] = useState<CandleStickSocketData[]>(
    []
  );
  const [updateKlinesData, setUpdateKlinesData] =
    useState<CandleStickSocketData | null>(null);
  const [updateTradeData, setUpdateTradeData] = useState<TradesSocketData>({
    price: 0,
    quantity: 0,
    symbol: "",
    time: "",
  });
  const fetchExchangeData = useCallback(async () => {
    const url = `${BASE_URL}/exchangeInfo`;
    const result = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await result.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setExchangeData(exchangeAdaptor(data));
  }, []);
  const fetchCandleData = useCallback(async () => {
    const url = `${BASE_URL}/klines?symbol=${symbol}&interval=${interval}`;
    const result = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await result.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setCandleData(ParseCandleStickData(data));
  }, [interval, symbol]);
  // 現在の baseAsset
  const base = useMemo(
    () =>
      exchangeData.find(({ symbol: symbolData }) => symbol === symbolData)
        ?.baseAsset,
    [exchangeData, symbol]
  );
  // 現在の baseAsset に紐つく symbol の option 配列
  const quoteSymbolOptions = useMemo(
    () =>
      exchangeData
        .filter(
          ({ baseAsset, status }) => status === "TRADING" && base === baseAsset
        )
        .map(({ symbol: symbolData }) => ({
          label: symbolData,
          value: symbolData,
        })),
    [base, exchangeData]
  );
  // symbol の option 配列
  const symbolOptions = useMemo(
    () =>
      exchangeData
        .filter(({ status }) => status === "TRADING")
        .map(({ symbol: symbolData }) => ({
          label: symbolData,
          value: symbolData,
        })),
    [exchangeData]
  );

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchExchangeData();
  }, [fetchExchangeData]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchCandleData();
  }, [fetchCandleData]);

  useEffect(() => {
    const wsKline = new WebSocket(
      `${WS_URL}/${symbol.toLocaleLowerCase()}@kline_${interval}`
    );
    const wsTrade = new WebSocket(
      `${WS_URL}/${symbol.toLocaleLowerCase()}@trade`
    );

    wsKline.onmessage = (e): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const messageKline: KlinesWSSResponse = JSON.parse(e.data);
      const parsedMessageKline = candleSocketAdaptor(messageKline);

      setUpdateKlinesData(parsedMessageKline);
    };
    wsTrade.onmessage = (e): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const messageTrades: TradesWSSResponse = JSON.parse(e.data);
      const parsedMessageTrades = tradesSocketAdaptor(messageTrades);

      setUpdateTradeData(parsedMessageTrades);
    };

    return () => {
      wsKline.close();
      wsTrade.close();
    };
  }, [interval, symbol]);

  if (!candleStickData.length || !updateKlinesData) {
    return <div className="loader" />;
  }

  return (
    <>
      <Seo title="FinancialChart" />
      <Grid
        color="blackAlpha.700"
        fontWeight="bold"
        gridTemplateColumns={"1fr 300px"}
        gridTemplateRows={"80px 50px 1fr 50px"}
        h="100vh"
        templateAreas={`"header header"
                  "control history"
                  "chart history"
                  "footer footer"`}
      >
        <GridItem area={"header"} bg="orange.300">
          Header
        </GridItem>
        <GridItem
          area={"control"}
          bg="#131722"
          borderBottom="solid 1px #e2e8f0"
          zIndex={99}
        >
          <FinancialChartControlComponent
            interval={interval}
            quoteSymbols={quoteSymbolOptions}
            symbol={symbol}
            symbols={symbolOptions}
          />
        </GridItem>
        <GridItem area={"history"} bg="#131722" borderLeft="solid 1px #e2e8f0">
          <FinancialTradeComponent updateTradeData={updateTradeData} />
        </GridItem>
        <GridItem area={"chart"} bg="#131722">
          <FinancialChartComponent
            initialChartData={candleStickData}
            updatedata={updateKlinesData}
          />
        </GridItem>
        <GridItem area={"footer"} bg="blue.300">
          Footer
        </GridItem>
      </Grid>
    </>
  );
}
