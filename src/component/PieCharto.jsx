
import React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie,Legend, PieChart } from "recharts";
import { useHubs } from "../HubsContext";
import { IoSquareSharp } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

function PieCharto() {
  const { shipments } = useHubs();

  // Count shipments by delivery status
  const chartData = React.useMemo(() => {
    const statusCount = shipments.reduce((acc, shipment) => {
      const status = shipment.delivery_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return [
      { status: "Transit", "Number of shipments": statusCount["Transit"] || 0, fill: "hsl(217, 94%, 65%)" },
      { status: "Delivered", "Number of shipments": statusCount["Delivered"] || 0, fill: "hsl(var(--chart-2))" },
      { status: "Exception", "Number of shipments": statusCount["Exception"] || 0, fill: "var(--color-exception)" },
      { status: "Pending", "Number of shipments": statusCount["Pending"] || 0, fill: "var(--color-pending)" },
      { status: "Created", "Number of shipments": statusCount["Created"] || 0, fill: "var(--color-created)" },
    ];
  }, [shipments]);

  // Update chartConfig to match new data structure
  const chartConfig = {
    "Number of shipments": {
      label: "Number of Shipments",
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
  // Calculate total shipments for display in the center
  const totalShipments = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr["Number of shipments"], 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col dark ">
      <CardHeader className="items-center pb-2">
        <CardTitle>Delivery Status </CardTitle>
        <CardDescription>Showing Shipments by Status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0  ">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[297px] w-full"
        >
       
          <PieChart>
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
                    <IconComponent size={10} style={{ color: color }} /> // Here's where we color the icon
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

            <Pie
              data={chartData}
              dataKey="Number of shipments"
              nameKey="status"
              innerRadius={50}
              strokeWidth={5}
              cornerRadius={5}
              outerRadius={100}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                if (percent === 0) return null;
                const RADIAN = Math.PI / 180;
                // Calculate the position for the label
                const radius = innerRadius + (outerRadius - innerRadius) / 2;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
            
                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              
            >

              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalShipments.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Shipments
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                payload={chartData.map((entry, index) => ({
                  id: entry.status,
                  type: "circle",
                  value: entry.status,
                  color: entry.fill
                }))}
             
              />
          </PieChart>
        
        </ChartContainer>
      </CardContent>
  
    </Card>
  );
}

export default PieCharto;