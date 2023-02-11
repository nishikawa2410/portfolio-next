"use client";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { Price24hSocketData } from "utils/adaptor";

type FinancialPriceListComponentProps = {
  price24hData: Price24hSocketData[];
};

export default function FinancialPriceListComponent({
  price24hData,
}: FinancialPriceListComponentProps): JSX.Element {
  return (
    <Box>
      <style>
        {`@keyframes swipe {
        0% {
          transform: translate(0);
        }
        100% {
          transform: translate(-100%);
        }
      }`}
      </style>
      <Flex height="80px" position="absolute" width="100vw">
        <HStack
          animation="swipe 20s linear infinite backwards"
          paddingRight={8}
          spacing={8}
        >
          {price24hData.map(({ priceChangePercent, symbol }) => (
            <Box key={symbol}>
              <Text color="gray.100" fontSize="20" fontWeight="bold">
                {symbol}
              </Text>
              <Text
                color={
                  parseFloat(priceChangePercent) > 0 ? "#00c176" : "#cf304a"
                }
              >
                {Math.round(parseFloat(priceChangePercent) * 10) / 10}%
              </Text>
            </Box>
          ))}
        </HStack>
        <HStack
          animation="swipe 20s linear infinite backwards"
          paddingRight={8}
          spacing={8}
        >
          {price24hData.map(({ priceChangePercent, symbol }) => (
            <Box key={symbol}>
              <Text color="gray.100" fontSize="20" fontWeight="bold">
                {symbol}
              </Text>
              <Text
                color={
                  parseFloat(priceChangePercent) > 0 ? "#00c176" : "#cf304a"
                }
              >
                {Math.round(parseFloat(priceChangePercent) * 10) / 10}%
              </Text>
            </Box>
          ))}
        </HStack>
        <HStack
          animation="swipe 20s linear infinite backwards"
          paddingRight={8}
          spacing={8}
        >
          {price24hData.map(({ priceChangePercent, symbol }) => (
            <Box key={symbol}>
              <Text color="gray.100" fontSize="20" fontWeight="bold">
                {symbol}
              </Text>
              <Text
                color={
                  parseFloat(priceChangePercent) > 0 ? "#00c176" : "#cf304a"
                }
              >
                {Math.round(parseFloat(priceChangePercent) * 10) / 10}%
              </Text>
            </Box>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
}
