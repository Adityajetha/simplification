Qualtrics.SurveyEngine.addOnload(function()
{
    /*Place your JavaScript here to run when the page loads*/

    /*Place your JavaScript here to run when the page loads*/
    //1. Get questionBody
    var questionBody = document.getElementsByClassName("QuestionBody")[0];

    //2. Create and attach drawingContainer to questionBody
    var drawingContainer = document.createElement("div");
    drawingContainer.className = "lineChartDrawingContainer";

    var svgDiv = document.createElement("div");
    svgDiv.className = "svgParent";

    drawingContainer.appendChild(svgDiv);
    questionBody.appendChild(drawingContainer);

    //3. Initialization Function for Drawing the Chart
    var points = [];
    var yScaler=0;
    var xScaler=0;

    function redrawChart(points, xLabels, yLabels){
        var numCircles = 300;

        var plot_flag = -1;
        var last_i = 0;

        var _xmin = d3.min(xLabels), _ymin = d3.min(yLabels), _xmax = d3.max(xLabels), _ymax = d3.max(yLabels);


        var margin = {top: 30, right: 30, bottom: 30, left: 50};
        var	width = 300 - margin.left - margin.right;
        var	height = 300 - margin.top - margin.bottom;

        var rate_plot2real = (_ymax - _ymin) / height;
        yScaler = rate_plot2real;
        xScaler = (_xmax - _xmin)/width;

        var svg = d3.select(".svgParent")
            .append("svg")
            .attr("class", "lineChartDrawingSvg")
            .attr("width", "300px")
            .attr("height", "300px");

        //var svg = d3.select('svg')
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom);

        var baseLayer = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var plotLayer = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // function for generating svg path
        var line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveCatmullRom);

        // set the ranges
        var x = d3.scaleLinear().domain([_xmin, _xmax]).range([0, width]);
        var y = d3.scaleLinear().domain([yLabels[0], yLabels.slice(-1)[0]]).range([height, 0]);

        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(x)
                // .ticks(5)
                ;
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(y)
                // .ticks(10)
                ;
        }

        // -------------------------------------------------- //

        // add the X Axis
        baseLayer.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickValues(xLabels)
            );
        //.tickValues([140])

        // add the Y Axis
        baseLayer.append("g")
            .call(d3.axisLeft(y)
                .tickValues(yLabels)
                .tickFormat(function(d){
                    d = d  ;
                    return d;
                })
            );

        // add the X gridlines
        baseLayer.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
                .tickValues(xLabels)
            );

        // add the Y gridlines
        baseLayer.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
                .tickValues(yLabels)
            );
        // -------------------------------------------------- //


        // maps point positions to pixel positions along the x axis
        var spread = d3.scaleBand()
            .domain(d3.range(numCircles))
            .range([0, width]);
        // .paddingOuter(0.1);


        function drawPath(pathLength) {
            var pathLength= points.length;
            var path = plotLayer.selectAll('path')
                .data([points.slice(0, pathLength + 1)]);
            path.enter().append('path');
            path.attr('d', line).attr('class', 'self');
            path.exit().remove();
        }

        //Initialize Path
        drawPath(points.length);
        // Draw Path
        svg.call(drawPath);

    }

    var xlabels =  [0,20,40,60,80,100];
    var ylabels = [-2,-1.5,-1,-0.5,0,0.5,1,1.5,2];
    var pointsX = Qualtrics.SurveyEngine.getEmbeddedData("LG1_age_X");
    var pointsY = Qualtrics.SurveyEngine.getEmbeddedData("LG1_age_Y");

    pointsX = pointsX.split(',');
    pointsY = pointsY.split(',');

    var points = [];
    for(var i=0;i<pointsX.length;i++){

        var x = parseFloat(pointsX[i]);
        var y = parseFloat(pointsY[i]);

        points.push({"x":x,"y":y})

    }


    console.log(points);

    redrawChart(points,xlabels,ylabels);


});

Qualtrics.SurveyEngine.addOnReady(function()
{
    /*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function()
{
    /*Place your JavaScript here to run when the page is unloaded*/

});