// scripts/legend.js

class MapLegend {
  constructor(containerId, options = {}) {
    this.MOBILE_BREAKPOINT = options.mobileBreakpoint || 768
    this.LEGEND_PADDING = options.legendPadding || 20
    this.container = document.getElementById(containerId)

    // Legend entries
    this.legendData = [
      { label: '1-300', color: '#F0F9E8' },
      { label: '301-600', color: '#76CABB' },
      { label: '601-900', color: '#4BA8C9' },
      { label: '901+', color: '#26347E' }
    ]

    // Debounce function
    this.debounce = (func, wait) => {
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

    this.initialize()
  }

  createLegendContainer() {
    const legendContainer = document.createElement('div')
    legendContainer.className = 'legend-container'
    this.container.appendChild(legendContainer)
    return legendContainer
  }

  createMobileLegend(container) {
    const legendWrapper = document.createElement('div')
    legendWrapper.className = 'legend-wrapper'

    // Create legend title
    const title = document.createElement('div')
    title.textContent = 'TEACHERS IMPACTED'
    title.className = 'legend-title'

    // Create color bar
    const colorBar = document.createElement('div')
    colorBar.className = 'legend-color-bar'

    this.legendData.forEach((item) => {
      const colorSection = document.createElement('div')
      colorSection.className = 'legend-color-section'
      colorSection.style.backgroundColor = item.color
      colorBar.appendChild(colorSection)
    })

    // Create labels container
    const labelsContainer = document.createElement('div')
    labelsContainer.className = 'legend-labels'

    this.legendData.forEach((item) => {
      const label = document.createElement('div')
      label.textContent = item.label
      label.className = 'legend-label'
      labelsContainer.appendChild(label)
    })

    legendWrapper.appendChild(title)
    legendWrapper.appendChild(colorBar)
    legendWrapper.appendChild(labelsContainer)
    container.appendChild(legendWrapper)
  }

  createDesktopLegend(container) {
    const title = document.createElement('div')
    title.textContent = 'Teachers Impacted'
    title.className = 'legend-title'
    container.appendChild(title)

    this.legendData
      .slice()
      .reverse()
      // Arranges the legend in rows
      // Each row includes a colored box and its corresponding label
      // Rows displayed in reverse order of 'legendData'
      .forEach((item) => {
        const row = document.createElement('div')
        row.className = 'legend-row'

        const color = document.createElement('div')
        color.className = 'legend-color-box'
        color.style.backgroundColor = item.color

        const label = document.createElement('div')
        label.textContent = item.label
        label.className = 'legend-label'

        row.appendChild(color)
        row.appendChild(label)
        container.appendChild(row)
      })
  }

  updateLegend(container) {
    const wasInMobile = this.isMobile
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT

    // Only redraw if the viewport state has changed
    if (wasInMobile !== this.isMobile) {
      container.innerHTML = ''

      if (this.isMobile) {
        container.style.cssText = `width: 100%;`
        this.createMobileLegend(container)
      } else {
        container.style.cssText = `position: absolute; bottom: ${this.LEGEND_PADDING}px; right: ${this.LEGEND_PADDING}px; width: 120px;`
        this.createDesktopLegend(container)
      }
    }
  }

  initialize() {
    const legendContainer = this.createLegendContainer()
    this.updateLegend(legendContainer)

    // Use debounced resize handler
    const debouncedUpdate = this.debounce(() => {
      this.updateLegend(legendContainer)
    }, 250)

    // Add resize observer for more reliable viewport changes
    const resizeObserver = new ResizeObserver(debouncedUpdate)
    resizeObserver.observe(document.documentElement)

    // Also keep the window resize listener as a fallback
    window.addEventListener('resize', debouncedUpdate)
  }
}

// Run the code when you create a new MapLegend object
window.MapLegend = MapLegend
