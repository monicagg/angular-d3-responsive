import { Component, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { DataModel } from 'src/app/data/data.model';

@Component({
  selector: 'app-radial-chart',
  templateUrl: './radial-chart.component.html',
  styleUrls: ['./radial-chart.component.scss']
})
export class RadialChartComponent implements OnChanges {
  @ViewChild('radialchart')
  private chartContainer: ElementRef;

  @Input()
  data: DataModel[];

  constructor() { }

  ngOnChanges(): void {
    if (!this.data) { return; }

    this.createChart();
  }

  private createChart(): void {
    d3.select('#radialchart svg').remove();

    const element = this.chartContainer.nativeElement;
    const data = this.data;
    const width = 400, height = 300;
    const innerRadius = 80;
    const outerRadius = Math.min(width, height) / 2;
    const dataColumns = ["frequency"];
    console.log("dataColumns = " + dataColumns);
    
    const arc = d3.arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle( (d: any) => x(d.data.letter))
    .endAngle( (d: any) => x(d.data.letter) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);
    
    const x = d3.scaleBand()
    .domain(data.map(d => d.letter))
    .range([0, 2 * Math.PI])
    .align(0);
    
    const y0 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([innerRadius * innerRadius, outerRadius * outerRadius]);
    
    const y = Object.assign(d => Math.sqrt(y0(d)), y0);
  
    const z = d3.scaleOrdinal()
		.domain(dataColumns)
		.range(["#98abc5", "#8a89a6", "#DAF7A6", "#239b56", "#1e8449", "#FF8C00", "#FFA500", "#FFD700", "#808000", "#d0743c", "#a05d56", "#7b6888"]);
    
        
    const svg = d3.select(element).append('svg')
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");
    
    const stack = d3.stack().keys(dataColumns);
    const series = stack(<any>data);
    
    svg.append("g")
      .selectAll("g")
      .data(series)
      .enter().append("g")
        .attr("fill", <any>(d => z(d.key)))
      .selectAll("path")
      .data(d => d)
      .enter().append("path")
        .attr("d", <any>arc);
  
    // xAxis
    svg.append("g")
      .attr("text-anchor", "middle")
      .call(g => g.selectAll("g")
        .data(data)
        .enter().append("g")
          .attr("transform", d => `
            rotate(${((x(d.letter) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
            translate(${innerRadius},0)
          `)
          .call(g => g.append("line")
              .attr("x2", -5)
              .attr("stroke", "#000"))
          .call(g => g.append("text")
              .attr("transform", d => (x(d.letter) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                  ? "rotate(0)translate(-18,5)"
                  : "rotate(-180)translate(18,5)")
              .text(d => d.letter)));
  
    //yAxis 
    svg.append("g")
        .attr("text-anchor", "middle")
    .call(g => g.append("text")
        .attr("y", d => -y(y.ticks(5).pop()))
        .attr("dy", "-1em")
        .text("Frequency"))
    .call(g => g.selectAll("g")
      .data(y.ticks(5).slice(1))
      .enter().append("g")
        .attr("fill", "none")
        .call(g => g.append("circle")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.5)
            .attr("r", y))
        .call(g => g.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(y.tickFormat(5, "%"))
         .clone(true)
            .attr("fill", "#000")
            .attr("stroke", "none")))
    
    //legend
    svg.append("g")
    .selectAll("g")
    .data(dataColumns.reverse())
    .enter().append("g")
      .attr("transform", (d, i) => `translate(-40,${(i - (dataColumns.length - 1)/2 ) * 20})`)
      .call(g => g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", <any>z))
      .call(g => g.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(d => d))
    
    
  }
}
