window.onload = pageLoaded();

var minutes = 25;
var seconds = 00;
var initMinutes = 25;
var initSeconds = 00;
var pomodoroFlag = 0;

function pageLoaded(){
	var startBtn = document.getElementById("startBtn");
	var stopBtn = document.getElementById("stopBtn");
	var resetBtn = document.getElementById("resetBtn");
	var settingsBtn = document.getElementById("settingsBtn");
	var backBtn = document.getElementById("backBtn");
	var cancelBtn = document.getElementById("cancelAddBtn");
	var addBtn = document.getElementById("addBtn");
	
	startBtn.onclick = startPomodoro;
	stopBtn.onclick = stopPomodoro;
	resetBtn.onclick = resetPomodoro;
	settingsBtn.onclick = settingsPanel;
	backBtn.onclick = updateTime;
	cancelBtn.onclick = goBack;
	addBtn.onclick = addTask;
	
	if(typeof(Storage) != "undefined"){
	}else{
		// No web Storage support
	}
}

function startPomodoro(){
	// This function will start a new pomodoro once the start or reset buttons have been clicked.
	if(pomodoroFlag  == 0){
		// If one second has passed then decrease time
		pomodoroFlag = setInterval(decreaseTime, 1000);
	}
}
function stopPomodoro(){
	// Stop the pomodoro clock from decreasing time
	clearInterval(pomodoroFlag);
	pomodoroFlag = 0;
}
function resetPomodoro(){
	var timeShown = document.getElementById("time");
	stopPomodoro();
	// Restart the shown time to the initial time
	minutes = initMinutes;
	seconds = initSeconds;
	timeShown.innerHTML = minutes + " : 00";
	startPomodoro();
}
function decreaseTime(){
	// This function is called every second after a pomodoro is started
	var timeShown = document.getElementById("time");
	if(minutes == 0 && seconds == 0){
		// Pomodoro Completed
		stopPomodoro();	 
	}else if(seconds == 0){
		minutes--;
		seconds = 59;
	}else{
		seconds--;
	}
	// Show current pomodoro time
	if(seconds < 10){
		timeShown.innerHTML = minutes + " : 0" + seconds;
	}else{
		timeShown.innerHTML = minutes + " : " + seconds;	
	}
}

/* Settings functions */
function settingsPanel(){
	// Shows the settings panel
	var settingsBox = document.getElementById("settingsBox");
	var containerBox = document.getElementById("container");
	settingsBox.style.display = 'block';
	containerBox.style.display = 'none';
	//containerBox.style.position = 'absolute';
}
function updateTime(){
	// Executes when the user closes the settings panel
	// Sets the time and initial time variables as the number entered by the user
	var timeShown = document.getElementById("time");
	var userMinutes = document.getElementById("userMinutes");
	var userSeconds = document.getElementById("userSeconds");
	var settingsBox = document.getElementById("settingsBox");
	var mainBox = document.getElementById("container");
	
	initMinutes = userMinutes.value;
	initSeconds = userSeconds.value;
	minutes = userMinutes.value;
	seconds = userSeconds.value;
	timeShown.innerHTML = minutes + " : " + seconds;
	settingsBox.style.display = 'none';
	mainBox.style.display = 'block';
}

/* Add new Task functions */
function addTask(){
	// Shows the add new task menu and waits for user input
	var mainBox = document.getElementById("container");
	var addNewTaskBox = document.getElementById("addNewTaskBox");
	addNewTaskBox.style.display = 'block';
	mainBox.style.display = 'none';
}
function goBack(){
	// Hides the add menu and shows the main screen
	var addNewTask = document.getElementById("addNewTaskBox");
	var mainBox = document.getElementById("container");
	addNewTask.style.display = 'none';
	mainBox.style.display = 'block';
}
