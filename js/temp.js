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
var ft_chunk_indices={}
var charts = {}

function plotLines(solutionPdpData, solutionTextData, shareY, grids, labels, featureOrder, ignoreZeros) {

    //console.log("featureOrder",featureOrder);

    //Clear linegraph container
    container = document.getElementById("linegraphs-container");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    //Filter zero terms
    if (ignoreZeros) {
        solutionPdpData = solutionPdpData.filter(function (d) {
            return d["fit"] === "linear" || d["fit"] === "non_linear"
        })
    }

    TextData = solutionTextData;
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
    ////console.log("MInMAx",currentSolutionMinYLinear,currentSolutionMinYNonLinear,currentSolutionMinY,currentSolutionMaxY);

    //Sort plot order by features
    var sortedFeatures = [];
    if (featureOrder === "alphabetical") {
        var features = d3.map(solutionPdpData, function (d) {
            return (d["feature"])
        }).keys();
        sortedFeatures = features.slice().sort();
    } else if (featureOrder === "sensitivity") {

        var featureSensitivites = d3.map(solutionPdpData, function (d) {
            return ([d["feature"], d["sensitivity"]])
        }).keys();
        var features = [];
        featureSensitivites.forEach(function (d) {
            features.push(d.split(","))
        });
        //  //console.log("feature keys", features);
        features.sort(function (a, b) {
            return parseFloat(a[1]) - parseFloat(b[1])
        }).reverse();
        for (var i = 0; i < features.length; i++) {
            sortedFeatures.push(features[i][0]);
        }
    } else if (featureOrder === "default") {
        sortedFeatures = unravel(solutionPdpData, "feature");
        //console.log(sortedFeatures);
        sortedFeatures = sortedFeatures.reduce(function (a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }, []);

    }

    //console.log("sorted features", sortedFeatures);

    // For each feature generate the plot
    for (var i = 0; i < sortedFeatures.length; i++) {

        currentFeaturePdpData = solutionPdpData.filter(function (d) {
            return d["feature"] === sortedFeatures[i]
        });

        currentFeatureTextData = TextData.filter(function (d) {
            return d["Feature Name"] === sortedFeatures[i]
        });

        //console.log("text");
        //console.log(text);
        let featureLabel = currentFeaturePdpData[0]["feature"];
        console.log(featureLabel);

        valueLabel = currentFeaturePdpData[0]["feature_friendly"];
        console.log(valueLabel);
        ft_to_val[featureLabel]=valueLabel;
        val_to_ft[valueLabel]=featureLabel;
        var outcomeLabel = "Partial Price";
        var values = [];
        var outcomes = [];

        for (var j = 0; j < currentFeaturePdpData.length; j++) {
            values.push(currentFeaturePdpData[j]["feature_values"]);
            outcomes.push(currentFeaturePdpData[j]["feature_outcomes"]);
        }

        var fit = currentFeaturePdpData[0]["fit"];

        // sample half
        var outcomesOld = outcomes;
        // outcomes =outcomes.slice(0,parseInt(outcomes.length/4));

        if (fit === "linear" && shareY === "Linear") {
            plotLineGraph(values, outcomes, currentFeatureTextData, valueLabel, outcomeLabel, grids, true, currentSolutionMinYLinear, currentSolutionMaxYLinear);
        } else if (fit === "non_linear" && shareY == "NonLinear") {
            plotLineGraph(values, outcomes, currentFeatureTextData, valueLabel, outcomeLabel, grids, true, currentSolutionMinYNonLinear, currentSolutionMaxYNonLinear);
        } else if (shareY === "All") {
            plotLineGraph(values, outcomes, currentFeatureTextData, valueLabel, outcomeLabel, grids, true, currentSolutionMinY, currentSolutionMaxY);
        } else {
            //console.log("Length outcomes old",outcomesOld.length)
            var minY = Math.round(Math.min.apply(null, outcomesOld) - 0.5);
            var maxY = Math.round(Math.max.apply(null, outcomesOld) + 0.5);
            plotLineGraph(values, outcomes, currentFeatureTextData, valueLabel, outcomeLabel, grids, true, minY, maxY);
        }

    }

}

function find_ind(xval,ftname){
    //console.log(xval,ftname,val_to_ft[ftname]);
    FeatureTextData = TextData.filter(function (d) {
        return d["Feature Name"] === val_to_ft[ftname]
    });

    for(var i=0;i<FeatureTextData.length;i++){
        //console.log(FeatureTextData[i]);
        if(parseFloat(FeatureTextData[i]["x_min"])<=xval && parseFloat(FeatureTextData[i]["x_max"])>=xval){
            return i;
        }
    }
}

function changeText(valueLabel,ind){
    let id = "text_linegraph_"+ind+"_"+valueLabel;
    console.log(id);
    let contai = document.getElementById(id);
    console.log(contai);
    contai.style.color = "red";
}

