import { CandleStickSocketData } from "utils/adaptor";
import ParseCandleStickData from "utils/candleStickService";
import { BASE_URL } from "utils/constants";

export default async function FetchCandleStickData(
  symbol = "BTCBUSD",
  interval = "1m"
): Promise<CandleStickSocketData[]> {
  const url = `${BASE_URL}?symbol=${symbol}&interval=${interval}`;
  const result = await fetch(url);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await result.json();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return ParseCandleStickData(data);
}
