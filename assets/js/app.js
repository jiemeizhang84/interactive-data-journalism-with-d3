// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(totalData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(totalData, d => d[chosenXAxis]) * 0.8,
                 d3.max(totalData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(totalData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(totalData, d => d[chosenYAxis]) * 0.8,
                 d3.max(totalData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);  
    return yAxis;
}

// function used for updating circles group with a transition to new circles
// upon click on x axis label
function renderCirclesXAxes(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));  
    return circlesGroup;
}

// function used for updating circles group with a transition to new circles
// upon click on y axis label
function renderCirclesYAxes(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    switch (chosenXAxis) {
        case "poverty":
            var xLabel = "Poverty: ";
            var xUnit = "%";
            break;
        case "age":
            var xLabel = "Age: ";
            var xUnit = "";
            break;
        case "household_income":
            var xLabel = "Household Income: $";
            var xUnit = "";
            break;
    }
    switch (chosenYAxis) {
        case "healthcare":
            var yLabel = "Lacks Healthcare: ";
            var yUnit = "%";
            break;
        case "smoke":
            var yLabel = "Smokes: ";
            var yUnit = "%";
            break;
        case "obese":
            var yLabel = "Obese: ";
            var yUnit = "%";
            break;
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([46, -83])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]} ${xUnit}<br>
        ${yLabel} ${d[chosenYAxis]} ${yUnit}`);
      });
 
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}



// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, totalData) {
  if (err) throw err;

  // Step 1: Parse Data/Cast as numbers
   // ==============================
  totalData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(totalData, d => d.poverty) * 0.8, d3.max(totalData, d => d.poverty) * 1.2])
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(totalData, d => d.healthcare)-2, d3.max(totalData, d => d.healthcare)+2])
    .range([height, 0]);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);



   // Step 5: Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("circle")
  .data(totalData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d.poverty))
  .attr("cy", d => yLinearScale(d.healthcare))
  .attr("r", "15")
  .attr("fill", "gold")
  .attr("opacity", ".9")
  .attr("stroke-width", "1")
  .attr("stroke", "white");
  

{/* <text x="20" y="20" font-family="sans-serif" font-size="20px" fill="red">Hello!</text>   */}
  chartGroup.selectAll("text")
  .data(totalData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d.poverty))
  .attr("y", d => yLinearScale(d.healthcare)+5)
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", "15px")
  .attr("fill", "grey")
  .text(d => d.abbr);

    // Step 4: Append Axes to the chart
  // ==============================

  chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

  chartGroup.append("g")
  .call(leftAxis);


  // Step 6: Initialize tool tip
  // ==============================
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([46, -83])
    .html(function(d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>Lack Healthcare: ${d.healthcare}%`);
    });

  // Step 7: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 8: Create event listeners to display and hide the tooltip
  // ==============================
  circlesGroup.on("click", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lack of Healthcare");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("class", "axisText")
    .text("Poverty");
});

