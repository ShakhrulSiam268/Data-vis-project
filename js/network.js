// Specify the path to the uploaded CSV file
const csvFile = 'labels.csv';

// Dimensions for the SVG container
const width = window.innerWidth - 700; // Adjust width to leave space for buttons and title
const height = window.innerHeight - 100;
const centerX = width / 2;
const centerY = height / 2;

// Create the main container for the layout
const container = d3.select("body")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("justify-content", "space-between")
    .style("align-items", "center")
    .style("height", "100vh")
    .style("padding", "0 50px");

// Create the title container on the left
const titleContainer = container.append("div")
    .style("width", "150px") // Fixed width for the title container
    .style("text-align", "center")
    .style("font-size", "20px")
    .style("font-weight", "bold");

// Add the placeholder for the network name
const title = titleContainer.append("span")
    .text("Network Title");

// Create the SVG container for the network
const svg = container.append("div")
    .style("flex", "1")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "white")
    .style("border", "1px solid #ccc");

// Create the button container on the right
const buttonContainer = container.append("div")
    .style("width", "150px") // Fixed width for the button container
    .style("text-align", "center")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("gap", "10px"); // Add spacing between buttons

// Add the "Show Original Network" button
const originalButton = buttonContainer.append("button")
    .text("Show Original Network")
    .style("padding", "10px 20px")
    .style("font-size", "14px")
    .style("cursor", "pointer");

// Add the "Search for Totem" button
const filteredButton = buttonContainer.append("button")
    .text("Search for Totem")
    .style("padding", "10px 20px")
    .style("font-size", "14px")
    .style("cursor", "pointer");

// Create a container inside the SVG to display "Totem: Object Name"
const totemDisplayContainer = container.append("div")
    .style("width", "150px") // Fixed width for the totem display container
    .style("text-align", "center")
    .style("font-size", "20px")
    .style("margin-bottom", "20px")  // Space above the buttons
    .style("font-weight", "bold")  // Optional, for better visibility
    .style("color", "blue");

