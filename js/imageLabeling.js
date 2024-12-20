let main = "#mainDiv"
let allData;
let imageSelectionSize = {width: 300, eachHeight: 43, height: 700}
let labelSelectionSize = {width: 250}

let imagesPerPage = 15, currentPage = 1;

const imageDisplaySize = {top: 10, right: 10, bottom: 10, left: 10},
    width = 740 - imageDisplaySize.left - imageDisplaySize.right,
    height = 740 - imageDisplaySize.top - imageDisplaySize.bottom;

let imageCPsize = {height: 60}

let imageSize = {width: 720, height: 720}

let controlPanelSize = {height: 60}

let image, thisImage, thisCaption, thisPerson,thisDifficult = null, bbox = false;

let currentPerson = "Person1"

let globalSelection = {}, prevSelect = {}, tableInitLabel;

const titlesLabel = ['Person', 'Image', 'Objects', 'Difficult']

const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));

// let controlPanel = d3.select(main).append('div')
//     .style("height", controlPanelSize.height + "px")
let imageSelectionDiv = d3.select(main).append('div')
    .attr("id", "imageSelection")
    .attr("class", "boxBlock")
    .style("width", imageSelectionSize.width + "px")
.style("height", imageSelectionSize.height + "px")

let select = imageSelectionDiv.append("div")
    // .text("hi")

let dropdown = select
    .insert("select", "svg")
    .attr("id", "personSelection")
    .style("display", "block")
    .style("float", "left")
    .on("change", dropdownChange)

dropdown.selectAll("option")
    .data(person)
    .enter()
    .append("option")
    .attr("class", "option")
    .attr("value", d => d)
    .html(d => d)

new SlimSelect({
    select: '#personSelection',
});

let selections = imageSelectionDiv.append("div")

// Handler for dropdown value change
function dropdownChange() {
    currentPerson = d3.select(this).property('value')
    currentPage = 1
    drawImageSelection()
}


// ----------- LABEL SELECTION ------------
let labelSelectionDiv = d3.select(main).append("div")
    .attr("id", "labelSelection")
    .attr("class", "boxBlock labelSelection")
    .style("width", labelSelectionSize.width + "px")

let detectedDiv = labelSelectionDiv.append("div")
    .attr("class", "sectionWrapper")

detectedDiv.append("div")
    .attr("class", "sectionTitle")
    .text("DETECTED")

let labelSpace = detectedDiv.append("div")
    .attr("class", "labelOption")

let recommendDiv = labelSelectionDiv.append("div")
    .attr("class", "sectionWrapper rec")

recommendDiv.append("div")
    .attr("class", "sectionTitle")
    .attr("id", "recText")
    .text("ALTERNATIVE")
    .style("top", (35) + "px")

let parDiv = recommendDiv.append("div").attr("id", "parentDiv")

let recommendSpace = parDiv.append("div")
    .attr("class", "labelOption")
    .append("div")

// ----------- DISPLAY IMAGE ---------------
let imageDisplayDiv = d3.select(main).append('div')
    .attr("class", "imageDisplay")

imageDisplayDiv.append("div")
    .attr("id", "imageSpecified")
    .attr("class", "boxBlock imageSpecified")
    .style("width", width + "px")
    .style("height", imageCPsize.height + "px")

let imageFrame = imageDisplayDiv.append("div")
    .attr("class", "imageFrame")

let imageCaption = imageDisplayDiv.append("div")
    .attr("class", "boxBlock imageCaption")
    .style("visibility", "hidden")

let similarFrame = d3.select().append("div")
    .attr("class", "imageFrame")

// -------- table ---------------------------
let tablePanel = d3.select(main)
    .append("div")
    .attr("id", "table-wrapper-relabel")
    .append("table")


init()


function init() {
    drawImageSelection()
    showImage()
}

