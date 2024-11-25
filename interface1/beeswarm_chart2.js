var json_path = 'converted_data.json';

//Defining the margin conventions
var margin = {top: 50, right: 30, bottom: 50, left: 100},
    width = 5000 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Define y Axis
var y = function(d) { return d.Score; };

//Saving the apllied x scale in a variable  
var yValue = function(d) { return yScale(y(d)); };

//Y scale
var yScale = d3.scale.linear()
               .domain([-0.05, 1])
               .range([height*0.9, 0])
               // .tickValues([.25, .5, .75, 1])
               // .tickFormat(d3.format(".2f"));

//Y axis    
var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .tickValues([0, 0.2, .4, .6, .8, 1])
                  .tickFormat(d3.format(".2f")); 

//Draw y axes
d3.select("#yAxis")
  .append("svg")
  .attr("height",height + margin.top + margin.bottom)
  .attr("width",margin.left)
  .append("g")
  .attr("transform", "translate(99,"+ margin.top+")")
  .attr("class", "y-axis ")
  .call(yAxis)
  .selectAll(".tick line")
  .attr("stroke-dasharray", "1, 2");  

// Define labels
var labels = ["canadaPencil", "giftBag", "hairClip", "silverStraw", "cloudSign",
              "redBow", "turtle", "gClamp", "pumpkinNotes", "rainbowPens", "glassBead",
              "eyeball", "legoBracelet", "trophy", "stickerBox", "rubiksCube", "noisemaker",
              "spiderRing", "partyFavor", "miniCards", "pinkEraser", "foamDart", "birdCall",
              "yellowBag", "gyroscope", "cupcakePaper", "cactusPaper", "blueSunglasses",
              "redWhistle", "cowbell", "lavenderDie", "brownDie", "plaidPencil", "metalKey",
              "carabiner", "yellowBalloon", "voiceRecorder", "redDart", "sign", "paperPlate",
              "pinkCandle", "vancouverCards", "hairRoller"]

// Define xAxis
var x = function(d) { return d.Label; };
       
//X scale
var xScale = d3.scale.ordinal()
             .domain(labels)
             .rangePoints([0, width]);

//Saving the apllied x scale in a variable  
var xValue = function(d) { return xScale(x(d)) + xScale.rangeBand()/2; };

//X axis
var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom");  

// colorScale
var colorScale = d3.scale.category20b()
             .domain(["canadaPencil", "giftBag", "hairClip", "silverStraw", "cloudSign",
                      "redBow", "turtle", "gClamp", "pumpkinNotes", "rainbowPens", "glassBead",
                      "eyeball", "legoBracelet", "trophy", "stickerBox", "rubiksCube", "noisemaker",
                      "spiderRing", "partyFavor", "miniCards", "pinkEraser", "foamDart", "birdCall",
                      "yellowBag", "gyroscope", "cupcakePaper", "cactusPaper", "blueSunglasses",
                      "redWhistle", "cowbell", "lavenderDie", "brownDie", "plaidPencil", "metalKey",
                      "carabiner", "yellowBalloon", "voiceRecorder", "redDart", "sign", "paperPlate",
                      "pinkCandle", "vancouverCards", "hairRoller"])


//Container
var svg = d3.select("#beeswarm")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 50)
            // .append("g")
            // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          
svg.append('line')
    .attr('x1',0)
    .attr('y1',margin.top)
    .attr('x2',margin.left+10000)
    .attr('y2',margin.top)
    .attr('fill','none')
    .style('stroke','black')
    .style('stroke-width',1);

svg.append('line')
    .attr('x1',0)
    .attr('y1',margin.top+810)
    .attr('x2',margin.left+10000)
    .attr('y2',margin.top+800)
    .attr('fill','none')
    .style('stroke','black')
    .style('stroke-width',1);

svg  = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//Draw x axes
svg.append("g")
   .attr("class", "x-axis ")
   .attr("transform", "translate(0," + (height)+ ")")
   .call(xAxis)
   .selectAll("text")
   // .attr("dx", width)
   .attr("dy", -50)
   .style("font-size", "15px")
   .style("text-anchor", "center")

//Defining the forcement 
var bubbleChart = d3.forceChart()
                    .size([height, width])
                    .x(xValue)  
                    .y(yValue)
                    .yGravity(7)   
                    .rStart(5) 
                    .xGravity(1/3);

