import React, { useState ,useEffect} from "react";
import {
  CardFooter,
  Image,
  Card,
  CardBody
} from "@nextui-org/react";
import { motion } from "framer-motion";
import logo from "../emp.jpeg"
import { useHubs } from "../HubsContext";
import Loading from '../Loading';
import { CgUnavailable } from "react-icons/cg";
function Hproduct({ hubid, hub }) {
  const { products, fetchProducts,setProducts } = useHubs();
  const [isLoading, setIsLoading] = useState(true);
  const [hubsProduct, setHubsProduct] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Effect to filter products when products or hub change
  useEffect(() => {
    if (hub && hub.name && products) {
      const filteredProducts = products.filter(product => product.hub === hub.name);
      setHubsProduct(filteredProducts);
    }
  }, [hub, products]);

  if (!hub) {
    return <div>Loading or hub not found...</div>;
  }
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  
  return (
    <div >
    {isLoading ? (
      <div className="h-[10vh] ">
  <Loading  />
  </div>
) : (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          {hubsProduct.length > 0 ? (
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-4 p-3">
              {hubsProduct.map((product, index) => (
                <Card shadow="sm" key={product._id.$oid} isPressable onPress={() => console.log("product pressed")}>
                  <CardBody className="overflow-visible p-0">
                    {/* Assume you have logic to handle product images */}
                    {product.image ? (
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={product.name} 
              className="w-full object-cover h-[140px]"
              src={`${backendUrl}/${product.image}`}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-[140px]">
              <CgUnavailable size={100} className="text-gray-500" />
            </div>
          )}
                  </CardBody>
                  <CardFooter className="text-small justify-between">
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between">
                      <b>{product.name}</b>
                    <p className="text-default-500">${product.unitprice || 0}</p>
                      </div>
                      <div className="flex justify-between">
                      <b>Current Inventory</b>
                    <p className="text-default-500">{product.currentInventory || 0}</p>
                      </div>
                    </div>
                   
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full ">
            <img src={logo} alt="No products available" className="mb-4 mt-[7%] rounded-full w-60 h-60 object-cover" />
            <p className="text-center text-lg text-gray-500">No products found. Why not start by adding your first one?</p>
          </div>
          )}
        </div>
      </div>
    </motion.div>
      )}
      </div>
  );
}

export default Hproduct;