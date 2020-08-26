import React from "react";
import PropTypes from "prop-types";

import {Position} from "./Position";

export class Portfolio extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: this.props.username,
            portfolio: [],
            disableButtons: false
        }
    }

    componentDidMount(){
        this.getPortfolio();
    }

    async addShares(symbol, inc){
        this.setState({
            disableButtons: true
        });
        var currentShares;
        for (var i=0; i<this.state.portfolio.length; i++) {
            if (this.state.portfolio[i].symbol === symbol) {
                currentShares = this.state.portfolio[i].shares;
                break;
            }
        }

        if (currentShares) {
            console.log("Adding " + inc + " shares of " + symbol);
            await this.modifyPortfolio(symbol, inc);
            window.location.reload(false);
        } else {
            // don't think this should ever get called
            alert("Could not find " + symbol + " in portfolio");
        }
        this.setState({
            disableButtons: false
        });
    }

    async reduceShares(symbol, inc){
        var negated = inc * -1;
        await this.modifyPortfolio(symbol, negated);
    }

    async modifyPortfolio(symbol, inc){
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
                    });
                } else {
                    alert(parsedResponse.msg);
                }
            },
            err => {throw err;}
        )
    }

    displayPortfolio(){
        const list = this.state.portfolio.map((item, index) => {
            return (
                <li className="list-container" key={index}>
                    <Position
                        position={item}
                        addFunc={this.addShares.bind(this)}
                        reduceFunc={this.reduceShares.bind(this)}
                    />
                </li>
            );
        });
        return list;
    }

    render(){
        return(
            <div>
                <h1>Welcome to your portfolio page {this.props.username}</h1>
                <ul id="container" className="pf-list">
                    {this.displayPortfolio()}
                </ul>
            </div>            
        );
    }
}

Portfolio.propTypes = {
    username: PropTypes.string
}