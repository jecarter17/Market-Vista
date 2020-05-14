import React from "react";
import logo from '../images/logo.svg';
import PropTypes from "prop-types";

export class Home extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            apiResponse:"",
            count: props.user.id
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
    
    componentWillMount(){
        this.callAPI();
    }

    render(){
        return(
            <div>
                <p>Welcome to the Home page {this.props.user.name}</p>
                <img src={logo} className="App-logo" alt="logo" />
                <p>{this.state.apiResponse}</p>
                <p>Count = {this.state.count}</p>
                <button onClick={() => this.countUp()} className="btn btn-primary">Count Up</button>
                <button onClick={() => this.countDown()} className="btn btn-primary">Count Down</button>
            </div>
        );
    }
}

Home.propTypes = {
    user: PropTypes.object
};