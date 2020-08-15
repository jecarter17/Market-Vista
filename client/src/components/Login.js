import React from "react";
import PropTypes from "prop-types";

import {Redirect} from "react-router-dom";

import {InputField} from "./InputField";
import {SubmitButton} from "./SubmitButton";

export class Login extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            buttonDisabled: false,
            toHome: false
        }
    }

    setInputValue(property, val){
        val = val.trim();
        if(val.length > 12){
            return;
        }
        this.setState({
            [property]: val
        })
    }

    resetForm(){
        this.setState({
            username: "",
            password: "",
            buttonDisabled: false
        })
    }
    /*
    homeRedirect(){
        console.log("home redirect called");
        const history = useHistory();
        history.push("/home");
    }

    async handleLogin(){
        var success = await this.doLogin();
        console.log("login success = " + success);
        if(success){
            console.log("successful login, redirecting to home");
            this.homeRedirect();
        }else{
            this.resetForm();
        }
    }*/

    async doLogin(){
        await this.handleLogin();
    }

    async handleLogin(){
        if(!this.state.username){
            return;
        }
        if(!this.state.password){
            return;
        }

        var redirect = false;

        this.setState({
            buttonDisabled: true
        });

        try {            
            redirect = await fetch("/login", {
                method: "POST",
                 headers: {
                   "Content-type": "application/json"
                 },
                 body: JSON.stringify({
                     username: this.state.username,
                     password: this.state.password
                 })
             }).then(
                 res => {
                     console.log(res);
                     return res.text();
                 },
                 err => {throw err;}
             ).then(
                 result => {
                     console.log(result);
                     var parsedResult = JSON.parse(result);
                     if(parsedResult.success){
                        /* trigger redirect on the next render */
                        this.setState({
                            toHome: true
                        });
                        console.log("Done setting state?");
                         console.log("saving token " + parsedResult.token);
                         this.props.saveToken(parsedResult.token);
                         return true;
                     }else{
                         this.resetForm();
                         alert(parsedResult.msg);
                         return false;
                     }                
                 },
                 err => {throw err;}
             );
        } catch (e) {
            alert(e.message);
        }

        console.log("Exiting handle login...");

        return;        
    }

    setStateSynchronous(stateUpdate) {
        return new Promise(resolve => {
            this.setState(stateUpdate, () => resolve());
        });
    }

    componentWillUnmount(){
        console.log("Component unmounting...");
        console.log(this.state.toHome);
    }

    componentDidUpdate() {
        console.log('updated component');  
    }

    redirect(){
        return <Redirect
            to={{
                pathname: "/home",
                state: { username: this.state.username }
            }}
        />
    }

    render(){
        /*
        if (this.state.toHome === true) {
            return <Redirect to='/home' />
        }*/
        console.log(this.state.toHome);

        return(
            <div className="loginForm">
                <h1>Login</h1>
                <InputField
                    type="text"
                    placeholder="Username"
                    value={this.state.username ? this.state.username : ""}
                    onChange={ (val) => this.setInputValue(("username"), val) }
                />
                <InputField
                    type="text"
                    placeholder="Password"
                    value={this.state.password ? this.state.password : ""}
                    onChange={ (val) => this.setInputValue(("password"), val) }
                />
                <SubmitButton
                    text={"Log In"}
                    disabled={this.state.buttonDisabled}
                    onClick={ () => this.doLogin() }
                />
                <a className="nav-link" href="/register">New here? Click here to create an account</a>
                {this.state.toHome ? this.redirect() : <p></p>}
            </div>
        );
    }
}

Login.propTypes = {
    saveToken: PropTypes.func
};