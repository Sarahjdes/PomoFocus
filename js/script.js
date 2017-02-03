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
        "failed": "0"
    },
		"currentTask" : {}
		,
		"tags" : [],
		"ids" : [],
		"pomodoros" : []
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
	var history = document.getElementById("history");
	var historyBtn = document.getElementById("historyBtn");
	var tasks = document.getElementById("tasks");

	// Load user settings from localStorage and update the app object
	loadAppState();
	// Put the values in the actual dom
	loadAppDom();
	updateUserTheme();
	startBtn.onclick = startPomodoro;
	stopBtn.onclick = stopPomodoro;
	resetBtn.onclick = resetPomodoro;
	historyBtn.onclick = function(){
	    tasks.classList.add("hideContainer");
	    history.classList.add("showSettings");
	};

	addBtn.onclick = function addNewTask(){
		// Shows the add new task menu and waits for user input
		var addNewTaskBox = document.getElementById("newTaskBox");
		var addNewTaskBtn = document.getElementById("addNewTaskBtn");
		var cancelBtn = document.getElementById("cancelAddBtn");

		document.getElementById("taskDate").value = getCurrentDate();
		document.getElementById("taskDate").min = getCurrentDate();

		addNewTaskBox.classList.add("showNewTask");
		mainBox.classList.add("hideMainLeft");
		addNewTaskBtn.onclick = function saveTask(){
			// add the new task to the app object
			addTask();
			// Save the app state to localStorage
			saveAppState();
			// Re-load the task list
			loadAppDom();
			addNewTaskBox.classList.remove("showNewTask");
			mainBox.classList.remove("hideMainLeft");
		};
		cancelBtn.onclick = function goBack(){
			addNewTaskBox.classList.remove("showNewTask");
			mainBox.classList.remove("hideMainLeft");
		};
	};
	settingsBtn.onclick = function showSettingsPanel(){
		// Shows the settings panel and waits for user input
		updateAlarmCheckBox();
		document.getElementById("volumeSlider").value = app.settings.alarmVolume;
		document.getElementById("vibrarCheck").checked = JSON.parse(app.settings.alarmVibrate);
		document.getElementById("selectedAlarm").innerHTML = app.settings.alarmSong;
		// Show the settings view and hiddes the main view
		settingsBox.classList.add("showSettings");
		mainBox.classList.add("hideMainRight");
		themeBtn.onclick = showThemeSelection;
		alarmBtn.onclick = showAlarmSelection;
		backBtn.onclick = function saveUserSettings(){
		    // Saves the user settings
			saveAppState();
			mainBox.classList.remove("hideMainRight");
		  settingsBox.classList.remove("showSettings");
		};
	};
	/*customBtn.onclick = function showCustom(){
		customBox.style.display = 'block';
		backCustom.onclick = updateTime;
	};*/
}

function activeTask(task, time){
	var time = new Date();
	var now = time.getHours() + ":" + time.getMinutes();
	if(task.startTime === now || task.startNow === true){
		return true;
	}else{
		return false;
	}
}

