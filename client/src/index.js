import React from 'react';
import {render} from "react-dom";
import {BrowserRouter} from "react-router-dom";

import Root  from './components/Root';

import * as serviceWorker from './app/serviceWorker';
import './css/index.css';

class App extends React.Component{
  render(){
    var defaultUser = {
      "name": "Guest",
      "id": 0
    };
    return(
      <BrowserRouter>
        <Root user={defaultUser}/>
      </BrowserRouter>      
    );
  }
}

render(<App />, window.document.getElementById('app'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
