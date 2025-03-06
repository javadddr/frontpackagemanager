// Nav.jsx
import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { SunIcon } from "./SunIcon";
import { MoonIcon } from "./MoonIcon";
import logocompany from "./dynamologo1.png"; // Adjust the path as needed

const Nav = ({ userData,handleThemeSwitch,setIsDark,isDark }) => {
  

  const handleDropdownAction = (key) => {
    if (key === "team_settings") {
      // Navigate to the external contact page (like key "7")
      window.open("https://dynamopackage.com/contact", "_blank");
    } else if (key === "settings") {
      // Handle capacity click (like key "6")
      const token = localStorage.getItem("token");
      const userId = userData?._id; // Assuming userData contains userId

      if (!token) {
        console.error("User token or ID is missing!");
        return;
      }

      const billingUrl = new URL(window.location.origin + "/billing");
      billingUrl.searchParams.append("token", token);
      window.location.href = billingUrl.href;
    } else if (key === "logout") {
      // Handle logout (like key "8")
      localStorage.removeItem("key");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <Navbar
      isBordered
      maxWidth="full"
      height="30px"
      className={`${isDark ? "bg-zinc-900" : "bg-white"} pt-3 pb-1 text-white ${isDark ? "dark" : ""}`}
    >
      {/* Brand */}
     

      {/* Center Content (if needed, can be empty for now) */}
      <NavbarContent justify="center">
        <NavbarItem>{/* Add more items here if needed */}</NavbarItem>
      </NavbarContent>

      {/* Right Side: Theme Switch and User Dropdown */}
      <NavbarContent justify="end">
        {/* Dark/Light Mode Switch */}
        <NavbarItem>
          <Switch
            isSelected={isDark}
            onValueChange={handleThemeSwitch}
            size="sm"
            color="success"
            startContent={<SunIcon />}
            endContent={<MoonIcon />}
          />
        </NavbarItem>

        {/* User Account Dropdown */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
   
<DropdownTrigger>
  <Avatar
    isBordered
    as="button"
    className="w-5 h-5 text-tiny transition-transform"
    color="secondary"
    name={userData?.email?.charAt(0).toUpperCase() || "U"} // Optional placeholder with initial
  />
</DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              variant="flat"
              className={`${isDark ? "" : "text-gray-900"}`}
              onAction={handleDropdownAction} // Add the action handler here
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{userData.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">Purchase More Capacity</DropdownItem>
              <DropdownItem key="team_settings">Contact Us</DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default Nav;