import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../src/component/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../src/component/ui/tooltip";
import { Info } from 'react-feather'; // Assuming you're using react-feather for icons, adjust accordingly
import { useHubs } from "./HubsContext";
import Loading from './Loading';
import Combain from './Combain';
import moment from 'moment'; 
import ForthSmal from './ForthSmal';
import { IoSquareSharp } from "react-icons/io5";
import Calendari2 from './component/Calenderi2';
import { ChartContainer,ChartTooltip, ChartTooltipContent } from "./component/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import PieCharto from './component/PieCharto';
import { BarChart, Bar } from "recharts";
import TwoBar from './component/TwoBar';
import TransitChart from './component/TransitChart';
import ProChart from "./ProChart";
import ProChange from "./ProChange";
import ProHub from "./ProHub";
import Seconsmall from './Seconsmall';
import Thirdsmall from './Thirdsmall';
function Dashboard({productStats,otherShipments}) {

 
  const { shipments,io, backendShipments, backendShipments1,totalReturn,fetchShipments,shipped,returnedCus,returnVen, backendShipments2,fetchAllBack } = useHubs();
  const [returnCounti, setReturnCounti] = useState(0);

  const [shipCounti, setShipCounti] = useState(0);
  const [chartData20, setChartData20] = useState([]);
  const [chartConfig20, setchartConfig20] = useState({});
  useEffect(() => {
    const now = moment();
    const startOfWeek = now.clone().startOf('isoWeek');
    const endOfWeek = now.clone().endOf('isoWeek');

    let newReturnCount = 0;
    let newShipCount = 0;

    // Count returns within the current week
    if (Array.isArray(totalReturn)) {
      totalReturn.forEach(shipment => {
        // Pick the first valid date: shipping_date or createdAtv2
        const dateToUse = shipment.shipping_date && moment(shipment.shipping_date).isValid() 
          ? shipment.shipping_date 
          : (shipment.createdAtv2 && moment(shipment.createdAtv2).isValid() 
            ? shipment.createdAtv2 
            : null);
        
        // Only count if we have a valid date
        if (dateToUse) {
          const shipmentDate = moment(dateToUse);
          if (shipmentDate.isBetween(startOfWeek, endOfWeek, null, '[]')) {
            newReturnCount++;
          }
        }
      });
    }

    if (Array.isArray(otherShipments)) {
      otherShipments.forEach(shipment => {
        const dateToUse = shipment.shipping_date && moment(shipment.shipping_date).isValid() 
          ? shipment.shipping_date 
          : shipment.createdAtv2;
        
        const shipmentDate = moment(dateToUse);
        if (shipmentDate.isBetween(startOfWeek, endOfWeek, null, '[]')) {
          newShipCount++;
        }
      });
    }
    setChartData20([
      { name: 'Return', count: newReturnCount, fill: "hsl(var(--chart-1))" },
      { name: 'Shipped', count: newShipCount, fill: "hsl(var(--chart-2))" },
    ]);
    setchartConfig20({
      Return: {
        label: "Return",
        color: "var(--chart-1)",
              icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)', marginRight: "-6px", marginTop: "1px" }} />,
      },
      Shipped: {
        label: "Shipped",
        color: "var(--chart-2)",
      }
    });
    // Update states
    setReturnCounti(newReturnCount);
    setShipCounti(newShipCount);
  }, [backendShipments]); 