function drawImageSelection() {
    let prevDiv;
    let chunks = array_chunks(images.filter(d => d.includes(currentPerson+"_")), imagesPerPage)
    let totalPage = Math.ceil(images.filter(d => d.includes(currentPerson+"_")).length / imagesPerPage)
    imageSelectionDiv.selectAll("#bottomDiv").remove()

    updateSelectionDiv()

    let bottomDiv = imageSelectionDiv.append("div")
        .attr("id", "bottomDiv")
        .attr("class", "switchPage")
        .style("margin-top", (imageSelectionSize.height - imageSelectionSize.eachHeight*chunks[currentPage - 1].length) + "px")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-left fasIcon")
        .style("left", "10px")
        .attr("id", "prevBtn")
        .on("click", function () {
            if (currentPage > 1){
                currentPage -= 1;
                updateSelectionDiv()

                d3.select("#pageText")
                    .html("Page " + currentPage + " of " + totalPage)

                bottomDiv
                    .style("margin-top", (imageSelectionSize.height - imageSelectionSize.eachHeight*chunks[currentPage - 1].length) + "px")

            }
        })


    bottomDiv.append("span").attr("id", "pageText")
        .html("Page " + currentPage + " of " + totalPage)
        .style("position", "absolute")
        .style("left", "35%")

    bottomDiv
        .append("i")
        .attr("class", "fas fa-chevron-circle-right fasIcon")
        .attr("id", "nextBtn")
        .style("right", "10px")
        .on("click", function (d) {
            if (currentPage < totalPage){
                currentPage += 1;
                updateSelectionDiv()

                d3.select("#pageText")
                    .html("Page " + currentPage + " of " + totalPage)

                bottomDiv
                    .style("margin-top", (imageSelectionSize.height - imageSelectionSize.eachHeight*chunks[currentPage - 1].length) + "px")

            }
        })


    function updateSelectionDiv(){
        selections
            .selectAll(".image-selection").remove()

        selections
            .selectAll(".image-selection")
            .data(chunks[currentPage - 1])
            .enter()
            .append("div")
            // .style("height", imageSelectionSize.eachHeight + "px")
            .attr("class", "image-selection")
            .style("height", imageSelectionSize.eachHeight + "px")
            .style("line-height", (imageSelectionSize.eachHeight - 10 )+ "px")
            .text(d => d + ".jpg")
            .on("click", function (d) {
                // update image
                thisImage = d
                updateImage(bbox, thisImage)
                console.log("Update Image called for :", thisImage);

                //default rotation
                image.attr("transform", "rotate(0" + "," + (width / 2) + ", " + (height / 2) + ")")

                // add label
                drawLabelSelection()

                d3.select(this).classed("selected", true)
                d3.select(prevDiv).classed("selected", false)
                prevDiv = this;
            })

    }
}

function drawLabelSelection() {
    thisPerson = thisImage.split("_")[0]

    // d3.csv("MC2-Image-Data/" + thisPerson + "/" + thisImage + ".csv", function (error, data) {
    //     if (error) throw error;
    //     prevSelect = {}

    d3.csv("annotated_csv/" + thisImage + ".csv", function (error, data) {
        if (error) throw error;
        prevSelect = {}

        let selection = labelSpace.selectAll(".detectedLabel")
            .data(data.sort((a, b) => +b.Score - +a.Score), d => d.Label);

        // EXIT
        selection.exit()
            .style("opacity", 1)
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove()

        // UPDATE
        selection
            .classed("selectedLabel", false)
            .transition()
            .duration(500)
            .style("top", (d, i) => ((i + 1) * 34) + "px")

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
            .attr("opacity", 1)

        // Rec position
        d3.select("#recText")
            .style("top", ((data.length + 1) * 34) + "px")
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("opacity", 1)

        //    The rest of data
        let detectedData = data.map(d => d.Label)
        // let recData = d3.shuffle(classes.filter(d => !detectedData.includes(d)))
        //     .slice(0, Math.floor(Math.random() * 10) + 2)
        // let remainingData = classes.filter(d => ((!detectedData.includes(d)) && (!recData.includes(d))))

    //    Add recommend labels

        // recData = getRecommend(data)

        let recData = classes.filter(d => !detectedData.includes(d)).map(d => {
            return {
                Label: d
            }
        })

        console.log(detectedData, recData)
        let recselection = recommendSpace.selectAll(".recLabel")
            .data(recData, d => d.Label);

        // EXIT
        recselection.exit()
            .style("opacity", 1)
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove()

        // UPDATE
        recselection
            .classed("selectedLabel", false)
            .transition()
            .duration(500)
            .style("top", (d, i) => ((i + 1 + detectedData.length + 1) * 34) + "px")

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
            .attr("opacity", 1)

        //    select on click
        labelSelectionDiv.selectAll(".objectLabel")
            .on("click", function (d) {

                if (!prevSelect[d.Label]) {
                    prevSelect[d.Label] = true
                    d3.select(this).classed("selectedLabel", true)
                } else {
                    prevSelect[d.Label] = false
                    d3.select(this).classed("selectedLabel", false)
                }
                // console.log(prevSelect)
            })
    })




}

