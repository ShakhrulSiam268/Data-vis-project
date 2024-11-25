function download(filename, data) { 

    //creating an invisible element 
    var element = document.createElement('a'); 
    // element.setAttribute('href', "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))); 
    element.setAttribute('href', 'data:text/json;charset=utf-8, '  + encodeURIComponent(JSON.stringify(data)));
    element.setAttribute('download', filename); 

    //the above code is equivalent to 
    // <a href="path of file" download="file name"> 

    document.body.appendChild(element); 

    //onClick property 
    element.click();

    document.body.removeChild(element); 
} 

// Start file download. 
document.getElementById("ResultSaver").addEventListener("click", function() { 
    // Generate download of hello.txt file with some content 
    // console.log("download")
    download("new_data.json", new_data); 
}, false);