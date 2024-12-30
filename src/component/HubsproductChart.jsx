import React, { useState, useEffect } from 'react';
import { useHubs } from '../HubsContext';
import { Card, CardHeader, CardBody, Divider, Accordion, AccordionItem } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HubShipments = () => {
  const { hubs } = useHubs();
  const [stockHubs, setStockHubs] = useState([]);

  useEffect(() => {
    const stockInfo = hubs.map(hub => ({
      name: hub.name,
      products: hub.products.map(product => ({
        name: product.name,
        value: product.value,
        unitprice: product.unitprice,
        stockindate: product.stockindate
      }))
    }));
    setStockHubs(stockInfo);
  }, [hubs]);

  // Animation for the entire box 
  const boxVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Prepare data for the chart
  const chartData = {
    labels: stockHubs.flatMap(hub => hub.products.map(p => `${hub.name} - ${p.name}`)),
    datasets: [
      {
        label: 'Product Value',
        data: stockHubs.flatMap(hub => hub.products.map(p => p.value)),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg shadow-lg p-6 text-gray-100 m-4"
      variants={boxVariants}
      initial="hidden"
      animate="visible"
    >
      <Card variant="bordered" className='dark'>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center w-full">All Hubs Overview</h2>
        </CardHeader>
        <CardBody>
          <div className="mb-6">
            <h3 className="text-lg mb-2">Product Value Across All Hubs:</h3>
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Product Values by Hub'
                  }
                }
              }}
            />
          </div>

          <Divider className="my-4" />

          <h3 className="text-lg mb-2">Detailed Product Information:</h3>
          <Accordion>
            {stockHubs.map((hub, hubIndex) => (
              <AccordionItem key={hubIndex} title={hub.name}>
                <ul className="list-disc pl-5">
                  {hub.products.map((product, productIndex) => (
                    <li key={productIndex}>
                      <strong>{product.name}</strong> - Value: {product.value}, Unit Price: ${product.unitprice.toFixed(2)}, Stocked In: {new Date(product.stockindate).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            ))}
          </Accordion>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default HubShipments;