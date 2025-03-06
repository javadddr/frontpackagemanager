import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./component/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./component/ui/chart";
import { useHubs } from "./HubsContext";
import { IoSquareSharp } from "react-icons/io5";
function ProChange({isDark}) {
  const { products } = useHubs();
  const [chartData, setChartData] = useState([]);

useEffect(() => {
  if (!products) return;

  let moves = [];
  products.forEach(product => {
    if (product.move && Array.isArray(product.move)) {
      product.move.forEach(move => {
        if (move) {
          const date = new Date(move.date);
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          moves.push({
            ...move,
            name: product.name,
            yearMonth: yearMonth,
            adjustedValue: move.status === 'in' ? move.value : -move.value,
            status: move.status,
          });
        }
      });
    }
  });

  // Group by month and sum values
  const groupedData = moves.reduce((acc, move) => {
    if (!acc[move.yearMonth]) {
      acc[move.yearMonth] = { yearMonth: move.yearMonth, in: 0, out: 0 };
    }
    if (move.status === 'in') acc[move.yearMonth].in += move.adjustedValue;
    else acc[move.yearMonth].out += move.adjustedValue;
    return acc;
  }, {});

  setChartData(Object.values(groupedData));
}, [products]);
 
const chartConfig = {
  in: {
    name: "Inventory In",
    color: "hsl(var(--chart-2))",
    icon: (props) => (
      <IoSquareSharp
        size={16}
        style={{ color: "hsl(var(--chart-2))", marginRight: "-6px", marginTop: "1px" }}
      />
    ),
  },
  out: {
    name: "Inventory Out",
    color: "rgb(204, 44, 75)",
    icon: (props) => (
      <IoSquareSharp
        size={16}
        style={{ color: "rgb(204, 44, 75)", marginRight: "-6px", marginTop: "1px" }}
      />
    ),
    
  }
};

  return (

      <Card className={`mt-10 mr-3 h-[300px] w-[400px] ${isDark?"dark":"light"}`}>
      <CardHeader>
        <CardTitle>Product Inventory Changes</CardTitle>
        <CardDescription>Showing inventory movements</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <BarChart width={500} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" axisLine={true} />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[200px]">
                  
                  {(props) => {
                    if (!props.active || !props.payload) return null;

                    return (
                      <div>
                        {props.payload.map((entry, index) => {
                          const IconComponent = chartConfig[entry.dataKey]?.icon;
                          const color = chartConfig[entry.dataKey]?.color || "hsl(var(--chart-2))";

                          return (
                            <div
                              key={`item-${index}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                color: "yellow",
                              }}
                            >
                              {IconComponent && (
                                <IconComponent
                                  size={10}
                                  style={{ color: color }}
                                />
                              )}
                              <span style={{ marginLeft: "0px" }}>{`${displayName}: ${entry.value}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </ChartTooltipContent>
              }
            />
          
           
            
            
            
             
              {chartData.map((item, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={item.status === 'in' ? 'hsl(var(--chart-2))' : 'rgb(204, 44, 75)'}
                />
              ))}
      
                     <Bar dataKey="in"  fill={chartConfig.in.color}  > <LabelList dataKey="in" position="inside" fill="black" /></Bar>
            <Bar dataKey="out" stackId="stack" fill={chartConfig.out.color} > <LabelList dataKey="out" position="inside" fill="black" /></Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}



export default ProChange;