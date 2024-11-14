// Load the CSV file
d3.csv("Dataset 4030.csv").then(data => {

    data.forEach(d => {
        d.white = +d.white;
        d.black = +d.black;
        d.total = +d.total;
    });
  
    // Scatter Plot (White vs Black)
    const scatterContainer = d3.select("#scatterPlot");
    const scatterWidth = scatterContainer.node().getBoundingClientRect().width;
    const scatterHeight = 550;
  
    const scatterSvg = scatterContainer.append("svg")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight);
  
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.black)])
        .range([60, scatterWidth - 60]); 
  
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.white)])
        .range([scatterHeight - 60, 60]);
  
    scatterSvg.append("g")
        .attr("transform", "translate(0, 490)")
        .call(d3.axisBottom(xScale));
  
    scatterSvg.append("g")
        .attr("transform", "translate(60, 0)")
        .call(d3.axisLeft(yScale));
  
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
  
    scatterSvg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.black))
        .attr("cy", d => yScale(d.white))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);
  
    // Stacked Bar Chart (County Distribution)
    const countyContainer = d3.select("#countyBarChart");
    const countyWidth = countyContainer.node().getBoundingClientRect().width;
    const countyHeight = 550;
  
    const countySvg = countyContainer.append("svg")
        .attr("width", countyWidth)
        .attr("height", countyHeight);
  
    const countyData = Array.from(d3.group(data, d => d.county), ([key, values]) => ({
        county: key,
        black: d3.sum(values, d => d.black),
        white: d3.sum(values, d => d.white)
    }));
  
    const xCounty = d3.scaleBand()
        .domain(countyData.map(d => d.county))
        .range([80, countyWidth - 60])
        .padding(0.2);
  
    const yCounty = d3.scaleLinear()
        .domain([0, d3.max(countyData, d => d.black + d.white)])
        .range([countyHeight - 60, 60]);
  
    countySvg.append("g")
        .attr("transform", "translate(0, 490)")
        .call(d3.axisBottom(xCounty).tickFormat(d => d.slice(0, 20)))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-60)")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em");
  
    countySvg.append("g")
        .attr("transform", "translate(80, 0)")
        .call(d3.axisLeft(yCounty));
  
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
  
    countySvg.selectAll("rect.white")
        .data(countyData)
        .enter()
        .append("rect")
        .attr("class", "white")
        .attr("x", d => xCounty(d.county))
        .attr("y", d => yCounty(d.white))
        .attr("width", xCounty.bandwidth())
        .attr("height", d => countyHeight - 60 - yCounty(d.white))
        .attr("fill", "#FF7F50");
  
    countySvg.selectAll("rect.black")
        .data(countyData)
        .enter()
        .append("rect")
        .attr("class", "black")
        .attr("x", d => xCounty(d.county))
        .attr("y", d => yCounty(d.black + d.white))
        .attr("width", xCounty.bandwidth())
        .attr("height", d => countyHeight - 60 - yCounty(d.black))
        .attr("fill", "#6495ED");
  
    // Stacked Bar Chart (By Grade)
    const gradeContainer = d3.select("#gradeBarChart");
    const gradeWidth = gradeContainer.node().getBoundingClientRect().width;
    const gradeHeight = 550;
  
    const gradeSvg = gradeContainer.append("svg")
        .attr("width", gradeWidth)
        .attr("height", gradeHeight);
  
    const gradeData = Array.from(d3.group(data, d => d.grade), ([key, values]) => ({
        grade: key,
        black: d3.sum(values, d => d.black),
        white: d3.sum(values, d => d.white)
    }));
  
    const xGrade = d3.scaleBand()
        .domain(gradeData.map(d => d.grade))
        .range([80, gradeWidth - 60])
        .padding(0.1);
  
    const yGrade = d3.scaleLinear()
        .domain([0, d3.max(gradeData, d => d.black + d.white)])
        .range([gradeHeight - 60, 60]);
  
    gradeSvg.append("g")
        .attr("transform", "translate(0, 490)")
        .call(d3.axisBottom(xGrade).tickFormat(d => d.slice(0, 18)))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");
  
    gradeSvg.append("g")
        .attr("transform", "translate(80, 0)")
        .call(d3.axisLeft(yGrade));
  
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
  
    gradeSvg.selectAll("rect.white")
        .data(gradeData)
        .enter()
        .append("rect")
        .attr("class", "white")
        .attr("x", d => xGrade(d.grade))
        .attr("y", d => yGrade(d.white))
        .attr("width", xGrade.bandwidth())
        .attr("height", d => gradeHeight - 60 - yGrade(d.white))
        .attr("fill", "#FF7F50");
  
    gradeSvg.selectAll("rect.black")
        .data(gradeData)
        .enter()
        .append("rect")
        .attr("class", "black")
        .attr("x", d => xGrade(d.grade))
        .attr("y", d => yGrade(d.black + d.white))
        .attr("width", xGrade.bandwidth())
        .attr("height", d => gradeHeight - 60 - yGrade(d.black))
        .attr("fill", "#6495ED");
  });
  