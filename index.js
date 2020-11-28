"use strict";

const dataURL = `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json`; // function to fetch data

const pullData = async url => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}; // function to format data


const formatData = async dataArray => {
  let data = await dataArray;
  data = data.map(entry => {
    let dateObject = new Date();
    const [minutes, seconds] = entry.Time.split(':');
    dateObject.setMinutes(minutes);
    dateObject.setSeconds(seconds);
    return { ...entry,
      'Time in Minutes': entry.Time,
      'Time': dateObject
    };
  });
  return data;
}; // function to create scatter plot


const createScatter = async () => {
  // create tooltip and set opacity
  const tooltip = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0); // plot margins

  const margin = {
    top: 20,
    bottom: 50,
    left: 50,
    right: 50
  }; // summon data

  const data = await formatData(pullData(dataURL)); // query selector for content

  const content = document.querySelector('.content'); // initialize height and width variables

  let height = content.clientHeight - 100;
  let width = content.clientWidth; // append svg to content div

  const svg = d3.select('.content').append('svg').attr('viewBox', `${-margin.left} ${-margin.top} ${width + margin.right} ${height + margin.top - margin.bottom}`); // redefine height and width variables to just be the svg, and not the margins

  height = document.querySelector('svg').clientHeight;
  width = document.querySelector('svg').clientWidth; // arrays for axes

  const years = data.map(entry => entry.Year);
  const times = data.map(entry => entry.Time); // axes domain and ranges

  const xAxis = d3.scaleLinear().domain([d3.min(years) - 1, d3.max(years) + 1]).range([margin.left, width - margin.right]);
  const yAxis = d3.scaleTime().domain(d3.extent(times)).nice().range([height - margin.bottom, margin.top]); // x-axis

  svg.append('g').attr('id', 'x-axis').call(d3.axisBottom(xAxis).tickFormat(d3.format("d"))).attr('transform', `translate(0,${height - margin.bottom})`).append('text').text('Year').attr('id', 'axis-title').attr('x', width / 2).attr('y', margin.bottom - 10); // y-axis

  svg.append('g').attr('id', 'y-axis').call(d3.axisLeft(yAxis).tickFormat(d3.timeFormat('%M:%S'))).attr('transform', `translate(${margin.left},0)`).append('text').text('Time in Minutes').attr('id', 'axis-title').attr('x', 0).attr('y', height / 2).attr('class', 'axis-title').attr("dy", -margin.left + 15); // arrays for legends

  const colors = ['#f00075', '#5ecdc7'];
  const keys = ['Doping', 'No Doping']; // scatter dots

  svg.append('g').selectAll('circle').data(data).enter().append('circle').attr('class', 'dot').attr('cx', d => xAxis(d.Year)).attr('data-xvalue', d => d.Year).attr('cy', d => yAxis(d.Time)).attr('data-yvalue', d => d.Time).attr('r', 5).style('fill', d => d.Doping ? colors[0] : colors[1]).attr('data-name', d => d.Name).attr('data-nationality', d => d.Nationality).attr('data-year', d => d.Year).attr('data-time', d => d['Time in Minutes']).attr('data-place', d => d.Place).attr('data-doping', d => d.Doping).on("mouseover pointerover pointerenter pointerdown pointermove gotpointercapture", e => {
    tooltip.transition().duration(300).style("opacity", .9);
    tooltip.attr('data-year', `${e.target.dataset.year}`);
    tooltip.html(`
      <p>Name: ${e.target.dataset.name}</p>
      <p>Nationality: ${e.target.dataset.nationality}</p>
      <p>Year: ${e.target.dataset.year}</p>
      <p>Time: ${e.target.dataset.time}</p>
      <p>Place: ${e.target.dataset.place}</p>
      ${e.target.dataset.doping ? `<p>Doping: ${e.target.dataset.doping}</p>` : ``}
          `).style("position", 'absolute').style("left", e.clientX - 60 + "px").style("top", e.clientY - 120 + "px");
  }).on("mouseout pointerout pointerup pointercancel pointerleave lostpointercapture", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  }); // legend

  const legend = svg.append('g').attr('id', 'legend');
  legend.append('text').text('LEGEND').attr('id', 'legend-text').attr('x', width - margin.right * 2.2).attr('y', height - margin.bottom * 2.9);
  legend.selectAll('#legend').data(keys).enter().append('circle').attr('id', 'legend-symbols').attr('cx', width - margin.right * 2.4).attr('cy', (d, i) => height - margin.bottom * 2.5 + i * 25).attr('r', 6).style('fill', (d, i) => colors[i]);
  legend.selectAll("#legend").data(keys).enter().append("text").attr('id', 'legend-text').attr("x", width - margin.right * 2.2).attr("y", (d, i) => height - margin.bottom * 2.5 + i * 25).text((d, i) => keys[i]).attr("alignment-baseline", "middle");
}; // run the function


createScatter();