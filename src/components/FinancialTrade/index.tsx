"use client";
import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import { TradesSocketData } from "utils/adaptor";

type FinancialTradeComponentProps = {
  updateTradeData: TradesSocketData | null;
};

export default function FinancialTradeComponent({
  updateTradeData,
}: FinancialTradeComponentProps): JSX.Element {
  const [tradesArrayData, setTradesArrayData] = useState<TradesSocketData[]>(
    []
  );
  const columnHelper = createColumnHelper<TradesSocketData>();
  const columns = [
    columnHelper.accessor("price", {
      cell: (info) => info.getValue(),
      header: "Price",
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor("quantity", {
      cell: (info) => info.getValue(),
      header: "Amount",
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor("time", {
      cell: (info) => info.getValue(),
      header: "Time",
      meta: {
        isNumeric: true,
      },
    }),
  ];
  const tradesRef = useRef<TradesSocketData[]>([
    {
      price: 0,
      quantity: 0,
      symbol: "",
      time: "",
    },
  ]);

  useMemo(() => {
    if (!updateTradeData) return;

    updateTradeData.color =
      tradesRef.current.length &&
      updateTradeData.price > tradesRef.current[0].price
        ? "#00c176"
        : "#cf304a";

    const tradesArray = [updateTradeData, ...tradesRef.current];

    if (tradesArray.length >= 30) tradesArray.pop();
    tradesRef.current = tradesArray;
  }, [updateTradeData]);

  const table = useReactTable({
    columns,
    data: tradesArrayData,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setInterval(() => {
      setTradesArrayData(tradesRef.current);
    }, 500);
  }, []);

  return (
    <Box height="calc(100vh - 130px)" overflow="hidden">
      <Table size="sm">
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta: any = header.column.columnDef.meta;

                return (
                  <Th
                    color="gray.100"
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    isNumeric={meta?.isNumeric}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = cell.column.columnDef.meta;

                  return (
                    <Td
                      borderColor="gray.500"
                      color={row.original.color}
                      fontWeight="300"
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                      isNumeric={meta?.isNumeric}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
