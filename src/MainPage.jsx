import React, { useState,useEffect } from "react";
import { LuPackageCheck, LuPackageX } from "react-icons/lu";
import { TbPackages } from "react-icons/tb";
import { GrMapLocation } from "react-icons/gr";
import Loading from "./Loading";
import logocompany  from "./dynamologo1.png"
import { IoMdLogOut } from "react-icons/io";
import { GrCapacity } from "react-icons/gr";
import { MdOutlineContactMail } from "react-icons/md";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { Layout, Menu, Breadcrumb, theme } from "antd";
import Ship from "./Ship";
import Locations from "./Locations";
import Customers from "./Customers"
import Vendors from "./Vendors"
import Hubs from "./Hubs"
import Inventory from "./Inventory";
import Dashboard from "./Dashboard";
import CusReturn from "./CusReturn";
import VenReturn from "./VenReturn";
import { useHubs } from "./HubsContext";
const { Header, Content, Footer, Sider } = Layout;
import TestForm from "../Tesform";



const MainPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  useEffect(() => {
  
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
  const [collapsed, setCollapsed] = useState(false);

  const [selectedKey, setSelectedKey] = useState("1");
  const { hubs, vendors,otherShipments, customers, products, backendShipments, backendShipments1, backendShipments2 } = useHubs();
  const [productStats, setProductStats] = useState({
    outgoing: {},
    incoming: {},
    remaining: {}
  });
  const menuItems = [
    { label: "Dashboard", key: "1", icon: <PieChartOutlined style={{ fontSize: "26px" }} /> },
    { label: "Shipping", key: "2", icon: <LuPackageCheck style={{ fontSize: "26px" }} /> },
   {
    label: "Returns",
    key: "3",
    icon: <LuPackageX style={{ fontSize: "26px" }} />,
    children: [
      { label: "From Customer", key: "3-1" },
      { label: "From Vendors", key: "3-2" },
    ],
  },
    { label: "Inventory", key: "4", icon: <TbPackages style={{ fontSize: "26px" }} /> },
    {
      label: "Locations",
      key: "5",
      icon: <GrMapLocation style={{ fontSize: "26px" }} />,
      children: [
        { label: "Hubs", key: "5-1" },
        { label: "Vendors", key: "5-2" },
        { label: "Customers", key: "5-3" },
      ],
    },
    { label: `Capacity: ${userData?.capacity || 0}`, key: "6" ,style: { backgroundColor: "#12A150",color:"black",fontSize:"14px",marginTop:"370px",height:"25px",textAlign:"start" }, icon: <GrCapacity style={{ fontSize: "19px",height:"30px" }} /> },
    { label: "Contact us", key: "7",style: { backgroundColor: "#09AACD",color:"black",fontSize:"14px" ,height:"25px",textAlign:"start"}, icon: <MdOutlineContactMail style={{ fontSize: "19px",height:"30px" }} /> },
    { label: "Log out", key: "8",style: { backgroundColor: "#936316",color:"black",fontSize:"14px" ,height:"25px",textAlign:"start"}, icon: <IoMdLogOut style={{ fontSize: "19px",height:"30px" }} /> },
  ];
  // Define getNameById as a standalone function
  const getNameById = (array, id) => {
    if (!id) return 'N/A';
    const item = array.find(item => item._id.toString() === id.toString());
    return item ? item.name : 'Unknown';
  };

  // Define processShipments as a standalone function
  const processShipments = (shipments, type) => {
    let stats = {};
  
    shipments.forEach(shipment => {
      const shipmentDate = shipment.createdAt ? 
        (shipment.createdAt.$date ? new Date(shipment.createdAt.$date) : new Date(shipment.createdAt)) : 
        new Date();
  
      shipment.products.forEach(product => {
        // Check if product exists in products array, fallback to 'Unknown' if not
        const productName = products.find(p => p._id?.toString() === product.id?.toString())?.name || 'Unknown';
  
        if (!stats[productName]) {
          stats[productName] = {
            quantity: [],
            hub: getNameById(hubs, shipment.hub),
            vendor: getNameById(vendors, shipment.vendor),
            customer: getNameById(customers, shipment.customer),
            createdAt: []
          };
        }
  
        // Store each shipment's details rather than overwriting
        stats[productName].quantity.push({
          quantity: product.quantity,
          date: shipmentDate.toISOString()  // Store each shipment's date
        });
        stats[productName].createdAt.push(shipmentDate.toISOString());
      });
    });
  
    // After processing all shipments, update stats to use the latest date and sum quantities
    Object.keys(stats).forEach(productName => {
      const latestEntry = stats[productName].createdAt.reduce((latest, current) => {
        return new Date(current) > new Date(latest) ? current : latest;
      }, stats[productName].createdAt[0]);
  
      stats[productName].createdAt = latestEntry;
      stats[productName].quantity = stats[productName].quantity.reduce((sum, item) => sum + item.quantity, 0);
    });
  
    return stats;
  };
  

useEffect(() => {
    if (products && hubs && vendors && customers && backendShipments && backendShipments1 && backendShipments2) {
      const allIncomingShipments = [...backendShipments1, ...backendShipments2];
      const allOutgoingShipments = backendShipments;

      // Process shipments
      const outgoing = processShipments(allOutgoingShipments, 'outgoing');
      const incoming = processShipments(allIncomingShipments, 'incoming');

      // Calculate remaining products
      const remaining = {};
      products.forEach(product => {
        const out = outgoing[product.name] ? outgoing[product.name].quantity : 0;
        const in_ = incoming[product.name] ? incoming[product.name].quantity : 0;
        const remainingQuantity = (product.quantity || 0) - out + in_;
        remaining[product.name] = {
          ...product,
          quantity: remainingQuantity
        };
      });

      setProductStats({
        outgoing,
        incoming,
        remaining
      });
    }
  }, [hubs, vendors, customers, products, backendShipments, backendShipments1, backendShipments2]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    if (key === "7") {
      // Navigate to the external contact page
      window.open("https://dynamopackage.com/contact", "_blank");
    } else if (key === "6") {
      // Handle capacity click
      const token = localStorage.getItem("token");
      const userId = userData?._id; // Assuming userData contains userId
  
      if (!token) {
        console.error("User token or ID is missing!");
        return; // Exit if no token or userId is available
      }
  
      // Construct the URL with query parameters
      const billingUrl = new URL("https://billing.dynamopackage.com");
      billingUrl.searchParams.append("token", token);
  
      // Navigate to the billing page in the same tab with parameters
      window.location.href = billingUrl.href;
    } else if (key === "8") {
      // Handle logout
      localStorage.removeItem("key");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Redirect to the login page
    } else {
      // Update selected key only for navigable menu items
      setSelectedKey(key);
    }
  };
  
  

  const fixedSiderStyle = {
    position: 'fixed',
    height: '100vh',
    overflowY: 'hidden',
    zIndex: 1000,
    left: 0,
    top: 0,
    bottom: 0,
  
  };
  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <Dashboard productStats={productStats} otherShipments={otherShipments}/>;
      case "2":
        return <Ship />;
      case "3-1":
        return <CusReturn/>;
        case "3-2":
        return <VenReturn/>;
      case "4":
        return <Inventory productStats={productStats}/>;
    
      case "5-1":
        return <Hubs />;
      case "5-2":
        return <Vendors />;
      case "5-3":
        return <Customers />;
      default:
        return <Dashboard productStats={productStats} otherShipments={otherShipments}/>;
    }
  };



  return (
    <div className='flex flex-col bg-zinc-900'>
    {isLoading ? (
  <Loading />
) : (
    <Layout theme="dark" style={{ minHeight: "100vh"}}>
    <Sider
  theme="dark"
  collapsible
  collapsed={collapsed}
  style={fixedSiderStyle}
  onCollapse={setCollapsed}
  className="shadow-2xl"
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    {/* Menu Section */}
    <div style={{ flexGrow: 1 }}>
      <div
        style={{
          height: 0,
          margin: 16,
          background: "rgba(255, 255, 255, 0.3)",
        }}
      />
      <div
      style={{
        height: collapsed ? "64px" : "70px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: collapsed ? "6px 10px" : "4px 10px",
      }}
    >
      <a
        href="https://dynamopackage.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="mb-4"
          src={logocompany}
          alt="Company Logo"
          style={{
            height: "100%",
            maxWidth: collapsed ? "90%" : "60%",
            objectFit: "contain",
            transition: "all 0.3s",
            marginLeft: collapsed ? "0" : "40px",
          }}
        />
      </a>
    </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
        style={{ fontFamily: "Arial, sans-serif", fontSize: "17px" }}
      />
    </div>

   {/* <div style={{position:"fixed",bottom:"100px"}}>
    javad
   </div> */}
    
  </div>
</Sider>
      <Layout>
        <Content  style={{ margin: "0 0px",paddingTop:"0px" }} >
          
          <div
            style={{
              padding: 0,
              minHeight: "90vh",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
         
              marginLeft:`${collapsed?"80px":"200px"}`
            }}
          >
            {renderContent()}
          </div>
        </Content>
        <Footer className="bg-zinc-900 ml-[10%] text-white" style={{ textAlign: "center",  marginLeft:`${collapsed?"80px":"200px"}` }}>
          Dynamo Package ©{new Date().getFullYear()} Created by DyamoChart
       
        </Footer>
      </Layout>
    </Layout>
     )}
     </div>
  );
};

export default MainPage;
