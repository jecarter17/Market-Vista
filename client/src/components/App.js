import React from 'react';
import '../css/App.css';

import { Header } from "./Header";
import { Home } from "./Home";

class App extends React.Component{

  render(){
    return (
      <div className="App">
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Header/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
            <Home name={"Guest"}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
