import React from "react";
import PropTypes from "prop-types";

import { SubmitButton } from "./SubmitButton";

export class Vista extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            username: this.props.username,
            portfolio: [],
            vistaWidth: 800,
            vistaHeight: 800,
            vistaCols: 10,
            vistaRows: 10
        }
        this.vistaRef = React.createRef();
        this.chartColors = ['#00429d', '#2b57a7', '#426cb0', '#5681b9', '#6997c2', '#7daeca', '#93c4d2', '#abdad9', '#caefdf', '#ffffe0'];
    }

    componentDidUpdate(){

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            portfolio: nextProps.portfolio
        };
    }

    /* TODO: Refactor to avoid duplicating function */
    async getPortfolio(){

        var obj = {
            username: this.state.username
        }
        var request = {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(obj)
        }
        console.log(request);

        await fetch("/getPortfolio", request).then(
            res => {
                console.log(res);
                return res.text();
            },
            err => {throw err;}
        ).then(
            res => {
                var parsedResponse = JSON.parse(res);
                if (parsedResponse.success) {
                    this.setState({
                        portfolio: parsedResponse.portfolio
                    }, this.doDrawing.bind(this));
                } else {
                    alert(parsedResponse.msg);
                }
            },
            err => {throw err;}
        )
    }

    doDrawing(){
        var sum = 0;

        this.state.portfolio.map((item) => {
            sum += (item.price * item.shares);
        });

        var colors = this.state.portfolio.map((item) => {
            var part = (item.price * item.shares) / sum;
            return("#" + Math.floor(part).toString(16));
        });

        var canvas = this.vistaRef.current;
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        var cw = canvas.width;
        var ch = canvas.height;
        var cols = this.state.vistaCols;
        var rows = this.state.vistaRows;
        var blockWidth = cw / cols;
        var blockHeight = ch / rows;

        ctx.clearRect(0, 0, cw, ch);
        ctx.save();

        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                //ctx.fillStyle = this.chartColors[Math.floor(Math.random() * this.chartColors.length)];
                ctx.fillStyle = colors[(x*y)%colors.length];
                ctx.fillRect(x * blockWidth, y * blockHeight, blockWidth, blockHeight);
            }
        }

        ctx.stroke();
        ctx.restore();
    }

    async drawVista(){
        await this.getPortfolio(); 
    }

    render(){
        return(
            <div>
                <h1>Welcome to your Vista page</h1>
                <SubmitButton
                    text={"Generate Vista"}
                    disabled={false}
                    onClick={this.drawVista.bind(this)}
                />
                <div>
                    <canvas ref={this.vistaRef} width={this.state.vistaWidth} height={this.state.vistaHeight}></canvas>
                </div>                
            </div>
        );
    }
}

Vista.propTypes = {
    username: PropTypes.string,
    portfolio: PropTypes.array
}