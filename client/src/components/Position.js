import React from "react";
import PropTyes from "prop-types";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
            price: 0,
            dialogOpen: false
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.position.symbol !== prevProps.position.symbol) {
            this.scrapeStockPrice(this.props.position.symbol);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {position: nextProps.position};
    }

    componentDidMount(){
        //this.fetchStockPrice();
        this.scrapeStockPrice(this.props.position.symbol);
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

    scrapeStockPrice(ticker){
        this.setState({price: 0});
        
         // TODO: this is a lazy fix for an extra empty call of this function
        // with an empty arg. Figure out root cause and fix that.
        if (ticker == null) {
            return;
        }

        var request = {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            }
        }
        console.log(ticker);

        fetch("/quotes/stock/"+ticker, request).then(
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

    getMarketPrice(){
        if (this.state.price == 0) {
            return "Loading...";
        } else {
            return "$" + (this.state.price * this.state.position.shares).toFixed(2).toString();
        }
    }

    /* prop function wrappers*/
    addFunc(){
        this.setState({addInput: 0});
        this.props.addFunc(this.state.position.symbol, this.state.addInput);
    }

    reduceFunc(){
        this.setState({reduceInput: 0});
        this.props.reduceFunc(this.state.position.symbol, this.state.reduceInput);
    }

    handleDialogOpen(){
        this.setState({dialogOpen:true});
    };

    handleDialogCloseAgree(){
        this.setState({dialogOpen:false});
        this.props.removePositionFunc(this.state.position.symbol);
    };

    handleDialogCloseDisagree(){
        this.setState({dialogOpen:false});
    };

    render(){
        return(
            <div className="text-container">
                <h4>{this.state.position.symbol}</h4>
                <p>Shares: {this.state.position.shares}</p>
                <p>Market Value: {this.getMarketPrice()}</p>
                <SubmitButton 
                    text={"Add Shares"}
                    disabled={this.state.buttonsDisabled}
                    onClick={() => this.addFunc()}
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
                    onClick={() => this.reduceFunc()}
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
                    onClick={() => this.handleDialogOpen()}
                />
                <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Remove position?"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove your position in {this.state.position.symbol}?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.handleDialogCloseDisagree()} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={() => this.handleDialogCloseAgree()} color="primary" autoFocus>
                        Agree
                    </Button>
                    </DialogActions>
                </Dialog>
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