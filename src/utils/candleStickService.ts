import {
  CandleStickSocketData,
  KlinesHTTPResponse,
  candleStickAdaptor,
} from "utils/adaptor";

export default function ParseCandleStickData(
  candleArray = []
): CandleStickSocketData[] {
  const transformedData = candleArray.reduce(
    (accu: CandleStickSocketData[], curr: KlinesHTTPResponse) => {
      const candle = candleStickAdaptor(curr);

      accu.push(candle);

      return accu;
    },
    []
  );

  return transformedData;
}
