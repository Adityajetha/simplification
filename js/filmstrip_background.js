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





function plotFilmLines(solutionPdpData, simp_ind,numSol, container, currentSolutionMinY,currentSolutionMaxY,shareY, grids, labels, featureOrder, ignoreZeros) {

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


    // For each feature generate the plot
    var count=0;
    var start=Math.max(0,simp_ind-5);
    var end = Math.min(11+start,numSol);
    if(end==numSol){
        start=Math.max(0,end-11);
    }
    for(var i=start;i<end;i++) {


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
            plotFilmLineGraph(values, outcomes, i,count, container,valueLabel, outcomeLabel, grids, true, currentSolutionMinYLinear, currentSolutionMaxYLinear);
        } else if (false && shareY == "NonLinear") {
            plotFilmLineGraph(values, outcomes, i,count, container, valueLabel, outcomeLabel, grids, true, currentSolutionMinYNonLinear, currentSolutionMaxYNonLinear);
        } else if (true||shareY === "All") {
            plotFilmLineGraph(values, outcomes, i,count, container, valueLabel, outcomeLabel, grids, true, currentSolutionMinY, currentSolutionMaxY);
        } else {
            //console.log("Length outcomes old",outcomesOld.length)
            var minY = Math.round(Math.min.apply(null, outcomesOld) - 0.5);
            var maxY = Math.round(Math.max.apply(null, outcomesOld) + 0.5);
            plotFilmLineGraph(values, outcomes, i,count,container, valueLabel, outcomeLabel, grids, true, minY, maxY);
        }
        count++;

    }

}


function plotFilmLineGraph(values, outcomes, simplify_index,simp_ind,container, valueLabel,outcomeLabel, grids, shareY, minY, maxY) {


    //Create div in container
    //console.log(currentFeatureTextData);
    //console.log(container);
    lineGraphDiv = document.createElement("div");
    lineGraphDiv.style.position='relative';
    lineGraphDiv.style.left=simp_ind*150 +'px';
    lineGraphDiv.style.top=-simp_ind*150 +'px';
    //console.log(lineGraphDiv.style.left);
    lineGraph = document.createElement("canvas");
    lineGraph.height = 150;
    lineGraph.width = 150;
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
    //console.log(datasets);
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

