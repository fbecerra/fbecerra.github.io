Promise.all([
    d3.csv("repitencia_slep.csv")
]).then(function(datos) {

    const regiones = datos[0].filter(d => d.indicador === 'Repite');
    const columns = Object.keys(regiones[0]).filter(col => col.includes('_'));

    regiones.forEach(region => { 
        columns.forEach(col => {
            region[col] = Number(region[col].replace('%', ''));
        })
    });

    const filters = Array.from(new Set(columns.map(d => d.split('_')[0])));
    const regions = regiones.map(d => d.slep);

    const plotTerritory = (data, col) =>{
        const width = 800;
        const height = 200;
        const margin = {
            left: 30,
            right: 30,
            top: 10,
            bottom: 10
        };
    
        const chartwidth = width - margin.left - margin.right;
        const chartheight = height - margin.top - margin.bottom;
    
        const r = 3.5;
        const x = d3.scaleLinear().range([0, chartwidth]);
    
        const beeswarm = beeswarmForce()
            .y(chartheight / 2)
            .r(r);

        const colExtent = d3.extent(regiones, d => d[col]);

        x.domain(colExtent);
        beeswarm.x(d => x(d[col]))

        const datum = beeswarm(data.filter(d => d.slep !== 'TODAS'));
        const nacional = data.filter(d => d.slep === 'TODAS');

        const color = 'steelblue';

        regions.forEach(reg => {
            d3.select('body').append('div')
                .html(reg === 'TODAS' ? 'NACIONAL' : reg);

            const svg = d3.select("body").append('svg')
                .attr("width", chartwidth + margin.left + margin.right)
                .attr("height", chartheight + margin.top + margin.bottom);

            const g = svg.append("g")
                .attr("transform", `translate(${[margin.left, margin.top]})`);
        
            g.append("g")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .attr("transform", `translate(0, ${chartheight / 1.25})`);
            
            g.selectAll("circle")
                .data(datum)
                .join("circle")
                .attr("fill", d => d.data.slep === reg ? color : "#D9D9D0")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", r);

            g.selectAll(".line")
                .data(nacional)
                .join('line')
                    .attr("class", "line")
                    .attr("stroke", reg === 'TODAS' ? color : 'darkgray')
                    .attr("stroke-dasharray", "8 8")
                    .attr("x1", d => x(d[col]))
                    .attr("y1", chartheight / 2 - 50)
                    .attr("x2", d => x(d[col]))
                    .attr("y2", chartheight / 2 + 50);

            g.selectAll(".line-label")
                .data([nacional[0], nacional[0]])
                .join('text')
                    .attr("class", "line-label")
                    .attr("fill", reg === 'TODAS' ? color : 'darkgray')
                    .attr("text-anchor", "middle")
                    .attr("x", d => x(d[col]))
                    .attr("y", (_,i) => chartheight / 2 - 50 + i * 14)
                    .attr("font-size", 10)
                    .text((_,i) => i === 0 ? 'Promedio' : 'nacional');

            // saveSvg(svg.node(), reg+'.svg');

            if (reg !== 'TODAS') {
                const regionValue = datum.filter(d => d.data.slep === reg)[0].data[col];
                const diff = regionValue - nacional[0][col];
    
                d3.select("body").append("span")
                    .html(`El SLEP de ${reg} tiene una repitencia de ${regionValue}%, lo que esta ${diff === 0 ? "justo en el" : Math.abs(diff).toFixed(2) + '%'} 
                            ${diff === 0 ? "" : (diff > 0 ? 'por sobre el' : 'por debajo del')} promedio nacional`)
            }
            
        });
    };

    const plotTerritoryIndicator = (data, reg, cols, promNacional) =>{
        const width = 800;
        const height = 200;
        const margin = {
            left: 30,
            right: 30,
            top: 10,
            bottom: 10
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

        x.domain(colExtent);
        beeswarm.x(d => x(d.value))

        const datum = beeswarm(data.filter(d => !d.col.endsWith('tot')));
        const promRegional = data.filter(d => d.col.endsWith('tot'));

        const color = 'steelblue';

        cols.forEach(col => {
            d3.select('body').append('div')
                .html(`${reg === 'TODAS' ? 'NACIONAL' : reg} + ${col}`);

            const svg = d3.select("body").append('svg')
                .attr("width", chartwidth + margin.left + margin.right)
                .attr("height", chartheight + margin.top + margin.bottom);

            const g = svg.append("g")
                .attr("transform", `translate(${[margin.left, margin.top]})`);
        
            g.append("g")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .attr("transform", `translate(0, ${chartheight / 1.25})`);
            
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
                    .attr("stroke-dasharray", "8 8")
                    .attr("x1", d => x(d.value))
                    .attr("y1", chartheight / 2 - 50)
                    .attr("x2", d => x(d.value))
                    .attr("y2", chartheight / 2 + 50);

            g.selectAll(".regional-line-label")
                .data([promRegional[0], promRegional[0]])
                .join('text')
                    .attr("class", "regional-line-label")
                    .attr("fill", col.endsWith('tot') ? color : 'darkgray')
                    .attr("text-anchor", "middle")
                    .attr("x", d => x(d.value))
                    .attr("y", (_,i) => chartheight / 2 - 50 + i * 14)
                    .attr("font-size", 10)
                    .text((_,i) => i === 0 ? 'Promedio' : 'regional');

            g.selectAll(".national-line")
                .data(promNacional)
                .join('line')
                    .attr("class", "national-line")
                    .attr("stroke", 'darkgray')
                    .attr("stroke-dasharray", "8 8")
                    .attr("x1", d => x(d.value))
                    .attr("y1", chartheight / 2 - 50)
                    .attr("x2", d => x(d.value))
                    .attr("y2", chartheight / 2 + 50);

            g.selectAll(".national-line-label")
                .data([promNacional[0], promNacional[0]])
                .join('text')
                    .attr("class", "national-line-label")
                    .attr("fill", 'darkgray')
                    .attr("text-anchor", "middle")
                    .attr("x", d => x(d.value))
                    .attr("y", (_,i) => chartheight / 2 - 50 + i * 14)
                    .attr("font-size", 10)
                    .text((_,i) => i === 0 ? 'Promedio' : 'nacional');

            // saveSvg(svg.node(), reg+'-'+col+'.svg');

            if (!col.endsWith('tot')) {
                const regionValue = datum.filter(d => d.data.col === col)[0].data.value;
                const diffRegional = regionValue - promRegional[0].value;
                const diffNacional = regionValue - promNacional[0].value;
    
                d3.select("body").append("span")
                    .html(`El SLEP de ${reg} y filtro ${col} tiene una repitencia de ${regionValue}%, lo que esta ${diffRegional === 0 ? "justo en el" : Math.abs(diffRegional).toFixed(2) + '%'} 
                            ${diffRegional === 0 ? "" : (diffRegional > 0 ? 'por sobre el' : 'por debajo del')} promedio regional y 
                            ${diffNacional === 0 ? "justo en el" : Math.abs(diffNacional).toFixed(2) + '%'} ${diffNacional === 0 ? "" : (diffNacional > 0 ? 'por sobre el' : 'por debajo del')} promedio nacional`);
            }
        })
    };

    plotTerritory(regiones, "dep_tot");

    filters.forEach(filter => {
        const cols = columns.filter(col => col.startsWith(filter));
        regions.forEach(reg => {
            const thisRegion = regiones.filter(d => d.slep === reg)[0];
            const datum = cols.map(col => {
                return {
                    col: col,
                    value: thisRegion[col]
                }
            });
            const nacional = regiones.filter(d => d.slep === 'TODAS').map(d => {
                return {
                    value: d[filter+'_tot']
                }
            });
            plotTerritoryIndicator(datum, reg, cols, nacional);
        })

    })
    


})