var nLight = [];
var nLock = [];
var nPowered = [];
var nTemp = [];
var nShade = [];
var nGarageDoor = [];
var divLights = [];
var mySliderLight = [];
var mySliderLock = [];
var mySliderSwitch = [];
var mySliderTemp = [];
var mySliderShade = [];
var mySliderGarageDoor = [];
var mySliderShortcut = [];
var controlWinks = [];
var groupWinks = [];
var robotWinks = [];
var shortcutWinks = [];
var loadingDevices = false;
var scrollPosition = 0;

var deviceTypes = {
	"air_conditioner_id": "air_conditioners",
	"binary_switch_id": "binary_switches",
	"shade_id": "shades",
	"camera_id": "cameras",
	"doorbell_id": "doorbells",
	"garage_door_id": "garage_doors",
	"light_bulb_id": "light_bulbs",
	"lock_id": "locks",
	"key_id": "keys",
	"cloud_clock_id": "cloud_clocks",
	"alarm_id": "alarms",
	"power_strip_id": "power_strips",
	"piggy_bank_id": "piggy_banks",
	"deposit_id": "deposits",
	"refrigerator_id": "refrigerators",
	"propane_tank_id": "propane_tanks",
	"remote_id": "remotes",
	"sensor_pod_id": "sensor_pods",
	"siren_id": "sirens",
	"smoke_detector_id": "smoke_detecors",
	"sprinkler_id": "sprinklers",
	"thermostat_id": "thermostats",
	"water_heater_id": "water_heaters"
};

$(function() {
	saveScrollPosition();
	fillBody();
	checkWeather();

	$(window).scroll(function() {
		clearTimeout($.data(this, "scrollCheck"));
		$.data(this, "scrollCheck", setTimeout(function() {
			if (!loadingDevices)
				saveScrollPosition();
		}, 250));
	});

	$("#groups").click(function() {
		$('html, body').scrollTop($("#groupsContainer").offset().top - 50);
	});

	$("#devices").click(function() {
		$('html, body').scrollTop($("#devicesContainer").offset().top - 50);
	});

	$("#shortcuts").click(function() {
		$('html, body').scrollTop($("#shortcutsContainer").offset().top - 50);
	});

	$("#robots").click(function() {
		$('html, body').scrollTop($("#robotsContainer").offset().top - 50);
	});
});

function isLocalStorageSupported() {
	return 'localStorage' in window && window['localStorage'] !== null;
}

function saveScrollPosition() {
	scrollPosition = $(window).scrollTop();

	if (isLocalStorageSupported())
		localStorage.setItem("scrollposition", scrollPosition);
}

function getScrollPosition() {
	if (isLocalStorageSupported()) {
		if (localStorage.getItem("scrollposition"))
			return parseInt(localStorage.getItem("scrollposition"));
		else
			return scrollPosition;
	}
	else
		return scrollPosition;
}

function restoreScrollPoisition() {
	$(window).scrollTop(getScrollPosition());
}

function checkWeather() {
	if(enable_weather) {
		$('#weather').attr('href', weather_path);
		$('#weather').css('display', 'inline-block');
	}
}

