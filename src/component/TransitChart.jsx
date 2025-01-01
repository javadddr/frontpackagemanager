import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { useHubs } from "../HubsContext";
import { Button} from "@nextui-org/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { IoSquareSharp } from "react-icons/io5";


const chartConfig = {
  TRANSIT_TIME: {
    label: "Transit Time",
    color: "hsl(var(--chart-1))",
    icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)',marginRight:"-6px",marginTop:"1px"  }} />,
  },
};


export default function TransitChart() {
  const [timeRange, setTimeRange] = useState("90d");
  const { shipments, backendShipments,hubs,vendors,products, backendShipments1, backendShipments2 } = useHubs();

  const [chartData, setChartData] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("all");
const [courierOptions, setCourierOptions] = useState(["all"]);
const [selectedHub, setSelectedHub] = useState("all");
const [hubOptions, setHubOptions] = useState(["all"]);
const [totalAverageTransitTime, setTotalAverageTransitTime] = useState(0);

console.log("hubOptions",hubOptions)
useEffect(() => {
  const allBackendShipments = [...backendShipments, ...backendShipments1, ...backendShipments2];
  
  const newShipments = shipments.map(shipment => {
    const matchingBackend = allBackendShipments.find(backendShipment => 
      backendShipment.tracking_numbers.some(tn => 
        tn.trackingNumber === shipment.tracking_number
      )
    );

    if (matchingBackend) {
      const hubName = hubs.find(h => h._id === matchingBackend.hub)?.name || "Unknown Hub";
      const vendorName = vendors.find(v => v._id === matchingBackend.vendor)?.name || "Unknown Vendor";

      return {
        ...shipment,
        hubName: hubName,
        vendorName: vendorName,
        products: matchingBackend.products.map(p => ({
          ...p,
          productName: products.find(product => product._id === p.id)?.name || "Unknown Product"
        }))
      };
    }
    return shipment;
  });



  // Gather unique courier codes and hub names
  const uniqueCouriers = Array.from(new Set(newShipments.map(s => s.courier_code)));
  const uniqueHubs = Array.from(new Set(newShipments.map(s => s.hubName)));
  setCourierOptions(["all", ...uniqueCouriers]);
  setHubOptions(["all", ...uniqueHubs]);

  // Filter by courier and hub if specific values are selected
  const filteredByCourierAndHub = newShipments.filter(s => 
    (selectedCourier === "all" || s.courier_code === selectedCourier) &&
    (selectedHub === "all" || s.hubName === selectedHub)
  );

  // Process data for chart using the filtered shipments
  const dataByDate = filteredByCourierAndHub.reduce((acc, shipment) => {
    const date = new Date(shipment.shipping_date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, transitTimes: [] };
    }
    acc[date].transitTimes.push(shipment.transit_time);
    return acc;
  }, {});

  const chartData = Object.values(dataByDate)
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(({ date, transitTimes }) => {
    const avgTransitTime = transitTimes.length > 0 
      ? transitTimes.reduce((sum, time) => sum + time, 0) / transitTimes.length 
      : 0;

    return {
      date: date,
      "TRANSIT_TIME": avgTransitTime
    };
  });

// Calculate total average transit time
let totalAvgTime = 0;
let totalCount = 0;

chartData.forEach(item => {
  if (!isNaN(item.TRANSIT_TIME) && item.TRANSIT_TIME > 0) { // Check if the transit time is a valid number
    totalAvgTime += item.TRANSIT_TIME;
    totalCount++;
  }
});

const totalAverageTransitTime = totalCount > 0 ? Number((totalAvgTime / totalCount).toFixed(1)) : 0;

setChartData(chartData);
setTotalAverageTransitTime(totalAverageTransitTime); // Assuming you've added this state in your component
}, [shipments, backendShipments, backendShipments1, backendShipments2, hubs, vendors, products, selectedCourier, selectedHub]);
const referenceDate = new Date(); // Use current date as reference for filtering
const filteredData = chartData.filter((item) => {
  const date = new Date(item.date);
  let daysToSubtract = 90;
  if (timeRange === "30d") {
    daysToSubtract = 30;
  } else if (timeRange === "7d") {
    daysToSubtract = 7;
  }
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);
  return date >= startDate;
});

  return (
    <Card className="dark">
   <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
  <div className="grid flex-1 gap-1 text-center sm:text-left">
    <CardTitle>Transit Time (Days)</CardTitle>
    <CardDescription>
      Displaying the transit times of different carriers, organized by hubs.
    </CardDescription>
  </div>
  <div className="space-x-2 flex">  
  <div className="flex gap-4 items-center">
      <Button 
        color="warning" 
        variant="flat" 
        style={{ width: '200px',height:'35px' }} // Using inline style for width
      >
        Average Transit Time: {totalAverageTransitTime}
      </Button>
    </div>
    <Select value={timeRange} onValueChange={setTimeRange}>
      <SelectTrigger
        className="w-[140px] rounded-lg"
        aria-label="Select time range"
      >
        <SelectValue placeholder="Last 3 months" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="90d" className="rounded-lg">
          Last 3 months
        </SelectItem>
        <SelectItem value="30d" className="rounded-lg">
          Last 30 days
        </SelectItem>
        <SelectItem value="7d" className="rounded-lg">
          Last 7 days
        </SelectItem>
      </SelectContent>
    </Select>
    <Select value={selectedCourier} onValueChange={setSelectedCourier}>
      <SelectTrigger
        className="w-[140px] rounded-lg"
        aria-label="Select courier"
      >
        <SelectValue placeholder="All Couriers" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {courierOptions.map(courier => (
          <SelectItem key={courier} value={courier} className="rounded-lg">
            {courier === "all" ? "All Couriers" : courier}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={selectedHub} onValueChange={setSelectedHub}>
      <SelectTrigger
        className="w-[140px] rounded-lg"
        aria-label="Select hub"
      >
        <SelectValue placeholder="All Hubs" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
  {hubOptions.map((hub, index) => (
    <SelectItem 
      key={`${hub || 'null'}-${index}`} 
      value={hub || 'unknown'} 
      className="rounded-lg"
    >
      {hub === "all" ? "All Hubs" : hub || "Unknown Hub"}
    </SelectItem>
  ))}
</SelectContent>

    </Select>
  </div>
</CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full pt-10"
        >
          <AreaChart 
            data={filteredData} 
            margin={{ top: 5, right: 40, left: 40, bottom: 5 }} // Adjust these values for padding
          >
       
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
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
      
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="TRANSIT_TIME"
              type="natural"
              stroke={chartConfig.TRANSIT_TIME.color}
              fill={chartConfig.TRANSIT_TIME.color}
              fillOpacity={0.3}
            >
              <LabelList 
                dataKey="TRANSIT_TIME" 
                position="top" 
                content={(props) => {
                  const { x, y, value } = props;
                  return (
                    <text 
                      x={x} 
                      y={y - 10} 
                      fill={chartConfig.TRANSIT_TIME.color} 
                      textAnchor="middle" 
                      fontSize={10}
                    >
                      {value.toFixed(1)}
                    </text>
                  );
                }} 
              />
            </Area>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
