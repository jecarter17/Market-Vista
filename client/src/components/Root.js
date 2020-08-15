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
      token: -1,
      isLoggedIn: false,
      username: "",
      loading: true,
      redirectToHome: false
    }
  }

  validateSessionToken(token){
    //check if user is logged in (so we can adjust rendering)
    console.log("validating token " + token);

    fetch("/validateToken", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        token: token
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
          this.setState({
            username: parsedResult.username
          });
          if(parsedResult.success){
            //save response username, return true
            console.log(parsedResult.msg);
            this.setState({
              isLoggedIn: true,
              loading: false,
              redirectToHome: false
            });
          }else{
            console.log(parsedResult.msg);
            this.setState({
              isLoggedIn: false,
              loading: false,
              redirectToHome: false
            });
          }                
        },
        err => {throw err;}
    );
  }

  componentDidMount(){
    //loading screen while validating token
    this.setState({
      loading: true
    });

    //load token from previous store
    var storedToken = localStorage.getItem("token");
    console.log("Mounting... loading token " + storedToken);
    if(storedToken != null){
      console.log("setting token " + storedToken + " from store");
      this.setState({
        token: storedToken
      },
      this.validateSessionToken(storedToken));
    }
    //window.addEventListener('beforeunload', this.componentCleanup);
  }
    

  componentCleanup(){
    //save token for next load
    console.log(this.state);
    console.log("Unmounting... storing token" + this.state.token);    
    localStorage.setItem("token", this.state.token);
  }

  componentWillUnmount() {
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
        this.render();
      },
      err => {throw err;}
    );
  }

  redirect(){
    /*this.setState({
      redirectToHome: false
    });*/
    return <Redirect
        to={{
            pathname: "/home",
            username: ""
        }}
    />
  }

  render(){
    console.log("Loading =" + this.state.loading);
    console.log("isLoggedIn =" + this.state.isLoggedIn);
    console.log("token =" + this.state.token);
    console.log("username =" + this.state.username);
    console.log("redirectToHome =" + this.state.redirectToHome);

    if (this.state.redirectToHome) {
      this.validateSessionToken(this.state.token);
    }

    if(this.state.loading){
      return(
        <div className="App">
          <div className="row">
            Loading, please wait...
          </div>
        </div>
      );
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
                <Route exact path="/" component={() => <Home name={this.state.username}/>}/>
                {/* <Route path="/home" component={() => <Home name={this.state.username} />}/> */}
                {/*<Route path="/home" component={() => <Home name={this.state.username} location={this.props.location}/>}/>*/}
                <Route path="/home" render={(props) => <Home {...props} name={this.state.username} />}/>
                <Route path="/vista" component={Vista}/>
                <Route path="/profile" component={Profile}/>
                <Route path="/portfolio" component={Portfolio}/>
                <Route path="/settings" component={Settings}/>
                <Route path="/login" component={() => <Login saveToken={this.saveToken.bind(this)} />}/>
              </Switch>
            </div>
          </div>
        </div>
      );
    }   
  }
}

export default Root;