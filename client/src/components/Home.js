import React from "react";
import logo from '../images/logo.svg';
import PropTypes from "prop-types";

export class Home extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            apiResponse:"",
            stockPrice: "",
            count: 0,
            username: this.props.username
        };
    }

    countUp(){
        this.setState({
            count: this.state.count + 1
        });
    }

    countDown(){
        this.setState({
            count: this.state.count - 1
        });
    }
    
    callAPI(){
    fetch("http://localhost:9000/testAPI")
        .then(res => res.text())
        .then(res => this.setState({apiResponse: res}))
    }
    
    componentDidMount(){
        this.callAPI();
    }

    render(){
        return(
            <div>
                <p>Welcome to the Home page {this.state.username}</p>
                <img src={logo} className="App-logo" alt="logo" />
                <p>IBM's stock price is {this.state.stockPrice}</p>
                <button onClick={() => {this.setState({stockPrice: 123.45})}} className="btn btn-primary">Get IBM Stock Price</button>
                <p>Count = {this.state.count}</p>
                <button onClick={() => this.countUp()} className="btn btn-primary">Count Up</button>
                <button onClick={() => this.countDown()} className="btn btn-primary">Count Down</button>
            </div>
        );
    }
}

Home.propTypes = {
    name: PropTypes.string
};