// scripts/legend.js

class MapLegend {
  constructor(containerId, options = {}) {
    this.MOBILE_BREAKPOINT = options.mobileBreakpoint || 768;
    this.LEGEND_PADDING = options.legendPadding || 20;
    this.container = document.getElementById(containerId);
    this.legendData = [
      { label: "<100", color: "#F0F9E8" },
      { label: "100-500", color: "#76CABB" },
      { label: "500-1000", color: "#4BA8C9" },
      { label: "1000-2000", color: "#1D79B5" },
      { label: "2000+", color: "#26347E" },
    ];

    this.initialize();
  }

  createLegendContainer() {
    const legendContainer = document.createElement("div");
    legendContainer.className = "legend-container";
    this.container.appendChild(legendContainer);
    return legendContainer;
  }

  createMobileLegend(container) {
    const legendWrapper = document.createElement("div");
    legendWrapper.className = "legend-wrapper";

    const title = document.createElement("div");
    title.textContent = "TEACHERS IMPACTED";
    title.className = "legend-title";

    const colorBar = document.createElement("div");
    colorBar.className = "legend-color-bar";

    this.legendData.forEach((item) => {
      const colorSection = document.createElement("div");
      colorSection.className = "legend-color-section";
      colorSection.style.backgroundColor = item.color;
      colorBar.appendChild(colorSection);
    });

    const labelsContainer = document.createElement("div");
    labelsContainer.className = "legend-labels";

    this.legendData.forEach((item) => {
      const label = document.createElement("div");
      label.textContent = item.label;
      label.className = "legend-label";
      labelsContainer.appendChild(label);
    });

    legendWrapper.appendChild(title);
    legendWrapper.appendChild(colorBar);
    legendWrapper.appendChild(labelsContainer);
    container.appendChild(legendWrapper);
  }

  createDesktopLegend(container) {
    const title = document.createElement("div");
    title.textContent = "Teachers Impacted";
    title.className = "legend-title";
    container.appendChild(title);

    this.legendData
      .slice()
      .reverse()
      .forEach((item) => {
        const row = document.createElement("div");
        row.className = "legend-row";

        const color = document.createElement("div");
        color.className = "legend-color-box";
        color.style.backgroundColor = item.color;

        const label = document.createElement("div");
        label.textContent = item.label;
        label.className = "legend-label";

        row.appendChild(color);
        row.appendChild(label);
        container.appendChild(row);
      });
  }

  updateLegend(container) {
    const isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
    container.innerHTML = "";

    if (isMobile) {
      container.style.cssText = `width: 100%; margin-top: 20px;`;
      this.createMobileLegend(container);
    } else {
      container.style.cssText = `position: absolute; bottom: ${this.LEGEND_PADDING}px; right: ${this.LEGEND_PADDING}px; width: 120px;`;
      this.createDesktopLegend(container);
    }
  }

  initialize() {
    const legendContainer = this.createLegendContainer();
    this.updateLegend(legendContainer);
    window.addEventListener("resize", () => this.updateLegend(legendContainer));
  }
}

window.MapLegend = MapLegend;
