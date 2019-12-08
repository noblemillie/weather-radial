//////////////////// Set up and initiate svg containers ///////////
var margin = {
	top: 50,
	right: 20,
	bottom: 80,
	left: 20
};
var width = (window.innerWidth - margin.left - margin.right - 10) / 2;
var height = window.innerHeight - margin.top - margin.bottom - 40;

//SVG container
var svg = d3
	.select('#weatherRadial')
	.append('svg')
	.attr('width', width + margin.left + margin.right - 10)
	.attr('height', height + margin.top + margin.bottom - 50)
	// .style('background-color', 'snow')
	.style('background-color', 'rgba(11, 11, 11, 0.7)')
	.style('border', '3px solid cyan')
	.append('g')
	.attr(
		'transform',
		'translate(' +
			(margin.left + width / 2) +
			',' +
			(margin.top + height / 1.9) +
			')'
	);

//////////////////// Load weather data ///////////////////
let squawData = [];

d3.json('historical.json', function(w) {
	var datesArr = [];
	squawData = w.data.weather;

	console.log('extract: ', w.data.weather);
	var dates = squawData.forEach(function(d) {
		datesArr.push(parseDate(d.date).toDateString());
		// d.date = parseDate(d.date);
		// console.log(`date: `, d.date);
	});
	console.log(`dates: `, datesArr);

	return squawData;
});

//////////////////////////// Create scales /////////////////////////
//Parses a string into a date
var parseDate = d3.time.format('%Y-%m-%d').parse;

//Turn strings into actual numbers/dates
weatherSnowData.forEach(function(d) {
	d.date = parseDate(d.date);
	// console.log(`date: `, d.date);
});

//Set the minimum inner radius and max outer radius of the chart
var outerRadius = Math.min(width, height, 450) / 2,
	innerRadius = outerRadius * 0.2;

//Base the color scale on average temperature extremes
var colorScale = d3.scale
	.linear()
	.domain([-15, -10, 0, 10, 15, 28])
	.range(['purple', 'dodgerblue', 'white', 'lightgreen', '#ffff8c', 'crimson'])
	.interpolate(d3.interpolateHcl);

var snowfallColorScale = d3.scale
	.linear()
	.domain([0, 2, 10, 40])
	.range(['powderblue', 'snow', 'white'])
	.interpolate(d3.interpolateHcl);

var historicalSnowfallColorScale = d3.scale
	.linear()
	.domain([0, 90])
	.range(['blue', 'cyan'])
	.interpolate(d3.interpolateHcl);

//Base the color scale on average temperature extremes
var axisColorScale = d3.scale
	.linear()
	.domain([-15, 7.5, 30])
	.range(['blue', 'white', 'crimson'])
	.interpolate(d3.interpolateHcl);

//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
var barScale = d3.scale
	.linear()
	.range([innerRadius, outerRadius])
	.domain([-15, 25]);

var snowBarScale = d3.scale
	.linear()
	.range([innerRadius, outerRadius])
	.domain([-40, -4]);

//Scale to turn the date into an angle of 360 degrees in total
//With the first datapoint (Jan 1st) on top
var angle = d3.scale
	.linear()
	.range([-180, 180])
	.domain(
		d3.extent(weatherSnowData, function(d) {
			return d.date;
		})
	);

//////////////////////////// Create Titles ////////////////////////////////
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
	.attr('x', -150)
	.attr('y', -outerRadius - 100)
	.text('Annual Temperature');
textWrapper
	.append('text')
	.attr('class', 'subtitle')
	.attr('x', -150)
	.attr('y', -outerRadius - 80)
	.text('Historic Temperature & Snowfall Ranges');

//Append credit at bottom
textWrapper
	.append('text')
	.attr('class', 'credit')
	.attr('x', 250)
	.attr('y', outerRadius + 170)
	.attr('opacity', 0.2)
	.text('* inspired by weather-radials.com');

///////////////////////////// Create Axes /////////////////////////////////
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
	.style('stroke-width', 4)
	.style('stroke', function(d) {
		return axisColorScale(d);
	})
	.style('opacity', 0.7)
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

//Add a line to split the year
barWrapper
	.append('line')
	.style('stroke-width', 1.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * 0.15)
	.attr('x2', 0)
	.attr('y2', -outerRadius * 1.1);

//Add a line to split first and second quarters
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('y1', 0)
	.attr('x1', innerRadius * 0.15)
	.attr('y2', 0)
	.attr('x2', outerRadius * 1.1);

//Add a line to split second and third quarters
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', innerRadius * 0.15)
	.attr('x2', 0)
	.attr('y2', outerRadius * 1.1);

//Add a line to split third and  year fourth quarters
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('y1', 0)
	.attr('x1', -innerRadius * 0.15)
	.attr('y2', 0)
	.attr('x2', -outerRadius * 1.1);

//Add December label for reference
barWrapper
	.append('text')
	.attr('class', 'december')
	.attr('x', -75)
	.attr('y', -outerRadius * 1.1)
	.attr('dy', '2em')
	.attr('transform', 'translate(40, -10) rotate(-15)')
	.text('December');

