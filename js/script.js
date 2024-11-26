let selectedClass = null; // Declare selectedClass once, globally
let toggleState = "FALSE";
let data = [];
let NewData = [];


function createLabelButtons(data) {
  // Extract unique labels
  const labels = Array.from(new Set(data.map(d => d.Label)));

  // Clear any existing buttons
  const buttonContainer = d3.select("#button-container-gallery");
  buttonContainer.html("");

  labels.forEach(label => {
    const button = buttonContainer
      .append("button")
      .text(label)
      .attr("class", "label-button")
      .style("margin", "5px")
      .style("padding", "3px 5px")
      .style("font-size", "12px")
      .style("background-color", "#007bff")
      .style("color", "white")
      .style("border", "none")
      .style("border-radius", "20px")
      .style("cursor", "pointer");

    // Attach click event listener
    button.on("click", () => {
      console.log(`Button clicked for label: ${label}`);

      // Update the selected label
      selectedClass = label;

      // Reset styles for all buttons
      d3.selectAll(".label-button")
        .style("background-color", "#007bff") // Default color
        .style("color", "white"); // Default text color

      // Highlight the clicked button immediately
      d3.select(button.node())
        .style("background-color", "#ffa500") // Highlight color (orange)
        .style("color", "black"); // Highlight text color

      // Update the gallery based on the selected label and score range
      const lowerThreshold = parseFloat(document.getElementById("min-slider").value);
      const upperThreshold = parseFloat(document.getElementById("max-slider").value);
      updateGalleryWithClassAndScore(data, selectedClass, lowerThreshold, upperThreshold);
    });
  });

  console.log("Buttons created:", document.querySelectorAll(".label-button"));
}



function initializeScoreSliders(data) {
  const minSlider = document.getElementById("min-slider");
  const maxSlider = document.getElementById("max-slider");
  const minSliderValueDisplay = document.getElementById("min-slider-value");
  const maxSliderValueDisplay = document.getElementById("max-slider-value");

  if (!minSlider || !maxSlider) {
    console.error("Sliders not found in the DOM.");
    return;
  }

  // Update the displayed value when the slider changes
  minSlider.addEventListener("input", () => {
    const lowerThreshold = parseFloat(minSlider.value);
    const upperThreshold = parseFloat(maxSlider.value);
    minSliderValueDisplay.textContent = lowerThreshold.toFixed(2); // Display the value with two decimals

    if (lowerThreshold > upperThreshold) {
      minSlider.value = upperThreshold; // Prevent crossing
    }
    if (selectedClass) {
      updateGalleryWithClassAndScore(data, selectedClass, lowerThreshold, upperThreshold);
    }
  });

  maxSlider.addEventListener("input", () => {
    const lowerThreshold = parseFloat(minSlider.value);
    const upperThreshold = parseFloat(maxSlider.value);
    maxSliderValueDisplay.textContent = upperThreshold.toFixed(2); // Display the value with two decimals

    if (upperThreshold < lowerThreshold) {
      maxSlider.value = lowerThreshold; // Prevent crossing
    }
    if (selectedClass) {
      updateGalleryWithClassAndScore(data, selectedClass, lowerThreshold, upperThreshold);
    }
  });
}

