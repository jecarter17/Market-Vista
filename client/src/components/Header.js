import React from "react";
import PropTypes from "prop-types";

export const Header = (props) => {
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <a className="navbar-brand" href="/home">Market Vista</a>
            {/*}
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>{*/}

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <a className="nav-link" href="/home">Home</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link disabled" href="/vista" tabIndex="-1" aria-disabled="true">My Vista</a>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Account</a>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <h6 className="dropdown-header">{props.name}</h6>
                            <a className="dropdown-item" href="/profile">Profile</a>
                            <a className="dropdown-item" href="/portfolio">Portfolio</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="/settings">Settings</a>
                        </div>
                    </li>
                    <li className="nav-item">
                        {props.isLoggedIn
                            ? <button className="btn btn-outline-success my-2 my-sm-0" type="submit" onClick={props.handleLogout}>Log Out</button>
                            : <a className="nav-link" href="/login">Login</a>
                        }
                    </li>
                </ul>
                <form className="form-inline my-2 my-lg-0">
                    <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"></input>
                    <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                </form>
            </div>
        </nav>
    );
}

Header.propTypes = {
    name: PropTypes.string,
    isLoggedIn: PropTypes.bool,
    handleLogout: PropTypes.func
};