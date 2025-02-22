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

function Thirdsmall() {
  const { io } = useHubs();
  const [weeklyShipments1, setWeeklyShipments1] = useState([]);
  const [returned, setReturned] = useState(0); // Changed to number for count

  useEffect(() => {
    if (io && Array.isArray(io)) {
      // Filter shipments where 'where' is NOT 'shipped'
      const returnedShipments = io.filter(item => item.where !== 'shipped');
      
      // Group shipments by week
      const weeklyData = returnedShipments.reduce((acc, item) => {
     
        const date = moment(
          item.shipping_date && moment(item.shipping_date).isValid() 
            ? item.shipping_date 
            : item.createdAtv2
        );
        const week = date.format('DD MMM'); // Format to day and month abbreviation
        const weekStart = date.startOf('isoWeek').format('DD MMM'); // First day of the week

        if (!acc[weekStart]) {
          acc[weekStart] = { WEEK: weekStart, Shipments: 0 };
        }
        acc[weekStart].Shipments += 1;
        return acc;
      }, {});

      // Convert object to array for Recharts
      const chartData = Object.values(weeklyData);
      setWeeklyShipments1(chartData);
      setReturned(returnedShipments.length); // Set the count of returned shipments
    }
  }, [io]);

  const chartConfig = {
    Shipments: {
      label: "Shipments",
      color: "hsl(348, 80%, 45%)", // A red-like hue for returns, adjust as needed
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(204, 44, 75)',marginRight:"-6px",marginTop:"1px"  }} />,
    },
    WEEK: {
      label: "WEEK",
      color: "hsl(348, 80%, 45%)", // Match the color for consistency
    }
  };

  return (
    <Card className="dark">
      <CardHeader>
        <CardTitle>
          <div className='flex justify-between'>
            <div>
              <span>Shipments Returned </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={17} className="inline text-gray-100 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Returns (Past 3 months-weekly)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className='text-4xl -mt-3 text-lime-600 '>{returned}</span> 
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex p-0 flex-col items-center">
          <div className="w-[200px] p-0 ">
            <ChartContainer className="h-[100px]" config={chartConfig}>
              <BarChart
                data={weeklyShipments1} 
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
                                <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' ,color:'yellow'}}>
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

export default Thirdsmall;