import React, { useState, useEffect } from 'react';
import { useHubs } from "./HubsContext";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../src/component/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../src/component/ui/tooltip";
import { Info } from 'react-feather';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./component/ui/chart";
import { BarChart, Bar } from "recharts";
import { XAxis } from "recharts";
import moment from 'moment';
import { IoSquareSharp } from 'react-icons/io5';

function Seconsmall({isDark}) {
  const { io } = useHubs();
  const [chartData1, setChartData1] = useState([]);
  const [shipped, setShipped] = useState([]);

  console.log("shippedIN chartData1", chartData1);

  useEffect(() => {
    if (io && Array.isArray(io)) {
      // Filter shipments where 'where' is 'shipped'
      const shippedShipments = io.filter(item => item.where === 'shipped');
      
      // Group shipments by week using shipping_date
      const weeklyData = shippedShipments.reduce((acc, item) => {
        const date = moment(
          item.shipping_date && moment(item.shipping_date).isValid() 
            ? item.shipping_date 
            : item.createdAtv2
        );
        const weekStart = date.startOf('isoWeek').format('DD MMM'); // Start of the week in 'DD MMM' format

        if (!acc[weekStart]) {
          acc[weekStart] = { WEEK: weekStart, Shipments: 0 };
        }
        acc[weekStart].Shipments += 1;
        return acc;
      }, {});

      // Convert object to array for Recharts
      const chartData = Object.values(weeklyData);
      setChartData1(chartData);
      setShipped(shippedShipments);
    }
  }, [io]);

  const chartConfig = {
    Shipments: {
      label: "Shipments",
      color: "hsl(217, 94%, 65%)", // Blue color for shipped
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)', marginRight: "-6px", marginTop: "1px" }} />,
    },
    WEEK: {
      label: "WEEK",
      color: "hsl(217, 94%, 65%)", // Same color for consistency
    }
  };

  return (
    <Card className={` ${isDark?"dark":""}`}>
      <CardHeader>
        <CardTitle>
          <div className='flex justify-between'>
            <div>
              <span>Shipments Shipped </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Info size={14} className={`inline ${isDark?"text-gray-100":"text-gray-900"}  cursor-pointer`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Shipments that have been sent out (Past 3 months-weekly)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className='text-4xl -mt-3 text-lime-600'>{shipped.length}</span> 
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex p-0 flex-col items-center">
          <div className="w-[200px] p-0">
            <ChartContainer className="h-[100px]" config={chartConfig}>
              <BarChart
                data={chartData1}
                margin={{
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0
                }}
              >
                <XAxis
                  dataKey="WEEK"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value} // Show the full 'DD MMM' format
                  reversed
                  label={{ position: 'insideBottom', dy: 10 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                    >
                      {(props) => {
                        if (!props.active || !props.payload) return null;

                        return (
                          <div>
                            {props.payload.map((entry, index) => {
                              const IconComponent = chartConfig[entry.dataKey]?.icon;
                              const color = chartConfig[entry.dataKey]?.color || "hsl(var(--chart-2))";

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
                <Bar
                  dataKey="Shipments"
                  fill={chartConfig.Shipments.color} // Use color from chartConfig directly
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Seconsmall;