function showImage() {
    let imageDisplaySvg = imageFrame.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svgImageDisplay")
        .append("g")

    image = imageDisplaySvg.append('image')
        .attr("id", "image")
        .attr("width", imageSize.width)
        .attr("height", imageSize.height)
        .attr("transform", "rotate(0, " + (width / 2) + ", " + (height / 2) + " )")

//    buttons for specify
    d3.select("#imageSpecified")
        .append("div")
        .attr("class", "btnDiv")
        .selectAll(".specifiyBtn")
        .data(["Original", "Annotated"])
        .enter()
        .append("button")
        .style("display", "inline")
        .attr("type", "button")
        .attr("id", d => "btn" + d)
        .attr('class', (d, i) => i ? "btn btn-sm specifiyBtn btn-light" : "btn btn-sm specifiyBtn btn-primary")
        .html(d => d)
        .on("click", function (d, i) {

            let thisBtn = d3.select(this)
            d3.selectAll(".specifiyBtn")
                .classed("btn-light", true)
                .classed("btn-primary", false)
            thisBtn.classed("btn-primary", true)
                .classed("btn-light", false)
            bbox = !!i
            // console.log(bbox)

            if (thisImage) {
                updateImage(bbox, thisImage)
            }
            console.log("Update Image called for :", thisImage);

        })

    let countClick = 0
    d3.select("#imageSpecified")
        .append("i")
        .attr("class", "fas fa-sync-alt fasIcon rotateBtn")
        .on("click", () => {
            countClick += 90
            image.attr("transform", "rotate(" + countClick + "," + (width / 2) + ", " + (height / 2) + ")")
        })

    // save button
    d3.select("#imageSpecified")
        .append("button")
        .style("display", "inline")
        .attr("type", "button")
        .attr('class', "btn btn-sm specifiyBtn btn-outline-secondary btnDiv")
        .style("margin-left", "-280px")
        .html("Save")
        .on("click", function () {

            // save to global db
            if (!globalSelection[thisPerson]){
                globalSelection[thisPerson] = {}
                globalSelection[thisPerson][thisImage] = d3.keys(prevSelect).filter(d => prevSelect[d] === true).sort()
                globalSelection[thisPerson][thisImage].difficult = thisDifficult

            }
            else {
                globalSelection[thisPerson][thisImage] = d3.keys(prevSelect).filter(d => prevSelect[d] === true).sort()
                globalSelection[thisPerson][thisImage].difficult = thisDifficult
            }
            // console.log(globalSelection, selectionObjToArr(globalSelection))
            updateTable();

        })
    d3.select("#imageSpecified")
        .append("button")
        .style("display", "inline")
        .attr("type", "button")
        .attr('class', "btn btn-sm specifiyBtn btn-outline-secondary btnDiv")
        .style("margin-left", "-225px")
        .html("Difficult")
        .on("click", function () {
            // not yet init
            if ((!globalSelection[thisPerson][thisImage]) || (!globalSelection[thisPerson][thisImage].difficult)){
                thisDifficult = true
            }
            else {
                globalSelection[thisPerson][thisImage].difficult = false
                thisDifficult = false
            }
        })
}

