var currentFeaturePdpData;
var currentSolutionMinY;
var currentSolutionMaxY;
var valueLabel;
var ft_to_val={};
var val_to_ft={};
var ft_chunk_indices={};

function plotFilmLines(solutionPdpData, simp_ind, numSol, container, currentSolutionMinY,currentSolutionMaxY) {
    currentFeaturePdpData=solutionPdpData;
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    let count=0;
    for(var i=0;i<numSol;i++) {
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
        plotFilmLineGraph(values, outcomes, i,count, simp_ind,container, valueLabel, outcomeLabel, currentSolutionMinY, currentSolutionMaxY);
        count++;
    }
}


function plotFilmLineGraph(values, outcomes, simplify_index,ind,simp_ind,container, valueLabel,outcomeLabel, minY, maxY) {
    lineGraphDiv = document.createElement("div");
    lineGraph = document.createElement("canvas");
    lineGraph.height = 150;
    lineGraph.width = 150;;
    lineGraph.id = "filmstrip_" + valueLabel+"_"+simplify_index;
    lineGraphDiv.id = valueLabel+simplify_index;
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
    var ctx = document.getElementById("filmstrip_" + valueLabel+"_"+simplify_index);
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}