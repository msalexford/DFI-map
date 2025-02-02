// scripts/metrics.js

// Initialize metrics dashboard by processing current and historical data
// Parameters:
//   currentData: Object containing current period metrics
//   previousData: Object containing previous period metrics (optional)
function initializeMetrics(currentData, previousData) {
  // Log input data for debugging purposes
  console.log('Initialize Metrics called with:', { currentData, previousData })

  // Get reference to metrics container element and clear any existing content
  const metricsContainer = document.querySelector('.metrics')
  metricsContainer.innerHTML = ''

  // Helper function to calculate percentage growth between two values
  // Parameters:
  //   current: Current period value
  //   previous: Previous period value
  // Returns: Formatted string with growth percentage (e.g., "+10%" or "-5%")
  const calculateGrowth = (current, previous) => {
    console.log('Calculating growth:', { current, previous })

    // Handle case where either value is missing/undefined
    if (!previous || !current) {
      console.log('No previous or current data, returning +0%')
      return '+0%'
    }

    // Calculate percentage growth
    const growth = ((current - previous) / previous) * 100

    // Format growth with "+" prefix for positive values
    const formattedGrowth =
      growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`
    console.log('Calculated growth:', formattedGrowth)
    return formattedGrowth
  }

  // Define array of metric objects, each containing:
  // - label: Display name for the metric
  // - value: Current value from input data
  // - growth: Calculated growth percentage using helper function
  const metrics = [
    {
      label: 'Leaders Supported',
      // Get current value from input data
      value: currentData['total-leaders'],
      // Calculate growth, using optional chaining (?.) to safely access previous data
      growth: calculateGrowth(
        currentData['total-leaders'],
        previousData?.['total-leaders']
      )
    },
    {
      label: 'EPPs Served',
      value: currentData['total-epps'],
      growth: calculateGrowth(
        currentData['total-epps'],
        previousData?.['total-epps']
      )
    },
    {
      label: 'Active States',
      value: currentData['total-states-active'],
      growth: calculateGrowth(
        currentData['total-states-active'],
        previousData?.['total-states-active']
      )
    },
    {
      label: 'Teachers Impacted',
      value: currentData['total-teachers'],
      growth: calculateGrowth(
        currentData['total-teachers'],
        previousData?.['total-teachers']
      )
    }
  ]

  // Log processed metrics for debugging
  console.log('Processed metrics:', metrics)

  // Create and append DOM elements for each metric
  metrics.forEach((metric) => {
    // Create container div for metric card
    const card = document.createElement('div')
    card.className = 'metric-card'

    // Set HTML content for metric card:
    // - Label div: Display name of metric
    // - Value div: Current value (formatted with commas) and growth indicator
    card.innerHTML = `
      <div class="metric-label">
        ${metric.label}
      </div>
      <div class="metric-value">
        ${metric.value.toLocaleString()}
      </div>
    `

    // Add completed metric card to metrics container
    metricsContainer.appendChild(card)
  })
}

// Add up arrow and growth percentage
// <span class="growth">↗ ${metric.growth}</span>
