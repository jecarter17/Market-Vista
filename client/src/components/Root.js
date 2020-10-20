import React from 'react';
import {Switch, Route, Redirect} from "react-router-dom";

import {Header} from "./Header";
import {Home} from "./Home";
import {Vista} from "./Vista";
import {Profile} from './Profile';
import {Portfolio} from "./Portfolio";
import {Settings} from "./Settings";
import {Login} from "./Login";

import '../css/Root.css';

class Root extends React.Component{
  
  constructor(){
    super();
    this.state = {
      isLoggedIn: false,
      username: "",
      loading: true,
      redirectToHome: false
    }
  }

  validateSessionToken(){
    console.log("validateSessionToken()");
    //check if user is logged in (so we can adjust rendering)
    var storedToken = localStorage.getItem("token");
    if(storedToken != null){
      console.log("validating token " + storedToken + " from store");

      fetch("/validateToken", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          token: storedToken
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
              //save response username, return true
              console.log(parsedResult.msg);
              this.setState({
                isLoggedIn: true,
                username: parsedResult.username,
                loading: false,
                redirectToHome: false
              });
            }else{
              console.log(parsedResult.msg);
              this.setState({
                isLoggedIn: false,
                username: "",
                loading: false,
                redirectToHome: false
              });
            }                
          },
          err => {throw err;}
      );
    } else {
      console.log("no token to validate...");
    }    
  }

  componentDidMount(){
    //loading screen while validating token
    this.setState({
      loading: true
    });
    this.validateSessionToken();
  }

  redirectToHome(){
    console.log("redirectToHome()");
    this.validateSessionToken();
    return <Redirect
      to={{
        pathname: "/home"
      }}
    />
  }    

  componentCleanup(){
    /* empty for now */
  }

  componentWillUnmount() {
    /* I don't think this will ever execute */
    console.log("Root unmounting...");
    //this.componentCleanup();
    //window.removeEventListener('beforeunload', this.componentCleanup); // remove the event handler for normal unmounting
  }

  saveToken(newToken){
    console.log("local storing " + newToken);
    localStorage.setItem("token", newToken);
  }

  async handleLogout(){
    //mark corresponding token as deleted
    await fetch("/logout", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        token: localStorage.getItem("token")
      })
    }).then(
      res => {
        console.log(res);
        return res.text();
      },
      err => {throw err;}
    ).then(
      res => {
        console.log(res);
        if(res){
          alert("Successfullly logged out");
        }else{
          alert("Failed to properly log out");
        }
        this.setState({
          isLoggedIn: false,
          username: "",
          redirectToHome: true
        });
      },
      err => {throw err;}
    );
  }

  render(){
    console.log("Loading =" + this.state.loading);
    console.log("isLoggedIn =" + this.state.isLoggedIn);
    console.log("username =" + this.state.username);
    console.log("redirectToHome =" + this.state.redirectToHome);

    if(this.state.loading){
      return(
        <div className="App">
          <div className="row">
            Loading, please wait...
          </div>
        </div>
      );
    } else if (this.state.redirectToHome) {
      return this.redirectToHome();
    } else {
      return (
        <div className="App">
          <div className="row">
            <div className="col-xs-10 col-xs-offset-1">
              <Header isLoggedIn={this.state.isLoggedIn} handleLogout={this.handleLogout.bind(this)}/>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-10 col-xs-offset-1">
              <Switch>
                <Route exact path="/" component={() => <Home username={this.state.username}/>}/>                
                <Route path="/home" component={() => <Home username={this.state.username} />}/>
                <Route path="/vista" component={() => <Vista username={this.state.username}/>}/>
                <Route path="/profile" component={() => <Profile username={this.state.username}/>}/>
                <Route path="/portfolio" component={() => <Portfolio username={this.state.username}/>}/>
                <Route path="/settings" component={Settings}/>
                <Route path="/login" component={() => <Login saveToken={this.saveToken.bind(this)} redirectToHome={this.redirectToHome.bind(this)}/>}/>
              </Switch>
            </div>
          </div>
        </div>
      );
    }   
  }
}

export default Root;