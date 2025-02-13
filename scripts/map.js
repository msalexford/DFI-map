// scripts/map.js

// Constants
const MOBILE_BREAKPOINT = 768

/**
 * Calculate responsive map dimensions based on container and screen size
 * @returns {Object} Dimensions object with width and height
 */
function calculateMapDimensions() {
  const container = document.getElementById('map')
  if (!container) return null

  const containerWidth = container.clientWidth

  // Adjust aspect ratio for better mobile display
  const aspectRatio = window.innerWidth <= MOBILE_BREAKPOINT ? 0.85 : 0.9

  // Calculate height based on width and aspect ratio
  const height = containerWidth * aspectRatio

  return {
    width: containerWidth,
    height: height
  }
}

/**
 * Create map projection based on dimensions
 * @param {Object} dimensions Map dimensions
 * @returns {Function} D3 geo projection
 */
function createProjection(dimensions) {
  if (!dimensions) return null

  // Create a basic AlbersUSA projection
  const projection = d3
    .geoAlbersUsa()
    // Size of map
    .scale(
      window.innerWidth <= MOBILE_BREAKPOINT
        ? dimensions.width * 1.1 // Slightly smaller scale for mobile
        : dimensions.width * 1.2
    )

  return projection
}

/**
 * Format numbers with commas
 * @param {number} num Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  return new Intl.NumberFormat().format(num || 0)
}

/**
 * Create sparkline visualization for metric trends
 * @param {Array} data Array of data points
 * @param {string} metric Metric key to visualize
 * @param {number} width SVG width
 * @param {number} height SVG height
 * @returns {SVGElement} Sparkline SVG node
 */
function createSparkline(data, metric, width = 64, height = 20) {
  if (!data?.length || !metric) return null

  const svg = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'metric-sparkline')

  if (data.length < 2) return svg.node()

  const margin = { top: 2, right: 2, bottom: 2, left: 2 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
    .range([0, innerWidth])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[metric] || 0)])
    .range([innerHeight, 0])

  const line = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d[metric] || 0))
    .curve(d3.curveLinear)

  // Add the line
  g.append('path')
    .datum(data)
    .attr('class', 'sparkline-line')
    .attr('fill', 'none')
    .attr('stroke', '#0f6455')
    .attr('stroke-width', 1.5)
    .attr('d', line)

  // Add points at start and end of line
  ;[data[0], data[data.length - 1]].forEach((point) => {
    g.append('circle')
      .attr('class', 'sparkline-point')
      .attr('cx', xScale(point.year))
      .attr('cy', yScale(point[metric] || 0))
      .attr('r', 1.75)
      .attr('fill', '#0f6455')
  })

  return svg.node()
}

/**
 * Create tooltip content for a state
 * @param {string} stateName State name
 * @param {Object} stateInfo Current state data
 * @param {Array} allStateData Historical state data
 * @returns {string} HTML string for tooltip content
 */
function createTooltipContent(stateName, stateInfo, allStateData) {
  if (!stateName || !stateInfo || !allStateData) return ''

  const stateData = allStateData
    .filter((d) => d['state-full'] === stateName)
    .sort((a, b) => a.year - b.year)

  function createMetricCard(label, value, metric) {
    const sparkline =
      stateData.length >= 2 ? createSparkline(stateData, metric) : ''
    return `
      <div class="tooltip-metric-card">
        <div class="tooltip-metric-content">
          <div>
            <div class="tooltip-metric-label">${label}</div>
            <div class="tooltip-metric-value">${formatNumber(value)}</div>
          </div>
          ${sparkline ? `<div class="sparkline-container">${sparkline.outerHTML}</div>` : ''}
        </div>
      </div>
    `
  }

  return `
    <div class="tooltip-header">
      <span class="tooltip-state-name">${stateName}</span>
    </div>
    ${createMetricCard('EPP Leaders', stateInfo.leaders, 'leaders')}
    ${createMetricCard('EPPs', stateInfo.epps, 'epps')}
    ${createMetricCard('Teachers Impacted', stateInfo.displayTeachers, 'displayTeachers')}
  `
}

/**
 * Create and manage tooltip
 * @returns {Object} Tooltip methods
 */
