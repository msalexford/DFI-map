// scripts/metrics.js

function initializeMetrics(currentData, previousData) {
  console.log("Initialize Metrics called with:", { currentData, previousData });

  const metricsContainer = document.querySelector(".metrics");
  metricsContainer.innerHTML = "";

  const calculateGrowth = (current, previous) => {
    console.log("Calculating growth:", { current, previous });

    if (!previous || !current) {
      console.log("No previous or current data, returning +0%");
      return "+0%";
    }

    const growth = ((current - previous) / previous) * 100;
    const formattedGrowth =
      growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
    console.log("Calculated growth:", formattedGrowth);
    return formattedGrowth;
  };

  const metrics = [
    {
      label: "Network Leaders",
      value: currentData["total-leaders"],
      growth: calculateGrowth(
        currentData["total-leaders"],
        previousData?.["total-leaders"]
      ),
    },
    {
      label: "EPPs Served",
      value: currentData["total-epps"],
      growth: calculateGrowth(
        currentData["total-epps"],
        previousData?.["total-epps"]
      ),
    },
    {
      label: "Active States",
      value: currentData["total-states-active"],
      growth: calculateGrowth(
        currentData["total-states-active"],
        previousData?.["total-states-active"]
      ),
    },
    {
      label: "Teachers Impacted",
      value: currentData["total-teachers"],
      growth: calculateGrowth(
        currentData["total-teachers"],
        previousData?.["total-teachers"]
      ),
    },
  ];

  console.log("Processed metrics:", metrics);

  metrics.forEach((metric) => {
    const card = document.createElement("div");
    card.className = "metric-card";
    card.innerHTML = `
      <div class="metric-label">
        ${metric.label}
      </div>
      <div class="metric-value">
        ${metric.value.toLocaleString()}
        <span class="growth">↗ ${metric.growth}</span>
      </div>
    `;
    metricsContainer.appendChild(card);
  });
}
