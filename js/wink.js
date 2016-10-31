var nLight = [];
var divLights = [];
var mySliderLight = [];
var controlWinks = [];

$(function() {
	fillBody();
	checkWeather();
});

function checkWeather() {
	if(enable_weather) {
		$('#weather').attr('href', weather_path);
		$('#weather').css('display', 'inline-block');
	}
}

function getWinkRow(wink, row) {
	if('hub_id' in wink)
		strDeviceType = 'hubs';

	if('light_bulb_id' in wink)
		strDeviceType = 'light_bulbs';
	else if('lock_id' in wink)
		strDeviceType = 'locks';
	else if('thermostat_id' in wink)
		strDeviceType = 'thermostats';
	else if('sensor_pod_id' in wink)
		strDeviceType = 'sensor_pods';
	else if('propane_tank_id' in wink)
		strDeviceType = 'propane_tanks';
	else if('smoke_detector_id' in wink)
		strDeviceType = 'smoke_detectors';

	switch(strDeviceType){
		case 'light_bulbs':
			var cell = document.getElementById("State" + row);
			var state = document.createElement("img");
			var bPowered = wink.desired_state.powered;
			state.id = "lightbulb";
			state.src = "png/lights/" + bPowered + ".png";
			state.alt = bPowered;
			cell.appendChild(state);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var span = document.createElement("span");
			divDesc.appendChild(span);
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			var cell = document.getElementById("Switch" + row);
			var wink_id = wink.light_bulb_id;
			if(wink.desired_state.powered)
				nLight[row] = (wink.desired_state.brightness) * 100;
			else
				nLight[row] = 0;
			mySliderLight[row] = new dhtmlXSlider({
				parent: "Switch" + row,
				value: nLight[row],
				tooltip: true,
				skin: "dhx_web",
				size: 150, 
				step: 10,
				min: 0,
				max: 100
				});
			var lineNext = document.createElement("BR");
			cell.appendChild(lineNext);
			var temp_bg = document.createElement("img");
			temp_bg.src = "png/lights/lightlegend.gif";
			temp_bg.style.paddingTop = "5px";
			temp_bg.style.align = "left";
			cell.appendChild(temp_bg);
			if(mySliderLight.length > 0) {
				mySliderLight[row].attachEvent("onSlideEnd", function(newLight){
					setDevice('light_bulbs', wink_id, newLight);
				});
			}
			var cell = document.getElementById("Current" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var span = document.createElement("span");
			divDesc.appendChild(span);
			divDesc.appendChild(document.createTextNode(nLight[row] + "%"));
			cell.appendChild(divDesc);
			break;

		case 'locks':
			var cell = document.getElementById("State" + row);
			var img = document.createElement("img");
			img.src = "png/locks/ic_device_locks_selection.png";
			img.width = 48;
			img.height = 48;
			cell.appendChild(img);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			var cell = document.getElementById("Switch" + row);
			if(wink.desired_state.locked)
				nLock = 1;
			else
				nLock = 0;
			mySliderLight[row] = new dhtmlXSlider({
				parent: cell, 
				size: 150, 
				skin: "dhx_web",
				tooltip: true,
				vertical: false, 
				min: 0,
				max: 1,
				value: nLock,
				step: 1});
			var lineNext = document.createElement("BR");
			cell.appendChild(lineNext);
			var temp_bg = document.createElement("img");
			temp_bg.style.paddingTop = "5px";
			temp_bg.src = "png/locks/locklegend.png";
			temp_bg.style.align = 'left';
			cell.appendChild(temp_bg);
			mySliderLight[row].attachEvent("onSlideEnd", function(newLock){
				setDevice('locks', wink.lock_id, newLock);
			});
			var cell = document.getElementById("Current" + row);
			var divDesc = document.createElement('div');
			var state = document.createElement("img");
			state.src = "png/locks/"+ wink.desired_state.locked + ".png";
			divDesc.appendChild(state);
			cell.appendChild(divDesc);
			break;

		case 'thermostats':
			var cell = document.getElementById("State" + row);
			var nTemp = wink.desired_state.max_set_point;
			nTemp = (nTemp * 1.8) + 32; // COMMENT THIS LINE OUT FOR CELSIUS
			var img = document.createElement("img");
			img.src = "png/thermostat/ic_device_thermostat_selection.png";
			img.width = 48;
			img.height = 48;
			cell.appendChild(img);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			var cell = document.getElementById("Switch" + row);
			var nTemp = wink.desired_state.max_set_point;
			nTemp = (nTemp * 1.8) + 32;
			mySliderLight[row] = new dhtmlXSlider({
				parent: cell, 
				size: 150, 
				skin: "dhx_web",
				tooltip: true,
				vertical: false, 
				min: 50,
				max: 80,
				value: nTemp,
				step: 1});
			var lineNext = document.createElement("BR");
			var temp_bg = document.createElement("img");
			temp_bg.style.paddingTop = "5px";
			temp_bg.src = "png/thermostat/thermostatlegend.png";
			cell.appendChild(temp_bg);
			mySliderLight[row].attachEvent("onSlideEnd", function(newTemp){
				newTemp = (newTemp - 32)/1.8;
				setDevice("thermostat_id", wink.thermostat_id, newTemp);
			});
			var cell = document.getElementById("Current" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var span = document.createElement("span");
			divDesc.appendChild(span);
			divDesc.appendChild(document.createTextNode(nTemp + "\xB0"));
			cell.appendChild(divDesc);
			break;

		case 'hubs':
			updateHub(wink, row);
			window.setInterval(function(){updateHub(wink, row)}, 30000);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var span = document.createElement("span");
			divDesc.appendChild(span);
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			break;

		case 'sensor_pods':
			var cell = document.getElementById("State" + row);
			var state = document.createElement("img");
			state.src = "png/sensors/sensor.png";
			state.width = 48;
			state.height = 48;
			state.alt = 'N/A';
			cell.appendChild(state);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			updateSensors(wink, row);
			break;

		case 'propane_tanks':
			var cell = document.getElementById("State" + row);
			var state = document.createElement("img");
			state.src = "png/sensors/na.png";
			state.alt = 'N/A';
			cell.appendChild(state);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var img = document.createElement("img");
			img.src = "png/sensors/sensor.png";
			img.width = 64;
			img.height = 64;
			divDesc.appendChild(img);
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			updateRefuel(wink, row);
			break;

		case 'smoke_detectors':
			var cell = document.getElementById("State" + row);
			var state = document.createElement("img");
			state.src = "png/sensors/smokealarm.png";
			state.alt = 'N/A';
			cell.appendChild(state);
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			var span = document.createElement("span");
			divDesc.appendChild(span);
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			var cell = document.getElementById("Switch" + row);
			var imgBattery = document.createElement('img');
			if(wink.last_reading.battery > .8)
				imgBattery.src = 'png/battery/battery_100.png';
			if((wink.last_reading.battery <= .8) && (wink.last_reading.battery > .6))
				imgBattery.src = 'pgn/battery/battery_75.png';
			if((wink.last_reading.battery <= .6) && (wink.last_reading.battery > .3))
				imgBattery.src = 'pgn/battery/battery_50.png';
			if((wink.last_reading.battery <= .3) && (wink.last_reading.battery > .15))
				imgBattery.src = 'pgn/battery/battery_75.png';
			if((wink.last_reading.battery <= .15) && (wink.last_reading.battery > 0))
				imgBattery.src = 'pgn/battery/battery_10.png';
			imgBattery.alt = wink.last_reading.battery;
			cell.appendChild(imgBattery);
			break;

		default:
			var cell = document.getElementById("State" + row).className += "hideme";
			var state = document.createElement("img");
			state.src = "png/lights/na.png";
			state.alt = 'not light';
			var cell = document.getElementById("Desc" + row);
			var divDesc = document.createElement('div');
			divDesc.style.width = 60;
			divDesc.appendChild(document.createTextNode(wink.name));
			cell.appendChild(divDesc);
			var cell = document.getElementById("Switch" + row);
	}

	return;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');

	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}

	return "";
}

function fillBody() {
	/*var xhr = new XMLHttpRequest();

	var username = wink_username;
	var password = wink_password;
	var clientid = 'quirky_wink_android_app';
	var clientsecret = 'e749124ad386a5a35c0ab554a4f2c045';
	var sendstring = "{\"client_id\":\"" + clientid + "\",\"client_secret\":\"" + clientsecret + "\",\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"grant_type\":\"password\"}";*/


	$.ajax({
		method: "POST",
		url: "https://winkapi.quirky.com/oauth2/token",
		dataType: "json",
		async: true,
		crossDomain: true,
		data: { client_id: "quirky_wink_android_app",
				client_secret: "e749124ad386a5a35c0ab554a4f2c045",
				username: wink_username,
				password: wink_password,
				grant_type: "password"
		}
	})
	.done(function(result) {
		AccessToken = result.access_token;
		RefreshToken = result.refresh_token;
		TokenType = result.token_type;
		fetchDevices();

		return;
	});
}

function createRows(row){
	var result = document.createElement("tr");
	td = document.createElement("td");
	td.id = "State" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = "Desc" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = "Switch" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = "Current" + row;
	result.appendChild(td);

	return result;
}

function updateSensors(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Sensor Status...";

	var cell = document.getElementById("Switch" + row);
	var divSensor = document.createElement('div');
	var imgBattery = document.createElement('img');

	if(wink.last_reading.battery > .8)
		imgBattery.src = 'png/battery/battery_100.png';
	if((wink.last_reading.battery <= .8) && (wink.last_reading.battery > .6))
		imgBattery.src = 'pgn/battery/battery_75.png';
	if((wink.last_reading.battery <= .6) && (wink.last_reading.battery > .3))
		imgBattery.src = 'pgn/battery/battery_50.png';
	if((wink.last_reading.battery <= .3) && (wink.last_reading.battery > .15))
		imgBattery.src = 'pgn/battery/battery_75.png';
	if((wink.last_reading.battery <= .15) && (wink.last_reading.battery > 0))
		imgBattery.src = 'pgn/battery/battery_10.png';

	imgBattery.alt = wink.last_reading.battery;
	divSensor.appendChild(imgBattery);
	imgOpened = document.createElement('img');

	if(wink.name.search("Door") > 0) {
		if(wink.name.search("Garage") > 0) {
			if(wink.last_reading.opened)
				imgOpened.src = 'png/sensors/sensors_small_garagedoor_open.png';
			else
				imgOpened.src = 'png/sensors/sensors_small_garagedoor_closed.png';
		}
		else {
			if(wink.last_reading.opened)
				imgOpened.src = 'png/sensors/sensors_small_door_open.png';
			else
				imgOpened.src = 'png/sensors/sensors_small_door_closed.png';
		}
	}

	if(wink.name.search("Window") > 0) {
		if(wink.last_reading.opened)
			imgOpened.src = 'png/sensors/sensors_small_window_open.png';
		else
			imgOpened.src = 'png/sensors/sensors_small_window_closed.png';
	}

	if(wink.name.search("Cabinet") > 0) {
		if(wink.last_reading.opened)
			imgOpened.src = 'png/sensors/sensors_small_cabinet_open.png';
		else
			imgOpened.src = 'png/sensors/sensors_small_cabinet_closed.png';
	}

	divSensor.appendChild(imgOpened);
	cell.appendChild(divSensor);
	document.getElementById("winkResult").innerHTML = "Found " + controlWinks.length + " Wink devices";
}

function updateRefuel(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Refuel Status...";

	var cell = document.getElementById("Switch" + row);
	var divSensor = document.createElement('div');
	var imgBattery = document.createElement('img');

	if(wink.last_reading.battery > .8)
		imgBattery.src = 'png/battery/battery_100.png';
	if((wink.last_reading.battery <= .8) && (wink.last_reading.battery > .6))
		imgBattery.src = 'pgn/battery/battery_75.png';
	if((wink.last_reading.battery <= .6) && (wink.last_reading.battery > .3))
		imgBattery.src = 'pgn/battery/battery_50.png';
	if((wink.last_reading.battery <= .3) && (wink.last_reading.battery > .15))
		imgBattery.src = 'pgn/battery/battery_75.png';
	if((wink.last_reading.battery <= .15) && (wink.last_reading.battery > 0))
		imgBattery.src = 'pgn/battery/battery_10.png';

	imgBattery.alt = wink.last_reading.battery;
	divSensor.appendChild(imgBattery);
	var imgRefuel = document.createElement('img');

	if(wink.last_reading.remaining > .8)
		imgRefuel.src = 'png/refuel/ic_device_refuel_stroke.png';
	if((wink.last_reading.remaining <= .8) && (wink.last_reading.refuel > .6))
		imgRefuel.src = 'pgn/refuel/ic_refuel_4.png';
	if((wink.last_reading.remaining <= .6) && (wink.last_reading.refuel > .4))
		imgRefuel.src = 'pgn/refuel/ic_refuel_3.png';
	if((wink.last_reading.remaining <= .4) && (wink.last_reading.refuel > .3))
		imgRefuel.src = 'pgn/refuel/ic_refuel_2.png';
	if((wink.last_reading.remaining <= .3) && (wink.last_reading.refuel > .15))
		imgRefuel.src = 'pgn/refuel/ic_refuel_1.png';
	if((wink.last_reading.remaining <= .15) && (wink.last_reading.refuel > 0))
		imgRefuel.src = 'pgn/refuel/ic_refuel_0.png';

	imgRefuel.alt = wink.last_reading.battery;
	divSensor.appendChild(imgRefuel);
	cell.appendChild(divSensor);

	document.getElementById("winkResult").innerHTML = "Found " + controlWinks.length + " Wink devices";
}

function updateHub(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Hub Status...";

	if('WebSocket' in window) {
		var ws = new WebSocket("ws://" + wink.last_reading.ip_address);

		ws.onerror = function(error){
			ws.close();
			ws = null;
			var cell = document.getElementById("State" + row);
			cell.innerHTML = "";
			var state = document.createElement("img");
			state.src = "png/hub/true.png";
			state.alt = "On-Line";
			state.id = "hub";
			cell.appendChild(state);
		};

		setTimeout(function(){
			if(ws != null){
				ws.close();
				ws = null;
				var cell = document.getElementById("State" + row);
				cell.innerHTML = "";
				var state = document.createElement("img");
				state.src = "png/hub/false.png";
				state.alt = "Off-Line";
				state.id = "hub";
				cell.appendChild(state);
			}
		}, 2000);
	}
	else
		alert("WebSocket are not supported");

	document.getElementById("winkResult").innerHTML = "Found "+ controlWinks.length + " Wink devices";
}

function fetchDevices() {
	document.getElementById("winkResult").innerHTML = "Fetching...";

	$.ajax({
		method: "GET",
		url: "https://winkapi.quirky.com/users/me/wink_devices",
		dataType: "json",
		async: true,
		crossDomain: true,
		headers: { "Authorization": "Bearer " + AccessToken }
	})
	.done(function(winks, textStatus, jqXHR) {
		if (jqXHR.status != 200) {
			document.getElementById("winkResult").innerHTML = "Error Calling Wink REST API " + jqXHR.status + " " + jqXHR.statusText;
			return;
		}
		else {
			document.getElementById("winkResult").innerHTML = "Calling Wink REST API";

			var tbody = document.createElement("tbody");
			var numWinks = 0;
			controlWinks = [];

			for (var i = 0; i < winks.data.length; i++) {
				controlWinks.push(winks.data[i]);
				tbody.appendChild(createRows(numWinks));
				++numWinks;
			}

			document.getElementById("winkResult").innerHTML = "Found " + controlWinks.length + " Wink devices";
			var winkTable = document.getElementById("winkTable");
			winkTable.replaceChild(tbody, document.getElementById("winkDevices"));
			tbody.setAttribute("id", "winkDevices");

			for (var i = 0; i < controlWinks.length; i++) {
				getWinkRow(controlWinks[i], i);
			
			}

			sortDevices();
		}

		window.setTimeout(function(){fetchDevices()},60000);
	});
}

function sortDevices() {
	var $tbody = $('#winkTable tbody');
	$tbody.find('tr').sort(function(a,b) {
		var tda = $(a).find('td:eq(1)').text();
		var tdb = $(b).find('td:eq(1)').text();
		return tda > tdb ? 1 : tda < tdb ? -1 : 0;
	}).appendTo($tbody);
}

function setDevice(model, udn, value) {
	document.getElementById("winkResult").innerHTML = "Setting...";

	switch(model) {
		case "light_bulbs":
			var deviceTarget = model+ "/" + udn;
			if(value > 0)
				bPowered = true;
			else
				bPowered = false;
			value = value/100;
			var body = {
				"desired_state":
				{
					"powered":bPowered,"brightness":value
				}
			};
			break;
		case "locks":
			if(value > 0)
				bLocked = true;
			else
				bLocked = false;
			var deviceTarget = model + "/" + udn;
			var body = {
				"desired_state":
				{
					"locked":bLocked
				}
			};
			break;
		case "thermostat_id":
			var deviceTarget = "thermostats/" + udn;
			var body = {
				"desired_state":
				{
					"mode":"heat_only","powered":true,"modes_allowed":null,"min_set_point":value,"max_set_point":value
				}
			};
			break;
		default:
		;
	}

	$.ajax({
		method: "PUT",
		url: "https://winkapi.quirky.com/" + deviceTarget,
		dataType: "json",
		async: true,
		crossDomain: true,
		headers: { "Authorization": "Bearer " + AccessToken },
		data: body
	})
	.done(function(resp, textStatus, jqXHR) {
		if (jqXHR.status != 200) {
			document.getElementById("winkResult").innerHTML = "Error Calling Wink REST API "
					+ jqXHR.status;
			return;
		}

		document.getElementById("winkResult").innerHTML = "SetDevice " + udn
				+ " to " + value + ": " + resp;

		fetchDevices();
	});
}
