// Modified initializeTimeline function
function initializeTimeline(startYear, endYear, yearCallback) {
  const container = d3.select("#timeline");
  container.html("");

  const timelineContainer = container
    .append("div")
    .attr("class", "timeline-container");

  // Play button
  const playButton = timelineContainer
    .append("button")
    .attr("class", "play-button")
    .html(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
    );

  // Timeline track with dots
  const timelineTrack = timelineContainer
    .append("div")
    .attr("class", "timeline-track");

  // Add thumb with year label
  const thumbContainer = timelineTrack
    .append("div")
    .attr("class", "thumb-container");

  const customThumb = thumbContainer
    .append("div")
    .attr("class", "custom-thumb");

  const thumbLabel = thumbContainer
    .append("div")
    .attr("class", "thumb-label year-label-active");

  const timeline = timelineTrack
    .append("input")
    .attr("type", "range")
    .attr("min", startYear)
    .attr("max", endYear)
    .attr("value", startYear)
    .attr("step", 1)
    .attr("class", "timeline-slider");

  // Add dots
  const dotsContainer = timelineTrack
    .append("div")
    .attr("class", "timeline-dots");

  for (let year = startYear; year <= endYear; year++) {
    dotsContainer
      .append("div")
      .attr("class", "timeline-dot")
      .style("left", `${((year - startYear) / (endYear - startYear)) * 100}%`)
      .attr("data-year", year);
  }

  // Reset button
  const resetButton = timelineContainer
    .append("button")
    .attr("class", "reset-button")
    .html(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
    );

  // Year labels at ends
  const yearLabels = container.append("div").attr("class", "year-labels");
  yearLabels
    .append("span")
    .attr("class", "year-label")
    .attr("data-year", startYear)
    .text(startYear);
  yearLabels
    .append("span")
    .attr("class", "year-label")
    .attr("data-year", endYear)
    .text(endYear);

  let isPlaying = false;
  let interval;

  function updateDots(selectedYear) {
    d3.selectAll(".timeline-dot").classed("active", function () {
      return parseInt(d3.select(this).attr("data-year")) <= selectedYear;
    });
  }

  function updateYearLabels(selectedYear) {
    // Update end labels
    d3.selectAll(".year-label")
      .classed("year-label-active", function () {
        return parseInt(d3.select(this).attr("data-year")) === selectedYear;
      })
      .classed("year-label-inactive", function () {
        return parseInt(d3.select(this).attr("data-year")) !== selectedYear;
      });

    // Only show thumb label if we're not at the ends
    const isEndYear = selectedYear === startYear || selectedYear === endYear;
    thumbLabel.style("opacity", isEndYear ? "0" : "1");

    if (!isEndYear) {
      thumbLabel.text(selectedYear);
    }
  }

  function updateYear(year) {
    console.log("Timeline updating year to:", year);
    timeline.property("value", year);
    updateDots(year);
    updateYearLabels(year);
    const percentage = ((year - startYear) / (endYear - startYear)) * 100;
    thumbContainer.style("left", `${percentage}%`);

    // Call the provided callback
    if (yearCallback) {
      console.log("Calling year callback with:", year);
      yearCallback(year);
    }
  }

  function play() {
    if (isPlaying) return;
    isPlaying = true;
    playButton.html(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
    );

    interval = setInterval(() => {
      let currentYear = parseInt(timeline.property("value"));
      if (currentYear >= endYear) {
        pause();
        return;
      }
      updateYear(currentYear + 1);
    }, 1000);
  }

  function pause() {
    if (!isPlaying) return;
    isPlaying = false;
    playButton.html(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
    );
    clearInterval(interval);
  }

  // Event listeners
  playButton.on("click", () => (isPlaying ? pause() : play()));
  resetButton.on("click", () => {
    pause();
    updateYear(startYear);
  });

  timeline.on("input", function () {
    const year = parseInt(this.value);
    updateYear(year);
  });

  d3.selectAll(".timeline-dot").on("click", function () {
    const year = parseInt(d3.select(this).attr("data-year"));
    updateYear(year);
  });

  // Initialize position
  updateYear(startYear);
}
