import React from "react";
import PropTypes from "prop-types";
import Chart from "chart.js";

import {Position} from "./Position";
import {InputField} from "./InputField";
import {SubmitButton} from "./SubmitButton";

import styles from "../css/Portfolio.css";

export class Portfolio extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: this.props.username,
            portfolio: [],
            disableButtons: false,
            tickerInput: "",
            sort: {
                key: "",
                ascending: true
            },
            prices: []
        }
        this.chartRef = React.createRef();
    }

    componentDidMount(){
        this.getPortfolio();
    }

    symbolOwned(symbol){
        for(var i = 0; i < this.state.portfolio.length; i++){
            if (this.state.portfolio[i].shares === symbol) {
                return true;
            }
        }
        return false;
    }

    async addPosition(symbol){
        if (this.symbolOwned(symbol)) {
            alert("You already added a position in " + symbol);
            return;
        } else if (!symbol) {
            alert("Please enter a non empty ticker");
            return;
        }

        var obj = {
            username: this.state.username,
            symbol: symbol
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        await fetch("/addPosition", request).then(
            res => {
                console.log(res);
                return res.text();
            }
        ).then(
            res => {
                console.log(res);
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio
                    });
                } else {
                    alert(parsedResponse.msg);
                }
            }
        ).catch(
            err => {throw err;}
        );
    }

    async removePosition(symbol){
        var obj = {
            username: this.state.username,
            symbol: symbol
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        await fetch("/removePosition", request).then(
            res => {
                console.log(res);
                return res.text();
            }
        ).then(
            res => {
                console.log(res);
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio
                    });
                } else {
                    alert(parsedResponse.msg);
                }
            }
        ).catch(
            err => {throw err;}
        );
    }

    async reduceShares(symbol, inc){
        var negated = inc * -1;
        await this.addShares(symbol, negated);
    }

    async addShares(symbol, inc){
        if (inc === 0) {
            alert("Please enter a nonzero value");
            return;
        }
        this.setState({
            disableButtons: true
        });
        await this.modifyPortfolio(symbol, inc);
        this.setState({
            disableButtons: false
        });
    }

    async modifyPortfolio(symbol, inc){
        if (inc < 0) {
            console.log("Removing " + String(-1 * inc) + " shares of " + symbol);
        } else {
            console.log("Adding " + inc + " shares of " + symbol);
        }

        var obj = {
            username: this.state.username,
            symbol: symbol,
            inc: parseInt(inc)
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        await fetch("/modifyPortfolio", request).then(
            res => {
                console.log(res);
                return res.text();
            },
            err => {throw err;}
        ).then(
            res => {
                console.log(res);
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio
                    });
                } else {
                    alert(parsedResponse.msg);
                }
            },
            err => {throw err;}
        )
    }

    getPortfolio(){

        var obj = {
            username: this.state.username
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        fetch("/getPortfolio", request).then(
            res => {
                console.log(res);
                return res.text();
            },
            err => {throw err;}
        ).then(
            res => {
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio
                    }, () => this.makeDoughnutChart());
                } else {
                    alert(parsedResponse.msg);
                }
            },
            err => {throw err;}
        )
    }

    componentDidUpdate(){
        console.log("component updated...");
    }

    async sortPortfolio(key, ascending){
        var obj = {
            username: this.state.username,
            key: key,
            ascending: ascending ? 1 : -1
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);
        this.setState({
            disableButtons: true
        });
        await fetch("/sortPortfolio", request).then(
            res => {
                console.log(res);
                return res.text();
            },
            err => {throw err;}
        ).then(
            res => {
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio,
                        sort: {
                            key: parsedResponse.sortKey,
                            ascending: parsedResponse.ascending == 1 ? true : false
                        }
                    }, () => console.log(this.state.sort));
                } else {
                    alert(parsedResponse.msg);
                }
            },
            err => {throw err;}
        ).catch(
            err => {
                throw err; 
            }
        );
    }

    displayPortfolio(){
        console.log("Displaying pf: " + JSON.stringify(this.state.portfolio));
        const list = this.state.portfolio.map((item, index) => {
            {console.log("item " + toString(index)+ ": " + JSON.stringify(item))}
            return (
                <li className="list-container" key={index}>
                    <div className="pos_container">
                        <Position
                            position={item}
                            addFunc={this.addShares.bind(this)}
                            reduceFunc={this.reduceShares.bind(this)}
                            removePositionFunc={this.removePosition.bind(this)}
                        />
                    </div>                    
                </li>
            );
        });
        return list;
    }

    makeDoughnutChart(){
        var ctx = this.chartRef.current.getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    setInputValue(property, val){
        val = val.trim();
        if(val.length > 5){
            return;
        }

        this.setState({
            [property]: val
        })
    }

    render(){
        return(
            <div>
                <h1>My Portfolio</h1>
                <div className="container">
                    <div className="row">
                        <div className="col-sm"></div>
                        <div className="col-sm">
                            {this.state.portfolio.length} positions
                        </div>
                        <div className="col-sm">
                            <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sort</a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <h6 className="dropdown-header">Sort by...</h6>
                                <button className="dropdown-item" onClick={this.state.sort.key === "ticker" ? () => this.sortPortfolio("ticker", !this.state.sort.ascending) : () => this.sortPortfolio("ticker", true)}>
                                    {this.state.sort.key === "ticker" ? <span style={{color: "blue"}}>Ticker {this.state.sort.ascending ?	"▲" : "▼"}</span> : "Ticker"}
                                </button>
                                <button className="dropdown-item" onClick={this.state.sort.key === "shares" ? () => this.sortPortfolio("shares", !this.state.sort.ascending) : () => this.sortPortfolio("shares", false)}>
                                    {this.state.sort.key === "shares" ? <span style={{color: "blue"}}>Shares {this.state.sort.ascending ?	"▲" : "▼"}</span> : "Shares"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <ul id="container" className="pf-list">
                    {this.displayPortfolio()}
                </ul>
                <div className="add-pos-container">
                    <InputField
                        type="text"
                        placeholder="Ticker"
                        value={this.state.tickerInput ? this.state.tickerInput : ""}
                        onChange={(val) => this.setInputValue("tickerInput", val)}
                    />
                    <SubmitButton 
                        text={"Add Position"}
                        disabled={this.state.buttonsDisabled}
                        onClick={() => this.addPosition(this.state.tickerInput)}
                    />
                </div>
                <canvas ref={this.chartRef} width="400" height="400"></canvas>               
            </div>            
        );
    }
}

Portfolio.propTypes = {
    username: PropTypes.string
}