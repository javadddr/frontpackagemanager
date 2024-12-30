
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const Map = ({routes,coordinateso}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  {console.log("routes",routes)}
  // const routes = [
  //   [
  //     { name: "New York", postalCode: "10001", isStart: true },
  //     { name: "Philadelphia", postalCode: "19104" },
  //     { name: "Washington, D.C.", postalCode: "20001" },
  //     { name: "Charlotte", postalCode: "28202" },
  //     { name: "Atlanta", postalCode: "30303" },
  //     { name: "Miami", postalCode: "33101", isFinish: true }
  //   ],
  //   [
  //     { name: "Los Angeles", postalCode: "90001", isStart: true },
  //     { name: "Las Vegas", postalCode: "89101" },
  //     { name: "Oklahoma City", postalCode: "73102", isFinish: true }
  //   ]
  //   // ... add more routes here if needed
  // ];
 
// { name: "Miami", postalCode: "33101", isException: true }
// { name: "Miami", postalCode: "33101", isTransit: true }
// { name: "Miami", postalCode: "33101", isFinish: true }
  const getCoordinates = async (postalCode) => {
    const mockCoordinates = coordinateso;
    return mockCoordinates[postalCode] || null;
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = 960;
    const height = 600;

    const projection = d3.geoAlbersUsa()
      .scale(900)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
   
    Promise.all(routes.map(route => Promise.all(route.map(city => getCoordinates(city.postalCode)))))
    .then(routeCoords => {
      setCoordinates(routeCoords);

      d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us => {
        const states = topojson.feature(us, us.objects.states).features.filter(d =>
          !['Alaska', 'Hawaii', 'Puerto Rico', 'Guam', 'American Samoa', 'Northern Mariana Islands', 'U.S. Virgin Islands'].includes(d.properties.name)
        );

        svg.selectAll("*").remove();

        svg.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "none");

        const g = svg.append("g");
 // Create a zoom behavior
        const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Set zoom scale limits
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

        svg.call(zoom); // Attach zoom behavior to the SVG

        svg.append("button")
        .text("Reset Zoom")
        .on("click", () => {
          svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity); // Reset zoom to the original state
        });

  
        g.selectAll("path")
          .data(states)
          .enter().append("path")
          .attr("d", path)
          .attr("fill", "#52525B")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);

          routeCoords.forEach((coords, routeIndex) => {
            const line = d3.line()
              .x(d => projection(d)[0])
              .y(d => projection(d)[1])
              .curve(d3.curveCardinal);
  
            const route = routes[routeIndex];
            const lineColor = route.some(city => city.isException) ? "red" 
              : route.some(city => city.isFinish) ? "#17C964" 
              : "blue";

          g.append("path")
            .datum(coords)
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", lineColor)  // Set the stroke color dynamically
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", function () {
              return this.getTotalLength();
            })
            .attr("stroke-dashoffset", function () {
              return this.getTotalLength();
            })
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
          

            g.selectAll(`circle.route-${routeIndex}`)
            .data(coords)
            .enter().append("circle")
            .attr("class", `route-${routeIndex}`)
            .attr("cx", d => projection(d)[0])
            .attr("cy", d => projection(d)[1])
            .attr("r", (d, i) => route[i].isStart || route[i].isFinish ? 5 : 5)
            .attr("fill", (d, i) => 
              route[i].isStart ? "yellow" :
              route[i].isFinish ? "green" :
              route[i].isTransit ? "blue" :
              route[i].isException ? "red" :
              "black"
            )
            .on("mouseover", (event, d) => {
              const index = coords.indexOf(d);
              tooltip.style("opacity", 1)
                .html(`Postal Code: ${route[index].postalCode}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

      // Draw city names for this route
      g.selectAll(`text.route-${routeIndex}`)
      .data(coords)
      .enter().append("text")
      .attr("class", `route-${routeIndex}`)
      .attr("x", d => projection(d)[0] + 7)
      .attr("y", d => projection(d)[1] + 3)
      .text((d, i) => route[i].name)
      .attr("font-size", "10px")
      .attr("fill", "white");

      const startCity = coords.find((_, i) => route[i].isStart);
      const endCity = coords.find((_, i) => route[i].isFinish);
      const transit = coords.find((_, i) => route[i].isTransit);
      const exception = coords.find((_, i) => route[i].isException);
    
        if (startCity) {
          g.append("rect")
            .attr("x", projection(startCity)[0] - 30)
            .attr("y", projection(startCity)[1] - 30)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "yellow")
            .attr("rx", 5);

          g.append("text")
            .attr("x", projection(startCity)[0])
            .attr("y", projection(startCity)[1] - 15)
            .attr("text-anchor", "middle")
            .text("Shipped")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .attr("font-weight", "bold");
        }

        if (endCity) {
          g.append("rect")
            .attr("x", projection(endCity)[0] - 30)
            .attr("y", projection(endCity)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "green")
            .attr("rx", 5);

          g.append("text")
            .attr("x", projection(endCity)[0])
            .attr("y", projection(endCity)[1] + 30)
            .attr("text-anchor", "middle")
            .text("Delivered")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold");
        }
        if (transit) {
          g.append("rect")
            .attr("x", projection(transit)[0] - 30)
            .attr("y", projection(transit)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "blue")
            .attr("rx", 5);

          g.append("text")
            .attr("x", projection(transit)[0])
            .attr("y", projection(transit)[1] + 30)
            .attr("text-anchor", "middle")
            .text("In Transit")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold");
        }
        if (exception) {
          g.append("rect")
            .attr("x", projection(exception)[0] - 30)
            .attr("y", projection(exception)[1] + 15)
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "red")
            .attr("rx", 5);

          g.append("text")
            .attr("x", projection(exception)[0])
            .attr("y", projection(exception)[1] + 30)
            .attr("text-anchor", "middle")
            .text("Exception")
            .attr("font-size", "12px")
            .attr("fill", "yello")
            .attr("font-weight", "bold");
        }
      });
      }).catch(error => console.error('Error loading the data:', error));
    });
  }, []);

  return (
    <>
    <div ref={tooltipRef} style={{
      position: 'absolute',
      backgroundColor: 'white',
      border: '1px solid black',
      padding: '5px',
      borderRadius: '5px',
      pointerEvents: 'none',
      opacity: 0
    }}></div>
    <svg ref={svgRef} width="100%" height="600px"></svg>
  </>
  );
};

export default Map;