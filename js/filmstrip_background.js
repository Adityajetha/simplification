var currentFeaturePdpData;
var TextData;
var currentSolutionMinY;
var currentSolutionMaxY;
var currentFeatureTextData;
var currentSolutionMinYLinear;
var currentSolutionMaxYLinear;
var currentSolutionMinYNonLinear;
var currentSolutionMaxYNonLinear;
var valueLabel;
var ft_to_val={};
var val_to_ft={};
var ft_chunk_indices={};
var charts = {};
var scrubVal;
var num_sim;
var numSol;





function plotFilmLines(solutionPdpData, numSol, container,shareY, grids, labels, featureOrder, ignoreZeros) {

    //console.log("featureOrder",featureOrder);

    //Clear linegraph container
    container = container;
    currentFeaturePdpData=solutionPdpData;
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }


    //Filter zero terms

    //console.log(solutionPdpData);

    //Get Y axes range
    var solutionsPdpDataLinear = solutionPdpData.filter(function (d) {
        return d["fit"] === "linear"
    });

    var solutionsPdpDataNonLinear = solutionPdpData.filter(function (d) {
        return d["fit"] === "non_linear"
    });

    currentSolutionMinY = null;
    currentSolutionMaxY = null;

    currentSolutionMinYLinear = null;
    currentSolutionMaxYLinear = null;

    currentSolutionMinYNonLinear = null;
    currentSolutionMaxYNonLinear = null;

    if (solutionsPdpDataLinear && solutionsPdpDataLinear.length > 0) {
        currentSolutionMinYLinear = Math.round(Math.min.apply(null, unravel(solutionsPdpDataLinear, "feature_outcomes")) - 0.5);
        currentSolutionMaxYLinear = Math.round(Math.max.apply(null, unravel(solutionsPdpDataLinear, "feature_outcomes")) + 0.5);
    }
    if (solutionsPdpDataNonLinear && solutionsPdpDataNonLinear.length > 0) {
        currentSolutionMinYNonLinear = Math.round(Math.min.apply(null, unravel(solutionsPdpDataNonLinear, "feature_outcomes")));
        currentSolutionMaxYNonLinear = Math.round(Math.max.apply(null, unravel(solutionsPdpDataNonLinear, "feature_outcomes")));
    }
    currentSolutionMinY = Math.round(Math.min.apply(null, [currentSolutionMinYLinear, currentSolutionMinYNonLinear].filter(function (n) {
        return !isNaN(n);
    })));
    currentSolutionMaxY = Math.round(Math.max.apply(null, [currentSolutionMaxYLinear, currentSolutionMaxYNonLinear].filter(function (n) {
        return !isNaN(n);
    })));

    // For each feature generate the plot
    for(var i=0;i<numSol;i++) {


        //console.log("text");
        //console.log(text);

        currentFeaturePdpData = solutionPdpData.filter(function (d) {
            return parseInt(d["100*p"]) == i
        });
        let featureLabel = currentFeaturePdpData[0]["feature"];

        valueLabel = currentFeaturePdpData[0]["feature"];
        ft_to_val[featureLabel] = valueLabel;
        val_to_ft[valueLabel] = featureLabel;
        var outcomeLabel = "Partial Price";
        var values = [];
        var outcomes = [];

        for (var j = 0; j < currentFeaturePdpData.length; j++) {
            values.push(currentFeaturePdpData[j]["value"]);
            outcomes.push(currentFeaturePdpData[j]["Partial Price"]);
        }


        // sample half
        var outcomesOld = outcomes;
        // outcomes =outcomes.slice(0,parseInt(outcomes.length/4));

        if (false && shareY === "Linear") {
            plotFilmLineGraph(values, outcomes, i, container,valueLabel, outcomeLabel, grids, true, currentSolutionMinYLinear, currentSolutionMaxYLinear);
        } else if (shareY == "NonLinear") {
            plotFilmLineGraph(values, outcomes, i, container, valueLabel, outcomeLabel, grids, true, currentSolutionMinYNonLinear, currentSolutionMaxYNonLinear);
        } else if (shareY === "All") {
            plotFilmLineGraph(values, outcomes, i, container, valueLabel, outcomeLabel, grids, true, currentSolutionMinY, currentSolutionMaxY);
        } else {
            //console.log("Length outcomes old",outcomesOld.length)
            var minY = Math.round(Math.min.apply(null, outcomesOld) - 0.5);
            var maxY = Math.round(Math.max.apply(null, outcomesOld) + 0.5);
            plotFilmLineGraph(values, outcomes, i,container, valueLabel, outcomeLabel, grids, true, minY, maxY);
        }

    }

}


function plotFilmLineGraph(values, outcomes, simplify_index,container, valueLabel,outcomeLabel, grids, shareY, minY, maxY) {


    //Create div in container
    console.log(currentFeatureTextData);
    console.log(container);
    lineGraphDiv = document.createElement("div");
    lineGraphDiv.style.position='relative';
    lineGraphDiv.style.left=simplify_index*300 +'px';
    lineGraphDiv.style.top=-simplify_index*250 +'px';
    console.log(lineGraphDiv.style.left);
    lineGraph = document.createElement("canvas");
    lineGraph.height = 250;
    lineGraph.id = "filmstrip_" + valueLabel+"_"+simplify_index;
    lineGraphDiv.id = valueLabel+simplify_index;
    lineGraphDiv.appendChild(lineGraph);
    ft_chunk_indices[valueLabel]={};
    container.appendChild(lineGraphDiv);

    var minX = Math.min.apply(null, values);
    var maxX = Math.max.apply(null, values);

    //Create data and config
    // if (shareY === "None") {
    //     minY = Math.min.apply(null, outcomes);
    //     maxY = Math.max.apply(null, outcomes);
    // }
    let datasets=[];


    datasets[0]={
        data: outcomes,
        fill: false,
        pointRadius: 0,
        showLine: true,
        backgroundColor: "#4281B5",
        borderColor: "#4281B5",
        //    #4281B5"
    };
    console.log(datasets);
    var data = {
        labels: values,
        datasets: datasets
    };

    var options = getLineGraphOptions(valueLabel, outcomeLabel, minX, maxX, minY, maxY, grids);
    var ctx = document.getElementById("filmstrip_" + valueLabel+"_"+simplify_index);
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    charts[valueLabel]=lineChart;
}

