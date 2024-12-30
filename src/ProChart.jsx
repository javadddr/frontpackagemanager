

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
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

export default function ProChart() {
  const { products } = useHubs();

  const chartData = products.map((product) => ({
    name: product.name,
    currentInventory: product.currentInventory,
    fill: product.currentInventory < product.reorderLevel ? "rgb(204, 44, 75)" : "hsl(var(--chart-2))",
  }));

  const chartConfig = {
   
    currentInventory: {
      label: "Product Inventory",
    },
    color: "hsl(var(--chart-1))",
    icon: (props) => (
      <IoSquareSharp
        size={16}
        style={{ color: "rgb(47, 114, 235)", marginRight: "-6px", marginTop: "1px" }}
      />
    ),
  };

  return (
    <Card className="mt-10 mr-3 h-[300px] w-[400px] dark">
      <CardHeader>
        <CardTitle>Inventory Levels</CardTitle>
        <CardDescription>
          Displays the current inventory levels and highlights products with
          inventory below the reorder threshold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px]">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 4 ? `${value.substring(0, 4)}...` : value
              }
            />
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
            <Bar
              dataKey="currentInventory"
              strokeWidth={2}
              radius={[6, 6, 0, 0]}
              activeIndex={2}
            >
              <LabelList dataKey="currentInventory" position="inside" fill="black" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
