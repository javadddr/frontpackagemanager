import React, { useState } from 'react';
import { Button, Select, SelectItem } from "@nextui-org/react";

function StepThree({ notify,setNotify,notifyWhen,setNotifyWhen}) {


  const transitOptions = ['0', '5 days', '7 days', '15 days', 'More than 20 days'];

  const handleNotifyClick = (option) => {
    setNotify(prevState => ({
      ...prevState,
      [option]: !prevState[option]
    }));
  };

  const handleNotifyWhenClick = (timing, value) => {
    if(timing === 'transitExceeded') {
      setNotifyWhen(prevState => ({
        ...prevState,
        [timing]: value
      }));
    } else {
      setNotifyWhen(prevState => ({
        ...prevState,
        [timing]: !prevState[timing]
      }));
    }
  };

  return (
    <div className='flex h-[300px] justify-between p-3'>
      <div aria-label="Choose who to notify" className='flex-1'>
        <h3 id="who-to-notify" className='text-gray-900 font-bold mb-0 text-base'>Who do you want to notify?</h3>
        <div aria-labelledby="who-to-notify" className="flex flex-col mt-4 justify-center text-center justify-self-center">
          <Button
            aria-label={notify.shipper ? "Selected: Shipper (Hub)" : "Select Shipper (Hub)"}
            color='warning'
            variant='flat'
            onClick={() => handleNotifyClick('shipper')}
            className={` ${notify.shipper ? 'bg-blue-400 text-white' : ''} mb-4 w-[250px]`}
          >
            Shipper (Hub)
          </Button>
          <Button
            aria-label={notify.receiver ? "Selected: Receiver (Customer or Vendor)" : "Select Receiver (Customer or Vendor)"}
            color='warning'
            variant='flat'
            onClick={() => handleNotifyClick('receiver')}
            className={` ${notify.receiver ? 'bg-blue-400 text-white' : ''} w-[250px]`}
          >
            Receiver (Customer or Vendor)
          </Button>
        </div>
      </div>
      <div aria-label="Choose when to notify" className='flex-1'>
        <h3 id="when-to-notify" className='text-gray-900 font-bold mb-0 text-base'>When?</h3>
        <div aria-labelledby="when-to-notify" className="flex flex-col mt-4 justify-center text-center justify-self-center">
          <Button
            aria-label={notifyWhen.now ? "Selected: Notify now" : "Notify now"}
            color='danger'
            variant='flat'
            onClick={() => handleNotifyWhenClick('now')}
            className={`${notifyWhen.now ? 'bg-blue-400 text-white' : ''} mb-4 w-[350px]`}
          >
            Now! notify them that I send the package
          </Button>
          <Button
            aria-label={notifyWhen.delivered ? "Selected: Notify when delivered" : "Notify when delivered"}
            color='danger'
            variant='flat'
            onClick={() => handleNotifyWhenClick('delivered')}
            className={`${notifyWhen.delivered ? 'bg-blue-400 text-white' : ''} mb-4 w-[350px]`}
          >
            When shipment is delivered
          </Button>
          <Button
            aria-label={notifyWhen.exception ? "Selected: Notify on exception" : "Notify on exception"}
            color='danger'
            variant='flat'
            onClick={() => handleNotifyWhenClick('exception')}
            className={`${notifyWhen.exception ? 'bg-blue-400 text-white' : ''} mb-4 w-[350px]`}
          >
            When there is an exception
          </Button>
          <div className="flex items-center justify-center">
            <label htmlFor="transit-select" className="mr-2 text-gray-900">When transit time exceeds:</label>
            <Select
              id="transit-select"
              aria-label="Select transit time"
              value={notifyWhen.transitExceeded}
              onChange={(e) => handleNotifyWhenClick('transitExceeded', e.target.value)}
              className="px-4 py-2 rounded w-[173px] mb-0"
            >
              {transitOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepThree;