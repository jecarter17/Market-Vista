import React from "react";
import PropTypes from "prop-types";

export class InputField extends React.Component{

    render(){
        return(
            <div className="inputField">
                <input
                    className="input"
                    type={this.props.type}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={ (e) => this.props.onChange(e.target.value)}
                ></input>
            </div>
        );
    }
}

InputField.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
    /* value PropType not specified as it may be number or string */
    onChange: PropTypes.func
}