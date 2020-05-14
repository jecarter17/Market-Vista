import React from "react";
import { withRouter } from "react-router";

class Profile extends React.Component{
    render(){
        return(
            <div>
                <h3>Profile Page</h3>
                <p>Username: </p>
                <p>ID: </p>
            </div>
        );
    }
}

export default withRouter(Profile);