function populateWinkRobot(wink, row) {
	var cell = document.getElementById("RobotDesc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(wink.name));
	cell.appendChild(divDesc);

	return;
}

function populateWinkShortcut(wink, row) {
	var cell = document.getElementById("ShortcutDesc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(wink.name));
	cell.appendChild(divDesc);
	var cell = document.getElementById("ShortcutSwitch" + row);
	mySliderShortcut[row] = new dhtmlXSlider({
		parent: cell,
		size: 150,
		skin: "dhx_web",
		tooltip: true,
		vertical: false,
		min: 0,
		max: 1,
		value: 0,
		step: 1
	});
	var lineNext = document.createElement("BR");
	cell.appendChild(lineNext);
	var temp_bg = document.createElement("img");
	temp_bg.src = "png/shortcuts/shortcutlegend.png";
	temp_bg.style.align = 'left';
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderShortcut.length > 0) {
		mySliderShortcut[row].attachEvent("onSlideEnd", function(){
			setShortcut(wink.scene_id);
		});
	}

	return;
}

function populateWinkGroup(wink, row) {
	var strDeviceType = wink.members[0].object_type;

	switch(strDeviceType){
		case 'light_bulb':
			addLightBulb(wink, row);
			break;

		case 'lock':
			addLock(wink, row);
			break;

		case 'binary_switch':
			addBinarySwitch(wink, row);
			break;

		default:
			addDefaultDevice(wink, row);
			break;
	}

	return;
}

function populateWinkDevice(wink, row) {
	var strDeviceTypeFull;
	var strDeviceType;

	for(var i = 0; i < Object.keys(wink).length; i++) {
		if(Object.keys(wink)[i] in deviceTypes) {
			strDeviceTypeFull = Object.keys(wink)[i];
			break;
		}
	}

	if (typeof strDeviceTypeFull == "undefined") {
		if("hub_id" in wink) {
			strDeviceTypeFull = "hub_id";
			strDeviceType = "hubs";
		}
	}
	else
		strDeviceType = deviceTypes[strDeviceTypeFull];

	switch(strDeviceType){
		case 'light_bulbs':
			addLightBulb(wink, row);
			break;

		case 'locks':
			addLock(wink, row);
			break;

		case 'thermostats':
			addThermostat(wink, row);
			break;

		case 'hubs':
			addHub(wink, row);
			break;

		case 'sensor_pods':
			addSensorPod(wink, row);
			break;

		case 'propane_tanks':
			addPropaneTank(wink, row);
			break;

		case 'smoke_detectors':
			addSmokeDetector(wink, row);
			break;

		case 'binary_switches':
			addBinarySwitch(wink, row);
			break;

		case 'shades':
			addShades(wink, row);
			break;

		case 'garage_doors':
			addGarageDoor(wink, row);
			break;

		default:
			addDefaultDevice(wink, row);
			break;
	}

	return;
}

function addHub(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		prefix = "Group";
	}

	//updateHub(wink, row);
	//window.setInterval(function(){updateHub(wink, row)}, 30000);
	var cell = document.getElementById("DeviceState" + row);
	cell.innerHTML = "";
	var state = document.createElement("img");
	state.src = "png/hub/true.png";
	state.alt = "On-Line";
	state.id = "hub";
	state.width = 48;
	state.height = 48;
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
}

function addLightBulb(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].light_bulb_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	var bLight = wink.desired_state.powered;
	state.id = "lightbulb";
	state.src = "png/lights/" + bLight + ".png";
	state.alt = bLight;
	state.width = 48;
	state.height = 48;
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	if(wink.desired_state.powered)
		nLight[row] = (wink.desired_state.brightness) * 100;
	else
		nLight[row] = 0;
		mySliderLight[row] = new dhtmlXSlider({
			parent: prefix + "Switch" + row,
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
	temp_bg.src = "png/lights/lightlegend.png";
	temp_bg.style.align = "left";
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderLight.length > 0) {
		mySliderLight[row].attachEvent("onSlideEnd", function(newLight){
			if ('members' in product) {
				for (child_wink in wink_children)
					setDevice('light_bulbs', wink_children[child_wink].light_bulb_id, newLight);
			}
			else
				setDevice('light_bulbs', wink.light_bulb_id, newLight);
		});
	}
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(nLight[row] + "%"));
	cell.appendChild(divDesc);
}

function addLock(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].lock_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var img = document.createElement("img");
	img.src = "png/locks/locks.png";
	img.width = 48;
	img.height = 48;
	cell.appendChild(img);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	if(wink.desired_state.locked)
		nLock = 1;
	else
		nLock = 0;
	mySliderLock[row] = new dhtmlXSlider({
		parent: cell,
		size: 150,
		skin: "dhx_web",
		tooltip: true,
		vertical: false,
		min: 0,
		max: 1,
		value: nLock,
		step: 1
	});
	var lineNext = document.createElement("BR");
	cell.appendChild(lineNext);
	var temp_bg = document.createElement("img");
	temp_bg.src = "png/locks/locklegend.png";
	temp_bg.style.align = 'left';
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	mySliderLock[row].attachEvent("onSlideEnd", function(newLock){
		if ('members' in product) {
			for (child_wink in wink_children)
				setDevice('locks', wink_children[child_wink].lock_id, newLock);
		}
		else
			setDevice('locks', wink.lock_id, newLock);
	});
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	var state = document.createElement("img");
	state.src = "png/locks/"+ wink.desired_state.locked + ".png";
	state.width = 24;
	state.height = 24;
	divDesc.appendChild(state);
	cell.appendChild(divDesc);
}

