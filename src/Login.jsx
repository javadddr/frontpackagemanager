import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {Tabs, Tab, Input, Button, Card, CardBody, CardHeader} from "@nextui-org/react";
import {EyeFilledIcon} from "./EyeFilledIcon";
import {EyeSlashFilledIcon} from "./EyeSlashFilledIcon";
import Typed from 'typed.js';
import Footerlogin from "./FooterLogin"
import {Alert} from "@nextui-org/react";
import { motion } from "framer-motion";
import {jwtDecode} from "jwt-decode"
import { GoogleLogin } from '@react-oauth/google';

////
import "./Register.css";


import Modal from './Modal'; // Import the modal component

const Login = () => {
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = React.useState("login");
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    // First POST request to /user/authByCredentials
    try {
      const response = await fetch("https://api.globalpackagetracker.com/user/authByCredentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
   
  
      if (response.status === 200) {
        // Save token and key to local storage
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("key", data.key);
  
        // Second POST request to /user/authByKey
        const secondResponse = await fetch("https://api.globalpackagetracker.com/user/authByKey", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content-type as JSON
          },
          body: JSON.stringify({ key: data.key }), // Pass the key in the body
        });
  
        const secondData = await secondResponse.json();
  
        if (secondResponse.status === 200) {
          // Save the user data to local storage
        
          localStorage.setItem("user", JSON.stringify({
            name: secondData.name,
            email: secondData.email,
            capacity: secondData.capacity,
          }));
          setSuccessMessage("Login successful!");
          setIsSuccess(true);
          setIsLoading(false)
          setTimeout(() => {
            setIsSuccess(false);
            setSuccessMessage("");
            navigate("/");
          }, 2000);
        } else {
          setErrorMessage("Authentication failed with the key.");
          setIsLoading(false)
        }
      } else {
        setErrorMessage(data.message || "Authentication failed with credentials.");
        setIsLoading(false)
      }
    } catch (err) {
      setErrorMessage("An error occurred while logging in.");
      setIsLoading(false)
      console.error(err);
    }finally {
      setIsLoading(false);
    }
  };

  const handleLoginGoogle = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const jwtResponse = jwtDecode(credentialResponse.credential);
      const { email } = jwtResponse; // Extract email from the JWT payload
      const password = "google_register"; // Using google_register as password for consistency
  
      // Try to login first (this will fail if the user does not exist)
      const loginResponse = await fetch("https://api.globalpackagetracker.com/user/authByCredentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const loginData = await loginResponse.json();
  
      if (loginResponse.status === 200) {
        // User exists, proceed with login
        localStorage.setItem("token", loginData.jwt);
        localStorage.setItem("key", loginData.key);
  
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
          localStorage.setItem("user", JSON.stringify({
            name: secondData.name,
            email: secondData.email,
            capacity: secondData.capacity,
          }));
          setSuccessMessage("Login successful!");
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setSuccessMessage("");
            navigate("/");
          }, 2000);
        } else {
          setErrorMessage("Authentication failed with the key.");
        }
      } else {
        // If login fails, attempt to register the user
        setSuccessMessage("You are a new user. We need to register your account: Registering...");
        setIsSuccess(true);
        
        const registerResponse = await fetch("https://api.globalpackagetracker.com/user/register", {
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
  
        const registerData = await registerResponse.json();
  
        if (registerResponse.status === 201) {
          setSuccessMessage("Registration successful! Creating the account...");
          
          // After registration, try to login again
          const loginAfterRegisterResponse = await fetch("https://api.globalpackagetracker.com/user/authByCredentials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
  
          const loginAfterRegisterData = await loginAfterRegisterResponse.json();
  
          if (loginAfterRegisterResponse.status === 200) {
            localStorage.setItem("token", loginAfterRegisterData.jwt);
            localStorage.setItem("key", loginAfterRegisterData.key);
  
            // Second POST request to /user/authByKey after registration
            const authByKeyResponse = await fetch("https://api.globalpackagetracker.com/user/authByKey", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ key: loginAfterRegisterData.key }),
            });
  
            const authByKeyData = await authByKeyResponse.json();
  
            if (authByKeyResponse.status === 200) {
              setSuccessMessage("Login successful!");
              localStorage.setItem("user", JSON.stringify({
                name: authByKeyData.name,
                email: authByKeyData.email,
                capacity: authByKeyData.capacity,
              }));
  
              // Redirect to the main page
              setTimeout(() => {
                navigate("/");
              }, 2000);
            } else {
              setErrorMessage("Authentication failed with the key after registration.");
            }
          } else {
            setErrorMessage("Login failed after registration. Please try again.");
          }
        } else {
          setErrorMessage(registerData.message || "Registration failed.");
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-600 sm:text-5xl custom-font">
          Manage and monitor every aspect of your <br></br> <span id="typed" className="text-blue-400"></span>.
        </h1>

        <p className="mt-6 text-base leading-8 text-gray-600 hidden xl:block">
        Track your packages live from shipping to delivery, manage products, and streamline sending and receiving across multiple hubs for your customers or vendors. Monitor when vendors or customers send returns, and easily plan for returned items. Notify vendors and customers during shipments, track inventory levels across hubs, and identify the fastest shipping methods to enhance efficiency.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
  <Button
    color="success"
    variant="flat"
    as="a"
    href="https://www.dynamopackage.com/"
    target="_blank" // optional, to open in a new tab
    rel="noopener noreferrer" // optional, for security reasons
    className="shadow-2xl border border-blue-800 text-gray-700 hover:no-underline"
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
          {errorMessage && 
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
          >
            <Alert 
              color="danger" 
              onClose={() => setErrorMessage("")}
              className="mb-4"
            >
              {errorMessage}
            </Alert>
          </motion.div>
        }

        {isSuccess && 
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
          >
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
          </motion.div>
        }

          <div className="flex-1 pr-40 flex flex-col w-full justify-center items-center p-4 pt-40">
       
        <Card className="max-w-full w-[340px]  rounded-lg h-[450px]" style={{border:'1px solid blue'}}>
          <CardBody className="overflow-hidden ">
            <Tabs
              fullWidth
              size="md"
              aria-label="Tabs form"
              selectedKey={selected}
              onSelectionChange={setSelected}
            
            >
              
              <Tab key="Login" title="Login"  className={`${selected=='Login'?'focus:outline-none':''}`} style={{ outline: 'none' }}>
                <form className="flex flex-col gap-4 h-[300px] focus:border-none ">
                <p className=" text-xs">Username</p>
              
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
                      className="max-w-xs mt-0  " placeholder="Enter your email" type="email" 
                    />
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
                 <p className="text-center text-sm">
                    Do not have an account?{" "}
                    <Link to="/register" className="text-blue-600 cursor-pointer">
                      Register
                    </Link>
                  </p>

                  <div className="flex gap-2 justify-end mt-2">
                    <Button fullWidth color="primary" variant='flat' type="submit"  disabled={isLoading} onClick={handleLogin} className="shadow-2xl border border-indigo-600">
                     
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
        <div className='flex flex-col justify-center items-center mt-2'>
       <Button size='md' radius="sm" color='warning' variant='flat' className='mb-2'>Or login using Google.</Button> 
       <GoogleLogin
  onSuccess={handleLoginGoogle}
  onError={() => {
    console.log('Login Failed');
  }}
  theme="filled_blue"
 
/>;
</div>
          </div>

        
          <div className="greenSquare"></div>
          <div className="greenSquare2"></div>
        </div>
 
        <div  >
        <Footerlogin/>
        </div>

        <Modal show={showAlert} message={message} onClose={() => setShowAlert(false)} alertType={alertType} />
    </div>
  );
};

export default Login;
