"use client"

import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { useHubs } from "../HubsContext";

const chartConfig = {
  inventory: {
    label: "Inventory",
    color: "hsl(var(--chart-1))",
  },
};

function ProductChart({ productStats }) {
  const { products } = useHubs();
  const [productInfo, setProductInfo] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!productStats || !products) return;

    const combineInfo = () => {
      const info = Object.entries(productStats.remaining).map(([productName, details]) => {
        const matchingProduct = products.find(p => p.name === productName);
        const incoming = productStats.incoming[productName] || [];
        const outgoing = productStats.outgoing[productName] || [];

        // Convert to array if it's not already one
        const incomingData = Array.isArray(incoming) ? incoming : [incoming];
        const outgoingData = Array.isArray(outgoing) ? outgoing : [outgoing];

        // Filter out any falsy values
        const filteredIncoming = incomingData.filter(Boolean);
        const filteredOutgoing = outgoingData.filter(Boolean);

        return {
          name: productName,
          hub: details.hub,
          startDate: details.startDate,
          currentQuantity: details.quantity,
          initialQuantity: matchingProduct ? matchingProduct.quantity : 'N/A',
          incoming: filteredIncoming,
          outgoing: filteredOutgoing
        };
      });

      setProductInfo(info);
      prepareChartData(info);
    };

    const prepareChartData = (info) => {
      let dataPoints = [];
      const allDates = new Set();

      // Collect all unique dates
      info.forEach(product => {
        const start = new Date(product.startDate);
        allDates.add(start.toISOString().split('T')[0]);
        
        product.incoming.forEach(item => allDates.add(new Date(item.createdAt).toISOString().split('T')[0]));
        product.outgoing.forEach(item => allDates.add(new Date(item.createdAt).toISOString().split('T')[0]));
      });

      // Sort dates
      const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

      // Add current date if not already in the list
      const nowDate = new Date().toISOString().split('T')[0];
      if (!sortedDates.includes(nowDate)) {
        sortedDates.push(nowDate);
      }

      // Create data points for each date
      sortedDates.forEach((date, index) => {
        const point = { date };
        info.forEach(product => {
          point[product.name] = calculateQuantityForDate(product, date, index === sortedDates.length - 1);
        });
        dataPoints.push(point);
      });

      setChartData(dataPoints);
    };

    const calculateQuantityForDate = (product, date, isLastDate) => {
      let quantity = product.initialQuantity;
      let currentDate = new Date(product.startDate);

      product.incoming.forEach(item => {
        if (new Date(item.createdAt).toISOString().split('T')[0] <= date) {
          quantity += item.quantity;
          currentDate = new Date(item.createdAt);
        }
      });

      product.outgoing.forEach(item => {
        if (new Date(item.createdAt).toISOString().split('T')[0] <= date) {
          quantity -= item.quantity;
          currentDate = new Date(item.createdAt);
        }
      });

      // If it's the last date, ensure we're showing the current quantity
      if (isLastDate) {
        quantity = product.currentQuantity;
      }

      return quantity;
    };

    combineInfo();
  }, [productStats, products]);

  return (
    <Card className="dark" >
      <CardHeader>
        <CardTitle>Inventory Level Chart</CardTitle>
        <CardDescription>
          Showing inventory changes over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer  className="aspect-auto h-[220px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 15,
              right: 15,
            }}
          >
           
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  indicator="line"
                />
              }
            />
            {productInfo.map((product, index) => (
              <Area 
                key={product.name}
                dataKey={product.name}
                type="natural"
                fill={`hsl(var(--chart-${index + 1}))`}
                fillOpacity={0.4}
                stroke={`hsl(var(--chart-${index + 1}))`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Inventory changes reflected in real-time <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              From {new Date(productInfo[0]?.startDate).toLocaleDateString()} to Today
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProductChart;