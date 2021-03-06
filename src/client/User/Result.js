import React from 'react';

const GOOD_ANSWER = "good";
const WRONG_ANSWER = "wrong";
const NO_ANSWER = "no";
const NEUTRAL = "neutral";

import "./result.css";

var Result = React.createClass({
    chooseFromStatus: function(list){
        var a = this.props.answerState;
        if(a==GOOD_ANSWER){
            return list[0];
        } else if(a==WRONG_ANSWER){
            return list[1];
        } else if (a==NO_ANSWER){
            return list[2];
        } else if(a==NEUTRAL){
            return list[3];
        } else {
            return undefined;
        } 
    },
    render: function(){
        var imageURL = this.chooseFromStatus([
            "./correct", 
            "./incorrect", 
            "./time", 
            "./like"]);
        var answers = this.props.answersList;
        return(
            <div className="result-block">
                <div className="result-image-holder">
                    <img className="result-image" src={imageURL}/>
                </div>
            </div>
        );
   } 
});


export default Result;