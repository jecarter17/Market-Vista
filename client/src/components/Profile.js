import React from "react";

export class Profile extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: "",
            user_id: "",
            portfolio: []
        }
    }

    componentDidMount(){
        this.fetchUserData("user1");
    }

    fetchUserData(u_name){
        const endpoint = "/getUserData";
        var obj = {
            "username": u_name
        };
        console.log(JSON.stringify(obj));
        const requestInfo = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        };
        
        fetch(endpoint, requestInfo).then(
            res => {
                console.log(res);
                return res.text();      
            },
            err => {throw err;}
        ).then(
            result => {
                var parsedUser = JSON.parse(result)[0];
                console.log(parsedUser);
                console.log(parsedUser.username);
                console.log(parsedUser._id);
                console.log(parsedUser.portfolio.toString());
                this.setState({
                    username: parsedUser.username,
                    user_id: parsedUser._id,
                    portfolio: parsedUser.portfolio
                });
            },
            err => {throw err;}
        );
    }

    render(){
        return(
            <div>
                <h3>Profile Page</h3>
                <p>Username: {this.state.username}</p>
                <p>User_ID: {this.state.user_id}</p>
                <p>Portfolio: {this.state.portfolio.toString()}</p> 
            </div>
        );
    }
}