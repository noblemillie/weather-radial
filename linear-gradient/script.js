///////////////////////////////////////////////////////////////////////////
//////////////////// Set up and initiate svg containers ///////////////////
///////////////////////////////////////////////////////////////////////////

var margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20
};
var width = window.innerWidth - margin.left - margin.right - 10;
var height = window.innerHeight - margin.top - margin.bottom - 10;

//SVG container
var svg = d3
	.select('#weatherRadial')
	.append('svg')
	.attr('width', width + margin.left + margin.right - 100)
	.attr('height', height + margin.top + margin.bottom - 50)
	.style('background-color', 'snow')
	// .style('background-color', 'rgba(240, 240, 240, 0.1)')
	.style('border', '1px solid blue')
	.append('g')
	.attr(
		'transform',
		'translate(' +
			(margin.left + width / 2) +
			',' +
			(margin.top + height / 2) +
			')'
	);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create scales ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Parses a string into a date
var parseDate = d3.time.format('%Y-%m-%d').parse;

//Turn strings into actual numbers/dates
weatherData.forEach(function(d) {
	d.date = parseDate(d.date);
	console.log(`date: `, d.date);
});

//Set the minimum inner radius and max outer radius of the chart
var outerRadius = Math.min(width, height, 500) / 2,
	innerRadius = outerRadius * 0.2;

//Base the color scale on average temperature extremes
var colorScale = d3.scale
	.linear()
	.domain([-15, 7.5, 30])
	.range(['dodgerblue', '#ffff8c', 'crimson'])
	.interpolate(d3.interpolateHcl);

//Base the color scale on average temperature extremes
var axisColorScale = d3.scale
	.linear()
	.domain([-15, 7.5, 30])
	.range(['dodgerblue', '#ffff8c', 'crimson'])
	.interpolate(d3.interpolateHcl);

//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
var barScale = d3.scale
	.linear()
	.range([innerRadius, outerRadius])
	.domain([-15, 25]);

//Scale to turn the date into an angle of 360 degrees in total
//With the first datapoint (Jan 1st) on top
var angle = d3.scale
	.linear()
	.range([-180, 180])
	.domain(
		d3.extent(weatherData, function(d) {
			return d.date;
		})
	);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Create Titles ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var textWrapper = svg
	.append('g')
	.attr('class', 'textWrapper')
	.attr(
		'transform',
		'translate(' + Math.max(-width / 2, -outerRadius - 0) + ',' + -10 + ')'
	);

//Append title to the top
textWrapper
	.append('text')
	.attr('class', 'title')
	.attr('x', 0)
	.attr('y', -outerRadius - 40)
	.text('Historic Daily Temperature Ranges');
textWrapper
	.append('text')
	.attr('class', 'subtitle')
	.attr('x', 0)
	.attr('y', -outerRadius - 20)
	.text('2015');

//Append credit at bottom
textWrapper
	.append('text')
	.attr('class', 'credit')
	.attr('x', 0)
	.attr('y', outerRadius + 120)
	.text('Based on weather-radials.com');

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Create Axes /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Wrapper for the bars and to position it downward
var barWrapper = svg
	.append('g')
	.attr('transform', 'translate(' + 0 + ',' + 0 + ')');

//Draw gridlines below the bars
var axes = barWrapper
	.selectAll('.gridCircles')
	.data([-20, -10, 0, 10, 20, 30])
	.enter()
	.append('g');
//Draw the circles
axes
	.append('circle')
	.attr('class', 'axisCircles')
	.style('stroke-width', 1)
	.style('stroke', function(d) {
		return axisColorScale(d);
	})
	// .style('fill', 'azure')
	// .style('fill', function(d, i) {
	// 	return axisColorScale(d / 3);
	// })
	// .attr('offset', function(d, i) {
	// 	return axisColorScale(i);
	// })
	.style('opacity', 0.4)
	.attr('r', function(d) {
		return barScale(d);
	});
