import React from 'react';
import Barchart from 'react-chartjs';
import AdminView from './AdminView';
import RaisedButton from 'material-ui/lib/raised-button';
import WaitPage from './WaitPage';
import AdminAnswers from './AdminAnswers';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';

var socket;
var BarChart = require("react-chartjs").Bar;

const ADMIN2_TYPE = 'ADMIN2_TYPE';

var colors = ['#607D8B', '#FF5722', '#795548', '#FF9800', '#FFC107', '#FFEB3B', '#CDDC39', '#8BC34A', '#4CAF50', '#009688', '#00BCD4', '#00BCD4', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63', '#F44336']; 

const titleStyle = {
    paddingTop:'3%',
    fontSize:'5vmin', 
};

const buttonLabelStyle = {
    fontSize:'5vmin'
}

var AdminQuestionnary = React.createClass({
    labelStyle: {textTransform: 'none', fontSize: '150%', textAlign: 'centered'},
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
                            arrayOfGoodAnswers.push(i);
                        }
	                }
	            }
	        }
        }
        socket.emit("end-time", arrayOfGoodAnswers);  
    },
    showBarChart: function(){
        socket.emit("showBarChart");
    },
  	_renderWaitPage() {
        return (<WaitPage launchQuizz={this.incrementCounter} okToStart={this.state.okToStart}/>);
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
            var answersLabelsCorrect = [];
	        for(var i=0;i<answersIds.length;i++){
	        	for (var j = 0; j<answersObjects.length; j++){
	                if (answersObjects[j].rid == answersIds[i]){
                        answersLabels.push(answersObjects[j].label);
	                    answersLabelsCorrect.push({label: answersObjects[j].label, correct: answersObjects[j].correct});
	                }
	            }
	        }
            var time = question.time || 10;
            var data = {answers:answersLabels, time:time, question: questionTitle};
            var datashow = {answers:answersLabels, time:time, question: questionTitle};
	        socket.emit("question", data);
            socket.emit("question-show", datashow);

		    var numberOfAnswers = answersIds.length;
			var initResults = this.zeroArray(numberOfAnswers);
            var rand = colors[Math.floor(Math.random() * colors.length)];
			var chartData = 
				{
					labels: answersLabels,
					datasets: [{label: 'Resultats', data: initResults, fillColor: rand}]
				};
            socket.emit("chartData", chartData);
            var buttonStyle = {
                width:"60%",
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '50%',
                marginTop:'10%'};
            var buttonStyle2 = {width:"100%", display:"block", padding:'0px'};
            var centerStyle = {textAlign:'center'};
            var divStyle = {width:"100%", display:"block", padding:'0px', marginTop:"3%"};
			return (
				<div>
					<p className="centered little padding6">{questionTitle}</p>
                    <AdminAnswers answersLabelsCorrect={answersLabelsCorrect}/>
                    <table style={divStyle}>
                        <tr>
                            <td style={centerStyle}>
                                <RaisedButton
                                    label="Question suivante"
                                    buttonStyle={buttonStyle2}
                                    onMouseDown={this.incrementCounter}
                                    labelStyle={this.labelStyle}
                                />
                            </td>
                            <td style={centerStyle}>
                                <RaisedButton
                                    label="Arrêter le chronomètre"
                                    buttonStyle={buttonStyle2}
                                    onMouseDown={this.stopTime}
                                    labelStyle={this.labelStyle}
                                />
                            </td>
                            <td style={centerStyle}>
                                <RaisedButton
                                    label="Afficher les réponses"
                                    buttonStyle={buttonStyle2}
                                    onMouseDown={this.showBarChart}
                                    labelStyle={this.labelStyle}
                                />
                            </td>
                        </tr>   
                    </table>
					<Chart
                        socket={socket}
                        data={chartData}
                        key={this.state.questionIndex}
                    />
				</div>
			);
		} else {
			socket.emit("end-questionnary");
			return (
                <RaisedButton
                    buttonStyle={this.buttonStyle}
                    label="Lancer un nouveau quizz"
                    onMouseDown={this.returnToAdmin}
                    labelStyle={this.labelStyle}
                />
            );
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
	        	<h1 style={titleStyle} className="red centered">{this.props.questionnary.title}</h1>
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
        for (var i = 0; i<this.props.data.labels.length;i++) {
            var newData = this.props.data;
            var label = this.props.data.labels[i];
            var TruncatedLabel = label.substring(0,10);
            newData.labels[i]=TruncatedLabel;
            this.setState({data: newData});
    // d'autres instructions
}
            
		socket.on("answer", function(indexOfAnswer){
			var newData = t.state.data;
	        newData.datasets[0].data[indexOfAnswer]++; 
	        t.setState({data: newData});
            socket.emit("chartData", t.state.data);
		});
	},
	render: function(){
        var centerChartStyle = {marginLeft:'auto', marginRight:'auto', display:'block', width:'80%', height:'40%', marginTop:'3%'};
		return <BarChart data = {this.state.data}
                                style={centerChartStyle}
                        className="coucoucouc"/>;
	}
});

export default AdminQuestionnary;