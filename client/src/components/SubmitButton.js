import React from "react";
import PropTypes from "prop-types";

export class SubmitButton extends React.Component{

    render(){
        return(
            <div className="submitButton">
                <button 
                    className="btn btn-primary"
                    disabled={this.props.disabled}
                    onClick={ () => this.props.onClick()}
                >
                    {this.props.text}
                </button>
            </div>
        );
    }
}

SubmitButton.propTypes = {
    text: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func
};