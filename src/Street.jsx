import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Icon Definitions
const startIcon = L.icon({
  iconUrl: 'http://maps.gstatic.com/intl/de_de/mapfiles/ms/micons/yellow-dot.png',
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -32]
});

const defaultIcon = L.icon({
  iconUrl: 'http://maps.gstatic.com/intl/de_de/mapfiles/ms/micons/blue-dot.png',
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -32]
});

const deliveredIcon = L.icon({
  iconUrl: 'http://maps.gstatic.com/intl/de_de/mapfiles/ms/micons/green-dot.png',
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -32]
});

const transitIcon = L.icon({
  iconUrl: 'http://maps.gstatic.com/intl/de_de/mapfiles/ms/micons/blue-dot.png',
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -32]
});

const exceptionIcon = L.icon({
  iconUrl: 'http://maps.gstatic.com/intl/de_de/mapfiles/ms/micons/red-dot.png',
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -32]
});

// Replace this with actual geocoding service calls
const getCoordinates = async (cityName, postalCode, country) => {
  const cityCoords = {
    'New York': [40.7128, -74.0060],
    'Philadelphia': [39.9526, -75.1652],
    'Washington, D.C.': [38.9072, -77.0369],
    'Charlotte': [35.2271, -80.8431],
    'Atlanta': [33.7490, -84.3880],
    'Miami': [25.7617, -80.1918],
    'Los Angeles': [34.0522, -118.2437],
    'Las Vegas': [36.1699, -115.1398],
    'Oklahoma City': [35.4676, -97.5164]
  };
  const key = cityName || postalCode;
  return cityCoords[key] || [0, 0]; // Default to [0, 0] if not found
};

const Street = () => {
  const [coordinates, setCoordinates] = useState({});

  const routes = [
    [
      { name: "New York", postalCode: "10001", isStart: true },
      { name: "Philadelphia", postalCode: "19104" },
      { name: "Washington, D.C.", postalCode: "20001" },
      { name: "Charlotte", postalCode: "28202" },
      { name: "Atlanta", postalCode: "30303" },
      { name: "Miami", postalCode: "33101", isFinish: true }
    ],
    [
      { name: "Los Angeles", postalCode: "90001", isStart: true },
      { name: "Las Vegas", postalCode: "89101", isTransit: true },
      { name: "Oklahoma City", postalCode: "73102", isException: true }
    ]
  ];

  useEffect(() => {
    const fetchCoordinates = async () => {
      const coords = {};
      for (let route of routes) {
        for (let stop of route) {
          const key = `${stop.name || ''}-${stop.postalCode || ''}`;
          if (!coords[key]) {
            coords[key] = await getCoordinates(stop.name, stop.postalCode);
          }
        }
      }
      setCoordinates(coords);
    };
    fetchCoordinates();
  }, []);

  const getStopCoordinates = (stop) => {
    const key = `${stop.name || ''}-${stop.postalCode || ''}`;
    return coordinates[key] || [0, 0]; // Default to [0, 0] if coordinates not found
  };

  const getMarkerIcon = (stop) => {
    if (stop.isStart) {
      return startIcon;
    } else if (stop.isFinish) {
      return deliveredIcon;  
    } else if (stop.isTransit) {
      return transitIcon;    
    } else if (stop.isException) {
      return exceptionIcon;  
    }
    return defaultIcon;      
  };

  const getLineColor = (stop) => {
    if (stop.isFinish) return 'green';
    if (stop.isTransit) return 'blue';
    if (stop.isException) return 'red';
    return 'black'; // Default color
  };

  // Helper function to determine the color of each segment of the route
  const getSegmentColor = (stop1, stop2) => {
    // Here we can decide based on either stop or both, for simplicity, we'll use the second stop
    return getLineColor(stop2);
  };
  const [isDarkMode, setIsDarkMode] = useState(true);
  return (
    <div style={{ height: "600px", width: "100%" }}>
          <MapContainer 
      center={[39.8283, -98.5795]} 
      zoom={4} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%", filter: isDarkMode ? 'invert(100%) hue-rotate(180deg)' : 'none' }}
    >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((route, routeIndex) => (
          <React.Fragment key={routeIndex}>
            {route.map((stop, index) => {
              const pos = getStopCoordinates(stop);
              return (
                <Marker key={index} position={pos} icon={getMarkerIcon(stop)}>
                  <Popup>
                    {stop.name || stop.postalCode}
                    {stop.isStart && " - Start"} 
                    {stop.isFinish && " - Finish"}
                  </Popup>
                </Marker>
              );
            })}
            {route.length > 1 && route.map((stop, index) => {
              if (index < route.length - 1) {
                return (
                  <Polyline 
                    key={`line-${index}`}
                    positions={[getStopCoordinates(stop), getStopCoordinates(route[index + 1])]} 
                    color={getSegmentColor(stop, route[index + 1])}
                    pathOptions={{ smoothFactor: 3 }}
                  />
                );
              }
              return null;
            })}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default Street;