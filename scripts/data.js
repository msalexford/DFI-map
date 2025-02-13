// scripts/data.js

// #region - Data sources and variables

// The URL of the Google Sheet tab with state data
const STATE_DATA_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmxD385xNl6aKZBP4oyNT2xGT41O8MyT7Bm092dXv9jeD8ERv5MaENVzQwUvSOA7KXuRYrFQxFMaek/pub?gid=2043337507&single=true&output=csv'
// The URL of the Google Sheet tab with U.S. data
const US_DATA_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmxD385xNl6aKZBP4oyNT2xGT41O8MyT7Bm092dXv9jeD8ERv5MaENVzQwUvSOA7KXuRYrFQxFMaek/pub?gid=1592997347&single=true&output=csv'

// Empty array that will hold processed data
let processedUSData = []

// #endregion

// #region - Process data

async function loadData() {
  try {
    // Fetch CSV data
    const [stateData, usData] = await Promise.all([
      fetchCSV(STATE_DATA_URL),
      fetchCSV(US_DATA_URL)
    ])

    // Process and sort U.S. data by year
    processedUSData = usData
      // Convert fields to integers
      .map((d) => ({
        ...d,
        year: parseInt(d.year),
        'total-leaders': parseInt(d['total-leaders']),
        'total-epps': parseInt(d['total-epps']),
        'total-states-active': parseInt(d['total-states-active']),
        'total-teachers': parseInt(d['total-teachers'])
      }))
      // Sort data in ascending order
      .sort((a, b) => a.year - b.year)

    // Process state data
    const stateGroups = {}
    // Create an object where the keys are state names and the values are arrays of data objects for that state
    stateData.forEach((d) => {
      if (!stateGroups[d['state-full']]) stateGroups[d['state-full']] = []
      stateGroups[d['state-full']].push(d)
    })

    const processedStateData = Object.entries(stateGroups).flatMap(
      ([stateName, stateDocs]) => {
        let runningTotal = 0
        // Sort each state's data by year
        const sorted = [...stateDocs].sort((a, b) => a.year - b.year)
        // Calculate a running total of teachers for each state
        return sorted.map((d) => {
          runningTotal += d.teachers || 0
          return {
            ...d,
            displayTeachers: runningTotal
          }
        })
      }
    )

    // Initialize the metrics dashboard with the processed U.S. data
    initializeMetrics(processedUSData[0], null)
    // Initialize the map visualization with the processed state data
    initializeMap(processedStateData)

    // Handle year updates for both map and metrics
    const handleYearUpdate = (year) => {
      console.log('Year update handler called with:', year)
      const yearInt = parseInt(year)

      // Update map
      if (window.updateMapYear) {
        console.log('Updating map for year:', yearInt)
        window.updateMapYear(yearInt)
      }

      // Update metrics
      const currentYearData = processedUSData.find((d) => d.year === yearInt)
      const previousYearData = processedUSData.find(
        (d) => d.year === yearInt - 1
      )

      console.log('Current year data:', currentYearData)
      console.log('Previous year data:', previousYearData)

      if (currentYearData) {
        console.log('Updating metrics for year:', yearInt)
        initializeMetrics(currentYearData, previousYearData)
      }
    }

    // Initialize timeline with correct year range
    const minYear = Math.min(...processedUSData.map((d) => d.year))
    const maxYear = Math.max(...processedUSData.map((d) => d.year))
    console.log(`Initializing timeline with range: ${minYear}-${maxYear}`)

    // Initialize timeline with the handler
    initializeTimeline(minYear, maxYear, handleYearUpdate)
  } catch (error) {
    // Error handling
    console.error('Error loading data:', error)
  }
}

// #endregion

// #region - Fetch and parse CSV data

function fetchCSV(url) {
  // Return a Promise
  return new Promise((resolve, reject) => {
    // Call Papa Parse
    Papa.parse(url, {
      download: true, // Download CSV data from the URL
      header: true, // First row contains header
      dynamicTyping: true, // Try to convert values to the correct data type
      skipEmptyLines: true, // Skip empty lines in the CSV file
      complete: (results) => resolve(results.data),
      error: (error) => reject(error) // Callback function if error
    })
  })
}

// #endregion

// Make the 'loadData' function available globally
window.loadData = loadData
