import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, LabelList } from "recharts";
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

function ProHub() {
  const { products } = useHubs();

  const chartData = products.length === 0 
  ? [] 
  : products.reduce((acc, product) => {
      let hubEntry = acc.find(item => item.hub === product.hub);
      if (!hubEntry) {
        hubEntry = { hub: product.hub, products: [] };
        acc.push(hubEntry);
      }
    
      hubEntry.products.push({
        name: product.name,
        currentInventory: product.currentInventory,
        fill: product.currentInventory < product.reorderLevel ? "rgb(204, 44, 75)" : "hsl(var(--chart-2))",
      });

      return acc;
  }, []);


  // Dynamically create chartConfig based on product names
  const chartConfig = useMemo(() => {
    const config = {};
  
    if (chartData.length > 0) {
      chartData[0].products.forEach((product, index) => {
        config[`products[${index}].currentInventory`] = {
          label: product.name,
          color: product.fill,
          icon: (props) => <IoSquareSharp size={16} style={{ color: product.fill, marginRight: "-6px", marginTop: "1px" }} />,
        };
      });
    }
  
    return config;
  }, [chartData]);
  

  return (
    <Card className="mt-10 mr-3 h-[300px] w-[400px] dark">
      <CardHeader>
        <CardTitle>Inventory by Hub</CardTitle>
        <CardDescription>
          Displays the current inventory levels of products per hub.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px]">
          <BarChart data={chartData}>
            <XAxis
              dataKey="hub"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 4 ? `${value.substring(0, 7)}...` : value
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[200px]">
                  {(props) => {
                    if (!props.active || !props.payload) return null;

                    return (
                      <div>
                        <p className="label">{`Hub: ${props.label}`}</p>
                        {props.payload.map((entry, index) => {
                          const productConfig = chartConfig[entry.dataKey];
                          if (!productConfig) return null; // Skip if no matching config

                          return (
                            <div 
                              key={`item-${index}`} 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                color: "yellow",
                                marginBottom: '5px' 
                              }}
                            >
                              {productConfig.icon({
                                size: 10,
                                style: { color: entry.fill }
                              })}
                              <span style={{ marginLeft: "5px" }}>{`${productConfig.label}: ${entry.value}`}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </ChartTooltipContent>
              }
            />
          {chartData.length > 0 && chartData[0].products.map((_, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey={`products[${index}].currentInventory`}
                stackId="a"
                strokeWidth={2}
                radius={[0, 0, 0, 0]}
                fill={chartData[0].products[index].fill}
              >
                <LabelList 
                  dataKey={`products[${index}].name`} 
                  position="inside" 
                  fill="black" 
                />
              </Bar>
            ))}

          
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default ProHub;