//Container for gallery
var bottom_div = d3.select("#my_example_images")
                   .style("width","2000px")
                   .style("height","600px")
                   .style("overflow-y","scroll")

var selected_items = []

function show_gallery(data,label){

  data.sort((a,b)=> b.Score - a.Score);

  data.forEach(function(d){d.isSelected = false;})
  
  bottom_div.selectAll('div')
            .data(data).enter()
            .append('img')
            .attr('src',function(d){return d.FileName})
            .attr('width',100)
            .attr('height', 80)
            .attr('id',function(d){return 'img'+d.id;})
            .style('border',function(d){
              if (d.Status == "Incorrect"){return "10px solid red"}
              else if (d.Status == "Correct"){return "10px solid green"}
              return "10px solid transparent"
            })
            .on('click',function(d,i){
              if (d.Status == "unprocessed"){
                if(!d.isSelected){
                d.isSelected = !d.isSelected;
                d3.select(this)
                  .style('border',"10px solid gold")

                d3.select("#c"+d.id)
                  .style("stroke","gold")
                  .style("stroke-width", 5)
                  .attr("r", 15)
                  .attr("opacity",0.6);

                selected_items.push(d.id);
                // console.log(selected_items)
                }
                else{
                  d.isSelected = !d.isSelected;
                  d3.select(this)
                    .style('border',"10px solid transparent")

                  d3.select("#c"+d.id)
                    .style("stroke",function(d){
                      if (d.Status == "Incorrect"){ return "red";}
                      else if (d.Status == "Correct"){ return "green";}
                      return "transparent";})
                    .attr("r", function(d){return d.r0;})
                    .attr("opacity",1.0);

                  var index = selected_items.indexOf(d.id);
                  selected_items.splice(index,1);
                  console.log(selected_items)
              }
              }
            })
            .on('mouseover',function(d){
              show_image(d);
            })

}

var c = document.getElementById("my_canvas");
var ctx = c.getContext("2d");
var img = document.getElementById('my_img');
var w = 400;
var h = 320;

var show_image = function(d){

  img.src = d.FileName;
  img.onload = function() {
    var x_ratio = math.ceil(img.width/w);
    var y_ratio = math.ceil(img.height/h);
    ctx.drawImage(img, 0, 0, w, h);
    var box_left = math.ceil(+d.left/x_ratio);
    var box_top = math.ceil(+d.top/y_ratio);
    var box_width = math.ceil(+d.Width/x_ratio);
    var box_height = math.ceil(+d.Height/y_ratio);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.strokeRect(box_left,box_top,box_width,box_height);
  }
}

var remove_gallery = function(label){
  d3.select("#my_example_images")
    .selectAll("img").remove();

  d3.selectAll("."+label)
    .style("stroke",function(d){
      if (d.Status == "Incorrect"){ return "red";}
      else if (d.Status == "Correct"){ return "green";}
      return "transparent";})
    .attr("r", function(d){return d.r0;})
    .attr("opacity",1.0);

  selected_items.splice(0,selected_items.length);
}

var labelSelectedAsCorrectAndUnselectedAsIncorrect = function(){
  
  var selectdLabel = new_data[selected_items[0]].Label;

  var data_of_the_label = new_data.filter(function(d){return d.Label == selectdLabel;});
  var id_list = data_of_the_label.map(function(d){return d.id;})

  for (var i = 0; i < id_list.length; i++) {
    var id = id_list[i];
    if (selected_items.includes(id)){
      new_data[id].Status = "Correct"
      d3.select("#c"+id)
        .style("stroke","green")

      d3.select("#img"+id)
        .style('border',"10px solid green");
    }
    else{
      new_data[id].Status = "Incorrect"
      d3.select("#c"+id)
        .style("stroke","red")
      d3.select("#img"+id)
        .style('border',"10px solid red");
    }
  }

  // reset circle size
  d3.selectAll("."+selectdLabel)
    .attr("r", function(d){return d.r0;})
    .attr("opacity",1.0);
}