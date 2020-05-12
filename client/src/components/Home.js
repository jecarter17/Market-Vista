import React from "react";
import logo from '../images/logo.svg';

export class Home extends React.Component{

    constructor(props){
        super(props);
        this.state = {apiResponse:""};
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
                <p>Welcome to the Home page {this.props.name}</p>
                <img src={logo} className="App-logo" alt="logo" />
                <p>{this.state.apiResponse}</p>
            </div>
        );
    }
}