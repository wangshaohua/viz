/* 
D3.js script to visualise scaling in US cities
*/



/*
FUNCTIONS TO DEAL WITH THE DATA
*/

function parseData(d) {
   // We parse data and convert floats to floats (except the names obviously)
  var keys = _.keys(d[0]);
  return _.map(d, function(d) {
    var o = {};
    _.each(keys, function(k) {
      if( k == 'Name' )
        o[k] = d[k];
      else if( k == 'ID')
         o[k] = parseInt(d[k]);
      else
        o[k] = parseFloat(d[k]);
    });
    return o;
  });
}


function getBounds(d, paddingFactor) {
  // Find min and maxes of each data item (for the scales)
  paddingFactor = typeof paddingFactor !== 'undefined' ? paddingFactor : 1;

  var keys = _.keys(d[0]), b = {};
  _.each(keys, function(k) {
    b[k] = {};
    _.each(d, function(d) {
      if(isNaN(d[k]))
        return;
      if(b[k].min === undefined || d[k] < b[k].min)
        b[k].min = d[k];
      if(b[k].max === undefined || d[k] > b[k].max)
        b[k].max = d[k];
    });
    b[k].max > 0 ? b[k].max *= paddingFactor : b[k].max /= paddingFactor;
    b[k].min > 0 ? b[k].min /= paddingFactor : b[k].min *= paddingFactor;
  });
  return b;
}




// Add a map
var map = d3.select("#map").append("svg")
   .attr("width", 800)
   .attr("height", 600);

//Map projection    
var projection = d3.geo.mercator()
   .scale(4000)
   .translate([1.8*800,1.3*600]);

var path = d3.geo.path()
   .projection(projection);




//Plot the usa map
d3.json("data/map/map.json", function(world) {

   // Plot the world map
   map.selectAll("path")
      .data(world.features)
      .enter().append("path")
         .attr("class","land")
         .attr("d", path);

   // Add the city name label; the value is set on transition.
   var label = map.append("text")
      .attr("class", "city label")
      .attr("text-anchor", "middle")
      .attr("y", 100)
      .attr("x", 100);




d3.csv("data/data.csv", function(data) {

   var xAxis = "Population",
       yAxis = "Road length";
   var yAxisOptions = ["Area", "Distance travelled", "Road length"]
   // var xAxisOptions = ["Population"];
   var descriptions = {
      "Area" : "Surface area (square km)",
      "Distance travelled" : "Total daily distance travelled (km)",
      "Road length" : "Total length of roads (km)"};


   var keys = _.keys(data[0]);
   var data = parseData(data);
   var bounds = getBounds(data, 1);

   var w = 1000, h = 640;      
   var colors = d3.scale.category20();

   // Add the chart
   var svg = d3.select("#chart1")
      .append("svg:svg")
      .attr("width", w)
      .attr("height", h);

   svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(80, -60)');


   // Build menus
   d3.select('#y-axis-menu')
      .selectAll('li')
      .data(yAxisOptions)
      .enter().append('li')
         .text(function(d) {return d;})
         .classed('selected', function(d) { //Clever, use a selected class for css styling purposes
            return d === xAxis;
         })
      .on('click', function(d) {
         xAxis = d;
         updateChart();
         updateMenus();
         updateMap();
      });

   // d3.select('#x-axis-menu')
   // .selectAll('li')
   // .data(xAxisOptions)
   // .enter()
   // .append('li')
   // .text(function(d) {return d;})
   // .classed('selected', function(d) {
   // return d === yAxis;
   // })
   // .on('click', function(d) {
   // yAxis = d;
   // updateChart();
   // updateMenus();
   // });

   // Axis labels
   d3.select('svg g.chart')
      .append('text')
      .attr({'id': 'xLabel', 'x': 400, 'y': 670, 'text-anchor': 'middle'})
      .text('Population');

   d3.select('svg g.chart')
      .append('text')
      .attr('transform', 'translate(-60, 330)rotate(-90)')
      .attr({'id': 'yLabel', 'text-anchor': 'middle'})
      .text(descriptions[yAxis]);


   // Render points
   updateScales();
   var pointColour = d3.scale.category20();
   d3.select('svg g.chart')
      .selectAll('circle')
      .data(data)
      .enter().append('circle')
         .attr('cx', function(d) {
            return isNaN(d[xAxis]) ? d3.select(this).attr('cx') : xScale(d[xAxis]);
            })
         .attr('cy', function(d) {
            return isNaN(d[yAxis]) ? d3.select(this).attr('cy') : yScale(d[yAxis]);
            })
         .attr('fill', function(d, i) {return pointColour(i);})
         .style('cursor', 'pointer')
         .on('mouseover', function(d) {
            console.log(d.Name)
            d3.select()
               .text(d.Name)
               .transition()
                  .style('opacity', 1);
            })
         .on('mouseout', function(d) {
            d3.select('svg g.chart #countryLabel')
               .transition()
                  .duration(1500)
                  .style('opacity', 0);
    });


   updateChart(true);
   updateMenus();

   // Render axes
   d3.select('svg g.chart')
      .append("g")
      .attr('transform', 'translate(0, 630)')
      .attr('id', 'xAxis')
      .call(makeXAxis);

   d3.select('svg g.chart')
      .append("g")
      .attr('id', 'yAxis')
      .attr('transform', 'translate(-10, 0)')
      .call(makeYAxis);



   function updateChart(init) {
      updateScales();

      d3.select('svg g.chart')
         .selectAll('circle')
         .transition()
            .duration(500)
            .ease('quad-out')
            .attr('cx', function(d) {
               return isNaN(d[xAxis]) ? d3.select(this).attr('cx') : xScale(d[xAxis]);
               })
            .attr('cy', function(d) {
               return isNaN(d[yAxis]) ? d3.select(this).attr('cy') : yScale(d[yAxis]);
               })
            .attr('r', function(d) {
               return isNaN(d[xAxis]) || isNaN(d[yAxis]) ? 0 : 7;
               });

      // Also update the axes
      d3.select('#xAxis')
         .transition()
         .call(makeXAxis);

      d3.select('#yAxis')
         .transition()
         .call(makeYAxis);

      // Update axis labels
      d3.select('#yLabel')
      .text(descriptions[yAxis]);
   };



   function updateScales() {
      xScale = d3.scale.log()
         .domain([bounds[xAxis].min, bounds[xAxis].max])
         .range([20, 780]);

      yScale = d3.scale.log()
         .domain([bounds[yAxis].min, bounds[yAxis].max])
         .range([600, 100]);    
   }



   function makeXAxis(s) {
      s.call(d3.svg.axis()
         .scale(xScale)
         .orient("bottom"));
   }

   function makeYAxis(s) {
      s.call(d3.svg.axis()
         .scale(yScale)
         .orient("left"));
   }


   function updateMenus() {
      d3.select('#x-axis-menu')
         .selectAll('li')
         .classed('selected', function(d) {
            return d === xAxis;
            });
      d3.select('#y-axis-menu')
         .selectAll('li')
         .classed('selected', function(d) {
            return d === yAxis;
            });
   }


   function updateMap() {

   };


});
});
