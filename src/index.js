import * as d3 from 'd3';

const gdpURL = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json`;

const xPadding = 60;
const yPadding = 20;
const width = 800;
const height = 450;

const svgContainer = d3
  .select('.chart-container')
  .append('svg')
  .attr('width', width + 50)
  .attr('height', height + 50)
  .attr('transform', `translate(${xPadding}, ${yPadding})`);

const overlay = d3
  .select('.chart-container')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

const tooltip = d3
  .select('.chart-container')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

svgContainer
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -200)
  .attr('y', xPadding + 20)
  .text('Gross Domestic Product');

svgContainer
  .append('text')
  .attr('x', width / 2 + 120)
  .attr('y', height + 50)
  .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
  .attr('class', 'info');

const createXScale = (dataArr, minRange, maxRange) => {
  const xMax = d3.max(dataArr.map(i => new Date(i[0])));
  const xMin = d3.min(dataArr.map(i => new Date(i[0])));

  xMax.setMonth(xMax.getMonth() + 3);
  const xScale = d3
    .scaleTime()
    .domain([xMin, xMax])
    .range([minRange, maxRange]);
  return xScale;
};
const createYScale = (dataArr, minRange, maxRange) => {
  const yMax = d3.max(dataArr.map(i => i[1]));
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([minRange, maxRange]);
  return yScale;
};

const createTooltip = (yearDate, gdp) => {
  const year = new Date(yearDate).getFullYear();
  const month = new Date(yearDate).getMonth();
  const quarter =
    month === 0 ? 'Q1' : month === 1 ? 'Q2' : month === 2 ? 'Q3' : 'Q4';

  return ` ${year} ${quarter} <br>
    ${gdp} Billion
  `;
};

const handleHoverIn = (barWidth, barHeight, xPos, data) => {
  const tooltipText = createTooltip(data[0], data[1]);

  overlay
    .transition()
    .duration(50)
    .style('width', `${barWidth}px`)
    .style('height', `${barHeight}px`)
    .style('opacity', '1')
    .style('left', `${xPos}px`)
    .style('top', `${height - barHeight}px`)
    .style('transform', `translate(${xPadding}px, ${yPadding}px)`);

  tooltip
    .transition()
    .duration(200)
    .style('opacity', '0.9');

  tooltip
    .html(tooltipText)
    .attr('data-date', data[0])
    .style('left', `${xPos}px`)
    .style('top', `${height - barHeight / 2}px`)
    .style('transform', `translate(${xPadding}px, ${yPadding}px)`);
};

const handleHoverOut = () => {
  overlay
    .transition()
    .duration(50)
    .style('opacity', '0');

  tooltip
    .transition()
    .duration(200)
    .style('opacity', '0');
};

const renderScale = (xAxisScale, yAxisScale) => {
  const xAxisGroup = d3.axisBottom(xAxisScale);
  const yAxisGroup = d3.axisLeft(yAxisScale);
  svgContainer
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisGroup);

  svgContainer
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${xPadding}, 0)`)
    .call(yAxisGroup);
};

const renderChart = (xScale, yScale, dataArr) => {
  const barWidth = width / dataArr.length;
  // yAxisScale range need to be inverted so it can start drawing from bottom to top
  svgContainer
    .selectAll('rect')
    .data(dataArr)
    .enter()
    .append('rect')
    .attr('data-date', d => d[0])
    .attr('data-gdp', d => d[1])
    .attr('class', 'bar')
    .attr('x', d => xScale(new Date(d[0])))
    .attr('y', d => height - yScale(d[1]))
    .style('height', d => yScale(d[1]))
    .style('width', barWidth)
    .style('fill', 'blue')
    .on('mouseover', d => {
      const barHeight = yScale(d[1]);
      const xPos = xScale(new Date(d[0]));
      handleHoverIn(barWidth, barHeight, xPos, d);
    })
    .on('mouseleave', handleHoverOut);
};

d3.json(gdpURL)
  .then(res => {
    //  turn month into quarter
    // find xMaxMin and yMaxMin
    //  create xScale & yScale
    // create <rect> using xScale & yScale

    const xScale = createXScale(res.data, xPadding, width);
    const yScale = createYScale(res.data, 0, height - yPadding);
    const yAxisScale = createYScale(res.data, height, yPadding); //

    renderChart(xScale, yScale, res.data);
    renderScale(xScale, yAxisScale);
  })
  .catch(err => console.error(err.responsesd.data));