function neutralise(){
    var all = document.getElementsByTagName("*");

    for (var i=0, max=all.length; i < max; i++) {
        let contai = all[i];
        //console.log(contai);
        contai.style.color = "black";
        // Do something with the element here
    }
}

function hideLine(i){
    let ind = parseInt(i.split("_")[2]);
    if(ind<2)return;
    let valueLabel = i.split("_")[3];
    ctx = charts[valueLabel].getDatasetMeta(ind-2);
    console.log(ctx);
    console.log(ctx.hidden);
    ctx.hidden=true;
    charts[valueLabel].update();
    console.log('hide line '+ind,valueLabel);
}

function showLine(i){
    let ind = parseInt(i.split("_")[2]);
    if(ind<2)return;
    let valueLabel = i.split("_")[3];
    ctx = charts[valueLabel].getDatasetMeta(ind-2);
    console.log(ctx);
    console.log(ctx.hidden);
    ctx.hidden=false;
    charts[valueLabel].update();
    console.log('hide line '+ind,valueLabel);
}


function plotLineGraph(values, outcomes, currentFeatureTextData, valueLabel,outcomeLabel, grids, shareY, minY, maxY) {


    //Create div in container
    console.log(currentFeatureTextData);
    container = document.getElementById("linegraphs-container");
    lineGraphDiv = document.createElement("div");
    lineGraph = document.createElement("canvas");
    lineGraph.height = 270;
    lineGraph.id = "linegraph_" + valueLabel;
    lineGraphDiv.id = valueLabel;
    lineGraphDiv.appendChild(lineGraph);
    ft_chunk_indices[valueLabel]={};
    for(i=0;i<currentFeatureTextData.length;i++){
        let graphText = document.createElement("p");
        graphText.id= "text_linegraph_"+i+"_" + valueLabel;
        graphText.style.display = 'inline';
        graphText.innerHTML = currentFeatureTextData[i]["Text"];
        graphText.onmouseover = function(){showLine(graphText.id)};
        graphText.onmouseout = function(){hideLine(graphText.id)};
        lineGraphDiv.appendChild(graphText);
    }

    container.appendChild(lineGraphDiv);

    var minX = Math.min.apply(null, values);
    var maxX = Math.max.apply(null, values);

    //Create data and config
    // if (shareY === "None") {
    //     minY = Math.min.apply(null, outcomes);
    //     maxY = Math.max.apply(null, outcomes);
    // }
    let datasets=[];
    let FeatureTextData = TextData.filter(function (d) {
        return d["Feature Name"] === val_to_ft[valueLabel]
    });

    for(var i=2;i<FeatureTextData.length;i++){
        let obj={
            fill:false,
            pointRadius: 0,
            showLine: true,
            backgroundColor: "#ff0000",
            borderColor: "#ff0000",
            hidden: true
        }
        let chunkData=[];
        for(var j=0;j<outcomes.length;j++){

            if(parseFloat(FeatureTextData[i]["x_min"])<=values[j] && parseFloat(FeatureTextData[i]["x_max"])>=values[j]){
                console.log("here");
                chunkData[j]=outcomes[j];
            }
            else{
                chunkData[j]=null;
            }
        }
        obj['data']=chunkData;
        datasets[i-2]=obj;
        console.log(obj);
        console.log(datasets);
    }
    datasets[currentFeatureTextData.length-2]={
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
    var ctx = document.getElementById("linegraph_" + valueLabel);
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

function getLineGraphOptions(valueLabel, outcomeLabel, minX, maxX, minY, maxY, grids) {

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
            onHover: function(evt) {
                var el = this.getElementAtEvent(evt)[0];
                if(el){
                    var ccc = el._chart;
                    var ft_name = ccc['canvas'].id.substring(10);
                    var xval = this.data.labels[el._index];
                    var ind = find_ind(xval,ft_name);
                    //var dt = this.getDatasetAtEvent(evt);
                    changeText(ft_name,ind);
                }
                else{neutralise();}
            },
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


//
// var options =  {
//   responsive:false,
//   scales:{
//     xAxes:[{
//       scaleLabel:{
//         display:true,
//         labelString:valueLabel,
//       },
//       ticks:{
//         callback:xTickFormatterCritical,
//         autoSkip:false,
//       }
//     }],
//     yAxes:[{
//       scaleLabel:{
//         display:true,
//         labelString:outcomeLabel,
//       },
//       ticks:{
//         min:minY,
//         max:maxY,
//         callback:yTickFormatter,
//         autoSkip:true,
//         // minRotation: 30
//       },
//       afterBuildTicks:filterYTicks
//     }]
//   },
//   legend: {
//     display: false
//   },
// };