function startPomodoro(){
	// This function will start a new pomodoro once the start or reset buttons have been clicked.
	var currentTask = app.currentTask;
	if(activeTask(currentTask) === true){
		document.getElementById("minorText").innerHTML = currentTask.name;
		if(clock.pomodoroFlag  == 0){
			// If one second has passed then decrease time
			clock.pomodoroFlag = setInterval(decreaseTime, 1000);
		}
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
	timeShown.innerHTML = clock.minutes + " : 00";
	startPomodoro();
}

function decreaseTime(){
	// This function is called every second after a pomodoro is started
	var timeShown = document.getElementById("time");
	if(clock.minutes == 0 && clock.seconds == 0){
		// Pomodoro Completed
		playAlarmClock();
		document.getElementById("minorText").innerHTML = "No active tasks";
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

function updateNewPomo(value, id){
    document.getElementById(id).innerHTML = value + " min";
}

function showAlarmSelection(){
	var shadowBox = document.getElementById("shadowBox");
	var alarmBox = document.getElementById("alarmBox");
	var cancelAlarmBox = document.getElementById("cancelAlarmBox");
	var saveAlarmBox = document.getElementById("saveAlarmBox");

	shadowBox.style.pointerEvents = 'auto';
	shadowBox.classList.add("showShadowBox");
	alarmBox.classList.add("showAlert");
	cancelAlarmBox.onclick = function cancel(){
			shadowBox.style.pointerEvents = 'none';
			shadowBox.classList.remove("showShadowBox");
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
				shadowBox.style.pointerEvents = 'none';
				shadowBox.classList.remove("showShadowBox");
        alarmBox.classList.remove("showAlert");
    };
};

function showThemeSelection(){
	var shadowBox = document.getElementById("shadowBox");
	var themeBox = document.getElementById("userThemeBox");
	var cancelThemeBox = document.getElementById("cancelThemeBox");
	var saveThemeBox = document.getElementById("saveThemeBox");

    // mostrar la seleccion de tema
    shadowBox.style.pointerEvents = 'auto';
		shadowBox.classList.add("showShadowBox");
    themeBox.classList.add("showAlert");
    cancelThemeBox.onclick = function cancel(){
				shadowBox.style.pointerEvents = 'none';
				shadowBox.classList.remove("showShadowBox");
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
				shadowBox.style.pointerEvents = 'none';
				shadowBox.classList.remove("showShadowBox");
        themeBox.classList.remove("showAlert");
    };
};

function getCurrentDate(){
	// Returns the current date in string format
	var date = new Date();
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var fixedDate = fixTime(year, month, day);
	return fixedDate;
}

function fixTime(year, month, day){
	var fixedDate = "";
	if(month < 10 && day < 10){
		fixedDate = year + "-0" + month + "-0" + day;
	}else if(month < 10){
		fixedDate = year + "-0" + month + "-" + day;
	}else if(day < 10){
		fixedDate = year + "-" + month + "-0" + day;
	}else{
		fixedDate = year + "-" + month + "-" + day;
	}
	return fixedDate;
}

function addTask(){
	var newTask = {};
	newTask.id = randomId();
	newTask.name = document.getElementById("taskName").value;
	newTask.date = document.getElementById("taskDate").value;
	newTask.startTime = document.getElementById("taskStartTime").value;
	newTask.duration = document.getElementById("duration").value;
	newTask.break = document.getElementById("breakTime").value;
	newTask.longBreak = document.getElementById("longBreakTime").value;
	newTask.startNow = false;
	// SOLVE TAGS SYSTEM
	app.ids.push(newTask.id);
	app.pomodoros.push(newTask);
}

function randomId(){
	// create and return a valid id
	var validNumber = false;
	var number = 0;
	while(validNumber !== true){
		number = Math.floor((Math.random() * 100000000000) + 1); // Creates a random number between 1 and 100000000000
		validNumber = alreadyExists(number);
	}
	return number.toString();
}

function alreadyExists(num){
	// Implement merge sort later
	var ids = app.ids;
	for(var i = 0; i < ids.length; i++){
		if(ids[i] === num){
			return false;
		}
	}
	return true;
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

function loadAppState(){
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
function loadAppDom(){
	// Sets values stored in the app object in the actual html
	var date = getCurrentDate();
	var pomodoros = app.pomodoros;
	document.getElementById("volumeSlider").value = app.settings.alarmVolume;
	document.getElementById("tasks").innerHTML = "";
	// Add pomodoros scheduled for today to the "tasks" menu
	for(var i = 0; i < pomodoros.length; i++){
		if(pomodoros[i].date == date){
			addDomTask(pomodoros[i]);
		}
	}
}

function addDomTask(task){
	var tasks = document.getElementById("tasks");
	var container = document.createElement("div");
	var title = document.createElement("span");
	var subTitle = document.createElement("subTask");
	var icon = document.createElement("i");
	var editIcon = document.createElement("i");
	var jump = document.createElement("br");

	container.classList.add("task");
	title.classList.add("taskText");
	subTitle.classList.add("subTask");
	icon.classList.add("fa", "fa-circle-o", "fa-lg", "taskState");
	editIcon.classList.add("fa", "fa-ellipsis-v", "fa-lg", "taskTime");

	title.innerHTML += " " + task.name;
	subTitle.innerHTML = task.startTime + " - " + task.duration + " minutes";

	title.appendChild(icon);
	title.onclick = function (){
		// abrir mensaje preguntando si quieres empezar el pomodoro ahora
	};
	editIcon.onclick = function (){
		// editar la tarea
		editTask(this.parentElement.id);
	};
	container.appendChild(title);
	container.appendChild(editIcon);
	container.appendChild(jump);
	container.appendChild(subTitle);
	container.id = task.id;
	tasks.appendChild(container);
}

function editTask(taskId){
	// encontrar la task a la que le pertenece este id
	var pomodoros = app.pomodoros;
	var task;
	var window = document.getElementById("editWindow");
	for(var i = 0; i < pomodoros.length; i++){
		if(pomodoros[i].id === taskId){
			task = pomodoros[i];
			break;
		}
	}
	window.classList.add("showEditW");
	document.getElementById("editTaskName").value = task.name;
	document.getElementById("editTaskName").value = task.startTime;
	document.getElementById("editTaskName").value = task.tags;
	document.getElementById("editTaskName").value = task.name;

}