function addThermostat(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var nTemp = wink.desired_state.max_set_point;
	nTemp = (nTemp * 1.8) + 32; // COMMENT THIS LINE OUT FOR CELSIUS
	var img = document.createElement("img");
	img.src = "png/thermostat/thermostat.png";
	img.width = 48;
	img.height = 48;
	cell.appendChild(img);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	var nTemp = wink.desired_state.max_set_point;
	nTemp = (nTemp * 1.8) + 32;
	mySliderTemp[row] = new dhtmlXSlider({
		parent: cell,
		size: 150,
		skin: "dhx_web",
		tooltip: true,
		vertical: false,
		min: 50,
		max: 80,
		value: nTemp,
		step: 1
	});
	var lineNext = document.createElement("BR");
	var temp_bg = document.createElement("img");
	temp_bg.style.marginTop = "20px";
	temp_bg.src = "png/thermostat/thermostatlegend.png";
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderTemp.length > 0) {
		mySliderTemp[row].attachEvent("onSlideEnd", function(newTemp){
			newTemp = (newTemp - 32)/1.8;
			setDevice("thermostat_id", wink.thermostat_id, newTemp);
		});
	}
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(nTemp + "\xB0"));
	cell.appendChild(divDesc);
}

function addSensorPod(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].sensor_pod_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	state.src = "png/sensors/sensor.png";
	state.width = 48;
	state.height = 48;
	state.alt = 'N/A';
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);

	if ('members' in product) {
		for (child_wink in wink_children)
			updateSensors(wink_children[child_wink], row);
	}
	else
		updateSensors(wink, row);
}

function addPropaneTank(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	state.src = "png/sensors/na.png";
	state.alt = 'N/A';
	state.width = 48;
	state.height = 48;
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var img = document.createElement("img");
	img.src = "png/sensors/sensor.png";
	img.width = 64;
	img.height = 64;
	divDesc.appendChild(img);
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	updateRefuel(wink, row);
}

function addSmokeDetector(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	state.src = "png/sensors/smokealarm.png";
	state.alt = 'N/A';
	state.width = 48;
	state.height = 48;
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
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
	imgBattery.width = 32;
	imgBattery.height = 32;
	cell.appendChild(imgBattery);
}

function addBinarySwitch(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].binary_switch_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var img = document.createElement("img");
	img.src = "png/binaryswitches/binaryswitches.png";
	img.width = 48;
	img.height = 48;
	cell.appendChild(img);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	if(wink.desired_state.powered)
		nPowered = 1;
	else
		nPowered = 0;
	mySliderSwitch[row] = new dhtmlXSlider({
		parent: cell,
		size: 150,
		skin: "dhx_web",
		tooltip: true,
		vertical: false,
		min: 0,
		max: 1,
		value: nPowered,
		step: 1
	});
	var lineNext = document.createElement("BR");
	cell.appendChild(lineNext);
	var temp_bg = document.createElement("img");
	temp_bg.src = "png/binaryswitches/binaryswitchlegend.png";
	temp_bg.style.align = 'left';
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderSwitch.length > 0) {
		mySliderSwitch[row].attachEvent("onSlideEnd", function(newSwitch){
			if ('members' in product) {
				for (child_wink in wink_children)
					setDevice('binary_switches', wink_children[child_wink].binary_switch_id, newSwitch);
			}
			else
				setDevice('binary_switches', wink.binary_switch_id, newSwitch);
		});
	}
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	var state = document.createElement("img");
	state.src = "png/binaryswitches/"+ wink.desired_state.powered + ".png";
	state.width = 24;
	state.height = 24;
	divDesc.appendChild(state);
	cell.appendChild(divDesc);
}

function addShades(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].shade_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	var bPosition = wink.desired_state.position;
	state.id = "lightbulb";
	state.src = "png/shades/shades.png";
	state.alt = bPosition;
	state.width = 48;
	state.height = 48;
	cell.appendChild(state);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	if(wink.desired_state.position)
		nShade[row] = (wink.desired_state.position);
	else
		nShade[row] = 0;
		mySliderShade[row] = new dhtmlXSlider({
			parent: prefix + "Switch" + row,
			value: nShade[row],
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
	temp_bg.src = "png/shades/shadeslegend.png";
	temp_bg.style.align = "left";
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderShade.length > 0) {
		mySliderShade[row].attachEvent("onSlideEnd", function(newShade){
			if ('members' in product) {
				for (child_wink in wink_children)
					setDevice('shades', wink_children[child_wink].shade_id, newShade);
			}
			else
				setDevice('shades', wink.shade_id, newShade);
		});
	}
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	var span = document.createElement("span");
	divDesc.appendChild(span);
	divDesc.appendChild(document.createTextNode(nShade[row] + "%"));
	cell.appendChild(divDesc);
}

