import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MapGE = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [coordinates, setCoordinates] = useState([]);

  const cities = [
    { name: "Berlin", coordinates: [13.405, 52.52], isStart: true },
    { name: "Hamburg", coordinates: [9.9937, 53.5511] },
    { name: "Hanover", coordinates: [9.7320, 52.3759] },
    { name: "Düsseldorf", coordinates: [6.7735, 51.2277] },
    { name: "Cologne", coordinates: [6.9603, 50.9375], isTransit: true },
  ];

  useEffect(() => {
    const width = 800;
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
      .center([10.5, 51]) // Center on Germany
      .scale(1500) // Adjust scale for zooming into Germany
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const geojsonURL = "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";
    svg.selectAll("*").remove();
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.selectAll("g").attr("transform", event.transform);
      });

    svg.call(zoom);

    d3.json(geojsonURL)
      .then((data) => {
        const countries = data.features;

        // Filter only Germany
        const states = countries.filter(d => d.properties.NAME === "Germany");

        const g = svg.append("g");

        g.selectAll("path")
          .data(states)
          .join("path")
          .attr("class", "country")
          .attr("d", path)
          .attr("fill", "#52525B")
          .attr("stroke", "#333")
          .attr("stroke-width", 0.1);
          

        g.selectAll("circle")
          .data(cities)
          .enter().append("circle")
          .attr("cx", d => projection(d.coordinates)[0])
          .attr("cy", d => projection(d.coordinates)[1])
          .attr("r", 5)
          .attr("fill", (d, i) =>
          cities[i].isStart ? "yellow" :
            cities[i].isFinish ? "green" :
            cities[i].isTransit ? "blue" :
            cities[i].isException ? "red" :
              "black"
        )
          .on("mouseover", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`City: ${d.name}`)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 20}px`);
          })
          .on("mouseout", () => {
            tooltip.style("opacity", 0);
          });

        g.selectAll("text")
          .data(cities)
          .join("text")
          .attr("x", d => projection(d.coordinates)[0] + 7)
          .attr("y", d => projection(d.coordinates)[1] + 3)
          .text((d, i) => cities[i].name)
          .attr("font-size", "10px")
          .attr("fill", "white");


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
            .attr("stroke", lineColor)  // Set the stroke color dynamically
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("stroke-dasharray", function () {
              const length = this.getTotalLength();
              return `${length} ${length}`;
            })
            .attr("stroke-dashoffset", function () {
              return this.getTotalLength();
            })
            .transition()
            .duration(3000)
            .attr("stroke-dashoffset", 0);


            const startCity = cities.find((_, i) => cities[i].isStart);
        const endCity = cities.find((_, i) => cities[i].isFinish);
        const transit = cities.find((_, i) => cities[i].isTransit);
        const exception = cities.find((_, i) => cities[i].isException);
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
            .attr("y", projection(endCity.coordinates)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "green")
            .attr("rx", 5);
        
          g.append("text")
            .attr("x", projection(endCity.coordinates)[0])
            .attr("y", projection(endCity.coordinates)[1] + 30)
            .attr("text-anchor", "middle")
            .text("Delivered")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold");
        }
        
        if (transit) {
          g.append("rect")
            .attr("x", projection(transit.coordinates)[0] - 30)
            .attr("y", projection(transit.coordinates)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "blue")
            .attr("rx", 5);
        
          g.append("text")
            .attr("x", projection(transit.coordinates)[0])
            .attr("y", projection(transit.coordinates)[1] + 30)
            .attr("text-anchor", "middle")
            .text("In Transit")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold");
        }
        
        if (exception) {
          g.append("rect")
            .attr("x", projection(exception.coordinates)[0] - 30)
            .attr("y", projection(exception.coordinates)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "red")
            .attr("rx", 5);
        
          g.append("text")
            .attr("x", projection(exception.coordinates)[0])
            .attr("y", projection(exception.coordinates)[1] + 30)
            .attr("text-anchor", "middle")
            .text("Exception")
            .attr("font-size", "12px")
            .attr("fill", "yellow")
            .attr("font-weight", "bold");
        }
        
        })
          
        

   
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default MapGE;


