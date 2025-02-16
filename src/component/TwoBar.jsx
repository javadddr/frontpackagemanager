import React, { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList, Legend } from "recharts";
import { useHubs } from "../HubsContext";
import moment from "moment";
import { IoSquareSharp } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const ChartConfig = {
  views: {
    label: "Shipments",
  },
  Transit: {
    label: "Transit",
    color: "hsl(217, 94%, 65%)",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)', marginRight: "-6px", marginTop: "1px" }} />,
  },
  Delivered: {
    label: "Delivered",
    color: "hsl(var(--chart-2))",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(26, 188, 156)', marginRight: "-6px", marginTop: "1px" }} />,
  },
  Exception: {
    label: "Exception",
    color: "hsl(348, 80%, 45%)",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(204, 44, 75)', marginRight: "-6px", marginTop: "1px" }} />,
  },
  Pending: {
    label: "Pending",
    color: "hsl(225, 10%, 65%)",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(156, 160, 174)', marginRight: "-6px", marginTop: "1px" }} />,
  },
  Created: {
    label: "Created",
    color: "hsl(41, 70%, 45%)",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(185, 138, 40)', marginRight: "-6px", marginTop: "1px" }} />,
  },
};

export default function TwoBar() {
  const { io } = useHubs();
  const [chartDatashipped1, setChartDatashipped1] = useState([]);
  const [chartDataReturn1, setChartDataReturn1] = useState([]);
  const [activeChart, setActiveChart] = useState("shipped");

  useEffect(() => {
    if (io && Array.isArray(io)) {
      const groupShipmentsByDateAndStatus = (shipmentsList, isShipped) => {
        const aggregatedData = {};
        shipmentsList.forEach((shipment) => {
          if ((isShipped && shipment.where === 'shipped') || (!isShipped && shipment.where !== 'shipped')) {
            const date = moment(shipment.date).format("YYYY-MM-DD");
            if (!aggregatedData[date]) {
              aggregatedData[date] = {
                date,
                Transit: 0,
                Delivered: 0,
                Exception: 0,
                Pending: 0,
                Created: 0,
              };
            }
            const status = shipment.delivery_status || 'Created';
            aggregatedData[date][status] = (aggregatedData[date][status] || 0) + 1;
          }
        });
        return Object.values(aggregatedData).sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      setChartDatashipped1(groupShipmentsByDateAndStatus(io, true));
      setChartDataReturn1(groupShipmentsByDateAndStatus(io, false));
    }
  }, [io]);

  const total = useMemo(() => {
    const sumshipped = chartDatashipped1.reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        if (key !== 'date') acc[key] = (acc[key] || 0) + curr[key];
      });
      return acc;
    }, {});
    const sumReturn = chartDataReturn1.reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        if (key !== 'date') acc[key] = (acc[key] || 0) + curr[key];
      });
      return acc;
    }, {});
    return { shipped: sumshipped, Return: sumReturn };
  }, [chartDatashipped1, chartDataReturn1]);

  useEffect(() => {
    console.log("Props changed, re-rendering:", { chartDatashipped1, chartDataReturn1 });
  }, [chartDatashipped1, chartDataReturn1]);

  return (
    <Card className="dark">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row h-[100px]">
        <div className="flex flex-1 flex-col justify-center gap-1 px-0 py-0 sm:py-0">
          <CardTitle>Delivery Status vs date for {activeChart === "shipped" ? "shipped packages" : "returned packages"}</CardTitle>
          <CardDescription>
            Showing Shipments by Status for the packages that were {activeChart === "shipped" ? "shipped by" : "returned to"} hubs
          </CardDescription>
        </div>
        <div className="flex justify-center text-white">
          {["shipped", "Return"].map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 h-[60px] flex-col justify-center gap-1 border-t px-3 py-4 p-3 rounded text-center even:border-l data-[active=true]:bg-lime-700 sm:border sm:border-t-1 sm:px-4 sm:py-1"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-white">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span className="text-lg font-bold leading-none sm:text-xl">
                {Object.values(total[key]).reduce((acc, val) => acc + val, 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={ChartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <BarChart
            data={activeChart === "shipped" ? chartDatashipped1 : chartDataReturn1}
            margin={{
              left: 12,
              right: 12,
              bottom: 0,
            }}
          >
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                >
                  {(props) => {
                    if (!props.active || !props.payload) return null;

                    return (
                      <div>
                        {props.payload.map((entry, index) => {
                          const IconComponent = ChartConfig[entry.dataKey]?.icon;
                          const color = ChartConfig[entry.dataKey]?.color || "hsl(var(--chart-2))";

                          return (
                            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', color: 'yellow' }}>
                              {IconComponent && 
                                <IconComponent size={10} style={{ color: color }} />
                              }
                              <span style={{ marginLeft: '0px' }}>{`${entry.name}: ${entry.value}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </ChartTooltipContent>
              }
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            {Object.keys(ChartConfig).slice(1).map((key) => (
              <Bar key={key} dataKey={key} stackId="a" fill={ChartConfig[key].color} radius={[0, 0, 0, 0]}>
                {activeChart === "shipped" && chartDatashipped1.some(item => item[key] !== 0) && (
                  <LabelList
                    dataKey={key}
                    position="center"
                    fill="#FFF"
                    fontSize={12}
                    formatter={(value) => (value === 0 ? '' : value)}
                  />
                )}
                {activeChart === "Return" && chartDataReturn1.some(item => item[key] !== 0) && (
                  <LabelList
                    dataKey={key}
                    position="center"
                    fill="#FFF"
                    fontSize={12}
                    formatter={(value) => (value === 0 ? '' : value)}
                  />
                )}
              </Bar>
            ))}
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              payload={Object.keys(ChartConfig).slice(1).map(key => ({
                id: key,
                type: "circle",
                value: ChartConfig[key].label,
                color: ChartConfig[key].color
              }))}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}