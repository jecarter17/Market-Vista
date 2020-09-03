import React from "react";
import PropTyes from "prop-types";

import {SubmitButton} from "./SubmitButton";
import {InputField} from "./InputField";

export class Position extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            position: this.props.position,
            buttonsDisabled: false,
            addInput: 0,
            reduceInput: 0,
            price: 0
        }
    }

    componentDidMount(){
        this.fetchStockPrice();
    }

    fetchStockPrice(){
        var obj = {
            symbol: this.state.position.symbol
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        fetch("/getStockQuote", request).then(
            res => {
                return res.text();
            }
        ).then(
            res => {
                console.log(res);
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({price: parsedResponse.price});
                } else {
                    alert(parsedResponse.msg);
                }                
            }
        ).catch(
            err => {throw err;}
        );
    }

    setInputValue(property, val){
        if (val < 0) {
            alert("Value may not be negative");
            return;
        }
    
        if (property === "addInput" && val + this.state.position.shares > 2147483647) {
            alert("Value too large");
            return;
        }

        if(property === "reduceInput" && val > this.state.position.shares){
            alert("May not reduce by more shares than are currently present");
            return;
        }

        this.setState({
            [property]: val
        })
    }

    render(){
        return(
            <div className="text-container">
                <h4>Ticker: {this.state.position.symbol}</h4>
                <p>Shares: {this.state.position.shares}</p>
                <p>Market Value: ${this.state.price * this.state.position.shares}</p>
                <SubmitButton 
                    text={"Add Shares"}
                    disabled={this.state.buttonsDisabled}
                    onClick={() => this.props.addFunc(this.state.position.symbol, this.state.addInput)}
                />
                <InputField
                    type="number"
                    placeholder="# Shares"
                    value={this.state.addInput ? this.state.addInput : 0}
                    onChange={(val) => this.setInputValue("addInput", val)}
                />
                <SubmitButton 
                    text={"Reduce Shares"}
                    disabled={this.state.buttonsDisabled}
                    onClick={() => this.props.reduceFunc(this.state.position.symbol, this.state.reduceInput)}
                />
                <InputField
                    type="number"
                    placeholder="# Shares"
                    value={this.state.reduceInput ? this.state.reduceInput : 0}
                    onChange={(val) => this.setInputValue("reduceInput", val)}
                />
                <SubmitButton 
                    text={"Remove Position"}
                    disabled={this.state.buttonsDisabled}
                    onClick={() => this.props.removePositionFunc(this.state.tickerInput)}
                />
            </div>
        )
    }
}

Position.propTypes = {
    position: PropTyes.object,
    addFunc: PropTyes.func,
    reduceFunc: PropTyes.func,
    removePositionFunc: PropTyes.func
}