function updateGalleryWithClassAndScore(data, selectedClass, lowerThreshold, upperThreshold) {
  if (!selectedClass) {
    console.warn("No class selected.");
    return;
  }

  // Filter data based on the selected class and score range
  const filteredData = data.filter(d => {
    const score = parseFloat(d.Score);
    return d.Label === selectedClass && score >= lowerThreshold && score <= upperThreshold;
  });

  // Clear and update the gallery
  const gallery = d3.select("#image-gallery");
  gallery.html(""); // Clear previous images

  // Render filtered images
  filteredData.forEach(d => {
    const img = gallery
      .append("img")
      .attr("src", d.ImagePath.replace(/\\/g, "/")) // Normalize path
      .attr("alt", d.Label)
      .style("width", "80px")
      .style("height", "80px")
      .style("object-fit", "cover")
      .style("margin", "2px")
      .style("border", "8px solid")
      .style("border-color", d.Positive === "TRUE" ? "#1bb803" : "#f32007") // Set initial border color
      .style("border-radius", "10px")
      .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.7)")
      .style("cursor", "pointer")
      .on("mouseover", () => {
        // Display image and annotation on hover
        const annotation = {
          x: +d.x, // x-coordinate
          y: +d.y, // y-coordinate
          width: +d.Width, // Annotation width
          height: +d.Height, // Annotation height
        };
        displaySelectedImage(d.ImagePath.replace(/\\/g, "/"), d.Label, annotation);
      })
      .on("mouseout", () => {
        // Hide the enlarged image and annotation on mouse out
        hideSelectedImage();
      })


      .on("click", () => {
        // Update the Positive value in the data array
        const index = data.findIndex(entry => entry.Label === d.Label && entry.ImagePath === d.ImagePath);
        if (index !== -1) {
            data[index].Positive = toggleState; // Update the global data array
        }
    
        // Update the UI
        d.Positive = toggleState; // Update the object bound to this element
        img.style("border-color", d.Positive === "TRUE" ? "green" : "red");
    
        console.log("Updated Data Array:", data); // Debugging to verify update
  NewData = data;
  populateMetricsTable(); // Update the table with confidence scores and precision
  plotPrecisionAndConfidenceAcrossPersons(); // Plot precision across persons

   
});

      
      
      
  });

  console.log(`Gallery updated with ${filteredData.length} items.`);
}


function displaySelectedImage(imagePath, label, annotation) {
  const selectedImage = document.getElementById("selected-image-2");
  const selectedLabel = document.getElementById("selected-label-2");

  // Set the image source and label
  selectedImage.src = imagePath;
  selectedImage.style.display = "block";
  selectedLabel.textContent = `Label: ${label}`;

  // Get the actual dimensions of the displayed image
  selectedImage.onload = () => {
    const imageWidth = selectedImage.clientWidth;
    const imageHeight = selectedImage.clientHeight;

    // Scale annotation coordinates to match the displayed image size
    const xScale = imageWidth / selectedImage.naturalWidth;
    const yScale = imageHeight / selectedImage.naturalHeight;

    const scaledX = annotation.x * xScale;
    const scaledY = annotation.y * yScale;
    const scaledWidth = annotation.width * xScale;
    const scaledHeight = annotation.height * yScale;

    // Ensure the annotation box is created
    let annotationBox = document.getElementById("annotation-box");
    if (!annotationBox) {
      // Create a new annotation box if it doesn't exist
      annotationBox = document.createElement("div");
      annotationBox.id = "annotation-box";
      annotationBox.style.position = "absolute";
      annotationBox.style.border = "2px solid red";
      annotationBox.style.pointerEvents = "none"; // Prevent interaction
      selectedImage.parentNode.appendChild(annotationBox);
    }

    // Adjust the box position for center-based annotation
    const adjustedX = scaledX - scaledWidth / 2;
    const adjustedY = scaledY - scaledHeight / 2;

    // Update the annotation box dimensions and position
    annotationBox.style.left = `${adjustedX}px`;
    annotationBox.style.top = `${adjustedY}px`;
    annotationBox.style.width = `${scaledWidth}px`;
    annotationBox.style.height = `${scaledHeight}px`;
    annotationBox.style.display = "block"; // Make it visible
  };
}

function hideSelectedImage() {
  const selectedImage = document.getElementById("selected-image-2");
  const selectedLabel = document.getElementById("selected-label-2");

  // Hide the enlarged image
  selectedImage.style.display = "none";
  selectedLabel.textContent = "";

  // Hide the annotation box
  const annotationBox = document.getElementById("annotation-box");
  if (annotationBox) {
    annotationBox.style.display = "none";
  }
}


