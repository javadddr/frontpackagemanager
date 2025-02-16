import React, { useState, useEffect } from 'react';
import { useHubs } from "./HubsContext";
import { Card, CardHeader, CardContent, CardTitle } from "../src/component/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../src/component/ui/tooltip";
import { Info } from 'react-feather';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./component/ui/chart";
import { BarChart, Bar } from "recharts";
import { XAxis } from "recharts";
import { IoSquareSharp } from 'react-icons/io5';

function ForthSmal() {
  const { io } = useHubs();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (io && Array.isArray(io)) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const lastWeekShipments = io.filter(item => {
        const itemDate = new Date(item.shipping_date);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      });

      // Group by shipped or returned
      const groupedData = lastWeekShipments.reduce((acc, item) => {
        const key = item.where === 'shipped' ? 'Shipped' : 'Returned';
        if (!acc[key]) acc[key] = 0;
        acc[key] += 1;
        return acc;
      }, {});
    
      // Format data for Recharts
      setChartData([{
        WEEK: 'Last 7 Days',
        Shipped: groupedData['Shipped'] || 0,
        Returned: groupedData['Returned'] || 0
      }]);
    }
  }, [io]);

  const chartConfig = {
    Shipped: {
      label: "Shipped",
      color: "hsl(217, 94%, 65%)",
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)',marginRight:"-6px",marginTop:"1px"  }} />
    },
    Returned: {
      label: "Returned",
      color: "hsl(348, 80%, 45%)",
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(204, 44, 75)',marginRight:"-6px",marginTop:"1px"  }} />
    },
    WEEK: {
      label: "WEEK",
      color: "hsl(217, 94%, 65%)"
    }
  };

  return (
    <Card className="dark">
      <CardHeader>
        <CardTitle>
          <div className='flex justify-between'>
            <div>
              <span>Shipped vs Returned </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={17} className="inline text-gray-100 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comparison of Shipped and Returned Shipments for the Last 7 Days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className='text-4xl -mt-3 text-lime-600'>{chartData[0] ? chartData[0].Shipped + chartData[0].Returned : 0}</span> 
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex p-0 flex-col items-center">
          <div className="w-[200px] p-0 ">
            <ChartContainer className="h-[100px]" config={chartConfig}>
              <BarChart
                data={chartData}
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
                  tickFormatter={(value) => value} 
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
                {['Shipped', 'Returned'].map(key => (
                  <Bar 
                    key={key}
                    dataKey={key}
                    fill={chartConfig[key].color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForthSmal;