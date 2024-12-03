// Load the CSV file
d3.csv("Dataset 4030.csv").then(data => {

    data.forEach(d => {
        d.white = +d.white;
        d.black = +d.black;
        d.total = +d.total;
    });

    let groupSelect = "Both";
    let currentCounty = "All";
    let currentGrade = "All";
    let xGrade;
    let yGrade;
    let xCounty;
    let yCounty;
    let xScale;
    let yScale;
    let dataScatterPlot;

    // Scatter Plot (White vs Black)
    const scatterContainer = d3.select("#scatterPlot");
    const scatterWidth = scatterContainer.node().getBoundingClientRect().width;
    const scatterHeight = 550;
  
    const scatterSvg = scatterContainer.append("svg")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight);
  
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight - 20)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Black Student Count");
  
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", -scatterHeight / 2)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("White Student Count");
  
    const drawScatterPlot = (dataScatterPlot, currentCounty, currentGrade) => {
        
        dataScatterPlot = data

        if(currentCounty !== "All") {
            dataScatterPlot = data.filter(d => d.county.includes(currentCounty));
        }

        if(currentGrade !== "All") {
            dataScatterPlot = dataScatterPlot.filter(d => d.grade.includes(currentGrade));
        }
        dataScatterPlot.forEach(d => {
            d.white = +d.white;
            d.black = +d.black;
            d.total = +d.total;
        });

        scatterSvg.selectAll("circle").remove(); 
        scatterSvg.selectAll(".x-axisScatter").remove();
        scatterSvg.selectAll(".y-axisScatter").remove();

        xScale = d3.scaleLinear()
        .domain([0, d3.max(dataScatterPlot, d => d.black)])
        .range([60, scatterWidth - 60]); 
  
        yScale = d3.scaleLinear()
        .domain([0, d3.max(dataScatterPlot, d => d.white)])
        .range([scatterHeight - 60, 60]);
  
        scatterSvg.append("g")
        .attr("transform", "translate(0, 490)")
        .attr("class", "x-axisScatter")
        .call(d3.axisBottom(xScale));
  
        scatterSvg.append("g")
        .attr("transform", "translate(60, 0)")
        .attr("class", "y-axisScatter")
        .call(d3.axisLeft(yScale));
  

        scatterSvg.selectAll("circle")
        .data(dataScatterPlot)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.black))
        .attr("cy", d => yScale(d.white))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");
    
            currentCounty = d.county;
            currentGrade = d.grade;

            drawCountyBars(groupSelect, currentCounty, currentGrade);
            drawGradeBars(groupSelect, currentGrade, currentCounty);
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "steelblue");

            currentCounty = "All";
            currentGrade = "All";

            drawCountyBars(groupSelect, currentCounty, currentGrade);
            drawGradeBars(groupSelect, currentGrade, currentCounty);
        });
    };
  
    drawScatterPlot(data, currentCounty, currentGrade);

    // Stacked Bar Chart (County Distribution)
    const countyContainer = d3.select("#countyBarChart");
    const countyWidth = countyContainer.node().getBoundingClientRect().width;
    const countyHeight = 550;
  
    const countySvg = countyContainer.append("svg")
        .attr("width", countyWidth)
        .attr("height", countyHeight);
  
    countySvg.append("text")
        .attr("class", "axis-label")
        .attr("x", countyWidth / 2)
        .attr("y", countyHeight)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("County");
  
    countySvg.append("text")
        .attr("class", "axis-label")
        .attr("x", -countyHeight / 2)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Student Count");

    const drawCountyBars = (group, currentCounty, currentGrade) => {
        countySvg.selectAll(".bar").remove(); 
        countySvg.selectAll(".x-axisCounty").remove();
        countySvg.selectAll(".y-axisCounty").remove();
    
        let filteredDataCounty;

        if (currentCounty === "All") {
            filteredDataCounty = Array.from(d3.group(data, d => d.county), ([key, values]) => ({
                county: key,
                white: d3.sum(values, d => d.white),
                black: d3.sum(values, d => d.black),
                grade: Array.from(new Set(values.map(d => d.grade)))
            }));
        } else {
            filteredDataCounty = data.filter(d => currentCounty.includes(d.county));
            filteredDataCounty = filteredDataCounty.filter(d => d.grade.includes(currentGrade));

            filteredDataCounty = Array.from(d3.group(filteredDataCounty, d => d.county), ([key, values]) => ({
                county: key,
                white: d3.sum(values, d => d.white),
                black: d3.sum(values, d => d.black),
                grade: Array.from(new Set(values.map(d => d.grade)))
            }));
        }


        if (group === "Both") {
            filteredDataCounty = filteredDataCounty.map(d => ({
                ...d,
                whiteTotal: d.white,
                blackTotal: d.black,
                grade: d.grade
            }));
        } else if (group === "White") {
            filteredDataCounty = filteredDataCounty.map(d => ({
                ...d,
                total: d.white,
            }));
        } else {
            filteredDataCounty = filteredDataCounty.map(d => ({
                ...d,
                total: d.black,
            }));
        }

        xCounty = d3.scaleBand()
        .domain(filteredDataCounty.map(d => d.county))
        .range([80, countyWidth - 60])
        .padding(0.2);

        yCounty = d3.scaleLinear()
        .domain([0, d3.max(filteredDataCounty, d => d.black + d.white)])
        .range([countyHeight - 60, 60]);

        countySvg.append("g")
        .attr("transform", "translate(0, 490)")
        .call(d3.axisBottom(xCounty).tickFormat(d => d.slice(0, 20)))
        .attr("class", "x-axisCounty")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-60)")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em");
  
        countySvg.append("g")
        .attr("transform", "translate(80, 0)")
        .attr("class", "y-axisCounty")
        .call(d3.axisLeft(yCounty));

        countySvg.selectAll(".bar")
            .data(filteredDataCounty)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xCounty(d.county))
            .attr("y", d => yCounty(d.total))
            .attr("width", xCounty.bandwidth())
            .attr("height", d => countyHeight - 60 - yCounty(d.total))
            .attr("fill", (group === "White") ? "#FF7F50" : (group === "Black") ? "#6495ED" : "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;

                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(filteredDataCounty, currentCounty, "All");
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(data, currentCounty, currentGrade);
            });
          
        countySvg.selectAll(".bar.white")
            .data(filteredDataCounty)
            .enter()
            .append("rect")
            .attr("class", "bar white")
            .attr("x", d => xCounty(d.county))
            .attr("y", d => yCounty(d.whiteTotal))
            .attr("width", xCounty.bandwidth())
            .attr("height", d => countyHeight - 60 - yCounty(d.whiteTotal))
            .attr("fill", "#FF7F50")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;

                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(filteredDataCounty, currentCounty, "All");
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(data, currentCounty, currentGrade);
            });

        countySvg.selectAll(".bar.black")
            .data(filteredDataCounty)
            .enter()
            .append("rect")
            .attr("class", "bar black")
            .attr("x", d => xCounty(d.county))
            .attr("y", d => yCounty(d.blackTotal + d.whiteTotal))
            .attr("width", xCounty.bandwidth())
            .attr("height", d => countyHeight - 60 - yCounty(d.blackTotal))
            .attr("fill", "#6495ED")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;
                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(filteredDataCounty, currentCounty, "All");
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawGradeBars(groupSelect, currentGrade, currentCounty);
                drawScatterPlot(data, currentCounty, currentGrade);
            });
    };
    
    drawCountyBars(groupSelect, currentCounty, currentGrade);
  
    // Stacked Bar Chart (By Grade)
    const gradeContainer = d3.select("#gradeBarChart");
    const gradeWidth = gradeContainer.node().getBoundingClientRect().width;
    const gradeHeight = 550;
  
    const gradeSvg = gradeContainer.append("svg")
        .attr("width", gradeWidth)
        .attr("height", gradeHeight);
  
    gradeSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", gradeWidth / 2)
        .attr("y", gradeHeight - 4)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Grade");
  
    gradeSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", -gradeHeight / 2)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Student Count");
  
    const drawGradeBars = (group, currentGrade, currentCounty) => {
        gradeSvg.selectAll(".bar").remove();
        gradeSvg.selectAll(".x-axisGrade").remove();
        gradeSvg.selectAll(".y-axisGrade").remove();
        
        let filteredData;
        if (currentGrade === "All") {
            filteredData = Array.from(d3.group(data, d => d.grade), ([key, values]) => ({
                grade: key,
                black: d3.sum(values, d => d.black),
                white: d3.sum(values, d => d.white),
                county: Array.from(new Set(values.map(d => d.county)))
            }));
        } else {
            filteredData = data.filter(d => currentGrade.includes(d.grade));
            filteredData = filteredData.filter(d => d.county.includes(currentCounty));

            filteredData = Array.from(d3.group(filteredData, d => d.grade), ([key, values]) => ({
                grade: key,
                black: d3.sum(values, d => d.black),
                white: d3.sum(values, d => d.white),
                county: Array.from(new Set(values.map(d => d.county)))
            }));
        }

        if (group === "Both") {
            filteredData = filteredData.map(d => ({
                ...d,
                whiteTotal: d.white,
                blackTotal: d.black,
                county: d.county
            }));
        } else if (group === "White") {
            filteredData = filteredData.map(d => ({
                ...d,
                total: d.white,
            }));
        } else {
            filteredData = filteredData.map(d => ({
                ...d,
                total: d.black,
            }));
        }

        xGrade = d3.scaleBand()
        .domain(filteredData.map(d => d.grade))
        .range([80, gradeWidth - 60])
        .padding(0.1);
  
        yGrade = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.black + d.white)])
        .range([gradeHeight - 60, 60]);

        gradeSvg.append("g")
        .attr("transform", "translate(0, 490)")
        .call(d3.axisBottom(xGrade).tickFormat(d => d.slice(0, 18)))
        .attr("class", "x-axisGrade")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");
  
        gradeSvg.append("g")
        .attr("transform", "translate(80, 0)")
        .attr("class", "y-axisGrade")
        .call(d3.axisLeft(yGrade));
    
        gradeSvg.selectAll(".bar")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xGrade(d.grade))
            .attr("y", d => yGrade(d.total))
            .attr("width", xGrade.bandwidth())
            .attr("height", d => gradeHeight - 60 - yGrade(d.total))
            .attr("fill", (group === "White") ? "#FF7F50" : (group === "Black") ? "#6495ED" : "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;

                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(filteredData, "All", currentGrade);
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(data, currentCounty, currentGrade);
            });

        gradeSvg.selectAll(".bar.white")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("class", "bar white")
            .attr("x", d => xGrade(d.grade))
            .attr("y", d => yGrade(d.whiteTotal))
            .attr("width", xGrade.bandwidth())
            .attr("height", d => gradeHeight - 60 - yGrade(d.whiteTotal))
            .attr("fill", "#FF7F50")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;
        
                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(filteredData, "All", currentGrade);
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(data, currentCounty, currentGrade);
            });
    
        gradeSvg.selectAll(".bar.black")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("class", "bar black")
            .attr("x", d => xGrade(d.grade))
            .attr("y", d => yGrade(d.blackTotal + d.whiteTotal))
            .attr("width", xGrade.bandwidth())
            .attr("height", d => gradeHeight - 60 - yGrade(d.blackTotal))
            .attr("fill", "#6495ED")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "black").style("stroke-width", "2px");
        
                currentCounty = d.county;
                currentGrade = d.grade;

                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(filteredData, "All", currentGrade);
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none");
    
                currentCounty = "All";
                currentGrade = "All";

                drawCountyBars(groupSelect, currentCounty, currentGrade);
                drawScatterPlot(data, currentCounty, currentGrade);
            });
    };

    drawGradeBars(groupSelect, currentGrade, currentCounty);

    d3.select("#groupSelectDropdown").on("change", function() {
        groupSelect = this.value;
        drawCountyBars(groupSelect, currentCounty, currentGrade);
        drawGradeBars(groupSelect, currentGrade, currentCounty);
        drawScatterPlot(data, currentCounty, currentGrade);

    });

  });
  