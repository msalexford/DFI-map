// scripts/map.js

function calculateMapDimensions() {
  const container = document.getElementById("map");
  const containerWidth = container.clientWidth;

  // Constants for map sizing
  const MIN_HEIGHT = 300;
  const MAX_HEIGHT = Math.min(800, window.innerHeight * 0.7);
  const BASE_ASPECT_RATIO = 0.65;
  const MOBILE_BREAKPOINT = 768;

  let dynamicAspectRatio = BASE_ASPECT_RATIO;
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    dynamicAspectRatio = 0.85;
  }

  let height = containerWidth * dynamicAspectRatio;
  height = Math.min(Math.max(height, MIN_HEIGHT), MAX_HEIGHT);

  // Add explicit padding to SVG dimensions
  const PADDING = {
    top: 40,
    bottom: 40,
    left: 0,
    right: 0,
  };

  return {
    width: containerWidth,
    height: height + PADDING.top + PADDING.bottom,
    effectiveHeight: height,
    padding: PADDING,
  };
}

async function initializeMap(stateData) {
  const container = document.getElementById("map");
  console.log("Initializing map...");

  try {
    if (typeof d3 === "undefined") {
      throw new Error("D3 library not loaded");
    }

    let dimensions = calculateMapDimensions();
    container.innerHTML = "";

    // Create SVG without additional translation
    const svg = d3
      .select("#map")
      .append("svg")
      .attr("class", "map-svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", "translate(0, 10)"); // Added small padding to prevent clipping

    const colorScale = d3
      .scaleThreshold()
      .domain([100, 500, 1000, 2000])
      .range(["#F0F9E8", "#76CABB", "#4BA8C9", "#1D79B5", "#26347E"]);

    new MapLegend("map", {
      mobileBreakpoint: 768,
      legendPadding: 20,
    });

    function updateProjection() {
      const dimensions = calculateMapDimensions();
      const scale =
        window.innerWidth <= 768
          ? dimensions.width * 1.2
          : dimensions.width * 1.0;

      const horizontalOffset = dimensions.width * 0.02;

      return d3
        .geoAlbersUsa()
        .scale(scale)
        .translate([
          dimensions.width / 2 + horizontalOffset,
          dimensions.effectiveHeight / 2, // Center in the effective height
        ]);
    }

    let path = d3.geoPath().projection(updateProjection());

    // Rest of the map initialization code...
    const mapUrls = [
      "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
      "https://d3js.org/us-10m.v1.json",
      "https://unpkg.com/us-atlas@3/states-10m.json",
    ];

    let us = null;
    let error = null;

    for (const url of mapUrls) {
      try {
        us = await d3.json(url);
        if (us) break;
      } catch (e) {
        error = e;
        continue;
      }
    }

    if (!us) {
      throw new Error(
        `Failed to load map data from all sources: ${error.message}`
      );
    }

    const statesFeatures = topojson.feature(us, us.objects.states).features;

    svg
      .selectAll("path")
      .data(statesFeatures)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "state")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("vector-effect", "non-scaling-stroke");

    function updateColors(year) {
      const yearData = d3.group(stateData, (d) => d.year).get(year) || [];
      svg
        .selectAll(".state")
        .transition()
        .duration(200)
        .attr("fill", (d) => {
          const stateInfo = yearData.find(
            (sd) => sd["state-full"] === d.properties.name
          );
          return !stateInfo || !stateInfo.displayTeachers
            ? "#f5f5f5"
            : colorScale(stateInfo.displayTeachers);
        });
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    const resizeHandler = debounce(() => {
      const dimensions = calculateMapDimensions();

      d3.select("#map svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

      const projection = updateProjection();
      path = d3.geoPath().projection(projection);

      svg.selectAll("path").transition().duration(300).attr("d", path);

      const legendContainer = document.querySelector(".legend-container");
      if (legendContainer) {
        if (window.innerWidth <= 768) {
          legendContainer.style.position = "relative";
          legendContainer.style.marginTop = "0";
          legendContainer.style.marginBottom = "20px";
          legendContainer.style.order = "-1";
          container.style.display = "flex";
          container.style.flexDirection = "column";
        } else {
          legendContainer.style.position = "absolute";
          legendContainer.style.bottom = "20px";
          legendContainer.style.right = "20px";
          legendContainer.style.order = "0";
          container.style.display = "block";
        }
      }
    }, 150);

    window.addEventListener("resize", resizeHandler);

    updateColors(2015);
    window.updateMapYear = updateColors;
    resizeHandler();
  } catch (error) {
    console.error("Error in map initialization:", error);
    container.innerHTML = `
      <div style="color: #dc2626; text-align: center; padding: 20px;">
        <p>Error loading map data. Please try refreshing the page.</p>
        <p style="font-size: 0.8em; color: #666; margin-top: 10px;">
          Technical details: ${error.message}
        </p>
      </div>`;
  }
}

window.initializeMap = initializeMap;
