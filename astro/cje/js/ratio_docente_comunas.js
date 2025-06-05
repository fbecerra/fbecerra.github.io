Promise.all([
    d3.csv("ratio_docente_comunas.csv")
]).then(function(datos) {

    // const indicadores = ['ratio docente', 'ratio docente parvularia', 
    //     'ratio docente basica', 'ratio docente media', 'ratio docente especial'];
    const indicadores = ['ratio docente especial'];

    indicadores.forEach(indicador => {
        const regiones = datos[0].filter(d => d.indicador === indicador);
        const columns = Object.keys(regiones[0]).filter(col => col.includes('_'));

        const filters = Array.from(new Set(columns.map(d => d.split('_')[0])));
        const regions = regiones.map(d => d.comuna);

        regiones.forEach(region => { 
            columns.forEach(col => {
                region[col] = Number(region[col]);
            })
        });

        const plotTerritory = async (data, col) =>{
            const width = 800;
            const height = 200;
            const margin = {
                left: 30,
                right: 30,
                top: 20,
                bottom: 20
            };
        
            const chartwidth = width - margin.left - margin.right;
            const chartheight = height - margin.top - margin.bottom;
        
            const r = 2;
            const x = d3.scaleLinear().range([0, chartwidth]);
        
            const beeswarm = beeswarmForce()
                .y(chartheight / 2)
                .r(r);

            const colExtent = d3.extent(regiones, d => d[col]);

            x.domain(colExtent);
            beeswarm.x(d => x(d[col]))

            const datum = beeswarm(data.filter(d => d.comuna !== 'TODAS'));
            const nacional = data.filter(d => d.comuna === 'TODAS');

            const color = 'steelblue';

            regions.forEach(reg => {
                d3.select('body').append('div')
                    .html(`${reg === 'TODAS' ? 'NACIONAL' : reg} + ${indicador}`);

                const div = d3.select('body').append('div');

                const svg = div.append('svg')
                    .attr("width", chartwidth + margin.left + margin.right)
                    .attr("height", chartheight + margin.top + margin.bottom);

                const g = svg.append("g")
                    .attr("transform", `translate(${[margin.left, margin.top]})`);
            
                const axis = g.append("g")
                    .call(d3.axisBottom(x).tickSizeOuter(0))
                    .attr("transform", `translate(0, ${chartheight / 1.25})`)
                
                axis.selectAll(".domain").remove();

                g.selectAll(".line")
                    .data(nacional)
                    .join('line')
                        .attr("class", "line")
                        .attr("stroke", reg === 'TODAS' ? color : 'darkgray')
                        // .attr("stroke-dasharray", "8 8")
                        .attr("x1", d => x(d[col]))
                        .attr("y1", chartheight / 2 + 50)
                        .attr("x2", d => x(d[col]))
                        .attr("y2", chartheight / 2 - 50);

                if (reg === 'TODAS') {
                    g.selectAll(".line-label")
                    .data([nacional[0], nacional[0]])
                    .join('text')
                        .attr("class", "line-label")
                        .attr("fill", reg === 'TODAS' ? color : 'darkgray')
                        .attr("text-anchor", "middle")
                        .attr("x", d => x(d[col]))
                        .attr("y", (_,i) => chartheight / 2 - 70 + i * 14)
                        .attr("font-size", 10)
                        .text((_,i) => i === 0 ? 'Promedio' : 'nacional');
                }
                
                g.selectAll(".dot")
                    .data(datum)
                    .join("circle")
                    .attr("class", 'dot')
                    .attr("fill", d => d.data.comuna === reg ? color : "#D9D9D0")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", r);

                if (reg !== 'TODAS') {
                    const thisData = datum.filter(d => d.data.comuna === reg);
                    g.selectAll("ring")
                        .data(thisData)
                        .join("circle")
                        .attr("class", "ring")
                        .attr("fill", "none")
                        .attr("stroke-width", 1.5)
                        .attr("stroke", "black")
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y)
                        .attr("r", r);

                    g.selectAll(".ring-line")
                        .data(thisData)
                        .join('line')
                            .attr("class", "ring-line")
                            .attr("stroke", 'black')
                            // .attr("stroke-dasharray", "8 8")
                            .attr("x1", d => d.x)
                            .attr("y1", d => d.y - r)
                            .attr("x2", d => d.x)
                            .attr("y2", d => d.y - r - 30);
        
                    g.selectAll(".ring-label")
                        .data(thisData)
                        .join('text')
                            .attr("class", "ring-label")
                            .attr("fill", 'black')
                            .attr("text-anchor", "middle")
                            .attr("x", d => d.x)
                            .attr("y", d => d.y - r - 30 - 4)
                            .attr("font-size", 10)
                            .text(d => d.data.comuna);
                }

                // saveSvg(svg.node(), reg+'-'+indicador+'.svg');

                if (reg !== 'TODAS') {
                    const regionValue = datum.filter(d => d.data.comuna === reg)[0].data[col];
                    const diff = regionValue - nacional[0][col];
        
                    div.append("div")
                        .style("width", "250px")
                        .style('display', 'inline-block')
                        .html(`La region de ${reg} tiene una repitencia de ${regionValue}%, lo que esta ${diff === 0 ? "justo en el" : Math.abs(diff).toFixed(2) + '%'} 
                                ${diff === 0 ? "" : (diff > 0 ? 'por sobre el' : 'por debajo del')} promedio nacional`)
                }
                
            });
        };

        const plotTerritoryIndicator = (data, reg, cols, promNacional) => {

            const dataToPlot = data.filter(d => !d.col.endsWith('tot'))

            const width = 800;
            const height = dataToPlot.length > 7 ? 200 : dataToPlot.length * 60;

            const margin = dataToPlot.length > 7 ? {
                left: 30,
                right: 30,
                top: 10,
                bottom: 10
            } : {
                left: 150,
                right: 30,
                top: 30,
                bottom: 60
            };
        
            const chartwidth = width - margin.left - margin.right;
            const chartheight = height - margin.top - margin.bottom;
        
            const r = 5;
            const x = d3.scaleLinear().range([0, chartwidth]);
        
            const beeswarm = beeswarmForce()
                .y(chartheight / 2)
                .r(r);

            const min = Math.min(d3.min(data, d => d.value), promNacional[0].value);
            const max = Math.max(d3.max(data, d => d.value), promNacional[0].value);
            const colExtent = [min, max];

            x.domain(dataToPlot.length > 7 ? colExtent : [0, colExtent[1]]);
            beeswarm.x(d => x(d.value));

            const datum = beeswarm(dataToPlot);
            const promRegional = data.filter(d => d.col.endsWith('tot'));

            const color = 'steelblue';

            cols.forEach(col => {
                d3.select('body').append('div')
                    .html(`${reg === 'TODAS' ? 'NACIONAL' : reg} + ${col} + ${indicador}`);

                const div = d3.select('body').append('div');

                const svg = div.append('svg')
                    .attr("width", chartwidth + margin.left + margin.right)
                    .attr("height", chartheight + margin.top + margin.bottom);

                const g = svg.append("g")
                    .attr("transform", `translate(${[margin.left, margin.top]})`);

                
                if (dataToPlot.length > 7) {

                    const axis = g.append("g")
                        .call(d3.axisBottom(x).tickSizeOuter(0))
                        .attr("transform", `translate(0, ${chartheight / 1.25})`);

                    axis.selectAll(".domain").remove();
                    
                    g.selectAll("circle")
                        .data(datum)
                        .join("circle")
                        .attr("fill", d => d.data.col === col ? color : "#D9D9D0")
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y)
                        .attr("r", r);

                    g.selectAll(".regional-line")
                        .data(promRegional)
                        .join('line')
                            .attr("class", "regional-line")
                            .attr("stroke", col.endsWith('tot') ? color : 'darkgray')
                            .attr("stroke-dasharray", "4 4")
                            .attr("x1", d => x(d.value))
                            .attr("y1", chartheight / 2 + 50)
                            .attr("x2", d => x(d.value))
                            .attr("y2", chartheight / 2 - 50);

                    if (col.endsWith('tot')) {
                        g.selectAll(".regional-line-label")
                            .data([promRegional[0], promRegional[0]])
                            .join('text')
                                .attr("class", "regional-line-label")
                                .attr("fill", col.endsWith('tot') ? color : 'darkgray')
                                .attr("text-anchor", "middle")
                                .attr("x", d => x(d.value))
                                .attr("y", (_,i) => chartheight / 2 - 70 + i * 14)
                                .attr("font-size", 10)
                                .text((_,i) => i === 0 ? 'Promedio' : 'regional');
                    }

                    g.selectAll(".national-line")
                        .data(promNacional)
                        .join('line')
                            .attr("class", "national-line")
                            .attr("stroke", 'darkgray')
                            .attr("x1", d => x(d.value))
                            .attr("y1", chartheight / 2 - 50)
                            .attr("x2", d => x(d.value))
                            .attr("y2", chartheight / 2 + 50);

                    if (!col.endsWith('tot')) {
                        const thisData = datum.filter(d => d.data.col === col);
                        g.selectAll("ring")
                            .data(thisData)
                            .join("circle")
                            .attr("class", "ring")
                            .attr("fill", "none")
                            .attr("stroke-width", 1.5)
                            .attr("stroke", "black")
                            .attr("cx", d => d.x)
                            .attr("cy", d => d.y)
                            .attr("r", r);

                        g.selectAll(".ring-line")
                            .data(thisData)
                            .join('line')
                                .attr("class", "ring-line")
                                .attr("stroke", 'black')
                                // .attr("stroke-dasharray", "8 8")
                                .attr("x1", d => d.x)
                                .attr("y1", d => d.y - r)
                                .attr("x2", d => d.x)
                                .attr("y2", d => d.y - r - 30);
            
                        g.selectAll(".ring-label")
                            .data(thisData)
                            .join('text')
                                .attr("class", "ring-label")
                                .attr("fill", 'black')
                                .attr("text-anchor", "middle")
                                .attr("x", d => d.x)
                                .attr("y", d => d.y - r - 30 - 4)
                                .attr("font-size", 10)
                                .text(d => d.data.col);

                        const regionValue = datum.filter(d => d.data.col === col)[0].data.value;
                        const diffRegional = regionValue - promRegional[0].value;
                        const diffNacional = regionValue - promNacional[0].value;
            
                        div.append("div")
                            .style("width", "250px")
                            .style('display', 'inline-block')
                            .html(`La region de ${reg} y filtro ${col} tiene un docente por cada ${regionValue}, lo que esta ${diffRegional === 0 ? "justo en el" : Math.abs(diffRegional).toFixed(2)} 
                                    ${diffRegional === 0 ? "" : (diffRegional > 0 ? 'por sobre el' : 'por debajo del')} promedio regional y 
                                    ${diffNacional === 0 ? "justo en el" : Math.abs(diffNacional).toFixed(2)} ${diffNacional === 0 ? "" : (diffNacional > 0 ? 'por sobre el' : 'por debajo del')} promedio nacional`);
                    }
                } else {

                    const axis = g.append("g")
                        .call(d3.axisBottom(x).tickSizeOuter(0))
                        .attr("transform", `translate(0, ${chartheight + margin.bottom - 20})`);

                    axis.selectAll(".domain").remove();

                    const y = d3.scaleBand()
                        .domain(dataToPlot.map(d => d.col))
                        .rangeRound([margin.top, height - margin.bottom])
                        .padding(0.1);

                    g.selectAll("rect")
                        .data(dataToPlot)
                        .join("rect")
                        .attr("fill", d => d.col === col ? color : 'lightgray')
                        .attr("x", x(0))
                        .attr("y", d => y(d.col))
                        .attr("width", d => x(d.value) - x(0))
                        .attr("height", y.bandwidth());

                    g.selectAll(".label")
                        .data(dataToPlot.filter(d => d.col === col))
                        .join("text")
                        .attr("class", "label")
                        .attr("text-anchor", "end")
                        .attr("fill", d => d.col === col ? color : 'lightgray')
                        .attr("x", x(0) - 10)
                        .attr("y", d => y(d.col) + y.bandwidth()/2 + 6)
                        .text(col);

                    g.selectAll(".regional-line")
                        .data(promRegional)
                        .join('line')
                            .attr("class", "regional-line")
                            .attr("stroke", col.endsWith('tot') ? color : 'darkgray')
                            .attr("stroke-dasharray", "4 4")
                            .attr("x1", d => x(d.value))
                            .attr("y1", y.range()[0])
                            .attr("x2", d => x(d.value))
                            .attr("y2", y.range()[1]);

                    if (col.endsWith('tot')) {
                        g.selectAll(".regional-line-label")
                            .data([promRegional[0], promRegional[0]])
                            .join('text')
                                .attr("class", "regional-line-label")
                                .attr("fill", col.endsWith('tot') ? color : 'darkgray')
                                .attr("text-anchor", "middle")
                                .attr("x", d => x(d.value))
                                .attr("y", (_,i) => y.range()[0] - 24 + i * 14)
                                .attr("font-size", 10)
                                .text((_,i) => i === 0 ? 'Promedio' : 'regional');
                    }

                    g.selectAll(".national-line")
                        .data(promNacional)
                        .join('line')
                            .attr("class", "national-line")
                            .attr("stroke", 'darkgray')
                            .attr("x1", d => x(d.value))
                            .attr("y1", y.range()[0])
                            .attr("x2", d => x(d.value))
                            .attr("y2", y.range()[1]);

                    if (!col.endsWith('tot')) {
                        const regionValue = dataToPlot.filter(d => d.col === col)[0].value;
                        const diffRegional = regionValue - promRegional[0].value;
                        const diffNacional = regionValue - promNacional[0].value;
            
                        div.append("div")
                            .style("width", "250px")
                            .style('display', 'inline-block')
                            .html(`La region de ${reg} y filtro ${col} tiene un docente por cada ${regionValue} estudiantes, lo que esta ${diffRegional === 0 ? "justo en el" : Math.abs(diffRegional).toFixed(2)} 
                                    ${diffRegional === 0 ? "" : (diffRegional > 0 ? 'por sobre el' : 'por debajo del')} promedio regional y 
                                    ${diffNacional === 0 ? "justo en el" : Math.abs(diffNacional).toFixed(2)} ${diffNacional === 0 ? "" : (diffNacional > 0 ? 'por sobre el' : 'por debajo del')} promedio nacional`);
                    }
                }

                // saveSvg(svg.node(), reg+'-'+indicador+'-'+col+'.svg');
            })
        };

        // plotTerritory(regiones, "dep_tot");

        filters.forEach(filter => {
            const cols = columns.filter(col => col.startsWith(filter));
            regions.forEach(reg => {
                const thisRegion = regiones.filter(d => d.comuna === reg)[0];
                const datum = cols.map(col => {
                    return {
                        col: col,
                        value: thisRegion[col]
                    }
                });
                const nacional = regiones.filter(d => d.comuna === 'TODAS').map(d => {
                    return {
                        value: d[filter+'_tot']
                    }
                });
                plotTerritoryIndicator(datum, reg, cols, nacional);
            })

        })
    })

    
    


})