function addGarageDoor(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		var wink_children = [];

		for (device in controlWinks) {
			for (member in product.members) {
				if (controlWinks[device].garage_door_id == product.members[member].object_id) {
					wink_children.push(controlWinks[device]);
				}
			}
		}

		wink = wink_children[0];
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var img = document.createElement("img");
	img.src = "png/garagedoors/garagedoors.png";
	img.width = 48;
	img.height = 48;
	cell.appendChild(img);
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
	if(wink.desired_state.powered)
		nGarageDoor = 1;
	else
		nGarageDoor = 0;
	mySliderGarageDoor[row] = new dhtmlXSlider({
		parent: cell,
		size: 150,
		skin: "dhx_web",
		tooltip: true,
		vertical: false,
		min: 0,
		max: 1,
		value: nPowered,
		step: 1
	});
	var lineNext = document.createElement("BR");
	cell.appendChild(lineNext);
	var temp_bg = document.createElement("img");
	temp_bg.src = "png/garagedoors/garagedoorslegend.png";
	temp_bg.style.align = 'left';
	temp_bg.width = 150;
	temp_bg.height = 14;
	cell.appendChild(temp_bg);
	if(mySliderGarageDoor.length > 0) {
		mySliderGarageDoor[row].attachEvent("onSlideEnd", function(newGarageDoor){
			if ('members' in product) {
				for (child_wink in wink_children)
					setDevice('binary_switches', wink_children[child_wink].binary_switch_id, newGarageDoor);
			}
			else
				setDevice('binary_switches', wink.binary_switch_id, newSwitch);
		});
	}
	var cell = document.getElementById(prefix + "Current" + row);
	var divDesc = document.createElement('div');
	var state = document.createElement("img");
	state.src = "png/garagedoors/"+ wink.desired_state.powered + ".png";
	state.width = 24;
	state.height = 24;
	divDesc.appendChild(state);
	cell.appendChild(divDesc);
}

function addDefaultDevice(product, row) {
	var wink = product;
	var name = product.name;
	var prefix = "Device";

	if ('members' in product) {
		prefix = "Group";
	}

	var cell = document.getElementById(prefix + "State" + row);
	var state = document.createElement("img");
	state.src = "png/lights/na.png";
	state.alt = 'not light';
	state.width = 48;
	state.height = 48;
	var cell = document.getElementById(prefix + "Desc" + row);
	var divDesc = document.createElement('div');
	divDesc.style.width = 60;
	divDesc.appendChild(document.createTextNode(name));
	cell.appendChild(divDesc);
	var cell = document.getElementById(prefix + "Switch" + row);
}

function fillBody() {
	if (wink_username === "" || wink_password === "") {
		prompt_dialog({
			lm: "Please enter your Wink Email:",
			callback: function(value) {
				wink_username = value;

				prompt_dialog({
					lm: "Please enter your Wink Password:",
					tm: "password",
					callback: function(value) {
						wink_password = value;

						doLogin();
					}
				});
			}
		});
	}
	else {
		doLogin();
	}
}

