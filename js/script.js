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
		"ids" : [],
		"pomodoros" : [],
		"pomodorosForToday" : []
};

var userCanAddTask = true;
var finishedTaskText;
var chartTasks = [];
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
	var tasks = document.getElementById("tasks");
	var seeChartBtn = document.getElementById("seeChartBtn");
	// Load user settings from localStorage and update the app object
	loadAppState();
	translate();
	// Put the values in the actual dom
	updateUserTheme();
	taskUpdate();
	loadAppDom();
	loadAllTasks();
	statDates();
	reloadStats();

	startBtn.onclick = startPomodoro;
	stopBtn.onclick = stopPomodoro;
	resetBtn.onclick = resetPomodoro;

	setInterval(function(){
		 checkAlarms();
	 }, 1000);

	seeChartBtn.onclick = function(){
		var chartW = document.getElementById("chartW");
		var barChartBtn = document.getElementById("barChartBtn");
		var donutChartBtn = document.getElementById("donutChartBtn");
		drawCharts('doughnut');
		shadowBox.style.pointerEvents = 'auto';
		shadowBox.classList.add("showShadowBox");
		chartW.classList.add("showAlert");
		barChartBtn.onclick = function(){
			drawCharts('bar');
		};
		donutChartBtn.onclick = function(){
			drawCharts('doughnut');
		};
		chartBackBtn.onclick = function (){
			shadowBox.style.pointerEvents = 'none';
			shadowBox.classList.remove("showShadowBox");
			chartW.classList.remove("showAlert");
		};
	}
	addBtn.onclick = function addNewTask(){
		// Shows the add new task menu and waits for user input
		var addNewTaskBox = document.getElementById("newTaskBox");
		var addNewTaskBtn = document.getElementById("addNewTaskBtn");
		var cancelBtn = document.getElementById("cancelAddBtn");
		var taskTag = document.getElementById("taskTag");
		var tagSelect = document.getElementById("tagSelect");
		document.getElementById("taskDate").value = getCurrentDate();
		document.getElementById("taskDate").min = getCurrentDate();

		addNewTaskBox.classList.add("showNewTask");
		mainBox.classList.add("hideMainLeft");

		addNewTaskBtn.onclick = function saveTask(){
			// add the new task to the app object
			if(document.getElementById("taskDate").value === getCurrentDate()){
				checkTime(document.getElementById("taskStartTime").value);
			}
			if(userCanAddTask === true){
				if(filledForm() === true){
					addTask();
					taskUpdate();
					saveAppState();
					loadAppDom();			// Re-load the task list
					loadAllTasks();
					document.getElementById("taskName").value = "";
					addNewTaskBox.classList.remove("showNewTask");
					mainBox.classList.remove("hideMainLeft");
				}else{
					showError("Please fill all required fields.");
				}
			}else{
				showError("Please select a different start time. This start time is already selected by another task.");
			}
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
}

function filledForm(){
	// check if the add form is filled
	if(document.getElementById("taskName").value.length > 0 && document.getElementById("taskStartTime").value != ""){
		return true;
	}else {
		return false;
	}
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
	finishedTaskText = document.getElementById("minorText").innerHTML;
	if(activeTask(currentTask) === true){
		// set the minutes and seconds
		document.getElementById("minorText").innerHTML = "Working on: " + currentTask.name;
		clock.initMinutes = currentTask.duration;
		clock.minutes = clock.initMinutes;
		clock.seconds = clock.initSeconds;
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
		finishedPomodoro();
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

function finishedPomodoro(){
	// A pomodoro has finished
	var congratsBox = document.getElementById("finishedPomoBox");
	var startBreakBtn = document.getElementById("startBreakText");
	var startLongBreakBtn = document.getElementById("startLongBreakText");
	var quitBtn = document.getElementById("quitText");
	var shadowBox = document.getElementById("shadowBox");
	shadowBox.style.pointerEvents = 'auto';
	shadowBox.classList.add("showShadowBox");
	congratsBox.classList.add("showAlert");

	startBreakBtn.onclick = function (){
		// start short break
	};
	startLongBreakBtn.onclick = function (){
		// start long break
	};
	quitBtn.onclick = function (){
		shadowBox.style.pointerEvents = 'none';
		shadowBox.classList.remove("showShadowBox");
		congratsBox.classList.remove("showAlert");
	};
	playAlarmClock();
	for(var i = 0; i < app.pomodorosForToday.length; i++){
		if(app.pomodorosForToday[i].id === app.currentTask.id){
			app.pomodorosForToday[i].finished = true;
			break;
		}
	}
	for(var i = 0; i < app.pomodoros.length; i++){
		if(app.pomodoros[i].id === app.currentTask.id){
			app.pomodoros[i].finished = true;
			break;
		}
	}
	app.stats.finishedPomos++;
	saveAppState();
	loadAppDom();
	loadAllTasks();
	reloadStats();
	document.getElementById("minorText").innerHTML = finishedTaskText;
	if(app.settings.alarmVibrate === true){
			Android.alarmVibrate();
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
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var day = date.getDate();
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

function checkTime(val){
	var pomos = app.pomodorosForToday;
	for(var i = 0; i < pomos.length; i++){
		if(pomos[i].startTime === val){
			// This time is already selected in another task for today
			userCanAddTask = false;
			showError("Please select a different start time. This start time is already selected by another task.");
			return;
		}
	}
	userCanAddTask = true;
}

function showError(msg){
	var shadowBox = document.getElementById("shadowBoxPop");
	var errorW = document.getElementById("errorW");
	var errorBtn = document.getElementById("errorBtn");
	var errorMsg = document.getElementById("errorMsg");
	shadowBox.style.pointerEvents = 'auto';
	shadowBox.classList.add("showShadowBox");
	errorMsg.innerHTML = msg;
	errorW.classList.add("showAlert");
	errorBtn.onclick = function(){
		shadowBox.style.pointerEvents = 'none';
		shadowBox.classList.remove("showShadowBox");
		errorW.classList.remove("showAlert");
	}
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

function taskUpdate(){
	// updates the pomodorosForToday array
	var date = getCurrentDate();
	app.pomodorosForToday = [];
	for(var i = 0; i < app.pomodoros.length; i++){
		if(app.pomodoros[i].date === date){
			app.pomodorosForToday.push(app.pomodoros[i]);
		}
	}
}

function loadAllTasks(){
	// Sets values stored in the app object in the actual html
	var pomodoros = app.pomodoros;
	document.getElementById("history").innerHTML = "";
	// Add pomodoros scheduled for today to the "tasks" menu
	for(var i = 0; i < pomodoros.length; i++){
		addDomTask(pomodoros[i], "history");
	}
}

function loadAppDom(){
	// Sets values stored in the app object in the actual html
	var pomodoros = app.pomodorosForToday;
	document.getElementById("tasks").innerHTML = "";
	// Add pomodoros scheduled for today to the "tasks" menu
	for(var i = 0; i < pomodoros.length; i++){
		addDomTask(pomodoros[i], "tasks");
	}
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
	newTask.finished = false;
	newTask.failed = false;
	newTask.tag = document.getElementById("tag").value;
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

function addDomTask(task, domContainer){
	var tasks = document.getElementById(domContainer);
	var container = document.createElement("div");
	var title = document.createElement("span");
	var subTitle = document.createElement("subTask");
	var icon = document.createElement("i");
	var editIcon = document.createElement("i");
	var jump = document.createElement("br");
	var shadowBox = document.getElementById("shadowBox");
	var startNowBtnY = document.getElementById("startYes");
	var startNowBtnN = document.getElementById("startNo");

	container.classList.add("task");
	title.classList.add("taskText");
	subTitle.classList.add("subTask");
	if(task.failed === true){
		icon.classList.add("fa", "fa-times-circle", "fa-lg", "failedTask");
	}else if(task.finished === false){
		icon.classList.add("fa", "fa-circle-o", "fa-lg", "taskState");
	}else{
		icon.classList.add("fa", "fa-check-circle-o", "fa-lg", "taskState");
	}
	editIcon.classList.add("fa", "fa-ellipsis-v", "fa-lg", "taskTime", "editIcon");

	title.appendChild(icon);
	title.innerHTML += " " + task.name;
	subTitle.innerHTML = task.startTime + " - " + task.duration + " minutes";
	if(domContainer !== "history"){
		title.onclick = function (){
			// abrir mensaje preguntando si quieres empezar el pomodoro ahora
			if(task.finished === false){
				shadowBox.style.pointerEvents = 'auto';
				shadowBox.classList.add("showShadowBox");
				startNow.classList.add("showAlert");
				startNowBtnY.onclick = function(){
					task.startNow = true;
					app.currentTask = task;
					shadowBox.style.pointerEvents = 'none';
					shadowBox.classList.remove("showShadowBox");
					startNow.classList.remove("showAlert");
					startPomodoro();
				};
				startNowBtnN.onclick = function(){
					shadowBox.style.pointerEvents = 'none';
					shadowBox.classList.remove("showShadowBox");
					startNow.classList.remove("showAlert");
				};
			}
		};
	}else{
		subTitle.innerHTML += " - " + task.date;
	}
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
	// Show a popup window to edit the selected task
	var task;
	var pomodoros = app.pomodoros;
	var position, idIndex;
	var window = document.getElementById("editWindow");
	var shadowBox = document.getElementById("shadowBox");
	var taskName = document.getElementById("editTaskName");
	var taskDate = document.getElementById("editTaskDate");
	var startTime = document.getElementById("editTaskStartTime");
	var taskDuration = document.getElementById("editDuration");
	var taskBreak = document.getElementById("editBreakTime");
	var taskLongBreak = document.getElementById("editLongBreakTime");
	var saveBtn = document.getElementById("addChangesBtn");
	var cancelBtn = document.getElementById("cancelEditBtn");
	var deleteTask = document.getElementById("deleteTaskBtn");
	var deletePrompt = document.getElementById("deletePrompt");
	var deleteYes = document.getElementById("deleteYes");
	var deleteNo = document.getElementById("deleteNo");
	// We search the task for the given id (the task id will exist until the task is deleted)
	for(var i = 0; i < pomodoros.length; i++){
		if(pomodoros[i].id === taskId){
			task = pomodoros[i];
			position = i;
			break;
		}
	}
	// We set the default popup values
	taskName.value = task.name;
	taskDate.value = task.date;
	startTime.value = task.startTime;
	taskDuration.value = task.duration;
	taskBreak.value = task.break;
	taskLongBreak.value = task.longBreak;
	document.getElementById("editPomoDuration").innerHTML = task.duration + " min";
	document.getElementById("editBreakDuration").innerHTML = task.break + " min";
	document.getElementById("editLongBreakDuration").innerHTML = task.longBreak + " min";
	// We show the popup window
	shadowBox.style.pointerEvents = 'auto';
	shadowBox.classList.add("showShadowBox");
	window.classList.add("showAlert");

	saveBtn.onclick = function (){
		if(userCanAddTask === true){
			app.pomodoros[position].name = taskName.value;
			app.pomodoros[position].date = taskDate.value;
			app.pomodoros[position].startTime = startTime.value;
			app.pomodoros[position].duration = taskDuration.value;
			app.pomodoros[position].break = taskBreak.value;
			app.pomodoros[position].longBreak = taskLongBreak.value;
			saveAppState();
			loadAppDom();
			loadAllTasks();
			shadowBox.style.pointerEvents = 'none';
			shadowBox.classList.remove("showShadowBox");
			window.classList.remove("showAlert");
		}else{
			showError("Please select a different start time. This start time is already selected by another task.");
		}
	};
	cancelBtn.onclick = function (){
		shadowBox.style.pointerEvents = 'none';
		shadowBox.classList.remove("showShadowBox");
		window.classList.remove("showAlert");
	};
	deleteTask.onclick = function (){
		window.classList.remove("showAlert");
		deletePrompt.classList.add("showAlert");
		deleteYes.onclick = function(){
			// delete task
			app.pomodoros.splice(position, 1);
			// delete task id
			idIndex = app.ids.indexOf(taskId);
			app.ids.splice(idIndex, 1);
			saveAppState();
			taskUpdate();
			loadAllTasks();
			loadAppDom();
			shadowBox.style.pointerEvents = 'none';
			shadowBox.classList.remove("showShadowBox");
			deletePrompt.classList.remove("showAlert");
		};
		deleteNo.onclick = function(){
			deletePrompt.classList.remove("showAlert");
			window.classList.add("showAlert");
		};
	};
}

function moverMenu(num){
	// I could set a timeout for when animation end for adding new changes
	var selectBar = document.getElementById("selectedSubMenu");
	var secondMenu = document.getElementById("secondMenu");
	if(num === 1){
		if(!selectBar.classList.contains("moveBar1")){
			selectBar.classList.add("moveBar1");
			selectBar.classList.remove("moveBar2");
			selectBar.classList.remove("moveBar3");

			secondMenu.classList.add("moveSecondMenu1");
			secondMenu.classList.remove("moveSecondMenu2");
			secondMenu.classList.remove("moveSecondMenu3");
		}
	}else if(num === 2){
		if(!selectBar.classList.contains("moveBar2")){
			selectBar.classList.add("moveBar2");
			selectBar.classList.remove("moveBar1");
			selectBar.classList.remove("moveBar3");

			secondMenu.classList.add("moveSecondMenu2");
			secondMenu.classList.remove("moveSecondMenu1");
			secondMenu.classList.remove("moveSecondMenu3");
		}
	}else if(num === 3){
		if(!selectBar.classList.contains("moveBar3")){
			selectBar.classList.add("moveBar3");
			selectBar.classList.remove("moveBar1");
			selectBar.classList.remove("moveBar2");

			secondMenu.classList.add("moveSecondMenu3");
			secondMenu.classList.remove("moveSecondMenu1");
			secondMenu.classList.remove("moveSecondMenu2");
		}
	}
}

function reloadStats(){
	var statsObject = {};
	var fromTime = new Date(document.getElementById("fromTime").value).getTime();
	var toTime = new Date(document.getElementById("toTime").value).getTime();
	var date;
	var pomodoros = app.pomodoros;
	chartTasks = [];
	statsObject.total = 0;
	statsObject.minutes = 0;
	statsObject.finished = 0;
	statsObject.failed = 0;
	statsObject.rate = 0;

	for(var i = 0; i < pomodoros.length; i++){
		date = new Date(pomodoros[i].date).getTime();
		if(date >= fromTime && date <= toTime){
			if(pomodoros[i].finished === true){
				chartTasks.push(pomodoros[i]);
				statsObject.minutes += parseInt(pomodoros[i].duration);
				statsObject.total++;
				statsObject.finished++;
			}else if(pomodoros[i].failed === true){
				statsObject.minutes += parseInt(pomodoros[i].duration);
				statsObject.failed++;
				statsObject.total++;
			}
		}
	}

	if(statsObject.total > 0){
		statsObject.rate = (statsObject.finished * 100) / statsObject.total;
	}

	document.getElementById("statsTime").innerHTML = fixTotal(statsObject.minutes);
	document.getElementById("statsFinished").innerHTML = statsObject.finished;
	document.getElementById("statsFailed").innerHTML = statsObject.failed;
	document.getElementById("statsRate").innerHTML = statsObject.rate.toFixed(1) + "%";
}

function statDates(){
	var date = new Date();
	date.setDate(date.getDate() - 10);
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	document.getElementById("fromTime").value = fixTime(year, month, date.getDate());
	document.getElementById("toTime").value = getCurrentDate();
}

function fixTotal(num){
	if(num > 60){
		var hours, minutes;
		hours = Math.trunc(num / 60);
		minutes = num - (hours * 60);
		return hours + " hrs, " + minutes + " min";
	}else{
		return num + " min";
	}
}

function drawCharts(charType){
	var ctx = document.getElementById("myChart").getContext('2d');
	var names = ["Estudiar", "Trabajar", "Investigar", "Deporte"];
	var bgColorArray = ["#bb4af7", "#ff80b3", "#6e4ff7", "f7525f"];

	var backgroundColor = [];
	var tagData = [0, 0, 0, 0];// LLnear con ceros

	for(var i = 0; i < names.length; i++){
		for(var j = 0; j < chartTasks.length; j++){
			if(chartTasks[j].tag === names[i]){
				tagData[i]++;
			}
		}
	}

	var myChart = new Chart(ctx, {
		type: charType,
		data: {
			labels: names,
			datasets: [{
				label: '',
				backgroundColor: bgColorArray,
				data: tagData
			}]
		}
	});
}

function translate(){
	var userLanguage = window.navigator.userLanguage || window.navigator.language;
	var langCode = userLanguage.substr(0, 2);
	var language;
	if(langCode === "en"){
		// load english script
		language = languageEN;
	}else if(langCode === "es"){
		// load spanish script
		language = languageES;
	}
	for(var i = 0; i < language.length; i++){
		document.getElementById(language[i].textId).innerHTML = language[i].text;
	}
}

function checkAlarms(){
	var date = new Date();
	var arr = app.pomodorosForToday;
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var currentTime = hour + ":" + minutes;

	for(var i = 0; i < arr.length; i++){
		if(arr[i].startTime === currentTime && arr[i].startNow === false){
			startTask(i);
		}
	}
}
function startTask(i){
	var startNowBox = document.getElementById("startTask");
	var shadowBox = document.getElementById("startNowShadow");
	var startYes = document.getElementById("startTaskYes");
	var startNo = document.getElementById("startTaskNo");

	shadowBox.style.pointerEvents = 'auto';
	shadowBox.classList.add("showShadowBox");
	startNowBox.classList.add("showAlert");

	startYes.onclick = function(){
		shadowBox.style.pointerEvents = 'none';
		shadowBox.classList.remove("showShadowBox");
		startNowBox.classList.remove("showAlert");
		app.pomodorosForToday[i].startNow = true;
		app.currentTask = app.pomodorosForToday[i];
		startPomodoro();
	};
	startNo.onclick = function(){
		shadowBox.style.pointerEvents = 'none';
		shadowBox.classList.remove("showShadowBox");
		startNowBox.classList.remove("showAlert");
	};
}
