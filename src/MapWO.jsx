import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MapWO = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(1);
  console.log("currentZoom",currentZoom)
  // Example of global cities - Adjust as needed
  const cities = [
    { name: "Szczecin, PL", coordinates: [14.550115, 53.428543],isStart: true  },
    { name: "Poznan, PL", coordinates: [16.925168, 52.406374] },
    { name: "Koeln, DE", coordinates: [6.953101, 50.935173] },
    { name: "Newark, US", coordinates: [-74.172365, 40.735657],isFinish: true  },
  
   
  
  ];
  const getRadius = (zoom) => {
    if (zoom <= 1) return 5;
    if (zoom > 1 && zoom <= 3) return 3;
    if (zoom > 3 && zoom <= 5) return 1;
    return 1; // If zoom is greater than 5
  };
  const getFontSize = (zoom) => {
    if (zoom <= 1) return "20px";
    if (zoom > 1 && zoom <= 3) return "8px";
    if (zoom > 3 && zoom <= 5) return "5px";
    return "10px"; // If zoom is greater than 5
  };

  useEffect(() => {
    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background", "#fff")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "3px");

    const projection = d3.geoMercator()
      .scale(130) // Adjust scale based on your needs
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const geojsonURL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
    svg.selectAll("*").remove();

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.selectAll("g").attr("transform", event.transform);
        setCurrentZoom(event.transform.k);
      });

    svg.call(zoom);
console.log("zoom",zoom)
    d3.json(geojsonURL).then(data => {
      const g = svg.append("g");

      g.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#52525B")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.1);

      // Draw line between cities
      const line = d3.line()
        .x(d => projection(d.coordinates)[0])
        .y(d => projection(d.coordinates)[1])
        .curve(d3.curveCardinal);

      const lineColor = cities.some(city => city.isException)
        ? "red"
        : cities.some(city => city.isFinish)
        ? "#17C964"
        : "blue";

      g.append("path")
        .datum(cities)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", getRadius(currentZoom))
        .attr("d", line)
        .attr("stroke-dasharray", function() {
          const length = this.getTotalLength();
          return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function() {
          return this.getTotalLength();
        })
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);
      // Plot cities
      g.selectAll("circle")
        .data(cities)
        .enter().append("circle")
        .attr("cx", d => projection(d.coordinates)[0])
        .attr("cy", d => projection(d.coordinates)[1])
        .attr("r", getRadius(currentZoom))
        .attr("fill", (d) =>
          d.isStart ? "yellow" :
          d.isFinish ? "green" :
          d.isTransit ? "blue" :
          d.isException ? "red" :
          "black"
        )
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`City: ${d.name}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

      // Add city names
      g.selectAll("text")
        .data(cities)
        .enter().append("text")
        .attr("x", d => projection(d.coordinates)[0] + 7)
        .attr("y", d => projection(d.coordinates)[1] + 3)
        .text(d => d.name)
        .style("font-size", getFontSize(currentZoom))
        .attr("fill", "white");


      // Add start and finish markers (example for start city)
      const startCity = cities.find(city => city.isStart);
      const endCity =cities.find(city => city.isFinish);
      const transit=cities.find(city => city.isTransit);
      const exception = cities.find(city => city.isException);
     
      if (startCity) {
        g.append("rect")
          .attr("x", projection(startCity.coordinates)[0] - 30)
          .attr("y", projection(startCity.coordinates)[1] - 30)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "yellow")
          .attr("rx", 5);

        g.append("text")
          .attr("x", projection(startCity.coordinates)[0])
          .attr("y", projection(startCity.coordinates)[1] - 15)
          .attr("text-anchor", "middle")
          .text("Shipped")
          .attr("font-size", "12px")
          .attr("fill", "black")
          .attr("font-weight", "bold");
      }

      if (endCity) {
        g.append("rect")
          .attr("x", projection(endCity.coordinates)[0] - 30)
          .attr("y", projection(endCity.coordinates)[1] - 30)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "green")
          .attr("rx", 5);

        g.append("text")
          .attr("x", projection(endCity.coordinates)[0])
          .attr("y", projection(endCity.coordinates)[1] - 15)
          .attr("text-anchor", "middle")
          .text("Delivered")
          .attr("font-size", "12px")
          .attr("fill", "white")
          .attr("font-weight", "bold");
      }

      if (transit) {
        g.append("rect")
          .attr("x", projection(transit.coordinates)[0] - 30)
          .attr("y", projection(transit.coordinates)[1] - 30)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "blue")
          .attr("rx", 5);

        g.append("text")
          .attr("x", projection(transit.coordinates)[0])
          .attr("y", projection(transit.coordinates)[1] - 15)
          .attr("text-anchor", "middle")
          .text("In Transit")
          .attr("font-size", "12px")
          .attr("fill", "white")
          .attr("font-weight", "bold");
      }

      if (exception) {
        g.append("rect")
          .attr("x", projection(exception.coordinates)[0] - 30)
          .attr("y", projection(exception.coordinates)[1] - 30)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", "red")
          .attr("rx", 5);

        g.append("text")
          .attr("x", projection(exception.coordinates)[0])
          .attr("y", projection(exception.coordinates)[1] - 15)
          .attr("text-anchor", "middle")
          .text("Exception")
          .attr("font-size", "12px")
          .attr("fill", "black")
          .attr("font-weight", "bold");
      }

      // Similar logic for finish, transit, and exception if needed

    }).catch(error => console.error("Error loading GeoJSON:", error));

  }, []);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default MapWO;