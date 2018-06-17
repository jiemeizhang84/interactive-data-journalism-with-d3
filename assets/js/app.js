// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

makeResponsive();

function makeResponsive() {

  var svgArea = d3.select(".chart").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
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
          .domain([d3.min(totalData, d => d[chosenXAxis]) * 0.9,
                  d3.max(totalData, d => d[chosenXAxis]) * 1.1])
          .range([0, width]);
      return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(totalData, chosenYAxis) {
      var yLinearScale = d3.scaleLinear()
          .domain([d3.min(totalData, d => d[chosenYAxis]) * 0.6,
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

  // function used for updating circle text position upon click on x axis label
  function renderCirclesTextXAxes(circleText, newXScale, chosenXAxis) {
    circleText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
    return circleText;
  }

  // function used for updating circle text position upon click on y axis label
  function renderCirclesTextYAxes(circleText, newYScale, chosenYAxis) {
    circleText.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]) + 4);
    return circleText;
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
          case "income":
              var xLabel = "Household Income: $";
              var xUnit = "";
              break;
      }
      switch (chosenYAxis) {
          case "healthcare":
              var yLabel = "Lacks Healthcare: ";
              var yUnit = "%";
              break;
          case "smokes":
              var yLabel = "Smokes: ";
              var yUnit = "%";
              break;
          case "obesity":
              var yLabel = "Obesity: ";
              var yUnit = "%";
              break;
      }

      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([46, -83])
        .html(function(d) {
          return (`${d.state}<hr>${xLabel} ${d[chosenXAxis]} ${xUnit}<br>
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

    // Parse Data/Cast as numbers
    totalData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // LinearScale function 
    var xLinearScale = xScale(totalData, chosenXAxis);
    var yLinearScale = yScale(totalData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    if (width < 400) {
      var leftAxis = d3.axisLeft(yLinearScale).ticks(5);
    } else {
      var leftAxis = d3.axisLeft(yLinearScale);
    }

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(totalData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 0.02*width)
    .attr("fill", "gold")
    .attr("opacity", ".9")
    .attr("stroke-width", "1")
    .attr("stroke", "white");  

    // add state abbreviation in circles
    if (width < 400) {
      var circleText = chartGroup.selectAll("text")
      .data(totalData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+4)
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 0)
      .attr("fill", "grey")
      .text(d => d.abbr);
    } else {
      var circleText = chartGroup.selectAll("text")
      .data(totalData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+4)
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 0.02*width)
      .attr("fill", "grey")
      .text(d => d.abbr);
    }

    // Append Axes to the chart
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
      .attr("class", "axisText")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
      .attr("class", "axisText")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("class", "axisText")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // y-axis label
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("class", "axisText")  
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare") // value to grab for event listener
      .attr("dy", "1em")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokeLabel = yLabelsGroup.append("text")
      .attr("class", "axisText")  
      .attr("y", 0 - margin.left + 30)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes") // value to grab for event listener
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("Smokes (%)"); 
      
    var obesityLabel = yLabelsGroup.append("text")
      .attr("class", "axisText")  
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .attr("dy", "1em")
      .classed("inactive", true)
      .text("Obese (%)"); 

    // updateToolTip function 
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");    
        // console.log(this);
  
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(totalData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCirclesXAxes(circlesGroup, xLinearScale, chosenXAxis);
          // updates circles text with new x values
          circleText = renderCirclesTextXAxes(circleText, xLinearScale, chosenXAxis);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      });


    yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      
      console.log(this);  
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis);

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(totalData, chosenYAxis);
        console.log("yLinearScale" + yLinearScale);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        console.log("yAxis" + yAxis);

        // updates circles with new y values
        circlesGroup = renderCirclesYAxes(circlesGroup, yLinearScale, chosenYAxis);
        // updates circles text with new y values
        circleText = renderCirclesTextYAxes(circleText, yLinearScale, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });
  });

}
