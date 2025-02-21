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
      label: "Leaders Supported",
      value: currentData["total-leaders"],
      tooltip:
        "Cumulative number of leaders of educator-preparation programs we've supported through our leadership programming.",
    },
    {
      label: "EPPs Served",
      value: currentData["total-epps"],
      tooltip:
        "Cumulative number of educator-preparation programs we've served through our programming.",
    },
    {
      label: "States Reached",
      value: currentData["total-states-active"],
      tooltip:
        "Cumulative number of states where we've supported leaders, served programs, and/or engaged in advocacy efforts.",
    },
    {
      label: "Teachers Impacted",
      value: currentData["total-teachers"],
      tooltip:
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
      <div class="tooltip-icon">i</div>
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
}