// Use returnCounti and shipCounti as needed

  const [shippedShipments, setShippedShipments] = useState([]);
  const [customerReceivedShipments, setCustomerReceivedShipments] = useState([]);
  const [vendorReceivedShipments, setVendorReceivedShipments] = useState([]);
  const [unknownShipments, setUnknownShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyShipments, setWeeklyShipments] = useState([]);
  const [weeklyShipments1, setWeeklyShipments1] = useState([]);
  const [unShipments, setUnShipments] = useState([]);
  const [cuRetur, setCuRetur] = useState([]);
  const [venRetur, setVenRetur] = useState([]);
  const [chartDatashipped, setChartDatashipped] = useState([]);
  const [chartDatashipped1, setChartDatashipped1] = useState([]);

  const [forceRender, setForceRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (shipments && backendShipments && backendShipments1 && backendShipments2) {
      setLoading(true);
      
      // Function to categorize shipments
      const categorizeShipments = (shipmentList, checkAgainst) => {
        return shipmentList.filter(shipment => {
          const trackingNumber = shipment.tracking_number;
          return checkAgainst.some(backendShip => 
            backendShip.tracking_numbers.some(trackObj => trackObj.trackingNumber === trackingNumber)
          );
        });
      };
  
      const remainingShipments = [...shipments];
  
      // Shipped Shipments
      const shipped = categorizeShipments(remainingShipments, backendShipments);
      setShippedShipments(shipped);
      remainingShipments.filterInPlace(ship => !shipped.includes(ship));
  
      // Customer Received Shipments
      const customerReceived = categorizeShipments(remainingShipments, backendShipments1);
      setCustomerReceivedShipments(customerReceived);
      remainingShipments.filterInPlace(ship => !customerReceived.includes(ship));
  
      // Vendor Received Shipments
      const vendorReceived = categorizeShipments(remainingShipments, backendShipments2);
      setVendorReceivedShipments(vendorReceived);
      setUnknownShipments(remainingShipments.filter(ship => 
        !shipmentBelongsToAny(ship, [backendShipments, backendShipments1, backendShipments2])
      ));
      const totalShipments = [...shippedShipments, ...remainingShipments.filter(ship => 
        !shipmentBelongsToAny(ship, [backendShipments, backendShipments1, backendShipments2])
      )];
      const totalShipments1 = [...returnedCus, ...returnVen];
      // Calculate weekly shipments after all categorizations are done
      const calculateWeeklyShipments = (shipments) => {
        const weeklyData = [];
        const now = moment();
      
        // Create an array of unique dates
        const dates = shipments
        .map(shipment => {
          const dateToUse = shipment.shipping_date && moment(shipment.shipping_date).isValid() 
            ? shipment.shipping_date 
            : shipment.createdAtv2;
          return moment(dateToUse).startOf('day').toISOString();
        })
        .filter(Boolean); // Still ensures no invalid dates slip through
        // Group dates by week
        const datesByWeek = dates.reduce((acc, date) => {
          const week = moment(date).isoWeek();
          acc[week] = (acc[week] || 0) + 1;
          return acc;
        }, {});
      
        // Fill the last 8 weeks
        for (let i = 0; i < 8; i++) {
          const weekNumber = now.clone().subtract(i, 'weeks').isoWeek();
          weeklyData.push({ week: `Week ${weekNumber}`, count: datesByWeek[weekNumber] || 0 });
        }
      
        return weeklyData;
      };
      const weeklyShipments = calculateWeeklyShipments(shipments);
      const unShipments = calculateWeeklyShipments(totalReturn);
     
     
      const calculateWeeklyShipmentsFromBackend = (backendShipments) => {
        const weeklyData1 = [];
        const now = moment();
        
        // Flatten all tracking numbers from backendShipments
        const allTrackingNumbers = backendShipments.flatMap(shipment => 
          shipment.tracking_numbers.map(track => track.trackingNumber)
        );
      
        // Match tracking numbers with shipment data to get shipping dates
        const shippingDates = allTrackingNumbers.map(trackingNumber => {
          const matchingShipment = shipments.find(ship => ship.tracking_number === trackingNumber);
          if (!matchingShipment) return null;
          
          const dateToUse = matchingShipment.shipping_date && moment(matchingShipment.shipping_date).isValid() 
            ? matchingShipment.shipping_date 
            : matchingShipment.createdAtv2;
          
          return moment(dateToUse).startOf('day').toISOString();
        }).filter(Boolean); // Filter out any null values
        // Group dates by week
        const datesByWeek = shippingDates.reduce((acc, date) => {
          const week = moment(date).isoWeek();
          acc[week] = (acc[week] || 0) + 1;
          return acc;
        }, {});
      
        // Fill the last 8 weeks
        for (let i = 0; i < 8; i++) {
          const weekNumber = now.clone().subtract(i, 'weeks').isoWeek();
          weeklyData1.push({ week: `Week ${weekNumber}`, count: datesByWeek[weekNumber] || 0 });
        }
      
        return weeklyData1;
      };
      
      const groupShipmentsByDateAndStatus = (shipments) => {
        const aggregatedData = {};
  
        shipments.forEach((shipment) => {
          // Use shipping_date if valid, otherwise fall back to createdAtv2
          const dateToUse = shipment.shipping_date && moment(shipment.shipping_date).isValid() 
            ? shipment.shipping_date 
            : shipment.createdAtv2;
          
          const shippingDate = moment(dateToUse).format('YYYY-MM-DD'); // Format the date
        
          // Initialize the date entry if not already initialized
          if (!aggregatedData[shippingDate]) {
            aggregatedData[shippingDate] = {
              Transit: 0,
              Delivered: 0,
              Exception: 0,
              Pending: 0,
              Created: 0,
            };
          }
        
  
          // Increment the count based on the shipment's delivery status
          switch (shipment.delivery_status) {
            case 'Transit':
              aggregatedData[shippingDate].Transit += 1;
              break;
            case 'Delivered':
              aggregatedData[shippingDate].Delivered += 1;
              break;
            case 'Exception':
              aggregatedData[shippingDate].Exception += 1;
              break;
            case 'Pending':
              aggregatedData[shippingDate].Pending += 1;
              break;
            case 'Created':
              aggregatedData[shippingDate].Created += 1;
              break;
            default:
              break;
          }
        });
  
        // Convert aggregated data into an array format for charting
        const chartData = Object.keys(aggregatedData).map((date) => ({
          date,
          ...aggregatedData[date],
        }));
  
        return chartData;
      };
  
      // Now group the totalShipments by date and status
     
      setWeeklyShipments(weeklyShipments);
      setUnShipments(unShipments)
      const weeklyShipped = calculateWeeklyShipmentsFromBackend(backendShipments);
      setWeeklyShipments1(weeklyShipped);
      const cuReturShipped = calculateWeeklyShipmentsFromBackend(backendShipments1);
      setCuRetur(cuReturShipped)
      const venReturShipped = calculateWeeklyShipmentsFromBackend(backendShipments2);
      setVenRetur(venReturShipped)
      setLoading(false);
      setForceRender(prev => !prev);
   
    }
 
  }, [shipments, backendShipments, backendShipments1, backendShipments2]);
  // const chartData20 = [
  //   { name: 'Return', count: returnCounti, fill: "hsl(var(--chart-1))" },
  //   { name: 'Shipped', count: shipCounti, fill: "hsl(var(--chart-2))" },
  // ];
  // const chartConfig20 = {
  //   Return: {
  //     label: "Return",
  //     color: "var(--chart-1)",
  //           icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)', marginRight: "-6px", marginTop: "1px" }} />,
  //   },
  //   Shipped: {
  //     label: "Shipped",
  //     color: "var(--chart-2)",
  //   }
  // };

  useEffect(() => {
    fetchAllBack()
    setTimeout(() => setIsLoading(false), 500);
  }, [shipments]);
  
  useEffect(() => {
    if (shipments  && otherShipments) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [shipments, otherShipments]);

  const shipmentBelongsToAny = (shipment, backendLists) => {
    const trackingNumber = shipment.tracking_number;
    return backendLists.some(list => 
      list.some(backendShip => 
        backendShip.tracking_numbers.some(trackObj => trackObj.trackingNumber === trackingNumber)
      )
    );
  };

  // Helper function to filter in place for arrays
  Array.prototype.filterInPlace = function(func) {
    let i = 0, n = this.length;
    while (i < n) {
      if (!func(this[i], i, this)) {
        this.splice(i, 1);
        n--;
      } else {
        i++;
      }
    }
    return this;
  };

  // Show loading component while data is being processed
  if (loading) {
    return <Loading />;
  }

 
  const chartData = weeklyShipments.filter(item => item.count > 0);
  const chartData1 = weeklyShipments1.filter(item => item.count > 0);
  const chartData2 = unShipments.filter(item => item.count > 0);
 
  function countUnmatchedShipments(shipments, backendShipments1, backendShipments2) {
    if (!Array.isArray(shipments)) {
      throw new Error('shipments must be an array');
    }
  
    let allTrackingNumbers = new Set();
  
    // Process backendShipments1 if it's an array
    if (Array.isArray(backendShipments1)) {
      const trackingNumbers1 = backendShipments1.flatMap(ship => 
        ship.tracking_numbers ? ship.tracking_numbers.map(t => t.trackingNumber) : []
      );
      allTrackingNumbers = new Set([...allTrackingNumbers, ...trackingNumbers1]);
    }
  
    // Process backendShipments2 if it's an array
    if (Array.isArray(backendShipments2)) {
      const trackingNumbers2 = backendShipments2.flatMap(ship => 
        ship.tracking_numbers ? ship.tracking_numbers.map(t => t.trackingNumber) : []
      );
      allTrackingNumbers = new Set([...allTrackingNumbers, ...trackingNumbers2]);
    }
  
    // Count shipments that are not in allTrackingNumbers
    const unmatchedCount = shipments.filter(shipment => 
      !allTrackingNumbers.has(shipment.tracking_number)
    ).length;
  
    return unmatchedCount;
  }
  const chartData3 = cuRetur.filter(item => item.count > 0);
  const chartData4 = venRetur.filter(item => item.count > 0);
  const chartConfig = {
    count: {
      label: "Shipments",
      color: "hsl(var(--chart-1))",
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)',marginRight:"-6px",marginTop:"1px"  }} />,
    },
    week: {
      label: "Week",  // Label for the X-axis
      color: "hsl(var(--chart-2))",  // You can define another color if needed
    }
  };
  const chartConfig2 = {
    customerReturns: {
      label: "Customer Returns",
      color: "hsl(var(--chart-1))", 
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(47, 114, 235)',marginRight:"-6px",marginTop:"1px"  }} />,
    },
    vendorReturns: {
      label: "Vendor Returns",
      color: "hsl(var(--chart-2))", 
      icon: (props) => <IoSquareSharp size={16} style={{ color: 'rgb(135,82,250)',marginRight:"-6px",marginTop:"1px"  }} />,
    }
  };
  const mergeData = (data1, data2) => {
    const allWeeks = new Set([...data1.map(d => d.week), ...data2.map(d => d.week)]);
    return Array.from(allWeeks).map(week => {
      const item1 = data1.find(d => d.week === week) || { week, count: 0 };
      const item2 = data2.find(d => d.week === week) || { week, count: 0 };
      return {
        week,
        customerReturns: item1.count,
        vendorReturns: item2.count
      };
    }).sort((a, b) => parseInt(b.week.split(' ')[1]) - parseInt(a.week.split(' ')[1])); // Sort by week in descending order
  };


  return (
    <div className='flex flex-col bg-zinc-900'>
    {isLoading ? (
  <Loading />
) : (
    <div className='flex flex-col bg-zinc-900'>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="dark">
    <CardHeader>
      <CardTitle>
        <div className='flex justify-between'>
          <div>
            <span>Total Shipments </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={17} className="inline ml-0 text-gray-100 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shows the total number of shipments logged in the system.</p>
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>
            </div>
          
            <span className='text-4xl -mt-3 text-lime-600'>{shipments.length}</span> 
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex p-0 flex-col items-center">
          <div className="w-[200px] p-0 ">
            <ChartContainer className="h-[100px]" config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={chartData} 
                margin={{
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top:0 // Adjust this as needed
                }}
              >
            <XAxis
    dataKey="week"
    tickLine={false}
    axisLine={false}
    tickMargin={8}
    tickFormatter={(value) => value.slice(4)}
    reversed
    label={{  position: 'insideBottom', dy: 10 }}
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
          
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]} // Optional: to round the top of the bars
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>

    <Seconsmall/>

    <Thirdsmall/>

    <ForthSmal/>
      </div>
      <Calendari2 otherShipments2={otherShipments} shipments={shipments} returnedCus={returnedCus} returnVen={returnVen}/>
      <div>
          <div className='flex w-[98%]  ml-4 '>
            <div className='w-[30%] '>
            <PieCharto/>
            </div>
            <div className='w-[70%] ml-4'>
            <TwoBar chartDatashipped={chartDatashipped}  chartDataReturn={chartDatashipped1}/>
            </div>
            </div>
      </div>
      <div className=' w-[98%] ml-4 mt-4'>
        <TransitChart/>
      </div>

      <div className="flex justify-center  w-[98%]  ml-4 mt-4">
<ProChart/>
<ProChange/>
<ProHub/>
</div>
      {/* <Thirdsmall/> */}
   
    </div>
      )}

      </div>
  );
}

export default Dashboard;