//Helper to turn list of dicts to array
function unravel(listOfDicts, key) {
    items = [];
    for (var i = 0; i < listOfDicts.length; i++) {
        items.push(listOfDicts[i][key]);
    }
    return items;
}

function logg(){
    console.log("On Hover");
}

function logc(){
    console.log("On Click");
}

function getFilmLineGraphOptions(valueLabel, outcomeLabel, minX, maxX, minY, maxY, grids) {

    var options = {};
    //console.log(grids);

    //charts[valueLabel][0]=this.getDatasetMeta(0);
    if (grids === "criticalGrid") {
        options = {
            responsive: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: valueLabel,
                    },
                    ticks: {
                        callback: xTickFormatterCritical,
                        autoSkip: false,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: outcomeLabel,
                    },
                    ticks: {
                        min: minY,
                        max: maxY,
                        callback: yTickFormatter,
                        autoSkip: true,
                        // minRotation: 30
                    },
                    afterBuildTicks: filterYTicks
                }]
            },
            legend: {
                display: false
            },
        };
    } else {
        options = {
            responsive: false,
            animation: false,
            events: ['mousemove','mouseout','click'],
            scales: {
                xAxes: [{
                    // gridLines: {
                    //     color: "rgba(0, 0, 0, 0)",},s
                    scaleLabel: {
                        display: true,
                        labelString: valueLabel,
                        fontColor: "#333436",
                        fontSize: 16,
                    },
                    ticks: {
                        callback: xTickFormatterQuantile,
                        autoSkip: false,
                        maxRotation: 0,
                        fontColor: "#424242",
                        // fontColor:"#fff"
                    }
                }],
                yAxes: [{
                    // gridLines: {
                    //     color: "rgba(0, 0, 0, 0)",},
                    scaleLabel: {
                        display: true,
                        labelString: outcomeLabel,
                    },
                    ticks: {
                        min: minY,
                        max: maxY,
                        callback: yTickFormatter,
                        autoSkip: true,
                        minRotation: 30,
                        maxTicksLimit: 6,
                        precision: 0,
                        fontColor: "#424242",
                        // fontColor:"#fff"
                    },
                    // afterBuildTicks: filterYTicksQuantile
                }]
            },
            legend: {
                display: false,
            },
        };

    }
    //console.log("options",options);

    return options;
}

function filterXTicks(axis, ticks) {

    //console.log(ticks);

    xMin = parseInt(Math.min.apply(null, ticks));
    xMax = parseInt(Math.max.apply(null, ticks));
    newTicks = [xMin, xMax];
    // tick = xMin;
    // while(tick<=xMax){
    //   newTicks.push(tick);
    //   tick = tick + 1;
    // }
    //console.log("In filter x ticks",newTicks);

    return ticks;

}


function xTickFormatterCritical(value, index, values) {

    if (currentFeaturePdpData[index]["xlabelCritical"] == 1) {
        return Math.round(value);

    }
}

function xTickFormatterQuantile(value, index, values) {

    if (currentFeaturePdpData[index]["xlabelQuantile"] == 1) {
        return Math.round(value, 2);
        // return value;
    }
}

function yTickFormatterQuantile(value, index, values) {
    if (currentFeaturePdpData[index]["ylabelQuantile"] == 1) {
        return value;
    }
}

function yTickFormatter(value, index, values) {
    // return Math.round((value / 1000)).toString() + " K"

    // if(value!==0) {
    //console.log(iv2 + "," + iv3 + "," + valueLabel + "," + value.toString());
    return value.toString() + " K";
    // }

}

function avoidTickOverlaps(newTicks) {
    minTick = Math.min.apply(null, newTicks);
    maxTick = Math.max.apply(null, newTicks);
    minDistance = (maxTick - minTick) * 0.01;

    var ticks = [];
    // always show min and max labels
    // assume sorted order
    ticks.push(newTicks[0]);
    for (var i = 1; i < newTicks.length; i++) {
        prevTick = newTicks[i - 1];
        currentTick = newTicks[i];
        if (currentTick - prevTick >= minDistance) {
            ticks.push(currentTick)
        }
    }

    return ticks;
}

function filterYTicks(axis, ticks) {

    newTicks = currentFeaturePdpData.filter(function (d) {
        return d["ylabel"] == 1
    });
    ////console.log(newTicks);
    newTicks = unravel(newTicks, "feature_outcomes");
    ////console.log(ticks,newTicks);
    // newTicks.unshift(currentSolutionMinY);
    // newTicks.push(currentSolutionMaxY);
    //newTicks = avoidTickOverlaps(newTicks);

    return newTicks;
}

function filterYTicksQuantile(axis, ticks) {

    newTicks = currentFeaturePdpData.filter(function (d) {
        return d["ylabelQuantile"] == 1
    });
    ////console.log(newTicks);
    newTicks = unravel(newTicks, "feature_outcomes");
    ////console.log(ticks,newTicks);
    // newTicks.unshift(currentSolutionMinY);
    // newTicks.push(currentSolutionMaxY);
    newTicks = avoidTickOverlaps(newTicks);

    return newTicks;
}
