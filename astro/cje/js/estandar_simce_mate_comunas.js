Promise.all([
    d3.csv("estandar_simce_mate_comunas.csv")
]).then(function(datos) {

    const indicadores = ['Insuficiente', 'Elemental', 'Adecuado'];

    const regiones = datos[0].filter(d => d.estandar !== 'Total');
    const columns = Object.keys(regiones[0]).filter(col => col.includes('_'));

    const filters = Array.from(new Set(columns.map(d => d.split('_')[0])));
    const regions = Array.from(new Set(datos[0].filter(d => d.estandar === 'Total').map(d => d.comuna)));

    regiones.forEach(region => { 
        columns.forEach(col => {
            region[col] = Number(region[col].replace('%', ''));
        })
    });

    const plotTerritory = (data, col) =>{
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
    
        const r = 3;
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

        const width = 800;
        const height = indicadores.length * 60;

        const margin = {
            left: 150,
            right: 30,
            top: 30,
            bottom: 60
        };
    
        const chartwidth = width - margin.left - margin.right;
        const chartheight = height - margin.top - margin.bottom;
    
        const x = d3.scaleLinear().range([0, chartwidth]);

        const y = d3.scaleBand()
            .domain(indicadores)
            .rangeRound([margin.top, height - margin.bottom])
            .padding(0.1);

        const color = 'steelblue';

        ["basica", 'media'].forEach(ne => {
            cols.forEach(col => {
                const dataToPlot = indicadores.map(ind => {
                    return {
                        indicador: ind,
                        value: data.filter(d => d.estandar === ind)[0][col]
                    }
                });
    
                const nationalData = indicadores.map(ind => {
                    return {
                        indicador: ind,
                        value: promNacional.filter(d => d.estandar === ind)[0][col]
                    }
                });
    
                const regionalData = indicadores.map(ind => {
                    return {
                        indicador: ind,
                        value: data.filter(d => d.estandar === ind)[0][col.split('_')[0] + '_tot']
                    }
                });
    
                const max = d3.max([dataToPlot, nationalData, regionalData].map(dat => d3.max(dat, d => d.value)));
                x.domain([0, max]);
    
                d3.select('body').append('div')
                    .html(`${reg === 'TODAS' ? 'NACIONAL' : reg} + ${col} + ${ne}`);
    
                const div = d3.select('body').append('div');
    
                const svg = div.append('svg')
                    .attr("width", chartwidth + margin.left + margin.right)
                    .attr("height", chartheight + margin.top + margin.bottom);
    
                const g = svg.append("g")
                    .attr("transform", `translate(${[margin.left, margin.top]})`);
    
                const axis = g.append("g")
                    .call(d3.axisBottom(x).tickSizeOuter(0))
                    .attr("transform", `translate(0, ${chartheight + margin.bottom - 20})`);
    
                axis.selectAll(".domain").remove();
    
                g.selectAll("rect")
                    .data(dataToPlot)
                    .join("rect")
                    .attr("fill", 'lightgray')
                    .attr("x", x(0))
                    .attr("y", d => y(d.indicador))
                    .attr("width", d => x(d.value) - x(0))
                    .attr("height", y.bandwidth());
    
                g.selectAll(".label")
                    .data(dataToPlot)
                    .join("text")
                    .attr("class", "label")
                    .attr("text-anchor", "end")
                    .attr("fill", 'lightgray')
                    .attr("x", x(0) - 10)
                    .attr("y", d => y(d.indicador) + y.bandwidth()/2 + 6)
                    .text(d => d.indicador);

                if (!col.endsWith('tot')) {
                    g.selectAll(".regional-line")
                        .data(regionalData)
                        .join('line')
                            .attr("class", "regional-line")
                            .attr("stroke", 'darkgray')
                            .attr("stroke-dasharray", "4 4")
                            .attr("x1", d => x(d.value))
                            .attr("y1", d => y(d.indicador))
                            .attr("x2", d => x(d.value))
                            .attr("y2", d => y(d.indicador) + y.bandwidth());
                }
    
                if (reg !== 'TODAS') {
                    g.selectAll(".national-line")
                        .data(nationalData)
                        .join('line')
                            .attr("class", "national-line")
                            .attr("stroke", 'darkgray')
                            .attr("x1", d => x(d.value))
                            .attr("y1", d => y(d.indicador))
                            .attr("x2", d => x(d.value))
                            .attr("y2", d => y(d.indicador) + y.bandwidth());
                }
    
                const sentences = indicadores.map(ind => {
                    const indValue = dataToPlot.filter(d => d.indicador === ind)[0].value;
                    const regValue = regionalData.filter(d => d.indicador === ind)[0].value;
                    const natValue = nationalData.filter(d => d.indicador === ind)[0].value;
                    return `${indValue}% de ${ind} ${col.endsWith('tot') ? '' : ', en tanto que el promedio regional es ' + regValue + '%'} ${reg === 'TODAS' ? '' : 'y el promedio nacional es ' + natValue + '%'}`
                })
    
                div.append("div")
                    .style("width", "250px")
                    .style('display', 'inline-block')
                    .html(sentences.join(". \n"));
    
                saveSvg(svg.node(), reg+'-'+col+'-'+ne+'.svg');
            })
        })
        
    };

    // plotTerritory(regiones, "dep_tot");

    const nacional = regiones.filter(d => d.comuna === 'TODAS' && indicadores.includes(d.estandar));

    regions.forEach(reg => {
        const thisRegion = regiones.filter(d => d.comuna === reg && indicadores.includes(d.estandar));
        
        filters.slice(0, 10).forEach(filter => {
            const cols = columns.filter(col => col.startsWith(filter));
            plotTerritoryIndicator(thisRegion, reg, cols, nacional);
        })

    })

})