function createTooltipManager() {
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('visibility', 'hidden')

  function updatePosition(event) {
    const tooltipNode = tooltip.node()
    if (!tooltipNode) return

    const tooltipRect = tooltipNode.getBoundingClientRect()
    const margin = 16

    let left = event.pageX + margin
    let top = event.pageY + margin

    // Adjust position if tooltip would go off screen
    if (left + tooltipRect.width > window.innerWidth - margin) {
      left = event.pageX - tooltipRect.width - margin
    }
    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = event.pageY - tooltipRect.height - margin
    }

    tooltip.style('left', `${left}px`).style('top', `${top}px`)
  }

  return {
    show: (content, event) => {
      tooltip.html(content).style('visibility', 'visible')
      updatePosition(event)
    },
    hide: () => tooltip.style('visibility', 'hidden'),
    move: updatePosition
  }
}

/**
 * Initialize the map visualization
 * @param {Array} stateData Array of state data
 */
async function initializeMap(stateData) {
  if (!stateData) throw new Error('No state data provided')

  const container = document.getElementById('map')
  if (!container) throw new Error('Map container not found')

  // Clear container
  container.innerHTML = ''

  // Calculate dimensions
  let dimensions = calculateMapDimensions()
  if (!dimensions) throw new Error('Could not calculate map dimensions')

  // Create projection
  let projection = createProjection(dimensions)
  if (!projection) throw new Error('Failed to create map projection')

  // Load map data
  const us = await d3.json(
    'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
  )
  if (!us?.objects?.states) throw new Error('Invalid map data format')

  const statesFeatures = topojson.feature(us, us.objects.states).features

  // Calculate map bounds *after* projection is created
  const pathGenerator = d3.geoPath().projection(projection) // Declare pathGenerator here
  const bounds = pathGenerator.bounds({
    type: 'FeatureCollection',
    features: statesFeatures
  }) // Calculate bounds based on the features
  const mapWidth = bounds[1][0] - bounds[0][0] // Difference between max X and min X
  const mapHeight = bounds[1][1] - bounds[0][1] // Difference between max Y and min Y

  const dynamicAspectRatio = mapHeight / mapWidth

  // Set the SVG height based on the dynamic aspect ratio
  const svgHeight = dimensions.width * dynamicAspectRatio

  // Select the map container and set its dimensions
  const mapContainer = d3.select('#map')
  mapContainer.select('.error-message').remove()
  let svg = mapContainer.select('.map-svg')

  if (svg.empty()) {
    svg = mapContainer.append('svg').attr('class', 'map-svg')
  }

  // Use the calculated svgHeight
  svg.attr('width', dimensions.width).attr('height', svgHeight)

  // Adjust map position after height is set
  projection.translate([
    dimensions.width / 2 -
      (window.innerWidth <= MOBILE_BREAKPOINT
        ? dimensions.width * 0.03 // Less offset for mobile
        : dimensions.width * 0.05),
    svgHeight / 2
  ])

  // Create color scale
  const colorScale = d3
    .scaleThreshold()
    .domain([1, 301, 601, 901])
    .range(['#f5f5f5', '#F0F9E8', '#76CABB', '#4BA8C9', '#26347E'])

  // Add legend
  new MapLegend('map', {
    mobileBreakpoint: 768,
    legendPadding: 20
  })

  // Create tooltip manager
  const tooltipManager = createTooltipManager()

  try {
    // Draw states
    svg
      .selectAll('path')
      .data(statesFeatures)
      .enter()
      .append('path')
      .attr('d', pathGenerator) // Use pathGenerator here
      .attr('class', 'state')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('vector-effect', 'non-scaling-stroke')
      .on('mouseover', function (event, d) {
        // Early return if state is sticky
        if (this.classList.contains('sticky-state')) return

        // Get current year from timeline slider
        const yearElement = document.querySelector('.timeline-slider')
        const year = yearElement ? parseInt(yearElement.value) : null

        // Only show hover effects for year 2025
        if (year !== 2025) return

        const stateInfo = stateData.find(
          (sd) => sd['state-full'] === d.properties.name && sd.year === 2025
        )
        if (!stateInfo) return

        d3.select(this).transition().duration(200).attr('opacity', 0.8)

        tooltipManager.show(
          createTooltipContent(d.properties.name, stateInfo, stateData),
          event
        )
      })
      .on('mousemove', (event) => {
        // Get current year from timeline slider
        const yearElement = document.querySelector('.timeline-slider')
        const year = yearElement ? parseInt(yearElement.value) : null

        // Only move tooltip for year 2025
        if (year === 2025) {
          tooltipManager.move(event)
        }
      })
      .on('mouseout', function () {
        // Early return if state is sticky
        if (this.classList.contains('sticky-state')) return

        // Get current year from timeline slider
        const yearElement = document.querySelector('.timeline-slider')
        const year = yearElement ? parseInt(yearElement.value) : null

        // Only reset opacity for year 2025
        if (year === 2025) {
          d3.select(this).transition().duration(200).attr('opacity', 1)
          tooltipManager.hide()
        }
      })
      .on('click', function (event, d) {
        const yearElement = document.querySelector('.timeline-slider')
        const year = yearElement ? parseInt(yearElement.value) : null
        if (year !== 2025) return

        const stateInfo = stateData.find(
          (sd) => sd['state-full'] === d.properties.name && sd.year === 2025
        )
        if (!stateInfo) return

        // Handle sticky state
        const wasSticky = this.classList.contains('sticky-state')

        // Remove sticky state from all states
        svg
          .selectAll('.state')
          .classed('sticky-state', false)
          .transition()
          .duration(200)
          .attr('opacity', 1)

        tooltipManager.hide()

        // If wasn't previously sticky, make it sticky
        if (!wasSticky) {
          d3.select(this)
            .classed('sticky-state', true)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)

          tooltipManager.show(
            createTooltipContent(d.properties.name, stateInfo, stateData),
            event
          )
        }
      })

    // Update colors function
    function updateColors(year) {
      if (!year) return

      const yearData = d3.group(stateData, (d) => d.year).get(year) || []

      svg
        .selectAll('.state')
        .transition()
        .duration(200)
        .attr('fill', (d) => {
          const stateInfo = yearData.find(
            (sd) => sd['state-full'] === d.properties.name
          )
          return !stateInfo || !stateInfo.displayTeachers
            ? '#f5f5f5'
            : colorScale(stateInfo.displayTeachers)
        })
    }

    // Handle window resize
    const resizeHandler = debounce(() => {
      // Recalculate dimensions
      dimensions = calculateMapDimensions()
      if (!dimensions) return

      // Create new projection
      projection = createProjection(dimensions)
      if (!projection) return

      // Recalculate map bounds *after* projection is created
      const newPathGenerator = d3.geoPath().projection(projection)
      const bounds = newPathGenerator.bounds({
        type: 'FeatureCollection',
        features: statesFeatures
      }) // Calculate bounds based on the features
      const mapWidth = bounds[1][0] - bounds[0][0] // Difference between max X and min X
      const mapHeight = bounds[1][1] - bounds[0][1] // Difference between max Y and min Y
      const dynamicAspectRatio = mapHeight / mapWidth

      // Set the SVG height based on the dynamic aspect ratio
      const svgHeight = dimensions.width * dynamicAspectRatio

      // Update SVG size
      svg.attr('width', dimensions.width).attr('height', svgHeight)

      // Update map position
      projection.translate([
        dimensions.width / 2 - dimensions.width * 0.05,
        svgHeight / 2
      ])

      // Update paths
      svg
        .selectAll('path')
        .transition()
        .duration(300)
        .attr('d', newPathGenerator)
    }, 150)

    window.addEventListener('resize', resizeHandler)

    // Initialize map
    updateColors(2015)
    window.updateMapYear = updateColors
    resizeHandler()
  } catch (error) {
    console.error('Error in map initialization:', error)
    container.innerHTML = `
      <div style="color: #dc2626; text-align: center; padding: 20px;">
        <p>Error loading map data. Please try refreshing the page.</p>
        <p style="font-size: 0.8em; color: #666; margin-top: 10px;">
          Technical details: ${error.message}
        </p>
      </div>`
  }
}

/**
 * Debounce function for handling resize events
 * @param {Function} func Function to debounce
 * @param {number} wait Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Make initializeMap available globally
window.initializeMap = initializeMap