function displayImagesForLabel(data, label) {
  console.log(`Displaying images for label: ${label}`);

  // Filter data for the selected label
  const filteredData = data.filter(d => d.Label === label);

  // Clear previous images in the gallery
  const gallery = d3.select("#image-gallery");
  gallery.html("");

  // Add filtered images to the gallery
  filteredData.forEach(d => {
    const img = gallery
      .append("img")
      .attr("src", d.ImagePath.replace(/\\/g, "/")) // Fix path slashes
      .attr("alt", label)
      .style("width", "120px") // Set consistent width
      .style("height", "120px") // Set consistent height
      .style("object-fit", "cover") // Crop images to fit the box
      .style("margin", "2px") // Spacing between images
      .style("border", "1px solid #ddd") // Light border
      .style("border-radius", "10px") // Rounded corners
      .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)") // Subtle shadow
      .style("cursor", "pointer") // Pointer cursor
      .on("click", () => {
        // Pass image data and annotation to displaySelectedImage
        const annotation = {
          x: +d.x, // x-coordinate
          y: +d.y, // y-coordinate
          width: +d.Width, // Annotation width
          height: +d.Height, // Annotation height
        };
        displaySelectedImage(d.ImagePath.replace(/\\/g, "/"), label, annotation); // Display image and annotation
      });
  });
}


function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function createScatterplot(data) {
  data.forEach(d => {
    d.Score = parseFloat(d.Score); // Ensure Score is numeric
    d.ImagePath = d.ImagePath.replace(/\\/g, "/"); // Normalize paths
  });

  // Get the container dimensions
  const container = document.getElementById("scatterplot");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Define margins
  const margin = { top: 20, right: 20, bottom: 80, left: 70 };

  // Calculate the inner plot dimensions (subtract margins)
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Ensure the plot fits exactly inside the container
  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", containerWidth) // Total width includes margins
    .attr("height", containerHeight) // Total height includes margins
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scatter plot logic using `width` and `height` for the plot area
  const xScale = d3
    .scaleBand()
    .domain(data.map(d => d.Label))
    .range([0, width])
    .padding(1.5);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.Score)])
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(yScale));

  // Axis Labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Labels");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 40)
    .style("text-anchor", "middle")
    .text("Confidence Score");

  // Hexbin Generator
  const hexbin = d3.hexbin()
    .x(d => xScale(d.Label))
    .y(d => yScale(d.Score))
    .radius(12); // Adjust radius based on preference

  // Create Hexbin Data
  const hexData = hexbin(data);

  // Color Scale
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Render Hexagons
  svg
    .append("g")
    .selectAll(".hexagon")
    .data(hexData)
    .enter()
    .append("path")
    .attr("class", "hexagon")
    .attr("d", hexbin.hexagon())
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .style("fill", d => colorScale(d[0].Label))
    .style("stroke", "black")
    .style("stroke-width", 0.5)
    .style("opacity", 0.5)
    .on("mouseover", function(event, d) {
      const datum = d[0];
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>Label:</strong> ${datum.Label}<br>
           <strong>Score:</strong> ${datum.Score.toFixed(3)}<br>
           <img src="${datum.ImagePath}" alt="${datum.Label}" width="100" height="100">`
        )
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY + 15}px`);

      // Increase size on hover
      d3.select(this)
        .transition().duration(200)
        .attr("transform", d => `translate(${d.x},${d.y}) scale(1.4)`); // Scale up the hexagon by 40%
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);

      // Reset size on mouse out
      d3.select(this)
        .transition().duration(200)
        .attr("transform", d => `translate(${d.x},${d.y}) scale(1)`); // Reset scale to original size
    });
}


function calculateMetrics() {
  const metrics = {};
  const labels = Array.from(new Set(NewData.map(d => d.Label)));

  labels.forEach(label => {
    const labelData = NewData.filter(d => d.Label === label);

    // True Positives and False Positives
    const truePositives = labelData.filter(d => d.Positive === "TRUE").length;
    const falsePositives = labelData.filter(d => d.Positive === "FALSE").length;

    // Calculate Precision
    const precision = (truePositives + falsePositives > 0) 
      ? truePositives / (truePositives + falsePositives)
      : 0;

    // Calculate Average Confidence Score
    const averageConfidence = labelData.length > 0
      ? labelData.reduce((sum, d) => sum + parseFloat(d.Score || 0), 0) / labelData.length
      : 0;

    metrics[label] = { precision, averageConfidence };
  });

  return metrics;
}


