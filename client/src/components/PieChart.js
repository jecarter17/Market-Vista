import React from "react";
import PropTypes from "prop-types";
import Chart from "chart.js";
import "chartjs-plugin-datalabels";

export class PieChart extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            portfolio: this.props.portfolio
        }
        this.chartRef = React.createRef();
        this.chartColors = ['#00429d', '#2b57a7', '#426cb0', '#5681b9', '#6997c2', '#7daeca', '#93c4d2', '#abdad9', '#caefdf', '#ffffe0'];
    }

    componentDidUpdate(prevProps){
        /* perform deep comparison bewteen old and new prop */
        if (JSON.stringify(this.props.portfolio) !== JSON.stringify(prevProps.portfolio)) {
            this.makeDoughnutChart();
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            portfolio: nextProps.portfolio
        };
    }

    makeDoughnutChart(){
        console.log("Making doughnut chart...");
        console.log(this.state.portfolio);

        /* don't try to make chart when empty portfolio is passed in */
        if (!this.state.portfolio) {
            return;
        }

        var ctx = this.chartRef.current.getContext('2d');
        var labels = this.state.portfolio.map((item) => {
            return item.symbol;
        });
        var marketPrices = this.state.portfolio.map((item) => {
            return item.price * item.shares;
        });
        var colors = this.state.portfolio.map((item, index) => {
            return this.chartColors[index];
        });
        var data = {
            labels: labels,
            datasets: [{
                label: 'Market Price',
                data: marketPrices,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        }

        var options = {
            tooltips: {
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = " "+(value*100 / sum).toFixed(2)+"%";
                        return percentage;
                    },
                    color: '#fff',
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
        console.log(labels);
        console.log(marketPrices);
        console.log(colors);
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    render(){
        return(
            <div>
                <h4>Portfolio Allocation</h4>
                <canvas ref={this.chartRef} width="100" height="100"></canvas>
            </div>
        );        
    }
}

PieChart.propTypes = {
    portfolio: PropTypes.array
}