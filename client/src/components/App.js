import React from 'react';
import '../css/App.css';

import { Header } from "./Header";
import { Home } from "./Home";

class App extends React.Component{
  constructor(props){
    super(props)
  }
  
  render(){
    var defaultName = "Guest";
    return (
      <div className="App">
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Header name={defaultName}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Home name={defaultName} initialCount={21}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
