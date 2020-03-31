var pdpData;
var remainingDataFiles = 1;
d3.csv("data/enumerated_p_cogam.csv", onLoadPdpData);
var iv1;
var iv2;
var iv3="%Pre-1940 Units";
var scrubVal = 0;
var filmstrip;
var scrubber;
var prev_ind=0;
var draw_track = true;
var isplay=false;
var nametoind={};

function onLoadPdpData(data) {
    pdpData = data;
    remainingDataFiles = remainingDataFiles - 1;
    onReadyData();
}

function play_helper(){
    filmstrip.value(scrubVal);
    filmstrip.track.scrollLeft = 150 * iv2 * scrubVal;
    var ind = getindex(scrubVal, iv2);
    if (prev_ind != ind) {
        prev_ind = ind;
        draw_track = false;
        controlInputsChangeHandler();
        draw_track = true;
    }
}

function play(){
    let img = document.getElementById("button_img");
    isplay=!isplay;
    if(!isplay){
        img.src="play.png";
    }
    else{
        img.src="pause.jpg";
    }
    play_cont();
}

function play_cont(){
    if(isplay && scrubVal<1) {
        scrubVal+=0.04;
        play_helper();
        setTimeout(() => { play_cont() }, 50);
    }
}


function onReadyData() {

    if (remainingDataFiles === 0) {
        nametoind["%Pre-1940 Units"]=0;
        nametoind["Stud-Teach Ratio"]=1;
        nametoind["Air Pollution"]=2;
        nametoind["Dist. CBD"]=3;
        document.getElementById("dashboard").style.display = "block";
        container = document.getElementById("scrubber-container");
        scrubber = new ScrubberView();
        container.appendChild(scrubber.elt);
        scrubber.onScrubStart = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
// onValueChanged is called whenever the scrubber is moved.
        scrubber.onValueChanged = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            filmstrip.track.scrollLeft = 150*iv2*scrubVal;
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
        scrubber.onScrubEnd = function (value) {
            scrubVal=value;
            filmstrip.value(scrubVal);
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
        container = document.getElementById("filmstrip-container");
        filmstrip = new FilmstripView();
        container.appendChild(filmstrip.elt);
        filmstrip.onScrubStart = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
        filmstrip.onValueChanged = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
        filmstrip.onScrubEnd = function (value) {
            scrubVal=value;
            scrubber.value(scrubVal);
            var ind = getindex(scrubVal,iv2);
            if(prev_ind!=ind){
                prev_ind=ind;
                draw_track=false;
                controlInputsChangeHandler();
                draw_track=true;
            }
        };
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

    plotCondition(iv1, iv2, iv3);
}

function setfeature(fname) {
    iv3=fname;
    var iv3Dropdown = document.getElementById("iv3");
    iv3Dropdown.selectedIndex=nametoind[fname];
    controlInputsChangeHandler();
}

function setbackground(idx,feature){
    for(let i=0;i<iv2;i++){
        let container=document.getElementById("filmstrip_"+feature+"_"+i);
        container.style.background="#FFF";
    }
    let container=document.getElementById("filmstrip_"+feature+"_"+idx);
    container.style.background="#DDD";
}


function plotCondition(iv1, iv2 ,iv3, shareY) {
    featureOrder = "default";
    var ind = getindex(scrubVal,iv2);
    prev_ind=ind;
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
            let solutionPdpData = pdpData.filter(function (d) {
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
            plotLines(solutionPdpData, currentSolutionMinY, currentSolutionMaxY);
        }
        else{
            let solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (d["feature"] == names[i])
            });
            let currentSolutionMaxY = Math.round(Math.max.apply(null, unravel(solutionPdpData, "Partial Price")));
            let currentSolutionMinY = Math.round(Math.min.apply(null, unravel(solutionPdpData, "Partial Price")));
            solutionPdpData = pdpData.filter(function (d) {
                return (true || d["method"] == iv1) && (parseInt(d["100*p"]) == 100) && (d["feature"] == names[i])
            });
            let share = "Local";
            if (shareY == "All") {
                share = "Global";
            }
            plotLines(solutionPdpData, currentSolutionMinY, currentSolutionMaxY);

        }
    }


    if(draw_track) {
        solutionPdpData = pdpData.filter(function (d) {
            return (true || d["method"] == iv1) && (d["feature"] == iv3)
        });
        plotFilmLines(solutionPdpData, ind, iv2, filmstrip.track, currentSolutionMinY,currentSolutionMaxY);
    }
    setbackground(ind,iv3);

}



