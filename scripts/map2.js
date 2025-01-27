// scripts/map.js

function getContainerDimensions() {
  const container = document.getElementById("map");
  const rect = container.getBoundingClientRect();
  const padding = 20;
  return {
    width: rect.width - padding,
    height: rect.height - padding,
  };
}

async function initializeMap(stateData) {
  const MOBILE_BREAKPOINT = 768;
  const { width, height } = getContainerDimensions();
  const dataByYear = d3.group(stateData, (d) => d.year);

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  const colorScale = d3
    .scaleThreshold()
    .domain([300, 800, 1500, 2500])
    .range(["#f5f5f5", "#e5f6f4", "#99e5db", "#40c4b2", "#207f89"]);

  new MapLegend("map", {
    mobileBreakpoint: MOBILE_BREAKPOINT,
    legendPadding: 20,
  });

  const updateColors = (year) => {
    const yearData = dataByYear.get(year) || [];
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
  };

  const updateProjection = () => {
    const { width, height } = getContainerDimensions();
    return d3
      .geoAlbersUsa()
      .scale(width * 1.3)
      .translate([width / 2, height / 2]);
  };

  let path = d3.geoPath().projection(updateProjection());

  try {
    const us = await d3.json(
      "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
    );
    const statesFeatures = topojson.feature(us, us.objects.states).features;

    svg
      .selectAll("path")
      .data(statesFeatures)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "state")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    updateColors(2015);
    window.updateMapYear = updateColors;

    window.addEventListener("resize", () => {
      const { width, height } = getContainerDimensions();
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      path = d3.geoPath().projection(updateProjection());
      svg.selectAll("path").attr("d", path);
    });
  } catch (error) {
    console.error("Error loading map data:", error);
  }
}

window.initializeMap = initializeMap;
