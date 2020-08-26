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
            reduceInput: 0
        }
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
                <p>Market Value: $0</p>
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
            </div>
        )
    }
}

Position.propTypes = {
    position: PropTyes.object,
    addFunc: PropTyes.func,
    reduceFunc: PropTyes.func
}