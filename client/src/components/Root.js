import React from 'react';
import {Switch, Route} from "react-router-dom";

import {Header} from "./Header";
import {Home} from "./Home";
import {Vista} from "./Vista";
import Profile from './Profile';
import {Portfolio} from "./Portfolio";
import {Settings} from "./Settings";
import {Login} from "./Login";

import '../css/Root.css';

class Root extends React.Component{
  
  render(){
    
    return (
      <div className="App">
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Header user={this.props.user}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path="/home" component={Home}/>              
              <Route path="/vista" component={Vista}/>
              <Route path="/profile" component={Profile}/>
              <Route path="/portfolio" component={Portfolio}/>
              <Route path="/settings" component={Settings}/>
              <Route path="/login" component={Login}/>
            </Switch>
            <Home user={this.props.user}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Root;
