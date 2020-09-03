import React from "react";
import PropTypes from "prop-types";

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
            tickerInput: ""
        }
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

        window.location.reload(false);
    }

    async removePosition(){

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
        window.location.reload(false);
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
                    <div className="pos_container">
                        <Position
                            position={item}
                            addFunc={this.addShares.bind(this)}
                            reduceFunc={this.reduceShares.bind(this)}
                            removePositionFunc={this.reduceShares.bind(this)}
                        />
                    </div>                    
                </li>
            );
        });
        return list;
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
                <h1>Welcome to your portfolio page {this.props.username}</h1>
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
            </div>            
        );
    }
}

Portfolio.propTypes = {
    username: PropTypes.string
}