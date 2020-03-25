//1. Fetch data
var pdpData;
var textData;
var remainingDataFiles = 1;
var dataset = "boston";
d3.csv("data/enumerated_p_cogam.csv", onLoadPdpData);
var iv1;
var iv2;
var iv3;
var iv4;
var iv5;
var iv6;
var scrubVal = 0;
var filmstrip;
var scrubber;
var prev_ind=0;
var draw_track = true;

function onLoadPdpData(data) {
    pdpData = data;
    remainingDataFiles = remainingDataFiles - 1;
    onReadyData();
}

function onReadyData() {

    if (remainingDataFiles == 0) {
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("preload").style.display = "none";
        container = document.getElementById("scrubber-container");
        scrubber = new ScrubberView();
        //console.log(container);
        container.appendChild(scrubber.elt);

// onScrubStart is called whenever a user starts scrubbing
        scrubber.onScrubStart = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            //console.log(value); // the value at the time of scrub start
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }


// onValueChanged is called whenever the scrubber is moved.
        scrubber.onValueChanged = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            filmstrip.track.scrollLeft = 150*iv2*scrubVal;
            //console.log(scrubVal); // the value at time of invocation
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }

// onScrubEnd is called whenever a user stops scrubbing
        scrubber.onScrubEnd = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            //console.log(scrubVal); // the value at the time of scrub end
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }

        container = document.getElementById("filmstrip-container");
        filmstrip = new FilmstripView();
        container.appendChild(filmstrip.elt);

// onScrubStart is called whenever a user starts scrubbing
        filmstrip.onScrubStart = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            //console.log(value); // the value at the time of scrub start
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }


// onValueChanged is called whenever the scrubber is moved.
        filmstrip.onValueChanged = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            //console.log(scrubVal); // the value at time of invocation
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }

// onScrubEnd is called whenever a user stops scrubbing
        filmstrip.onScrubEnd = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            //console.log(scrubVal); // the value at the time of scrub end
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        }


        controlInputsChangeHandler();
    }
}

function getindex(sc,num){
    if(parseInt(sc*num)==num)
        return num-1;
    return parseInt(sc*num);
}


function controlInputsChangeHandler() {

    var iv1Dropdown = document.getElementById("iv1");
    iv1 = iv1Dropdown.options[iv1Dropdown.selectedIndex].value;

    var iv2Dropdown = document.getElementById("iv2");
    iv2 = iv2Dropdown.options[iv2Dropdown.selectedIndex].value;

    var iv3Dropdown = document.getElementById("iv3");
    iv3 = iv3Dropdown.options[iv3Dropdown.selectedIndex].value;

    var shareY = [].filter.call(document.getElementsByName("shareYRadios"), function (n) {
        return n.checked
    })[0].value;
    let grids="defaultGrid";
    let labels="defaultLabels";
    let featureOrder="alphabetical";
    plotCondition(iv1, iv2, iv3, shareY, grids, labels, featureOrder);
}


function plotCondition(iv1, iv2 ,iv3, shareY, grids, labels, featureOrder) {
    var ignoreZeros = true;
    featureOrder = "default";
    var ind = getindex(scrubVal,iv2);
    prev_ind=ind;
    //console.log(iv1,ind,iv3);
    //console.log(pdpData);
    //console.log('ind is ' + ind);
    container = document.getElementById("linegraphs-container");

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    names=[];
    names[0]="%Pre-1940 Units";
    names[1]="Stud-Teach Ratio";
    names[2]="Air Pollution";
    names[3]="Dist. CBD";
    for(var i=0;i<4;i++) {
        if(names[i]==iv3) {
            var solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (d["feature"] == iv3)
            });
            let currentSolutionMaxY = Math.round(Math.max.apply(null, unravel(solutionPdpData, "Partial Price")));
            let currentSolutionMinY = Math.round(Math.min.apply(null, unravel(solutionPdpData, "Partial Price")));
            solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (parseInt(d["100*p"]) == ind) && (d["feature"] == iv3)
            });
            let share = "Local";
            if (shareY == "All") {
                share = "Global";
            }
            //console.log(solutionPdpData);
            plotLines(solutionPdpData, currentSolutionMinY, currentSolutionMaxY, shareY, grids, labels, featureOrder, ignoreZeros);
        }
        else{/*
            var solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (d["feature"] == names[i])
            });
            let currentSolutionMaxY = Math.round(Math.max.apply(null, unravel(solutionPdpData, "Partial Price")));
            let currentSolutionMinY = Math.round(Math.min.apply(null, unravel(solutionPdpData, "Partial Price")));
            solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (parseInt(d["100*p"]) == 100) && (d["feature"] == iv3)
            });
            let share = "Local";
            if (shareY == "All") {
                share = "Global";
            }
            //console.log(solutionPdpData);
            plotLines(solutionPdpData, currentSolutionMinY, currentSolutionMaxY, shareY, grids, labels, featureOrder, ignoreZeros);
        */
        }
    }


    if(draw_track) {
        solutionPdpData = pdpData.filter(function (d) {
            return (true || d["method"] == iv1) && (d["feature"] == iv3)
        });


        plotFilmLines(solutionPdpData, ind, iv2, filmstrip.track, currentSolutionMinY,currentSolutionMaxY, shareY, grids, labels, featureOrder, ignoreZeros);
    }
    //var varid = "filmstrip_" + iv3 +"_"+ind;
    //var elmnt = document.getElementById(varid);
    //elmnt.scrollIntoView();

}