function populateMetricsTable() {
  const metrics = calculateMetrics();
  const tbody = d3.select("#metrics-table tbody");
  tbody.html(""); // Clear existing rows

  Object.entries(metrics).forEach(([label, { precision, averageConfidence }]) => {
    const row = tbody.append("tr");
    row.append("td").text(label); // Label
    row.append("td").text(averageConfidence.toFixed(2)); // Confidence Score
    row.append("td").text(precision.toFixed(2)); // Precision
  });
}

function plotPrecisionAndConfidenceAcrossPersons() {
  const svg = d3.select("#pr-curve");
  const margin = { top: 25, right: 10, bottom: 80, left: 40 }; // Adjusted margins for axes labels
  const width = svg.node().clientWidth - margin.left - margin.right; // Width of the graph area
  const height = svg.node().clientHeight - margin.top - margin.bottom; // Total available height
  const chartHeight = height / 2 - 20; // Split height for two charts

  svg.selectAll("*").remove(); // Clear existing plot

  // Create group elements for the two bar charts
  const topChart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  const bottomChart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top + chartHeight + 70})`);

  // Calculate data for precision and average confidence score for each person
  const persons = [...new Set(NewData.map(d => d.Person))]; // Extract unique persons
  const metrics = persons.map(person => {
    const personData = NewData.filter(d => d.Person === person);
    const truePositives = personData.filter(d => d.Positive === "TRUE").length; // Count true positives
    const totalPredictions = personData.length; // Total predictions
    const avgConfidence = d3.mean(personData, d => parseFloat(d.Score)); // Average confidence score

    return {
      person,
      precision: totalPredictions > 0 ? truePositives / totalPredictions : 0,
      avgConfidence: avgConfidence || 0
    };
  });

  // Scales for top chart (Precision)
  const xScaleTop = d3.scaleBand()
    .domain(metrics.map(d => "P" + d.person.replace("Person", ""))) // Change 'Person31' to 'P31'
    .range([0, width])
    .padding(0.1);

  const yScaleTop = d3.scaleLinear()
    .domain([0, 1]) // Precision values range from 0 to 1
    .range([chartHeight, 0]);

  // Scales for bottom chart (Confidence Score)
  const xScaleBottom = d3.scaleBand()
    .domain(metrics.map(d => "P" + d.person.replace("Person", ""))) // Change 'Person31' to 'P31'
    .range([0, width])
    .padding(0.1);

  const yScaleBottom = d3.scaleLinear()
    .domain([0, d3.max(metrics, d => d.avgConfidence)]) // Use max confidence score for scale
    .range([chartHeight, 0]);

  // Tooltip setup
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("font-size", "14px");

  // Top chart: Precision across persons
  topChart.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScaleTop))
    .selectAll("text")
    .style("font-size", "8px") // Set the font size for the x-axis labels
    .style("font-family", "Montserrat, sans-serif") // Make the font more angular
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  topChart.append("g")
    .call(d3.axisLeft(yScaleTop))
    .selectAll("text")
    .style("font-size", "8px") // Set font size for the y-axis labels
    .style("font-family", "Montserrat, sans-serif"); // Make the font more angular

  topChart.selectAll(".bar-precision")
    .data(metrics)
    .enter()
    .append("rect")
    .attr("class", "bar-precision")
    .attr("x", d => xScaleTop("P" + d.person.replace("Person", ""))) // Add 'P' before person number
    .attr("y", d => yScaleTop(d.precision))
    .attr("width", xScaleTop.bandwidth())
    .attr("height", d => chartHeight - yScaleTop(d.precision))
    .attr("fill", "#4394E5")
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .text("Precision: " + d.precision.toFixed(2)); // Show precision on hover
      d3.select(this).transition().duration(200).attr("height", chartHeight - yScaleTop(d.precision)-20); // Make the bar bigger
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
    })
    .on("mouseout", function(event, d) {
      tooltip.style("visibility", "hidden");
      d3.select(this).transition().duration(200).attr("height", chartHeight - yScaleTop(d.precision)); // Reset the bar size
    });

  topChart.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Precision Across Persons")
    .style("font-size", "14px");

  // Bottom chart: Confidence score across persons
  bottomChart.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScaleBottom))
    .selectAll("text")
    .style("font-size", "8px") // Set the font size for the x-axis labels
    .style("font-family", "Montserrat, sans-serif") // Make the font more angular
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  bottomChart.append("g")
    .call(d3.axisLeft(yScaleBottom))
    .selectAll("text")
    .style("font-size", "8px") // Set font size for the y-axis labels
    .style("font-family", "Montserrat, sans-serif"); // Make the font more angular

  bottomChart.selectAll(".bar-confidence")
    .data(metrics)
    .enter()
    .append("rect")
    .attr("class", "bar-confidence")
    .attr("x", d => xScaleBottom("P" + d.person.replace("Person", ""))) // Add 'P' before person number
    .attr("y", d => yScaleBottom(d.avgConfidence))
    .attr("width", xScaleBottom.bandwidth())
    .attr("height", d => chartHeight - yScaleBottom(d.avgConfidence))
    .attr("fill", "#0066CC")
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .text("Confidence: " + d.avgConfidence.toFixed(2)); // Show confidence on hover
      d3.select(this).transition().duration(200).attr("height", chartHeight - yScaleBottom(d.avgConfidence) - 20); // Make the bar bigger
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
    })
    .on("mouseout", function(event, d) {
      tooltip.style("visibility", "hidden");
      d3.select(this).transition().duration(200).attr("height", chartHeight - yScaleBottom(d.avgConfidence)); // Reset the bar size
    });

  bottomChart.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Average Confidence Score Across Persons")
    .style("font-size", "14px");
}





// Load the dataset and store it in `data`
d3.csv("merged_dataset_with_imagepath.csv").then(loadedData => {
  data = loadedData; // Store the data globally for updates
  NewData = data;
  console.log("Data loaded successfully:", data);
  // Initialize scatterplot, buttons, sliders, etc.
  createScatterplot(data);
  createLabelButtons(data);
  populateMetricsTable(); // Update the table with confidence scores and precision
  
  // Ensure this function is called to plot the bar charts immediately
  plotPrecisionAndConfidenceAcrossPersons();

  // Set initial gallery display
  const lowerThreshold = parseFloat(document.getElementById("min-slider").value);
  const upperThreshold = parseFloat(document.getElementById("max-slider").value);
  updateGalleryWithClassAndScore(data, selectedClass, lowerThreshold, upperThreshold);
});


document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-button");
  const downloadButton = document.getElementById("download-csv");

  if (toggleButton) {
      // Update global toggle state based on checkbox state
      toggleButton.addEventListener("change", () => {
          toggleState = toggleButton.checked ? "TRUE" : "FALSE";
          console.log(`Toggle state updated to: ${toggleState}`);
      });
  } else {
      console.error("Toggle button not found in the DOM.");
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
        // Log the updated data for verification
        console.log("Data to be downloaded:", NewData);

        // Convert `NewData` to CSV
        const headers = Object.keys(NewData[0]).join(","); // Extract headers from the first object
        const rows = NewData.map(row =>
            Object.values(row)
                .map(value => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value)) // Escape quotes in strings
                .join(",") // Join row values with commas
        );
        const csvContent = [headers, ...rows].join("\n"); // Combine headers and rows into CSV content

        // Create a Blob for CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create and trigger a download link
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "updated_data.csv"); // Set file name as CSV
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("CSV downloaded successfully!");
    });
} else {
    console.error("Download button not found.");
}

});


  
  
  
  
  