import React from 'react';
import Barchart from 'react-chartjs';
import AdminView from './AdminView';

var socket;
var BarChart = require("react-chartjs").Bar;

const ADMIN2_TYPE = 'ADMIN2_TYPE';


var AdminQuestionnary = React.createClass({
	getInitialState: function(){
		return {okToStart:false, questionIndex:-1}
	},
	componentDidMount: function(){
		var t = this;
		socket = this.props.socket;
		socket.on("all-users-are-ready", function(){
			t.setState({okToStart:true});
		});
		socket.emit("launch-quizz", this.props.questionnary.qid);
		socket.on("answer", function(indexOfAnswer){
			console.log("Receivend answer " + indexOfAnswer);
		});
        socket.on("end-time-request", function(){
            t.stopTime();
        });
	},
	incrementCounter: function(){
		var oldQuestionIndex = this.state.questionIndex;
		this.setState({questionIndex:oldQuestionIndex+1});
	},
    stopTime: function(){
        var arrayOfGoodAnswers = [];
        var questionnary = this.props.questionnary;
		var maxIndex = questionnary.questions.length;
        if(this.state.questionIndex<maxIndex){
            var question = questionnary.questions[this.state.questionIndex];
            var answersIds = question.answers;
            var answersObjects = questionnary.answers;
            for(var i=0;i<answersIds.length;i++){
	        	for (var k = 0; k<answersObjects.length; k++){
	                if (answersObjects[k].rid == answersIds[i]){
                        if(answersObjects[k].correct){
                            console.log("Correct :" + i);
                            arrayOfGoodAnswers.push(i);
                        }
	                }
	            }
	        }
        }
        console.log(arrayOfGoodAnswers);
        socket.emit("end-time", arrayOfGoodAnswers);  
    },
    showBarChart: function(){
        socket.emit("showBarChart");
        console.log("I emitted showBarChart");
    },
  	_renderWaitPage() {
  		var startButton = <button className="index-button" onClick={this.incrementCounter}>Start !</button>;
  		var waitMessage = <p> En attente de tous les utilisateurs ...</p>
  		return this.state.okToStart ? startButton : waitMessage;
	},
	_renderQuizzPage(){
		var questionnary = this.props.questionnary;
		var maxIndex = questionnary.questions.length;
		if(this.state.questionIndex<maxIndex){
			var question = questionnary.questions[this.state.questionIndex];
			var questionTitle = question.text;
	        var answersLabels = [];
			var answersIds = question.answers;
			var answersObjects = questionnary.answers;
	        for(var i=0;i<answersIds.length;i++){
	        	for (var j = 0; j<answersObjects.length; j++){
	                if (answersObjects[j].rid == answersIds[i]){
	                    answersLabels.push(answersObjects[j].label);
	                }
	            }
	        }
            var time = question.time || 10;
            var data = {answers:answersLabels, time:time};
            var datashow = {answers:answersLabels, time:time, question: questionTitle};
	        socket.emit("question", data);
            socket.emit("question-show", datashow);
            console.log ("emitted question-show to server");
	        var answersNodes = answersLabels.map(function(label) {
	        	return(
		        	<li>
		                <p>{label} </p>
		            </li>);
	        });

	        //CHART DATA

		    var numberOfAnswers = answersIds.length;
			var initResults = this.zeroArray(numberOfAnswers);
			var chartData = 
				{
					labels: answersLabels,
					datasets: [{label: 'Resultats', data: initResults}]
				};
            socket.emit("chartData", chartData);

			return (
				<div>
					<p>{questionTitle}</p>
					<ul>
						{answersNodes}
					</ul>
					<button className="index-button" onClick={this.incrementCounter}>Next</button>
                    <button className="index-button" onClick={this.stopTime}>Stop Time</button>
                    <button className="index-button" onClick={this.showBarChart}> Show Answers </button>
					<Chart socket={socket} data={chartData} key={this.state.questionIndex}/>
				</div>
			);
		} else {
			socket.emit("end-questionnary");
			return (<button className="index-button" onClick={this.returnToAdmin}> Lancer un nouveau quizz </button>);
		}
	},
                    
    returnToAdmin : function(){
                this.setState({userType: ADMIN2_TYPE});
            },
	//TODO ajouter le compte des utilisateurs
  	render: function(){
	    var content = this.state.questionIndex>-1 ? this._renderQuizzPage() : this._renderWaitPage();
	    if(this.state.userType == undefined) {
            return(
	        <div>
	        	<h1>{this.props.questionnary.title}</h1>
	   			{content}
	        </div>
	    );
        }
        else if (this.state.userType == ADMIN2_TYPE){
            return(
                <AdminView url='/questionnaries'/>
            );
        }
  	}, 
  	zeroArray: function(n){
		return Array.apply(null, {length: n}).map(function() {return 0;});
	}
});

var Chart = React.createClass({
	getInitialState: function(){
		var t = this;
		return({data:t.props.data});
	}, 
	componentDidMount: function(){
		var socket = this.props.socket;
		var t = this;
        console.log("chart mounted");
        console.log(t.state.data);
		socket.on("answer", function(indexOfAnswer){
			var newData = t.state.data;
	        newData.datasets[0].data[indexOfAnswer]++; 
	        t.setState({data: newData});
            socket.emit("chartData", t.state.data);
            console.log("i emitted chartdata");
            console.log(t.state.data);
		});
	},
	render: function(){
		return <BarChart data = {this.state.data}/>;
	}
});

export default AdminQuestionnary;