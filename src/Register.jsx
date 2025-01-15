import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {Alert} from "@nextui-org/react";
import {Tabs, Tab, Input, Button, Card, CardBody, CardHeader} from "@nextui-org/react";
import {EyeFilledIcon} from "./EyeFilledIcon";
import {EyeSlashFilledIcon} from "./EyeSlashFilledIcon";
import Typed from 'typed.js';
import Footerlogin from "./FooterLogin"
import { motion } from "framer-motion";
import {jwtDecode} from "jwt-decode"
import { GoogleLogin } from '@react-oauth/google';
////
import "./Register.css";


import Modal from './Modal'; // Import the modal component


const Register = () => {
  const navigate = useNavigate();

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


 
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  
  const [isWorking, setIsWorking] = useState(false);
  const [successMessagew, setSuccessMessagew] = useState("");
  const [selected, setSelected] = React.useState("login");
  const [isVisible, setIsVisible] = React.useState(false);
  const [isVisible2, setIsVisible2] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibility2 = () => setIsVisible2(!isVisible2);






  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    if (password !== confirmPassword) {
      setError("Passwords and Confirm Password do not match!");
      setIsLoading(false);
      return; // Stop the function execution here
    }
    try {
      // First POST request to /user/register
      const response = await fetch("https://api.globalpackagetracker.com/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          source: "Package Manager",
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 201) {
        console.log("User registered successfully:", data);
        setErrorMessage(true)
        setSuccessMessage("Registration successful!");
  
        // Second POST request to /user/authByCredentials (login)
        const loginResponse = await fetch("https://api.globalpackagetracker.com/user/authByCredentials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
  
        const loginData = await loginResponse.json();
  
        // Check if login is successful
        if (loginResponse.status === 200) {
          console.log("Login successful:", loginData);
  
          // Save the token and key to localStorage
          localStorage.setItem("token", loginData.jwt);
          localStorage.setItem("key", loginData.key);
  
          // Second POST request to /user/authByKey
          const secondResponse = await fetch("https://api.globalpackagetracker.com/user/authByKey", {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Set content-type as JSON
            },
            body: JSON.stringify({ key: loginData.key }), // Pass the key in the body
          });
  
          const secondData = await secondResponse.json();
  
          if (secondResponse.status === 200) {
            // Save the user data (name, email, capacity) to localStorage
            localStorage.setItem("user", JSON.stringify({
              name: secondData.name,
              email: secondData.email,
              capacity: secondData.capacity,
            }));
  
            // Redirect to the main page
            navigate("/");
          } else {
            console.error("authByKey failed:", secondData);
            setError("Authentication failed with the key.");
          }
        } else {
          console.error("Login failed:", loginData);
          setError("Login failed. Please check your credentials.");
        }
      } else {
        console.error("Registration failed:", data);
        setError(data.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError("An error occurred. Please try again later.");
    }finally {
      setIsLoading(false);
    }
  };


  const handleRegisterGoogle = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const email = jwtDecode(credentialResponse.credential).email;
      const password = "google_register";
      setSuccessMessagew("Registration started!")
      setIsWorking(true);
      // First POST request to /user/register
      const response = await fetch("https://api.globalpackagetracker.com/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          source: "Package Manager",
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 201) {
        console.log("User registered successfully:", data);
        setErrorMessage(true);
        setIsWorking(false);
        setSuccessMessage("Registration successful!");
  
        // Second POST request to /user/authByCredentials (login)
        const loginResponse = await fetch("https://api.globalpackagetracker.com/user/authByCredentials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
  
        const loginData = await loginResponse.json();
  
        // Check if login is successful
        if (loginResponse.status === 200) {
          console.log("Login successful:", loginData);
  
          // Save the token and key to localStorage
          localStorage.setItem("token", loginData.jwt);
          localStorage.setItem("key", loginData.key);
          setSuccessMessage("Creating Your Account...!");
          // Second POST request to /user/authByKey
          const secondResponse = await fetch("https://api.globalpackagetracker.com/user/authByKey", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: loginData.key }),
          });
  
          const secondData = await secondResponse.json();
  
          if (secondResponse.status === 200) {
            setSuccessMessage("Your account has been created, and you are being redirected to the app!");
            // Save the user data (name, email, capacity) to localStorage
            localStorage.setItem("user", JSON.stringify({
              name: secondData.name,
              email: secondData.email,
              capacity: secondData.capacity,
            }));
  
            // Redirect to the main page
            navigate("/");
          } else {
            console.error("authByKey failed:", secondData);
            setError("Authentication failed with the key.");
          }
        } else {
          console.error("Login failed:", loginData);
          setError("Login failed. Please check your credentials.");
        }
      } else {
        console.error("Registration failed:", data);
        setError(data.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
      isSuccess(false)
    }
  };




  useEffect(() => {
    setIsLoaded(true);
  }, []);


  useEffect(() => {
    const options = {
      strings: ['Packages', 'Invetory', 'Returns','Customers','Vendors','Products'],
      typeSpeed: 280,
      backSpeed: 180,
      loop: true,
    };

    const typed = new Typed('#typed', options);

    // Cleanup
    return () => {
      typed.destroy();
    };
  }, []);
  
  return (
    <div className="flex flex-col h-screen w-screen" style={{ backgroundColor: "#f4f4f5" }}>
    <div className='flex flex-grow '>
        <div className="hidden md:flex w-3/4 bg-cover bg-center">
      <div className="hidden md:flex w-4/4">



      <div className={`relative w-full isolate ml-32 pt-40 lg:px-8 ${isLoaded ? 'animate-fadeIn' : 'opacity-0'}`}>
        <div
          aria-hidden="true"
          className="absolute  inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 "
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative  left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-16 sm:py-20 lg:py-10">
        
          <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-600 sm:text-5xl custom-font">
        Manage and monitor every aspect of your <br></br> <span id="typed" className="text-blue-400"></span>.
      </h1>

      <p className="mt-6 text-base leading-8 text-gray-600 hidden xl:block">
      Track your packages live from shipping to delivery, manage products, and streamline sending and receiving across multiple hubs for your customers or vendors. Monitor when vendors or customers send returns, and easily plan for returned items. Notify vendors and customers during shipments, track inventory levels across hubs, and identify the fastest shipping methods to enhance efficiency.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              color="success"
              variant="flat"
              className="shadow-2xl border border-blue-800 text-gray-700 hover:no-underline"
              as="a"
              href="https://www.dynamopackage.com/"
              target="_blank" // optional, to open in a new tab
              rel="noopener noreferrer" // optional, for security reasons
            >
              Visit our website
            </Button>

            
            <a href="https://www.dynamopackage.com/learn" className="text-sm font-semibold leading-6 text-gray-900 hover:no-underline">
            Learn more <span aria-hidden="true">→</span>
            </a>

            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>

        
      </div>





        </div>
        </div>

        {error && 
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
        >
          <Alert 
            color="danger" 
            onClose={() => setError("")}
            className="mb-4"
          >
            {error}
          </Alert>
        </motion.div>
      }
        <div className="flex-1 pr-40 flex flex-col w-full justify-center items-center p-4 pt-40">
   
        
        {isSuccess && 
          <Alert 
            color="success" 
            onClose={() => {
              setIsSuccess(false);
              setSuccessMessage("");
            }}
            className="mb-4"
          >
            {successMessage}
          </Alert>
        }

{isWorking && 
          <Alert 
            color="secondary" 
            onClose={() => {
              setIsWorking(false);
              setSuccessMessagew("");
            }}
            className="mb-4"
          >
            {successMessagew}
          </Alert>
        }
      <Card className="max-w-full w-[340px]  rounded-lg h-[450px]" style={{border:'1px solid blue'}}>
        <CardBody className="overflow-hidden ">
          <Tabs
            fullWidth
            size="md"
            aria-label="Tabs form"
            selectedKey={selected}
            onSelectionChange={setSelected}
          
          >
            
            <Tab key="sign-up" title="Sign up"  className={`${selected=='sign-up'?'focus:outline-none':''}`} style={{ outline: 'none' }}>
              <form className="flex flex-col gap-4 h-[300px] focus:border-none ">
              <p className=" text-xs">Email</p>
            
                <Input   
                      color="secondary" 
                      isRequired  
                      name="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                    
                    }}
                    className="max-w-xs mt-0  " placeholder="Enter your email" type="email" />
                <p className=" text-xs">Password</p>
                <Input
                  
                  name="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    endContent={
                      <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                        {isVisible ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                    color="secondary"
  
                    style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                    
                    }}
                    className="max-w-xs mt-0  "
                  />
                    <p className=" text-xs">Confirm Password</p>
                <Input
                  
                  name="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter your password"
                    endContent={
                      <button className="focus:outline-none" type="button" onClick={toggleVisibility2} aria-label="toggle password visibility">
                        {isVisible2 ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    type={isVisible2 ? "text" : "password"}
                    color="secondary"
  
                    style={{
                      backgroundColor: "transparent", // No background color
                      border: "none",                 // No border
                      outline: "none",                // No outline
                      boxShadow: "none", 
                      color:'black',  
                      marginTop:'0px'
                      
                    
                    }}
                    className="max-w-xs mt-0  "
                  />
               <p className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 cursor-pointer">
                    Login
                  </Link>
                </p>

                <div className="flex gap-2 justify-end mt-2">
                  <Button fullWidth color="primary" variant='flat' type="submit"  disabled={isLoading} onClick={handleRegister} className="shadow-2xl border border-indigo-600">
                   
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      {/* <div className='flex flex-col justify-center items-center mt-2'>
       <Button size='md' radius="sm" color='warning' variant='flat' className='mb-2'>Or, you can sign up using Google.</Button> 
      <GoogleLogin
          onSuccess={handleRegisterGoogle}
          onError={() => {
            console.log('Login Failed');
          }}
          auto_select={true}
          theme="filled_blue"
        />;
        </div> */}
        </div>

      
        <div className="greenSquare"></div>
        <div className="greenSquare2"></div>
      </div>

  
      <div  style={{marginTop:'0px'}}>
      <Footerlogin/>
      </div>
  
  </div>
  );
};

export default Register;
