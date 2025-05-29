const beeswarmForce = function(){
    let x = d => d[0];
    let y = d => d[1];
    let r = d => d[2];
    let ticks = 300;
    
    function beeswarm(data){
      const entries = data.map(d => {
        return {
          x0: typeof x === "function" ? x(d) : x,
          y0: typeof y === "function" ? y(d) : y,
          r: typeof r === "function" ? r(d) : r,
          data: d
        }
      });
      
      const simulation = d3.forceSimulation(entries)
          .force("x", d3.forceX(d => d.x0))
          .force("y", d3.forceY(d => d.y0))
          .force("collide", d3.forceCollide(d => d.r));
      
      for (let i = 0; i < ticks; i++) simulation.tick();
      
      return entries;
    }
    
    beeswarm.x = f => f ? (x = f, beeswarm) : x;
    beeswarm.y = f => f ? (y = f, beeswarm) : y;
    beeswarm.r = f => f ? (r = f, beeswarm) : r;
    beeswarm.ticks = n => n ? (ticks = n, beeswarm) : ticks;
    
    return beeswarm;
  }