// Read the CSV file and process data
d3.csv(csvFile).then(data => {
    // Create a set of unique persons and objects
    const persons = [...new Set(data.map(d => d.Person))];
    const objects = [...new Set(data.map(d => d.object))];

    // Track the appearance time of each object for each person
    const objectAppearanceTime = {};
    data.forEach(d => {
        if (!objectAppearanceTime[d.object]) {
            objectAppearanceTime[d.object] = {};
        }
        if (!objectAppearanceTime[d.object][d.Person]) {
            objectAppearanceTime[d.object][d.Person] = 0;
        }
        objectAppearanceTime[d.object][d.Person]++;
    });

    // Calculate positions for persons (center column) and objects (elliptical arrangement)
    const personSpacing = height / (persons.length + 1);
    const ellipseWidth = Math.min(width / 2, 300); // Dynamically adjust ellipse width
    const ellipseHeight = Math.min(height / 2.5, 200); // Dynamically adjust ellipse height
    const objectMargin = 200; // Add margin around the ellipse to avoid overlapping

    const personNodes = persons.map((person, i) => ({
        id: person,
        type: "person",
        x: centerX,
        y: personSpacing * (i + 1),
        appearanceCount: 0  // Initialize appearance count to 0
    }));

    const objectNodes = objects.map((object, i) => ({
        id: object,
        type: "object",
        x: centerX + (ellipseWidth + objectMargin) * Math.cos((2 * Math.PI * i) / objects.length),
        y: centerY + (ellipseHeight + objectMargin) * Math.sin((2 * Math.PI * i) / objects.length)
    }));

    const originalNodes = [...personNodes, ...objectNodes];
    const originalLinks = data.map(d => ({
        source: d.Person,
        target: d.object
    }));

    // Function to create filtered nodes and links
    function getFilteredNetwork() {
        const objectToPersonsMap = {};
        data.forEach(d => {
            if (!objectToPersonsMap[d.object]) {
                objectToPersonsMap[d.object] = new Set();
            }
            objectToPersonsMap[d.object].add(d.Person);
        });

        const filteredObjects = Object.keys(objectToPersonsMap).filter(
            object => objectToPersonsMap[object].size === 8
        );

        const filteredObjectNodes = objectNodes.filter(node =>
            filteredObjects.includes(node.id)
        );

        const filteredPersonIds = new Set();
        const filteredLinks = originalLinks.filter(link => {
            if (filteredObjects.includes(link.target)) {
                filteredPersonIds.add(link.source);
                return true;
            }
            return false;
        });

        const filteredPersonNodes = personNodes.filter(node =>
            filteredPersonIds.has(node.id)
        );

        return {
            nodes: [...filteredPersonNodes, ...filteredObjectNodes],
            links: filteredLinks
        };
    }

    // Function to draw the network
    function drawNetwork(nodes, links, titleText) {
        // Clear the SVG
        svg.selectAll("*").remove();

        // Update the network title
        title.text(titleText);

        // Draw links
        svg.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(links)
            .enter()
            .append("path")
            .attr("d", d => {
                const source = nodes.find(n => n.id === d.source);
                const target = nodes.find(n => n.id === d.target);
                const curvature = 0.5;

                const x1 = source.x;
                const y1 = source.y;
                const x2 = target.x;
                const y2 = target.y;

                const cx = (x1 + x2) / 2 + curvature * (y2 - y1);
                const cy = (y1 + y2) / 2 - curvature * (x2 - x1);

                return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
            })
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .attr("opacity", 0.8);

        // Draw nodes for persons
        const personNodesGroup = svg.append("g")
            .attr("class", "person-nodes");

        personNodesGroup.selectAll("rect")
            .data(nodes.filter(n => n.type === "person"))
            .enter()
            .append("rect")
            .attr("x", d => d.x - 30)
            .attr("y", d => d.y - 10)
            .attr("width", 65)
            .attr("height", 20)
            .attr("fill", "lightgray")
            .attr("stroke", "black")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                highlightPerson(d.id, nodes, links);
                event.stopPropagation();
            });

        personNodesGroup.selectAll("text")
            .data(nodes.filter(n => n.type === "person"))
            .enter()
            .append("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y + 5)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d.id)
            .style("font-size", "12px");

        // Draw nodes for objects
        const objectNodesGroup = svg.append("g")
            .attr("class", "object-nodes");

        objectNodesGroup.selectAll("circle")
            .data(nodes.filter(n => n.type === "object"))
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 6)
            .attr("fill", "orange")
            .attr("stroke", "black")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                highlightObject(d.id, nodes, links);
                event.stopPropagation();
            });

        objectNodesGroup.selectAll("text")
            .data(nodes.filter(n => n.type === "object"))
            .enter()
            .append("text")
            .attr("x", d => d.x + (d.x > centerX ? 10 : -10)) // Offset labels to avoid overlap
            .attr("y", d => d.y + 5) // Slightly below the circle
            .attr("text-anchor", d => (d.x > centerX ? "start" : "end")) // Align labels properly
            .attr("alignment-baseline", "middle")
            .text(d => d.id)
            .style("font-size", "10px");
    }

    // Highlight functions and event handlers
    function highlightPerson(personId, nodes, links) {
        // Highlight paths linked to the person
        svg.selectAll("path")
            .style("visibility", d => (d.source === personId ? "visible" : "hidden"));

        // Highlight the selected person node
        svg.selectAll("rect")
            .style("opacity", d => (d.id === personId ? 1 : 0.2))
            .style("stroke-width", d => (d.id === personId ? 2 : 1));

        // Adjust person text style
        svg.selectAll("text")
            .style("opacity", d => (d.id === personId || links.some(l => l.source === personId && l.target === d.id) ? 1 : 0.2))
            .style("font-size", d => (d.id === personId ? "16px" : "12px"))
            .style("fill", d => (d.id === personId ? "red" : "black"));

        // Highlight connected object nodes
        svg.selectAll("circle")
            .style("opacity", d =>
                links.some(l => l.source === personId && l.target === d.id) ? 1 : 0.2);
    }

    function highlightObject(objectId, nodes, links) {
        // Highlight paths linked to the object
        svg.selectAll("path")
            .style("visibility", d => (d.target === objectId ? "visible" : "hidden"));

        // Highlight the selected object node
        svg.selectAll("circle")
            .style("opacity", d => (d.id === objectId ? 1 : 0.2))
            .style("stroke-width", d => (d.id === objectId ? 2 : 1));

        // Adjust object text style
        svg.selectAll("text")
            .style("opacity", d => (d.id === objectId || links.some(l => l.target === objectId && l.source === d.id) ? 1 : 0.2))
            .style("font-size", d => (d.id === objectId ? "16px" : "12px"))
            .style("fill", d => (d.id === objectId ? "red" : "black"));

        // Highlight connected person nodes
        svg.selectAll("rect")
            .style("opacity", d =>
                links.some(l => l.target === objectId && l.source === d.id) ? 1 : 0.2);

        // Update appearance count for each person connected to the object
        const connectedPersons = links.filter(link => link.target === objectId).map(link => link.source);

        connectedPersons.forEach(personId => {
            const personNode = personNodes.find(p => p.id === personId);
            if (personNode) {
                personNode.appearanceCount = objectAppearanceTime[objectId][personId];
            }
        });

        // Update text for person nodes with appearance count and change color to red
        svg.selectAll(".person-nodes text")
            .text(d => {
                const personNode = personNodes.find(p => p.id === d.id);
                if (personNode) {
                    return `${d.id} (${personNode.appearanceCount})`;
                }
                return d.id;
            })
            .style("fill", "red"); // Change font color to red for the count number
    }

    // Reset the visualization when clicking outside the SVG
    function resetVisualization() {
        svg.selectAll("path")
            .style("visibility", "visible")
            .style("stroke", "green")
            .style("opacity", 0.8);

        svg.selectAll("rect")
            .style("opacity", 1)
            .style("stroke-width", 1)
            .style("fill", "lightgray");

        svg.selectAll("circle")
            .style("opacity", 1)
            .style("stroke-width", 1)
            .style("fill", "orange");

        svg.selectAll("text")
            .style("opacity", 1)
            .style("font-size", "12px")
            .style("fill", "black");

        title.text("Network Title");
    }
    // Function to find objects that are possessed at least twice by each corresponding person
    function getTotemObjects(filteredObjectNodes) {
        const totemObjects = [];

        // Loop through each filtered object and check its possession count
        filteredObjectNodes.forEach(objectNode => {
            // Get the list of persons associated with this object
            const associatedPersons = originalLinks.filter(link => link.target === objectNode.id).map(link => link.source);

            // Check if all persons possess this object at least twice
            const isTotem = associatedPersons.every(personId => {
                return objectAppearanceTime[objectNode.id][personId] >= 2;  // Must possess at least twice
            });

            if (isTotem) {
                totemObjects.push(objectNode.id);  // Add the object to the list of Totems
            }
        });

        return totemObjects;
    }



    // Event listener for the "Show Original Network" button
    originalButton.on("click", () => {
        drawNetwork(originalNodes, originalLinks, "Original Network");
    });

    // Event listener for the "Search for Totem" button
    filteredButton.on("click", () => {
        const { nodes: filteredNodes, links: filteredLinks } = getFilteredNetwork();
        const filteredObjectNodes = filteredNodes.filter(node => node.type === "object");

        // Get the Totem objects
        const totemObjects = getTotemObjects(filteredObjectNodes);
        console.log("Totem objects found:", totemObjects); // Log the found totem objects

        // Clear the previous Totem display
        totemDisplayContainer.selectAll("*").remove();

        // If no Totem objects are found, log a message
        if (totemObjects.length === 0) {
            console.log("No Totem objects found.");
        }

        // Display the Totem objects as text inside the SVG with blue font color
        totemObjects.forEach((totem, index) => {
            console.log(`Displaying Totem: ${totem}`); // Log each Totem object to be displayed
            totemDisplayContainer.append("text")
                .attr("x", 20) // Position text at a fixed location inside the SVG (to ensure visibility)
                .attr("y", 40 + index * 20) // Stack the texts vertically with a gap of 20px
                .text(`Totem: ${totem}`)
                .style("font-size", "14px")
                .style("fill", "blue"); // Set the font color to blue
        });

        // Draw the network with filtered totem objects
        drawNetwork(filteredNodes, filteredLinks, "Filtered Network");
    });


    // Event listener for clicks outside the SVG to reset the visualization
    d3.select("body").on("click", (event) => {
        if (!svg.node().contains(event.target)) {
            resetVisualization();
        }
    });

    // Draw the original network initially
    drawNetwork(originalNodes, originalLinks, "Original Network");
}).catch(error => console.error('Error loading or processing CSV:', error));

// Verify the structure of the `totemDisplayContainer` and check its position
console.log(totemDisplayContainer);
