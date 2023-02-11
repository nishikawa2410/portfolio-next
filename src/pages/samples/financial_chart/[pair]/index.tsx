import { Grid, GridItem } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import FinancialTradeComponent from "components/FinancialTrade";
import Seo from "components/Seo";
import {
  CandleStickSocketData,
  KlinesWSSResponse,
  TradesSocketData,
  TradesWSSResponse,
  candleSocketAdaptor,
  tradesSocketAdaptor,
} from "utils/adaptor";
import { WS_URL } from "utils/constants";
import FetchCandleStickData from "utils/fetchService";

const FinancialChartComponent = dynamic(
  () => import("components/FinancialChart"),
  { ssr: false }
);

export default function FinancialChart(): JSX.Element {
  const searchParams = useSearchParams();
  const pair = useMemo(
    () => searchParams.get("pair") || "BTCBUSD",
    [searchParams]
  );
  const interval = useMemo(
    () => searchParams.get("interval") || "1m",
    [searchParams]
  );
  const [candleStickData, setCandleData] = useState<CandleStickSocketData[]>(
    []
  );
  const [updateKlinesData, setUpdateKlinesData] =
    useState<CandleStickSocketData | null>(null);
  const [updateTradeData, setUpdateTradeData] = useState<TradesSocketData>({
    pair: "",
    price: 0,
    quantity: 0,
    time: "",
  });
  const fetchCandleData = useCallback(async () => {
    const candleData = await FetchCandleStickData(pair, interval);

    setCandleData(candleData);
  }, [interval, pair]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchCandleData();
  }, [candleStickData.length, fetchCandleData]);

  useEffect(() => {
    const wsKline = new WebSocket(
      `${WS_URL}/${pair.toLocaleLowerCase()}@kline_${interval}`
    );
    const wsTrade = new WebSocket(
      `${WS_URL}/${pair.toLocaleLowerCase()}@trade`
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
  }, [interval, pair]);

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
        <GridItem area={"control"} bg="pink.300">
          Control
        </GridItem>
        <GridItem area={"history"} bg="#131722">
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
