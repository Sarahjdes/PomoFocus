var clock = {
	"minutes" : 25,
	"seconds" : 00,
	"initMinutes" : 25,
	"initSeconds" : 00,
	"pomodoroFlag" : 0
};

window.onload = pageLoaded();

function pageLoaded(){
	var startBtn = document.getElementById("startBtn");
	var stopBtn = document.getElementById("stopBtn");
	var resetBtn = document.getElementById("resetBtn");
	var settingsBox = document.getElementById("settingsBox");
	var settingsBtn = document.getElementById("settingsBtn");
	var backBtn = document.getElementById("backBtn");
	var cancelBtn = document.getElementById("cancelAddBtn");
	var addBtn = document.getElementById("addBtn");
	var mainBox = document.getElementById("container");
	var customBox = document.getElementById("customizeTimeBox");
	var customBtn = document.getElementById("customBtn");
	var backCustom = document.getElementById("backCustom");
	var addNewTaskBox = document.getElementById("addNewTaskBox");
	var addNewTaskBtn = document.getElementById("addNewTaskBtn");
	var shadowBox = document.getElementById("shadowBox");
	var themeBox = document.getElementById("userThemeBox");
	var themeBtn = document.getElementById("themeBtn");
	var alarmBtn = document.getElementById("alarmBtn");
	var alarmBox = document.getElementById("alarmBox");
	var cancelThemeBox = document.getElementById("cancelThemeBox");
	var cancelAlarmBox = document.getElementById("cancelAlarmBox");
	var saveThemeBox = document.getElementById("saveThemeBox");
	var app = {
		"settings" : {
			/* App settings */
			"userTheme" : "Green",
			"alarmSong" : "Happy Song",
			"alarmVolume" : "70",
			"alarmVibrate" : "false"
		}, 
		"stats" : {
			/* some basic pomodoro stats and an array of pomodoro objects */
			/* each pomodoro objects contains: date, duration and state, there are 3 possible states
			 	- success: the pomodoro was finished successfully
			 	- failure: the user failed to finish the pomodoro
			 	- none: the pomodoro has not been executed yet */
			"finishedPomos" : "0",
			"success": "0",
			"failed": "0",
			"pomodoros" : [
				{
					"pomodoro" : {
						"date" : "27/03/2017",
						"duration" : "25", // duration is in minutes
						"state": "none"
					}
				},
				{
					"pomodoro" : {
						"date" : "18/07/2017",
						"duration" : "10",
						"state": "none"
					}
				}
			]
		}
	};
	
	app = loadSettings(app);
	updateUserTheme(app.settings.userTheme);
	updateApp(app);
	
	startBtn.onclick = startPomodoro;
	stopBtn.onclick = stopPomodoro;
	resetBtn.onclick = resetPomodoro;
	addBtn.onclick = function addTask(){
		// Shows the add new task menu and waits for user input
		addNewTaskBox.style.display = 'block';
		mainBox.style.display = 'none';
		addNewTaskBtn.onclick = function goBack(){
			// Hides the add menu and shows the main screen
			addNewTaskBox.style.display = 'none';
			mainBox.style.display = 'block';
			// add the new task to the app object, then save the app state
		};
		cancelBtn.onclick = function goBack(){
			addNewTaskBox.style.display = 'none';
			mainBox.style.display = 'block';
		};
	};
	settingsBtn.onclick = function settingsPanel(){
		// Shows the settings panel and waits for user input
		var settingsObject = app.settings;
		settingsBox.style.display = 'block';
		mainBox.style.display = 'none';
		themeBtn.onclick = function showThemeSelection(){
			// mostrar la seleccion de tema
			shadowBox.style.display = 'block';
			themeBox.style.display = 'block';
			cancelThemeBox.onclick = function cancel(){
				shadowBox.style.display = 'none';
				themeBox.style.display = 'none';
			};
			saveThemeBox.onclick = function cancel(){
				// save the user selected theme
				var userTheme;
				if(document.getElementById("userThemeR1").checked){
					userTheme = document.getElementById("userThemeR1").value;
				}else if(document.getElementById("userThemeR2").checked){
					userTheme = document.getElementById("userThemeR2").value;		 
				}else if(document.getElementById("userThemeR3").checked){
					userTheme = document.getElementById("userThemeR3").value;
				}else if(document.getElementById("userThemeR4").checked){
					userTheme = document.getElementById("userThemeR4").value;
				}
				settingsObject.userTheme = userTheme;
				document.getElementById("selectedTheme").innerHTML = userTheme;
				updateUserTheme(userTheme);
				shadowBox.style.display = 'none';
				themeBox.style.display = 'none';
			};
		};
		alarmBtn.onclick = function showAlarmSelection(){
			shadowBox.style.display = 'block';
			alarmBox.style.display = 'block';
			cancelAlarmBox.onclick = function cancel(){
				shadowBox.style.display = 'none';
				alarmBox.style.display = 'none';
			};
		};
		backBtn.onclick = function updateUserSettings(){
			// Saves the user settings
			app.settings = settingsObject;
			saveAppState(app);
			settingsBox.style.display = 'none';
			mainBox.style.display = 'block';
		};
	};
	customBtn.onclick = function showCustom(){
		customBox.style.display = 'block';
		backCustom.onclick = updateTime;
	};	
}
function startPomodoro(){
	// This function will start a new pomodoro once the start or reset buttons have been clicked.
	if(clock.pomodoroFlag  == 0){
		// If one second has passed then decrease time
		clock.pomodoroFlag = setInterval(decreaseTime, 1000);
	}
}
function stopPomodoro(){
	// Stop the pomodoro clock from decreasing time
	clearInterval(clock.pomodoroFlag);
	clock.pomodoroFlag = 0;
}
function resetPomodoro(){
	var timeShown = document.getElementById("time");
	stopPomodoro();
	// Restart the shown time to the initial time
	clock.minutes = clock.initMinutes;
	clock.seconds = clock.initSeconds;
	timeShown.innerHTML =clock.minutes + " : 00";
	startPomodoro();
}
function decreaseTime(){
	// This function is called every second after a pomodoro is started
	var timeShown = document.getElementById("time");
	if(clock.minutes == 0 && clock.seconds == 0){
		// Pomodoro Completed
		stopPomodoro();	 
	}else if(clock.seconds == 0){
		clock.minutes--;
		clock.seconds = 59;
	}else{
		clock.seconds--;
	}
	// Show current pomodoro time
	if(clock.seconds < 10){
		timeShown.innerHTML = clock.minutes + " : 0" + clock.seconds;
	}else{
		timeShown.innerHTML = clock.minutes + " : " + clock.seconds;	
	}
}
function updateTime(){
	// Sets the time and initial time variables as the number entered by the user
	var customBox = document.getElementById("customizeTimeBox");
	var timeShown = document.getElementById("time");
	var userMinutes = document.getElementById("userMinutes");
	var userSeconds = document.getElementById("userSeconds");
	
	clock.initMinutes = userMinutes.value;
	clock.initSeconds = userSeconds.value;
	clock.minutes = userMinutes.value;
	clock.seconds = userSeconds.value;
	timeShown.innerHTML = clock.minutes + " : " + clock.seconds;
	customBox.style.display = 'none';
}
function updateUserTheme(userTheme){
	var player = document.getElementById("player");
	var iconos = document.getElementsByClassName("settingsIcons");
	var btn = document.getElementsByClassName("customBtn");
	var i;
	if(userTheme == "Green"){
		player.style.background = "linear-gradient(#47c9a2 20%, #26A69A 100%) 100% no-repeat";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#47c9a2";	
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#009688";
			btn[i].style.borderColor = "#009688";
		}
		return;
	}else if(userTheme == "Blue"){
		player.style.background = "linear-gradient(#2196F3 20%, #42A5F5  100%) 100% no-repeat";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#2196F3";	
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#01579B";
			btn[i].style.borderColor = "#01579B";
		}
		return;
	}else if(userTheme == "Pink"){
		player.style.background = "linear-gradient(#E91E63 20%, #E91E63  100%) 100% no-repeat";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#E91E63";	
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#ff3870";
			btn[i].style.borderColor = "#ff3870";
		}
		return;
	}else if(userTheme == "Classic"){
		player.style.background = "linear-gradient(#546E7A 20%, #607D8B 100%) 100% no-repeat";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#546E7A";	
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#212121";
			btn[i].style.borderColor = "#212121";	
		}
		return;
	}
}
function updateApp(app){
	// Updates the user settings and task list
}
function loadSettings(app){
	if(typeof(Storage) != "undefined"){
		if(localStorage.getItem("app") != null){
			// Si es que hay opciones guardadas
			app = JSON.parse(localStorage.getItem("app"));
			return app;
		}else{
			// Es la primera vez que se ejecuta la aplicacion
			localStorage.setItem("app", JSON.stringify(app));
			return app;
		}
	}else{
		// No web Storage support
	}
}
function saveAppState(app){
	if(typeof(Storage) != "undefined"){
		localStorage.setItem("app", JSON.stringify(app));
	}
}
function loadAppState(app){
	if(typeof(Storage) != "undefined"){
		app = JSON.parse(localStorage.getItem("app"));
	}
}
