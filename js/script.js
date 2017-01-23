var clock = {
	"minutes" : 25,
	"seconds" : 00,
	"initMinutes" : 25,
	"initSeconds" : 00,
	"pomodoroFlag" : 0
};
var app = {
    "settings" : {
        "userTheme" : "Green",
        "alarmSong" : "Alarm 1",
        "alarmVolume" : 50,
        "alarmVibrate" : "false"
    },
    "stats" : {
        "finishedPomos" : "0",
        "success": "0",
        "failed": "0",
        "pomodoros" : [
            {
                "pomodoro" : {
                    "date" : "27/03/2017",
                    "duration" : "25",
                    "state": "none"
                }
            }
        ]
    }
};

window.onload = pageLoaded();

function pageLoaded(){
	var startBtn = document.getElementById("startBtn");
	var stopBtn = document.getElementById("stopBtn");
	var resetBtn = document.getElementById("resetBtn");
	var settingsBox = document.getElementById("settingsBox");
	var settingsBtn = document.getElementById("settingsBtn");
	var backBtn = document.getElementById("backBtn");
	var addBtn = document.getElementById("addBtn");
	var mainBox = document.getElementById("container");
	var customBox = document.getElementById("customizeTimeBox");
	var customBtn = document.getElementById("customBtn");
	var backCustom = document.getElementById("backCustom");
	var shadowBox = document.getElementById("shadowBox");
	var themeBtn = document.getElementById("themeBtn");
	var alarmBtn = document.getElementById("alarmBtn");

    // Load user settings from localStorage and update the app object
	loadSettings();
	// Put the values in the actual dom
    document.getElementById("volumeSlider").value = app.settings.alarmVolume;
	updateUserTheme();
    // Update the user task list for today, user stats, etc
    // updateApp();

	startBtn.onclick = startPomodoro;
	stopBtn.onclick = stopPomodoro;
	resetBtn.onclick = resetPomodoro;
	addBtn.onclick = addNewTask;

	settingsBtn.onclick = function showSettingsPanel(){
		// Shows the settings panel and waits for user input
		updateAlarmCheckBox();
		document.getElementById("volumeSlider").value = app.settings.alarmVolume;
		document.getElementById("vibrarCheck").checked = JSON.parse(app.settings.alarmVibrate);
		document.getElementById("selectedAlarm").innerHTML = app.settings.alarmSong;
		// Show the settings view and hiddes the main view
		settingsBox.classList.add("showSettings");
		mainBox.classList.add("hideContainer");
		themeBtn.onclick = showThemeSelection;
		alarmBtn.onclick = showAlarmSelection;
		backBtn.onclick = function saveUserSettings(){
		    // Saves the user settings
			saveAppState();
			settingsBox.classList.add("hideSettings");
			mainBox.classList.remove("hideContainer");
			mainBox.classList.add("showContainer");
		    settingsBox.classList.remove("hideSettings");
			mainBox.classList.remove("showContainer");
		    settingsBox.classList.remove("showSettings");
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
		playAlarmClock();
		if(app.settings.alarmVibrate === true){
		    Android.alarmVibrate();
		}
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
function addNewTask(){
    // Shows the add new task menu and waits for user input
	var addNewTaskBox = document.getElementById("addNewTaskBox");
  var addNewTaskBtn = document.getElementById("addNewTaskBtn");
	var cancelBtn = document.getElementById("cancelAddBtn");
	
	addNewTaskBox.classList.add("showAlert");
  addNewTaskBtn.onclick = function goBack(){
        // Hides the add menu and shows the main screen
        addNewTaskBox.style.display = 'none';
        mainBox.style.display = 'block';
        // add the new task to the app object, then save the app state
    };
    cancelBtn.onclick = function goBack(){
			addNewTaskBox.classList.remove("showAlert");
    };
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
function updateUserTheme(){
    var theme = app.settings.userTheme;
	var player = document.getElementById("player");
	var iconos = document.getElementsByClassName("settingsIcons");
	var btn = document.getElementsByClassName("customBtn");
	var i = 0;
    // Update the user theme
	document.getElementById("selectedTheme").innerHTML = theme;
	if(theme == "Green"){
	    document.getElementById("userThemeR1").checked = true;
	    player.style.background = "radial-gradient(ellipse farthest-corner at center, #47C9A2 0%, #26A69A 100%)";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#47c9a2";
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#009688";
			btn[i].style.borderColor = "#009688";
		}
	}else if(theme == "Blue"){
	    document.getElementById("userThemeR2").checked = true;
		player.style.background = "radial-gradient(ellipse farthest-corner at center, #42A5F5 0%, #2196F3 100%)";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#2196F3";
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#01579B";
			btn[i].style.borderColor = "#01579B";
		}
	}else if(theme == "Pink"){
	    document.getElementById("userThemeR3").checked = true;
		player.style.background = "radial-gradient(ellipse farthest-corner at center, #FC216B 0%, #E91E63 100%)";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#E91E63";
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#ff3870";
			btn[i].style.borderColor = "#ff3870";
		}
	}else if(theme == "Classic"){
	    document.getElementById("userThemeR4").checked = true;
		player.style.background = "radial-gradient(ellipse farthest-corner at center, #607D8B 0%, #546E7A 100%)";
		for(i = 0; i < iconos.length; i++){
			iconos[i].style.color = "#546E7A";
		}
		for(i = 0; i < btn.length; i++){
			btn[i].style.background = "#212121";
			btn[i].style.borderColor = "#212121";
		}
	}else if(theme == "Bright"){
        document.getElementById("userThemeR5").checked = true;
        player.style.background = " radial-gradient(ellipse farthest-corner at center, #FF9D68 0%, #FF7A75 100%)";
        for(i = 0; i < iconos.length; i++){
            iconos[i].style.color = "#FF7A75";
        }
        for(i = 0; i < btn.length; i++){
            btn[i].style.background = "#FF9D68";
            btn[i].style.borderColor = "#FF9D68";
        }
    }
}
function updateAlarmCheckBox(){
	// Update user alarm song
	alarm = app.settings.alarmSong;
	if(alarm == document.getElementById("userAlarmR1").value){
	    document.getElementById("userAlarmR1").checked = true;
	}else if(alarm == document.getElementById("userAlarmR2").value){
        document.getElementById("userAlarmR2").checked = true;
	}else if(alarm == document.getElementById("userAlarmR3").value){
        document.getElementById("userAlarmR3").checked = true;
    }else if(alarm == document.getElementById("userAlarmR4").value){
        document.getElementById("userAlarmR4").checked = true;
    }
}
function showAlarmSelection(){
	var shadowBox = document.getElementById("shadowBox");
	var alarmBox = document.getElementById("alarmBox");
	var cancelAlarmBox = document.getElementById("cancelAlarmBox");
	var saveAlarmBox = document.getElementById("saveAlarmBox");

	shadowBox.style.display = 'block';
	alarmBox.classList.add("showAlert");
	cancelAlarmBox.onclick = function cancel(){
	    shadowBox.style.display = 'none';
	    alarmBox.classList.remove("showAlert");
	};
	saveAlarmBox.onclick = function save(){
	    // save the user alarm sound
        var userSong;
        if(document.getElementById("userAlarmR1").checked){
            userSong = document.getElementById("userAlarmR1").value;
        }else if(document.getElementById("userAlarmR2").checked){
            userSong = document.getElementById("userAlarmR2").value;
        }else if(document.getElementById("userAlarmR3").checked){
            userSong = document.getElementById("userAlarmR3").value;
        }else if(document.getElementById("userAlarmR4").checked){
            userSong = document.getElementById("userAlarmR4").value;
        }
        app.settings.alarmSong = userSong;
        document.getElementById("selectedAlarm").innerHTML = app.settings.alarmSong;
        shadowBox.style.display = 'none';
        alarmBox.classList.remove("showAlert");
    };
};
function showThemeSelection(){
	var shadowBox = document.getElementById("shadowBox");
	var themeBox = document.getElementById("userThemeBox");
	var cancelThemeBox = document.getElementById("cancelThemeBox");
	var saveThemeBox = document.getElementById("saveThemeBox");

    // mostrar la seleccion de tema
    shadowBox.style.display = 'block';
    themeBox.classList.add("showAlert");
    cancelThemeBox.onclick = function cancel(){
        shadowBox.style.display = 'none';
        themeBox.classList.remove("showAlert");
    };
    saveThemeBox.onclick = function save(){
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
        }else if(document.getElementById("userThemeR5").checked){
            userTheme = document.getElementById("userThemeR5").value;
        }
        app.settings.userTheme = userTheme;
        updateUserTheme();
        shadowBox.style.display = 'none';
        themeBox.classList.remove("showAlert");
    };
};
function updateApp(){
	// Updates the user settings and task list
}
function playAlarmClock(){
	var userAlarm;
	if(document.getElementById("userAlarmR1").checked){  		// Alarm = Alarm1
		userAlarm = 1;
	}else if(document.getElementById("userAlarmR2").checked){   // Alarm = Alarm2
		userAlarm = 2;
	}else if(document.getElementById("userAlarmR3").checked){   // Alarm = Alarm3
		userAlarm = 3;
	}else if(document.getElementById("userAlarmR4").checked){   // Alarm = No Alarm
		userAlarm = 0;
	}
	playAlarm(userAlarm);
}
function playAlarm(alarm){
	if(alarm != 0){
        Android.playSound(alarm, (app.settings.alarmVolume / 100));
	}
}
function updateSlider(value){
	app.settings.alarmVolume = value;
}
function toggleAlarm(value){
    app.settings.alarmVibrate = value;
}
function loadSettings(){
	if(typeof(Storage) != "undefined"){
		if(localStorage.getItem("app") != null){                // Si es que hay opciones guardadas
			app = JSON.parse(localStorage.getItem("app"));
		}else{                                                 // Es la primera vez que se ejecuta la aplicacion
			localStorage.setItem("app", JSON.stringify(app));
		}
	}else{
		// No web Storage support
	}
}
function saveAppState(){
	if(typeof(Storage) != "undefined"){
		localStorage.setItem("app", JSON.stringify(app));
	}
}
function loadAppState(){
	if(typeof(Storage) != "undefined"){
		app = JSON.parse(localStorage.getItem("app"));
	}
}