//Draw the axis labels
axes
	.append('text')
	.attr('class', 'axisText')
	.attr('y', function(d) {
		return barScale(d);
	})
	.attr('dy', '0.3em')
	.text(function(d) {
		return d + '°C';
	});

//Add January for reference
barWrapper
	.append('text')
	.attr('class', 'january')
	.attr('x', 7)
	.attr('y', -outerRadius * 1.1)
	.attr('dy', '2em')
	.text('January');

//Add December for reference
barWrapper
	.append('text')
	.attr('class', 'january')
	.attr('x', -75)
	.attr('y', -outerRadius * 1.1)
	.attr('dy', '2em')
	.text('December');
//Add a line to split the year
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * 0.15)
	.attr('x2', 0)
	.attr('y2', -outerRadius * 1.1);

///////////////////////////////////////////////////////////////////////////
////////////////////////////// Draw bars //////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//Draw a bar per day were the height is the difference between the minimum and maximum temperature
//And the color is based on the mean temperature
barWrapper
	.selectAll('.tempBar')
	.data(weatherData)
	.enter()
	.append('rect')
	.attr('class', 'tempBar')
	.attr('transform', function(d, i) {
		return 'rotate(' + angle(d.date) + ')';
	})
	.attr('width', 1.5)
	.attr('height', function(d, i) {
		return barScale(d.max_temp) - barScale(d.min_temp);
	})
	.attr('x', -0.75)
	.attr('y', function(d, i) {
		return barScale(d.min_temp);
	})
	.style('fill', function(d) {
		return colorScale(d.mean_temp);
	});

///////////////////////////////////////////////////////////////////////////
//////////////// Create the gradient for the legend ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Extra scale since the color scale is interpolated
var tempScale = d3.scale
	.linear()
	.domain([-15, 30])
	.range([0, width]);

//Calculate the variables for the temp gradient
var numStops = 10;
tempRange = tempScale.domain();
tempRange[2] = tempRange[1] - tempRange[0];
tempPoint = [];
for (var i = 0; i < numStops; i++) {
	tempPoint.push((i * tempRange[2]) / (numStops - 1) + tempRange[0]);
} //for i

//Create the gradient
svg
	.append('defs')
	.append('linearGradient')
	.attr('id', 'legend-weather')
	.attr('x1', '0%')
	.attr('y1', '0%')
	.attr('x2', '100%')
	.attr('y2', '0%')
	.selectAll('stop')
	.data(d3.range(numStops))
	.enter()
	.append('stop')
	.attr('offset', function(d, i) {
		return tempScale(tempPoint[i]) / width;
	})
	.attr('stop-color', function(d, i) {
		return colorScale(tempPoint[i]);
	});

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the legend ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var legendWidth = Math.min(outerRadius * 2, 400);

//Color Legend container
var legendsvg = svg
	.append('g')
	.attr('class', 'legendWrapper')
	.attr('transform', 'translate(' + 0 + ',' + (outerRadius + 70) + ')');

//Draw the Rectangle
legendsvg
	.append('rect')
	.attr('class', 'legendRect')
	.attr('x', -legendWidth / 2)
	.attr('y', 0)
	.attr('rx', 8 / 2)
	.attr('width', legendWidth)
	.attr('height', 8)
	.style('fill', 'url(#legend-weather)');

//Append title
legendsvg
	.append('text')
	.attr('class', 'legendTitle')
	.attr('x', 0)
	.attr('y', -10)
	.style('text-anchor', 'middle')
	.text('Average Daily Temperature');

//Set scale for x-axis
var xScale = d3.scale
	.linear()
	.range([-legendWidth / 2, legendWidth / 2])
	.domain([-15, 30]);

//Define x-axis
var xAxis = d3.svg
	.axis()
	.orient('bottom')
	.ticks(5)
	.tickFormat(function(d) {
		return d + '°C';
	})
	.scale(xScale);

//Set up X axis
legendsvg
	.append('g')
	.attr('class', 'axis')
	.attr('transform', 'translate(0,' + 10 + ')')
	.call(xAxis);
