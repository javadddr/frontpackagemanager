import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import Spreadsheet from "react-spreadsheet";
import Customers from "./Customers"
import Vendors from "./Vendors"
import Hubs from "./Hubs"
function Locations() {
  const [data, setData] = useState([
    [
      { value: "Name" },
      { value: "Address" },
      { value: "Email" },
      { value: "Alert" },
      { value: "Contact Point" },
      { value: "Comment" },
    ],
    [
      { value: "Strawberry" },
      { value: "123 Main St" },
      { value: "strawberry@email.com" },
      { value: "None" },
      { value: "555-1234" },
    ],
    [
      { value: "Blueberry" },
      { value: "456 Oak Ave" },
      { value: "blueberry@email.com" },
      { value: "Low" },
      { value: "555-5678" },
    ],
  ]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Tabs size="lg" color="warning" aria-label="Tabs colors" radius="full">
          <Tab key="hubs" title="My hubs" />
          <Tab key="customers" title="My customers" />
          <Tab key="vendors" title="My vendors" />
        </Tabs>
      </div>
      <Spreadsheet data={data} onChange={setData} />
    </div>
  );
}

export default Locations;
