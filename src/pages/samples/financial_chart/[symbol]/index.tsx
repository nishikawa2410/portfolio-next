import { Box, Button, Grid, GridItem, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import FinancialChartControlComponent from "components/FinancialChartControl";
import FinancialPriceListComponent from "components/FinancialPriceList";
import FinancialTradeComponent from "components/FinancialTrade";
import Seo from "components/Seo";
import {
  CandleStickSocketData,
  ExchangeSocketData,
  KlinesWSSResponse,
  Price24hSocketData,
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

export type FinancialChartProps = {
  intervalParam: string;
  symbolParam: string;
};

export default function FinancialChart({
  intervalParam,
  symbolParam,
}: FinancialChartProps): JSX.Element {
  const router = useRouter();
  // 為替ペア(symbol)
  const [symbol, setSymbol] = useState(symbolParam);
  // 相場更新レート
  const [chartInterval, setChartInterval] = useState(intervalParam);
  // symbolデータ
  const [exchangeData, setExchangeData] = useState<ExchangeSocketData[]>([]);
  // 24h価格変動データ
  const [price24hData, setPrice24hData] = useState<Price24hSocketData[]>([]);
  // 相場履歴データ
  const [candleStickData, setCandleData] = useState<CandleStickSocketData[]>(
    []
  );
  // 相場リアルタイム更新データ
  const [updateKlinesData, setUpdateKlinesData] =
    useState<CandleStickSocketData | null>(null);
  // 取引リアルタイム更新データ
  const [updateTradeData, setUpdateTradeData] = useState<TradesSocketData>({
    price: 0,
    quantity: 0,
    symbol: "",
    time: "",
  });
  // symbol データ取得
  const fetchExchangeData = useCallback(async () => {
    const url = `${BASE_URL}/exchangeInfo`;
    const result = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await result.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setExchangeData(exchangeAdaptor(data));
  }, []);
  // 24h価格変動データ取得
  const fetchPrice24hData = useCallback(async () => {
    const url = `${BASE_URL}/ticker/24hr?symbols=["BTCBUSD","ETHBUSD","BNBBUSD","XRPBUSD","ADABUSD","DOGEBUSD","MATICBUSD","SOLBUSD","DOTBUSD","SHIBBUSD","LTCBUSD","ETCBUSD"]`;
    const result = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await result.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setPrice24hData(data);
  }, []);
  // 相場データ取得
  const fetchCandleData = useCallback(async () => {
    const url = `${BASE_URL}/klines?symbol=${symbol}&interval=${chartInterval}`;
    const result = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await result.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setCandleData(ParseCandleStickData(data));
  }, [chartInterval, symbol]);
  // 現在のbaseAsset
  const base = useMemo(
    () =>
      exchangeData.find(({ symbol: symbolData }) => symbol === symbolData)
        ?.baseAsset,
    [exchangeData, symbol]
  );
  // 現在のbaseAssetに紐つく取引可能なsymbolのoption配列
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
  // quoteAssetがBUSD かつ 取引可能なsymbolのoption配列
  const symbolOptions = useMemo(
    () =>
      exchangeData
        .filter(
          ({ quoteAsset, status }) =>
            status === "TRADING" && quoteAsset === "BUSD"
        )
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
    // 24h価格変動データを5秒おきに更新する
    // eslint-disable-next-line no-void
    void fetchPrice24hData();

    const timerId = setInterval(() => {
      // eslint-disable-next-line no-void
      void fetchPrice24hData();
    }, 5000);

    return () => {
      // DOMがアンマウントされたとき、24h価格変動データ更新を止める
      clearInterval(timerId);
    };
  }, [fetchPrice24hData]);

  useEffect(() => {
    if (!chartInterval || !symbol) return;
    // 為替ペア、相場更新レートが変更されたタイミングで初期化
    setCandleData([]);
    // eslint-disable-next-line no-void
    void fetchCandleData();
  }, [chartInterval, fetchCandleData, symbol]);

  // リアルタイムデータ取得
  useEffect(() => {
    const wsKline = new WebSocket(
      `${WS_URL}/${symbol.toLocaleLowerCase()}@kline_${chartInterval}`
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
      // DOMがアンマウントされたとき、WebSocketをクローズしstateを初期化する
      wsKline.close();
      setUpdateKlinesData(null);
      wsTrade.close();
      setUpdateTradeData({
        price: 0,
        quantity: 0,
        symbol: "",
        time: "",
      });
    };
  }, [chartInterval, symbol]);

  if (!candleStickData.length || !updateKlinesData) {
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
          <GridItem
            area={"header"}
            bg="#131722"
            borderBottom="solid 1px #e2e8f0"
          >
            <Text color="gray.400" fontWeight="300" p={4}>
              loading
            </Text>
          </GridItem>
          <GridItem
            area={"control"}
            bg="#131722"
            borderBottom="solid 1px #e2e8f0"
            zIndex={99}
          >
            <Text color="gray.400" fontWeight="300" p={4}>
              loading
            </Text>
          </GridItem>
          <GridItem
            area={"history"}
            bg="#131722"
            borderLeft="solid 1px #e2e8f0"
          >
            <Text color="gray.400" fontWeight="300" p={4}>
              loading
            </Text>
          </GridItem>
          <GridItem area={"chart"} bg="#131722">
            <Text color="gray.400" fontWeight="300" p={4}>
              loading
            </Text>
          </GridItem>
          <GridItem area={"footer"} bg="#131722" borderTop="solid 1px #e2e8f0">
            {
              // TODO: add footer
            }
          </GridItem>
        </Grid>
      </>
    );
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
        <GridItem area={"header"} bg="#131722" borderBottom="solid 1px #e2e8f0">
          <FinancialPriceListComponent price24hData={price24hData} />
        </GridItem>
        <GridItem
          area={"control"}
          bg="#131722"
          borderBottom="solid 1px #e2e8f0"
          zIndex={99}
        >
          <FinancialChartControlComponent
            chartInterval={chartInterval}
            quoteSymbols={quoteSymbolOptions}
            setChartInterval={setChartInterval}
            setSymbol={setSymbol}
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
        <GridItem
          area={"footer"}
          bg="#131722"
          borderTop="solid 1px #e2e8f0"
          position="relative"
        >
          <Box left="20px" position="absolute" top="calc(50% - 12px)">
            <Button onClick={(): void => router.back()} size="xs">
              ←Back
            </Button>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  FinancialChartProps
> = async ({
  query: { interval: intervalParam, symbol: symbolParam },
  // eslint-disable-next-line @typescript-eslint/require-await
}) => ({
  // URLパラメータをサーバーサイドで取得することでレンダーの遅延をなくす
  props: {
    intervalParam: typeof intervalParam === "string" ? intervalParam : "1m",
    symbolParam: typeof symbolParam === "string" ? symbolParam : "BTCBUSD",
  },
});
