var currentFeaturePdpData;
var TextData;
var currentSolutionMinY;
var currentSolutionMaxY;
var currentFeatureTextData;
var valueLabel;
var ft_to_val={};
var val_to_ft={};
var ft_chunk_indices={};
var charts = {};


function plotLines(solutionPdpData, currentSolutionMinY,currentSolutionMaxY) {
    container = document.getElementById("linegraphs-container");
    currentFeaturePdpData=solutionPdpData;
    let featureLabel = currentFeaturePdpData[0]["feature"];
    valueLabel = currentFeaturePdpData[0]["feature"];
    ft_to_val[featureLabel]=valueLabel;
    val_to_ft[valueLabel]=featureLabel;
    var outcomeLabel = "Partial Price";
    var values = [];
    var outcomes = [];
    for (var j = 0; j < currentFeaturePdpData.length; j++) {
        values.push(currentFeaturePdpData[j]["value"]);
        outcomes.push(currentFeaturePdpData[j]["Partial Price"]);
    }
    plotLineGraph(values, outcomes, valueLabel, outcomeLabel, currentSolutionMinY, currentSolutionMaxY);
}


function plotLineGraph(values, outcomes, valueLabel,outcomeLabel, minY, maxY) {
    container = document.getElementById("linegraphs-container");
    lineGraphDiv = document.createElement("div");
    lineGraph = document.createElement("canvas");
    lineGraph.height = 270;
    lineGraph.id = "linegraph_" + valueLabel;
    lineGraph.onclick = function(){setfeature(valueLabel);}
    lineGraphDiv.id = valueLabel;
    lineGraphDiv.appendChild(lineGraph);
    ft_chunk_indices[valueLabel]={};
    container.appendChild(lineGraphDiv);
    var minX = Math.min.apply(null, values);
    var maxX = Math.max.apply(null, values);
    let datasets=[];
    datasets[0]={
        data: outcomes,
        fill: false,
        pointRadius: 0,
        showLine: true,
        backgroundColor: "#4281B5",
        borderColor: "#4281B5",
    };
    var data = {
        labels: values,
        datasets: datasets
    };

    var options = getLineGraphOptions(valueLabel, outcomeLabel, minX, maxX, minY, maxY);
    var ctx = document.getElementById("linegraph_" + valueLabel);
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    charts[valueLabel]=lineChart;
}

function unravel(listOfDicts, key) {
    items = [];
    for (var i = 0; i < listOfDicts.length; i++) {
        items.push(listOfDicts[i][key]);
    }
    return items;
}

function getLineGraphOptions(valueLabel, outcomeLabel, minX, maxX, minY, maxY) {
        var options = {};
        options = {
            responsive: false,
            animation: false,
            events: ['mousemove','mouseout','click'],
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: valueLabel,
                        fontColor: "#333436",
                        fontSize: 12,
                    },
                    ticks: {
                        precision: 0,
                        callback: function(label, index, labels) {
                                return (Math.round(label*100))/100;
                        },
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: outcomeLabel,
                    },
                    ticks:{
                      min:minY,
                      max:maxY,
                    }
                }]
            },
            legend: {
                display: false,
            },
        };
    return options;
}