//Add January label for reference
barWrapper
	.append('text')
	.attr('class', 'january')
	.attr('x', 7)
	.attr('y', -outerRadius * 1.1)
	.attr('dy', '2em')
	.attr('transform', 'translate(-30, -5) rotate(15)')
	.text('January');

//Add a line to split Feb/Mar
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * 0.1)
	.attr('x2', -210)
	.attr('y2', -outerRadius * 0.5);

//Add a line to split Nov/Dec
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * -0.15)
	.attr('x2', -120)
	.attr('y2', -outerRadius * 0.9);

//Add a line to split Jan/Feb
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * 0.15)
	.attr('x2', 120)
	.attr('y2', -outerRadius * 0.9);

//Add February label for reference
barWrapper
	.append('text')
	.attr('class', 'february')
	.attr('x', 7)
	.attr('y', -outerRadius * 1.1)
	.attr('dy', '2em')
	.attr('transform', 'translate(-5, 0) rotate(45)')
	.text('February');

//Add a line to split Feb/Mar
barWrapper
	.append('line')
	.style('stroke-width', 0.5)
	.attr('class', 'yearLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * 0.1)
	.attr('x2', 210)
	.attr('y2', -outerRadius * 0.5);

// Add line to indicate start of ski-season
barWrapper
	.append('line')
	.style('stroke-width', 17.5)
	.attr('class', 'seasonLine')
	.attr('x1', 0)
	.attr('y1', -innerRadius * -0.01)
	.attr('y2', -180)
	.attr('x2', -outerRadius * 0.75)
	.style('opacity', 0.8);

// Add line to indicate end of ski-season
barWrapper
	.append('line')
	.style('stroke-width', 17.5)
	.attr('class', 'seasonLine')
	.attr('x1', 0)
	.attr('x2', -outerRadius * -1.0)
	.attr('y1', -innerRadius * -0.01)
	.attr('y2', 100)
	.style('opacity', 0.8);

////////////////////////////// Draw bars //////////////////////////////////
var today = [
	{
		date: '2019-1-28',
		curr_year_snow: 0,
		min_snow: 0,
		mean_snow: 9,
		max_snow: 21,
		max_temp: -7,
		mean_temp: -8,
		min_temp: -10
	}
];

barWrapper
	.selectAll('.presentLine')
	// .data(weatherSnowData)
	.data(today)
	.enter()
	.append('rect')
	.attr('class', 'presentLine')
	.attr('transform', function(d, i) {
		return 'rotate(' + angle(parseDate(d.date)) + ')';
	})
	.attr('width', 7)
	.attr('height', function(d, i) {
		return barScale(innerRadius - 25) - barScale(d.min_temp);
	})
	.attr('x', -5)
	// .attr('y', -2)
	.attr('y', function(d, i) {
		return barScale(1);
	})
	.attr('rx', 10)
	.style('opacity', 0.99)
	.style('fill', 'violet')
	.style('stroke', function(d) {
		return colorScale(d.mean_temp);
	});

barWrapper
	.selectAll('.snowBar')
	.data(weatherSnowData)
	.enter()
	.append('rect')
	.attr('class', 'snowBar')
	.attr('transform', function(d, i) {
		return 'rotate(' + angle(d.date) + ')';
	})
	.attr('width', 3)
	.attr('height', function(d, i) {
		return snowBarScale(d.mean_snow) - snowBarScale(d.min_snow);
		// return snowBarScale(d.max_snow) - snowBarScale(d.min_snow);
	})
	.attr('x', -0.25)
	.attr('y', function(d, i) {
		return snowBarScale(d.min_snow + 1);
	})
	.style('fill', function(d) {
		return snowfallColorScale(d.mean_snow);
	})
	.attr('rx', '1px')
	.style('opacity', 0.99);

barWrapper
	.selectAll('.maxSnowBar')
	.data(weatherSnowData)
	.enter()
	.append('rect')
	.attr('class', 'maxSnowBar')
	.attr('transform', function(d, i) {
		return 'rotate(' + angle(d.date) + ')';
	})
	.attr('width', 4)
	.attr('height', function(d, i) {
		return snowBarScale(d.max_snow) - snowBarScale(d.mean_snow);
	})
	.attr('x', -0.75)
	.attr('y', function(d, i) {
		return snowBarScale(d.mean_snow + 1);
	})
	.style('fill', function(d) {
		return historicalSnowfallColorScale(
			snowBarScale(d.max_snow) - snowBarScale(d.mean_snow)
		);
	})
	.style('opacity', 0.25);

// tempBar height is the difference between the minimum and maximum temperature
// tempBar color is based on the mean temperature
barWrapper
	.selectAll('.tempBar')
	.data(weatherSnowData)
	.enter()
	.append('rect')
	.attr('class', 'tempBar')
	.attr('transform', function(d, i) {
		return 'rotate(' + angle(d.date) + ')';
	})
	.attr('width', 2)
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

//////////////// Create the gradient for the legend ////////////////
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

////////////////////////// Draw the legend /////////////////////////
var legendWidth = Math.min(outerRadius * 2, 400);

//Color Legend container
var legendsvg = svg
	.append('g')
	.attr('class', 'legendWrapper')
	.attr('transform', 'translate(' + 0 + ',' + (outerRadius + 80) + ')');

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
	.text('Historical Average Temperature');

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