function doLogin() {
	$.ajax({
		method: "POST",
		url: "https://api.wink.com/oauth2/token",
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

function createRows(row, type){
	var result = document.createElement("tr");
	td = document.createElement("td");
	td.id = type + "State" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = type + "Desc" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = type + "Switch" + row;
	result.appendChild(td);
	var td = document.createElement("td");
	td.id = type + "Current" + row;
	result.appendChild(td);

	return result;
}

function updateSensors(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Sensor Status...";

	var cell = document.getElementById("DeviceSwitch" + row);
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
	imgBattery.width = 32;
	imgBattery.height = 32;
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

	imgOpened.width = 32;
	imgOpened.height = 32;

	divSensor.appendChild(imgOpened);
	cell.appendChild(divSensor);
	document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
}

function updateRefuel(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Refuel Status...";

	var cell = document.getElementById("DeviceSwitch" + row);
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
	imgBattery.width = 32;
	imgBattery.height = 32;
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
	imgRefuel.width = 32;
	imgRefuel.height = 32;
	divSensor.appendChild(imgRefuel);
	cell.appendChild(divSensor);

	document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
}

function updateHub(wink, row) {
	document.getElementById("winkResult").innerHTML = "Updating Hub Status...";

	if('WebSocket' in window) {
		var ws = new WebSocket("ws://" + wink.last_reading.ip_address);

		ws.onerror = function(error){
			ws.close();
			ws = null;
			var cell = document.getElementById("DeviceState" + row);
			cell.innerHTML = "";
			var state = document.createElement("img");
			state.src = "png/hub/true.png";
			state.alt = "On-Line";
			state.id = "hub";
			state.width = 48;
			state.height = 48;
			cell.appendChild(state);
		};

		setTimeout(function(){
			if(ws != null){
				ws.close();
				ws = null;
				var cell = document.getElementById("DeviceState" + row);
				cell.innerHTML = "";
				var state = document.createElement("img");
				state.src = "png/hub/false.png";
				state.alt = "Off-Line";
				state.id = "hub";
				state.width = 48;
				state.height = 48;
				cell.appendChild(state);
			}
		}, 2000);
	}
	else
		alert("WebSocket are not supported");

	document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
}

function fetchRobots() {
	document.getElementById("winkResult").innerHTML = "Fetching...";

	$.ajax({
		method: "GET",
		url: "https://api.wink.com/users/me/robots",
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
			robotWinks = [];

			for (var i = 0; i < winks.data.length; i++) {
				robotWinks.push(winks.data[i]);
				tbody.appendChild(createRows(numWinks, "Robot"));
				++numWinks;
			}

			document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
			var winkRobotsTable = document.getElementById("winkRobotsTable");

			winkRobotsTable.replaceChild(tbody, document.getElementById("winkRobots"));
			tbody.setAttribute("id", "winkRobots");

			for (var i = 0; i < robotWinks.length; i++) {
				populateWinkRobot(robotWinks[i], i);
			}

			sortTable("winkRobotsTable");

			loadingDevices = false;

			restoreScrollPoisition();
		}
	});
}

function fetchShortcuts() {
	document.getElementById("winkResult").innerHTML = "Fetching...";

	$.ajax({
		method: "GET",
		url: "https://api.wink.com/users/me/scenes",
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
			shortcutWinks = [];

			for (var i = 0; i < winks.data.length; i++) {
				shortcutWinks.push(winks.data[i]);
				tbody.appendChild(createRows(numWinks, "Shortcut"));
				++numWinks;
			}

			document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
			var winkShortcutsTable = document.getElementById("winkShortcutsTable");
			winkShortcutsTable.replaceChild(tbody, document.getElementById("winkShortcuts"));
			tbody.setAttribute("id", "winkShortcuts");

			for (var i = 0; i < shortcutWinks.length; i++) {
				populateWinkShortcut(shortcutWinks[i], i);
			}

			sortTable("winkShortcutsTable");

			fetchRobots();
		}
	});
}

function fetchGroups() {
	document.getElementById("winkResult").innerHTML = "Fetching...";

	$.ajax({
		method: "GET",
		url: "https://api.wink.com/users/me/groups",
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
			groupWinks = [];

			for (var i = 0; i < winks.data.length; i++) {
				groupWinks.push(winks.data[i]);
				tbody.appendChild(createRows(numWinks, "Group"));
				++numWinks;
			}

			document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
			var winkGroupsTable = document.getElementById("winkGroupsTable");
			winkGroupsTable.replaceChild(tbody, document.getElementById("winkGroups"));
			tbody.setAttribute("id", "winkGroups");

			for (var i = 0; i < groupWinks.length; i++) {
				populateWinkGroup(groupWinks[i], i);
			}

			sortTable("winkGroupsTable");

			fetchShortcuts();
		}
	});
}

