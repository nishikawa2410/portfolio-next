"use client";
import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import { Select as ChakraReactSelect } from "chakra-react-select";
import { AiOutlineSearch } from "react-icons/ai";

type Option = {
  label: string;
  value: string;
};

type FinancialChartControlComponentProps = {
  interval: string;
  quoteSymbols: Option[];
  symbol: string;
  symbols: Option[];
};

export default function FinancialChartControlComponent({
  interval,
  quoteSymbols,
  symbol,
  symbols,
}: FinancialChartControlComponentProps): JSX.Element {
  return (
    <Box>
      <HStack height="50px">
        <Heading as="h1" color="gray.100" fontSize="24px" ml={4} mr={4}>
          {symbol}
        </Heading>
        <Text color="gray.400" fontWeight="300">
          Margin Pairs:
        </Text>
        <Box color="gray.400" width="150px">
          <ChakraReactSelect<Option, false>
            id="MarginPairs"
            instanceId="MarginPairs"
            isMulti={false}
            isRequired={true}
            onChange={(newValue): void => {
              if (!newValue?.value) return;
              // TODO: next router に対応する
              window.location.href = `/samples/financial_chart/${newValue.value}?interval=${interval}`;
            }}
            options={quoteSymbols}
            placeholder={
              <HStack spacing="4px">
                <AiOutlineSearch color="#CBD5E0" height="10px" width="10px" />
                <Text color="gray.400">{symbol}</Text>
              </HStack>
            }
            size="sm"
            useBasicStyles={true}
          />
        </Box>
        <Text color="gray.400" fontWeight="300">
          Other Pairs:
        </Text>
        <Box color="gray.400" width="150px">
          <ChakraReactSelect<Option, false>
            id="OtherPairs"
            instanceId="OtherPairs"
            isMulti={false}
            isRequired={true}
            onChange={(newValue): void => {
              if (!newValue?.value) return;
              // TODO: next router に対応する
              window.location.href = `/samples/financial_chart/${newValue.value}?interval=${interval}`;
            }}
            options={symbols}
            placeholder={
              <HStack spacing="4px">
                <AiOutlineSearch color="#CBD5E0" height="10px" width="10px" />
                <Text color="gray.400">{symbol}</Text>
              </HStack>
            }
            size="sm"
            useBasicStyles={true}
          />
        </Box>
        <Text color="gray.400" fontWeight="300">
          Rate:
        </Text>
        <Box color="gray.400" width="80px">
          <ChakraReactSelect<Option, false>
            id="Rate"
            instanceId="Rate"
            isMulti={false}
            isRequired={true}
            isSearchable={false}
            onChange={(newValue): void => {
              if (!newValue?.value) return;
              // TODO: next router に対応する
              window.location.href = `/samples/financial_chart/${symbol}?interval=${newValue.value}`;
            }}
            options={[
              { label: "1s", value: "1s" },
              { label: "1m", value: "1m" },
              { label: "3m", value: "3m" },
              { label: "5m", value: "5m" },
              { label: "15m", value: "15m" },
              { label: "30m", value: "30m" },
              { label: "1h", value: "1h" },
              { label: "2h", value: "2h" },
              { label: "4h", value: "4h" },
              { label: "6h", value: "6h" },
              { label: "8h", value: "8h" },
              { label: "12h", value: "12h" },
              { label: "1d", value: "1d" },
              { label: "3d", value: "3d" },
              { label: "1w", value: "1w" },
              { label: "1M", value: "1M" },
            ]}
            placeholder={<Text color="gray.400">{interval}</Text>}
            size="sm"
            useBasicStyles={true}
          />
        </Box>
      </HStack>
    </Box>
  );
}