function updateTable() {
    let data = selectionObjToArr(globalSelection)

    let table = d3.select("table")

    // initiate table
    if (!tableInitLabel) {
        table.append('thead').append('tr')
            .selectAll('th')
            .data(titlesLabel).enter()
            .append('th')
            .attr("class", "th-data")
            .text(d => d);

        table.append('tbody').attr("id", "tb");

        tableInitLabel = true;

        d3.select("#mainDiv")
            .append("button")
            .style("display", "inline")
            .attr("type", "button")
            .attr('class', "btn btn-sm btn-success exportBtn")
            .html("Export")
            .on("click", function () {
                download_csv(globalSelection)
            })
    }

    d3.select("tbody").selectAll("td").remove("*")

    data.forEach(function (row) {
        return $("#tb").append('<tr>' +
            '<td>' + row.Person + '</td>' +
            '<td>' + (row.Image) + '</td>' +
            '<td >' + stringifyArray(row.Objects) + '</td>' +
            '<td >' + (row.Difficult ? "*" : "") + '</td>' +

            '</tr>');
    });
}

function stringifyArray(arr) {
    let str = "";
    arr.forEach(d => str = str.concat(d) + '<br>')
    return str
}

function selectionObjToArr(obj){
    let arr = []
    d3.keys(obj).forEach(person => {
        d3.keys(obj[person]).forEach(image => {
            arr.push({
                Person: person,
                Image: image,
                Objects: obj[person][image],
                Difficult: obj[person][image].difficult
            })
        })
    })

    arr.sort((a,b) => +a.Image.split("_")[1] - +b.Image.split("_")[1])
        .sort((a,b) => +a.Person.slice(6) - +b.Person.slice(6))
    console.log(arr)
    return arr
}

function selectionToArrSingleLine(obj) {
    let arr = []
    d3.keys(obj).forEach(person => {
        d3.keys(obj[person]).forEach(image => {
            obj[person][image].forEach(object => {
                arr.push({
                    Person: person,
                    Image: image,
                    Object: object,
                    Difficult: !!obj[person][image].difficult
                })
            })
        })
    })

    arr.sort((a,b) => a.Object - b.Object)
        .sort((a,b) => +a.Image.split("_")[1] - +b.Image.split("_")[1])
        .sort((a,b) => +a.Person.slice(6) - +b.Person.slice(6))
    return arr
}

function updateImage(bbox, thisImage) {
    let person = thisImage.split("_")[0]

    d3.select("#image")
        .attr('xlink:href', bbox ? "annotated_image/" + thisImage + "bbox.jpg" : "MC2-Image-Data/" + person + "/" + thisImage + ".jpg")

    thisDifficult = null
    // add caption
    d3.csv("caption.csv", function (error, captionData) {
        if (error) throw error;

        console.log(captionData)
        thisCaption = captionData.find(d => d.Image === thisImage)
        if (thisCaption){
            console.log(thisCaption)
            imageCaption
                .html(thisCaption.Caption)
                .style("visibility", "visible")
        }
        else {
            imageCaption.style("visibility", "hidden")
        }
    })
}



function download_csv(data) {
    let input = selectionToArrSingleLine(data)
    let keys = d3.keys(input[0])

    let inputArr = input.map(d => {
        return keys.map(e => d[e])
    })

    var csv = 'Person,Image,Object,Difficult\n';
    inputArr.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });

    console.log(csv);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'labels.csv';
    hiddenElement.click();
}

function getPerson(str) {
    // sortedImages = images.sort((a,b) => +a.split("_")[1] - +b.split("_")[1]).sort((a,b) => {
    //     return getPerson(a) - getPerson(b)
    // })
    return +str.split("_")[0].slice(6)
}

function showSimilarImage() {

}