function fetchDevices() {
	document.getElementById("winkResult").innerHTML = "Fetching...";

	loadingDevices = true;

	$.ajax({
		method: "GET",
		url: "https://api.wink.com/users/me/wink_devices",
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
				if ('parent_object_type' in winks.data[i] && winks.data[i].parent_object_type == "lock") {
					// do nothing, ignoring keys
				}
				else {
					controlWinks.push(winks.data[i]);
					tbody.appendChild(createRows(numWinks, "Device"));
					++numWinks;
				}
			}

			document.getElementById("winkResult").innerHTML = controlWinks.length + " devices connected";
			var winkDevicesTable = document.getElementById("winkDevicesTable");
			winkDevicesTable.replaceChild(tbody, document.getElementById("winkDevices"));
			tbody.setAttribute("id", "winkDevices");

			for (var i = 0; i < controlWinks.length; i++) {
				if ('parent_object_type' in controlWinks[i] && controlWinks[i].parent_object_type == "lock") {
					// do nothing, ignoring keys
				}
				else {
					populateWinkDevice(controlWinks[i], i);
				}
			}

			sortTable("winkDevicesTable");

			fetchGroups();
		}

		window.setTimeout(function(){fetchDevices()},60000);
	});
}

function sortTable(id) {
	var $tbody = $('#' + id + ' tbody');
	$tbody.find('tr').sort(function(a,b) {
		var tda = $(a).find('td:eq(1)').text();
		var tdb = $(b).find('td:eq(1)').text();
		return tda > tdb ? 1 : tda < tdb ? -1 : 0;
	}).appendTo($tbody);
}

function setShortcut(sceneid) {
	document.getElementById("winkResult").innerHTML = "Setting...";

	$.ajax({
		method: "POST",
		url: "https://api.wink.com/scenes/" + sceneid + "/activate",
		dataType: "json",
		async: true,
		crossDomain: true,
		headers: { "Authorization": "Bearer " + AccessToken }
	})
	.done(function(resp, textStatus, jqXHR) {
		if (jqXHR.status != 200 && jqXHR.status != 202) {
			document.getElementById("winkResult").innerHTML = "Error Calling Wink REST API "
					+ jqXHR.status;
			return;
		}

		document.getElementById("winkResult").innerHTML = "Shortcut activated";

		fetchDevices();
	});
}

function setDevice(model, udn, value) {
	document.getElementById("winkResult").innerHTML = "Setting...";

	var bValue;

	switch(model) {
		case "light_bulbs":
			var deviceTarget = model+ "/" + udn;
			if(value > 0)
				bValue = true;
			else
				bValue = false;
			value = value/100;
			var body = {
				"desired_state":
				{
					"powered":bValue,"brightness":value
				}
			};
			break;
		case "locks":
			if(value > 0)
				bValue = true;
			else
				bValue = false;
			var deviceTarget = model + "/" + udn;
			var body = {
				"desired_state":
				{
					"locked":bValue
				}
			};
			break;
		case "thermostat_id":
			var deviceTarget = "thermostats/" + udn;
			var body = {
				"desired_state":
				{
					"mode":"heat_only",
					"powered":true,
					"modes_allowed":null,
					"min_set_point":value,
					"max_set_point":value
				}
			};
			break;
		case "binary_switches":
			if(value > 0)
				bValue = true;
			else
				bValue = false;
			var deviceTarget = model + "/" + udn;
			var body = {
				"desired_state":
				{
					"powered":bValue
				}
			};
			break;
		case "shades":
			var deviceTarget = model + "/" + udn;
			var body = {
				"desired_state":
				{
					"position":value
				}
			};
			break;
		case "garage_doors":
			var deviceTarget = model + "/" + udn;
			var body = {
				"desired_state":
				{
					"position":value
				}
			};
			break;
		default:
			break;
	}

	$.ajax({
		method: "PUT",
		url: "https://api.wink.com/" + deviceTarget,
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

var promptCount = 0;
window.prompt_dialog = function(options) {
	var lm = options.lm || "Dialog:",
		bm = options.bm || "Ok",
		tm = options.tm || "text";

	if(!options.callback)
		alert("No callback function provided! Please provide one.");

	var prompt = document.createElement("div");
	prompt.className = "prompt_dialog";

	var submit = function() {
		options.callback(input.value);
		document.body.removeChild(prompt);
	};

	var label = document.createElement("label");
	label.textContent = lm;
	label.for = "prompt_dialog_input" + (++promptCount);
	prompt.appendChild(label);

	var input = document.createElement("input");
	input.id = "prompt_dialog_input" + (promptCount);
	input.type = tm;
	input.addEventListener("keyup", function(e) {
		if (e.keyCode == 13) submit();
	}, false);
	prompt.appendChild(input);

	var button = document.createElement("button");
	button.textContent = bm;
	button.addEventListener("click", submit, false);
	prompt.appendChild(button);

	document.body.appendChild(prompt);

	input.focus();
};
