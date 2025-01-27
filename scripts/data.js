// scripts/data.js

const STATE_DATA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmxD385xNl6aKZBP4oyNT2xGT41O8MyT7Bm092dXv9jeD8ERv5MaENVzQwUvSOA7KXuRYrFQxFMaek/pub?gid=2043337507&single=true&output=csv";
const US_DATA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmxD385xNl6aKZBP4oyNT2xGT41O8MyT7Bm092dXv9jeD8ERv5MaENVzQwUvSOA7KXuRYrFQxFMaek/pub?gid=1592997347&single=true&output=csv";

let processedUSData = []; // Make this accessible throughout the file

async function loadData() {
  try {
    const [stateData, usData] = await Promise.all([
      fetchCSV(STATE_DATA_URL),
      fetchCSV(US_DATA_URL),
    ]);

    // Process and sort US data by year
    processedUSData = usData
      .map((d) => ({
        ...d,
        year: parseInt(d.year),
        "total-leaders": parseInt(d["total-leaders"]),
        "total-epps": parseInt(d["total-epps"]),
        "total-states-active": parseInt(d["total-states-active"]),
        "total-teachers": parseInt(d["total-teachers"]),
      }))
      .sort((a, b) => a.year - b.year);

    console.log("Processed US Data:", processedUSData);

    // Process state data
    const stateGroups = {};
    stateData.forEach((d) => {
      if (!stateGroups[d["state-full"]]) stateGroups[d["state-full"]] = [];
      stateGroups[d["state-full"]].push(d);
    });

    const processedStateData = Object.entries(stateGroups).flatMap(
      ([stateName, stateDocs]) => {
        let runningTotal = 0;
        const sorted = [...stateDocs].sort((a, b) => a.year - b.year);
        return sorted.map((d) => {
          runningTotal += d.teachers || 0;
          return {
            ...d,
            displayTeachers: runningTotal,
          };
        });
      }
    );

    // Initialize visualizations with first year's data
    initializeMetrics(processedUSData[0], null);
    initializeMap(processedStateData);

    // Handle year updates for both map and metrics
    const handleYearUpdate = (year) => {
      console.log("Year update handler called with:", year);
      const yearInt = parseInt(year);

      // Update map
      if (window.updateMapYear) {
        console.log("Updating map for year:", yearInt);
        window.updateMapYear(yearInt);
      }

      // Update metrics
      const currentYearData = processedUSData.find((d) => d.year === yearInt);
      const previousYearData = processedUSData.find(
        (d) => d.year === yearInt - 1
      );

      console.log("Current year data:", currentYearData);
      console.log("Previous year data:", previousYearData);

      if (currentYearData) {
        console.log("Updating metrics for year:", yearInt);
        initializeMetrics(currentYearData, previousYearData);
      }
    };

    // Initialize timeline with correct year range
    const minYear = Math.min(...processedUSData.map((d) => d.year));
    const maxYear = Math.max(...processedUSData.map((d) => d.year));
    console.log(`Initializing timeline with range: ${minYear}-${maxYear}`);

    // Initialize timeline with the handler
    initializeTimeline(minYear, maxYear, handleYearUpdate);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

window.loadData = loadData;