// initialize new_data as an empty array. new_data is used to return modified data
var new_data = [];

// read data
d3.json(json_path, function(error, data) {
  
  if (error) throw error;

  // copy every element of data to new_data
  data.forEach(function(d,i){
    d.id = i;
    new_data.push({"FileName":d.FileName, "Label":d.Label,
                   "left":d.left, "top":d.top, 
                   "Width":d.Width,"Height":d.Height,
                   "Status":d.Status,"Score":d.Score,
                   "id":d.id, "Person":d.Person, "Pic": d.Pic});
  })

  // console.log(new_data.filter(function(d){return d.Status == "Incorrect"}))

  //Draw bubbles
  svg.append("g")
    .call(bubbleChart, new_data)
    .attr("class", "bubbles")
    .selectAll(".node")
    .append("circle")
    .attr("class",function(d){return d.Label;})
    .attr("id", function(d){return "c" + d.id;})
    // .attr("r", function(d) { return d.r0; })
    .attr("r", 7) 
    .attr('stroke', 'black')
    .attr('stroke-width',1)
    .attr("fill", function(d) {
//      return colorScale(d.Label)})
//      .style("stroke-width", 2.0)
//      .style("stroke", function(d){
     if (d.Status == "Incorrect"){ return "#fb8072";}
     else if (d.Status == "Correct"){ return "#8dd3c7";}
     return "transparent";});

  // make a list of label images and attach them to the corresponding ticks of x axis
  var label_image_list = [];
  labels.forEach(function(label){
    label_image_list.push({
      "img":"MC2-Image-Data/TrainingImages/"+label+"/"+label+"_1.jpg", 
      "label": label,
      "isSelected":false});
  })

  var exmaple_images = svg.select(".x-axis").selectAll(".tick")
                         .data(label_image_list)
                         .append("svg:image")
                         .attr("xlink:href", function (d) { return d.img ; })
                         .attr("width", 100)
                         .attr("height", 80)
                         .attr("x", -50)
                         .attr("y", 10)

  var image_borders = svg.select(".x-axis").selectAll(".tick")
                         .append('rect')
                         .attr('transform',"translate(-50,15)")
                         .attr('class', 'image-border')
                         .attr('width', 100)
                         .attr('height', 70);

  var accuracy_list = []
  labels.forEach(function(label){
      var data_of_the_label = data.filter(function(d){return d.Label == label});
      var correct_data = data_of_the_label.filter(function(d){return d.Status == "Correct"});
      var num_correct = correct_data.length;
      var num_total = (data_of_the_label.length == 1)? 0: data_of_the_label.length;
      var percentage = num_total ? (num_correct/num_total * 100) : 0;
      accuracy_list.push({
        "label": label,
        "num_correct": num_correct,
        "num_total": num_total,
        "percentage": percentage
      })
  })

  // console.log(accuracy_in_percentage)
  var percentage_monitor = svg.select(".x-axis").selectAll(".tick")
                              .data(accuracy_list)
                              .append('text')
                              .append("tspan")
                              .style("fill","green")
                              .text(function(d){return d.num_correct})
                              .attr("x", -20)
                              .attr("y", -20)
                              .append("tspan")
                              .style("fill","black")
                              .text("/")
                              .attr("x", 0)
                              .attr("y", -20)
                              .append("tspan")
                              .style("fill","blue")
                              .text(function(d){return d.num_total })
                              .attr("x", 10)
                              .attr("y", -20)
                              .append("tspan")
                              .style("fill",function(d){
                                return (d.percentage - 30.0 > 1e-6)? "green": "red";
                              })
                              .text(function(d){return " (" + d.percentage.toFixed(3) +"%)"})
                              .attr("x", -30)
                              .attr("y", 0)
  
  // svg.select(".x-axis").selectAll(".tick")
  //    .append('text')
  //    .text("correct")
  //    .attr("x", -30)
  //    .attr("y", 60)


  image_borders.on('click', function(d){
    if (!d.isSelected){
      d.isSelected = !d.isSelected;
      d3.select(this)
      .style('stroke',"blue")
      .style('stroke-width',"5");
      var selected_subset = new_data.filter(function(dd){return dd.Label == d.label});

      show_gallery(selected_subset, d.label);
    }
    else{
      d.isSelected = !d.isSelected;
      d3.select(this)
        .style('stroke','transparent');


      remove_gallery(d.label);
    }
  })


})

