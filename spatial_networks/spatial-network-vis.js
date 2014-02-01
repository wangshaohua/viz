var width = 2000,
    height = 1000;

// Define width and height for display. Ideally we don't want any circle to cros the border
// Figure out something better
var plot_width = width*(1-0.1),
    plot_height = height*(1-0.1);

// Initialise colorbrewer color
var color = d3.scale.ordinal()
    .range(d3.range(7));

// Append svg image to body
var svg = d3.select("body").append("svg")
  .attr("width",width)
  .attr("class","RdYlGn")
  .attr("height",height);

// Extract the data and plot
d3.json("network.json", function(error, graph) {

    // Helper function to map node id's to node objects.
    // Returns d3.map of ids -> nodes
    mapNodes = function(nodes){
      nodesMap = d3.map();
      nodes.forEach( function(n){
        nodesMap.set(n.id, n);
      });
      return nodesMap;
    };

    //id's -> node objects
    nodesMap  = mapNodes(graph.nodes);

    // switch links to point to node objects instead of id's
    graph.edges.forEach(function(l){
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });


    // Plot the nodes
    svg.selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", function(d) { return "level q" + color(d.level) + "-9"; })
      .attr("cy", function(d) { return d.y*plot_height})
      .attr("cx", function(d) { return d.x*plot_width})
      .attr("r", function(d) { return 10*Math.log(d.population)});
      // .on("mouseover", showDetails);
      // .on("mouseover", hideDetails);
        

    // Plot the edges
    svg.selectAll("line")
      .data(graph.edges)
      .enter().append("line")
      .attr("x1", function(d) { return d.source.x*plot_width; })
      .attr("y1", function(d) { return d.source.y*plot_height; })
      .attr("x2", function(d) { return d.target.x*plot_width; })
      .attr("y2", function(d) { return d.target.y*plot_height; })
      .attr("class", "edge")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.4)
      .style("stroke-width", 1.);

});





