// Add hover functionality to DETECTED and ALTERNATIVE sections
labelSelectionDiv.selectAll(".objectLabel")
    .on("mouseover", function (event, d) {
        // Remove any existing preview
        d3.select("#hover-preview").remove();

        // Append image preview near mouse
        d3.select("body")
            .append("img")
            .attr("id", "hover-preview")
            .attr("src", `path_to_sample_images/${d.Label}.jpg`) // Update with correct path
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("width", "150px") // Set a reasonable size for preview
            .style("height", "auto")
            .style("border", "2px solid black")
            .style("background-color", "white")
            .style("z-index", "1000");

        // Position image at mouse pointer
        d3.select("#hover-preview")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mousemove", function (event) {
        // Update position dynamically as mouse moves
        d3.select("#hover-preview")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function () {
        // Remove preview on mouse out
        d3.select("#hover-preview").remove();
    });

// Existing logic for drawing labels in DETECTED and ALTERNATIVE sections
function drawLabelSelection() {
    thisPerson = thisImage.split("_")[0];

    d3.csv("../annotated_csv/" + thisImage + ".csv", function (error, data) {
        if (error) throw error;
        prevSelect = {};

        let selection = labelSpace.selectAll(".detectedLabel")
            .data(data.sort((a, b) => +b.Score - +a.Score), d => d.Label);

        // EXIT
        selection.exit()
            .style("opacity", 1)
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        // UPDATE
        selection
            .classed("selectedLabel", false)
            .transition()
            .duration(500)
            .style("top", (d, i) => ((i + 1) * 34) + "px");

        // ENTER
        selection
            .enter()
            .append("div")
            .attr("class", "objectLabel detectedLabel")
            .html(d => '<span>' + d.Label + '</span><span class="labelScore">' + (+d.Score).toFixed(2) + '</span>')
            .style("top", (d, i) => ((i + 1) * 34) + "px")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1);

        // Rec position
        d3.select("#recText")
            .style("top", ((data.length + 1) * 34) + "px")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1);

        let detectedData = data.map(d => d.Label);

        let recData = classes.filter(d => !detectedData.includes(d)).map(d => {
            return { Label: d };
        });

        let recselection = recommendSpace.selectAll(".recLabel")
            .data(recData, d => d.Label);

        // EXIT
        recselection.exit()
            .style("opacity", 1)
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        // UPDATE
        recselection
            .classed("selectedLabel", false)
            .transition()
            .duration(500)
            .style("top", (d, i) => ((i + 1 + detectedData.length + 1) * 34) + "px");

        // ENTER
        recselection
            .enter()
            .append("div")
            .attr("class", "objectLabel recLabel")
            .html(d => d.Label)
            .style("top", (d, i) => ((i + 1 + detectedData.length + 1) * 34) + "px")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1);

        // Select on click
        labelSelectionDiv.selectAll(".objectLabel")
            .on("click", function (d) {
                if (!prevSelect[d.Label]) {
                    prevSelect[d.Label] = true;
                    d3.select(this).classed("selectedLabel", true);
                } else {
                    prevSelect[d.Label] = false;
                    d3.select(this).classed("selectedLabel", false);
                }
            });
    });
}
