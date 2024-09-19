// Set up SVG canvas dimensions
const svg = d3.select("svg"),
    margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

// Append g element for the chart
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Time-based x scale and linear y scale
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Axes
const xAxis = g.append("g").attr("transform", `translate(0,${height})`);
const yAxis = g.append("g");

// Define a line generator
const lineGenerator = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));

// Sample reference line data (fixed with respect to time)
let refData1 = [
  { time: new Date(2024, 8, 19), value: 50 },
  { time: new Date(2024, 8, 20), value: 70 },
  { time: new Date(2024, 8, 21), value: 60 }
];

let refData2 = [
  { time: new Date(2024, 8, 19), value: 40 },
  { time: new Date(2024, 8, 20), value: 80 },
  { time: new Date(2024, 8, 21), value: 65 }
];

// Dynamic lines data (movable)
let dynamicLines = [
  {
    color: "green",
    data: [
      { time: new Date(2024, 8, 19), value: 30 },
      { time: new Date(2024, 8, 20), value: 60 },
      { time: new Date(2024, 8, 21), value: 50 }
    ],
    id: 0
  },
  {
    color: "orange",
    data: [
      { time: new Date(2024, 8, 19), value: 20 },
      { time: new Date(2024, 8, 20), value: 50 },
      { time: new Date(2024, 8, 21), value: 45 }
    ],
    id: 1
  }
];

// Set the domains of the scales
x.domain(d3.extent(refData1, d => d.time));
y.domain([0, d3.max(refData2, d => d.value)]);

// Add the fixed reference lines
g.append("path")
  .datum(refData1)
  .attr("class", "ref-line")
  .attr("fill", "none")
  .attr("stroke", "blue")
  .attr("stroke-dasharray", "5,5")
  .attr("d", lineGenerator);

g.append("path")
  .datum(refData2)
  .attr("class", "ref-line")
  .attr("fill", "none")
  .attr("stroke", "red")
  .attr("stroke-dasharray", "5,5")
  .attr("d", lineGenerator);

// Add axes
xAxis.call(d3.axisBottom(x));
yAxis.call(d3.axisLeft(y));

// Add dynamic lines
function drawLines(lines) {
  g.selectAll(".dynamic-line").remove();  // Clear only the dynamic lines

  lines.forEach(line => {
    g.append("path")
      .datum(line.data)
      .attr("class", "dynamic-line")
      .attr("fill", "none")
      .attr("stroke", line.color)
      .attr("stroke-width", line.id === selectedLineIndex ? 4 : 2)  // Highlight selected line
      .attr("id", `line-${line.id}`)
      .attr("d", lineGenerator);  // Draw the line
  });
}

// Draw dynamic lines initially
drawLines(dynamicLines);

// Track the currently selected line for movement
let selectedLineIndex = 0;

// Function to move the selected line
function moveSelectedLine(moveAmount) {
  let selectedLine = dynamicLines[selectedLineIndex];

  selectedLine.data.forEach(d => {
    d.time = new Date(d.time.getTime() + moveAmount);
  });

  // Ensure the line stays within the x-axis range
  let minTime = d3.min(selectedLine.data, d => d.time);
  let maxTime = d3.max(selectedLine.data, d => d.time);

  if (minTime < x.domain()[0] || maxTime > x.domain()[1]) {
    selectedLine.data.forEach(d => {
      d.time = new Date(d.time.getTime() - moveAmount);  // Revert movement if out of bounds
    });
  }

  drawLines(dynamicLines);  // Redraw lines with the updated data
}

// Event listener for keyboard input
document.addEventListener("keydown", (event) => {
  const moveAmount = 1000 * 60 * 60 * 24;  // Move by one day

  if (event.key === "ArrowLeft") {
    moveSelectedLine(-moveAmount);
  } else if (event.key === "ArrowRight") {
    moveSelectedLine(moveAmount);
  } else if (event.key === "ArrowUp") {
    // Switch to the previous line (if any)
    selectedLineIndex = (selectedLineIndex > 0) ? selectedLineIndex - 1 : dynamicLines.length - 1;
    drawLines(dynamicLines);  // Redraw lines with new selection
  } else if (event.key === "ArrowDown") {
    // Switch to the next line (if any)
    selectedLineIndex = (selectedLineIndex < dynamicLines.length - 1) ? selectedLineIndex + 1 : 0;
    drawLines(dynamicLines);  // Redraw lines with new selection
  }
});
