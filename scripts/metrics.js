// metrics.js
function initializeMetrics(currentData, previousData) {
  // Log input data for debugging purposes
  console.log("Initialize Metrics called with:", { currentData, previousData });

  // Get reference to metrics container element and clear any existing content
  const metricsContainer = document.querySelector(".metrics");
  metricsContainer.innerHTML = "";

  // Define metrics with their tooltips
  const metrics = [
    {
      label: window.headerContent?.metric_leaders_label || "Leaders Supported",
      value: currentData["total-leaders"],
      tooltip:
        window.headerContent?.metric_leaders_tooltip ||
        "Cumulative number of leaders of educator-preparation programs we've supported through our leadership programming.",
    },
    {
      label: window.headerContent?.metric_epps_label || "EPPs Served",
      value: currentData["total-epps"],
      tooltip:
        window.headerContent?.metric_epps_tooltip ||
        "Cumulative number of educator-preparation programs we've served through our programming.",
    },
    {
      label: window.headerContent?.metric_states_label || "States Reached",
      value: currentData["total-states-active"],
      tooltip:
        window.headerContent?.metric_states_tooltip ||
        "Cumulative number of states where we've supported leaders, served programs, and/or engaged in advocacy efforts.",
    },
    {
      label: window.headerContent?.metric_teachers_label || "Teachers Impacted",
      value: currentData["total-teachers"],
      tooltip:
        window.headerContent?.metric_teachers_tooltip ||
        "Cumulative number of current teachers we've impacted through our comprehensive support of the educator-preparation programs where they were enrolled.",
    },
  ];

  // Log processed metrics for debugging
  console.log("Processed metrics:", metrics);

  // Create and append DOM elements for each metric
  metrics.forEach((metric) => {
    // Create container div for metric card
    const card = document.createElement("div");
    card.className = "metric-card";

    // Create tooltip container for desktop
    const tooltipContainer = document.createElement("div");
    tooltipContainer.className = "tooltip-container desktop-only";
    tooltipContainer.innerHTML = `
      <div class="tooltip-icon">?</div>
      <div class="tooltip-content">${metric.tooltip}</div>
    `;

    // Set HTML content for metric card
    card.innerHTML = `
      <div class="metric-value">
        ${metric.value.toLocaleString()}
      </div>
      <div class="metric-label">
        <div class="label-text">${metric.label}</div>
      </div>
        <div class="mobile-tooltip">${metric.tooltip}</div>
    `;

    // Insert tooltip after the metric label
    const metricLabel = card.querySelector(".metric-label");
    metricLabel.appendChild(tooltipContainer);

    // Add completed metric card to metrics container
    metricsContainer.appendChild(card);
  });

  // Call this once after all metrics cards are created
  adjustTooltipPosition();
}

// Add this at the end of metrics.js after your initializeMetrics function
function adjustTooltipPosition() {
  const tooltips = document.querySelectorAll(".tooltip-container");

  tooltips.forEach((tooltip) => {
    tooltip.addEventListener("mouseenter", () => {
      const content = tooltip.querySelector(".tooltip-content");
      if (!content) return;

      // Get tooltip dimensions and position
      const rect = content.getBoundingClientRect();
      const iframe = window.frameElement;

      // If we're in an iframe and tooltip would be cut off
      if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();

        // Check if tooltip would extend beyond iframe bounds
        if (rect.right > iframeRect.right) {
          // Adjust positioning to keep it visible
          content.style.left = "auto";
          content.style.right = "0";
          content.style.transform = "none";
        }

        if (rect.left < iframeRect.left) {
          content.style.left = "0";
          content.style.right = "auto";
          content.style.transform = "none";
        }
      }
    });
  });
}
