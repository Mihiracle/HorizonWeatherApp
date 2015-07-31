
var icons = { "clear-day" : "B", 
			  "clear-night" : "C", 
			  "rain" : "R", 
			  "snow" : "W", 
			  "sleet" : "T", 
			  "wind" : "F", 
			  "fog" : "E", 
			  "cloudy" : "N", 
			  "partly-cloudy-day" : "H", 
			  "partly-cloudy-night" : "I"
			}; //This is my associated array where I tie in the summary to the icons. 
			   //I used meteocons which links the letter to a certain icon. So I go from summary to letter to icon. 

function getWeather(cityCoord, cityName) { //Here we have the getWeather function, which has the parameter cityCoord and cityName
	var latAndLng = cityCoord; 	


	var forecastURL = "https://api.forecast.io/forecast/131adda0fbf7c3e18253029a4c5bf664/" + latAndLng; //we take the city coords and add it to the forecast url. 
																									    //this is how we get all the weather info for that location. 

	$.ajax({ //Here is the ajax call 
		url: forecastURL,
		jsonpCallBack: 'jsonCallBack', 
		contentType: "application/json", 
		dataType: 'jsonp',
		success: function(json) { //when its a success 
			console.log(json); 
			$("#temp").html(Math.round(json.currently.temperature)+ "&#176;F"); 
			$("#summary").html(json.currently.summary);
			$("#temp").attr("data-icon", icons[json.currently.icon]); 
			$("#location").html(cityName); 
			$("#precip").html("Chance for Precipitation: " + (Math.round(100*(json.currently.precipProbability))) + "%"); 
			$("#wind").html("Wind Speed:  " + (Math.round(json.currently.windSpeed)) + "mph"); 
			$("#dailysum").html("Today: " + json.hourly.summary); 
			//The section above shows the current weather data being put into the html content tags. 
			var rainStart = null; //here we are implementing code to tell you the times of the day when it could rain. 
			var rainEnd = null; 
			var precip = null; 
			for (var i =0; i < 49; i++) {  //this for loop finds the first hour in the next 48 hours when it will rain
				precip = json.hourly.data[i].precipProbability; 
				if (precip > 0.1) { 
					rainStart = new Date(json.hourly.data[i].time *1000);
					break; 
				}
			}
			for (var i = 0; i < 49; i++) { //this finds the last hour it will rain
				precip = json.hourly.data[i].precipProbability;
				if (precip <= 0.1 && precip >= 0) { 
					rainEnd = new Date(json.hourly.data[i].time *1000); 
					break; 
				}
			}
			if (rainStart != null && rainEnd == null) {  //if we cant tell when the rain ends then we just say it starts at a certain time
				$("#time").html("It will start raining at: " + rainStart.toLocaleTimeString()); 

			}
			else if (rainStart == null) { //if there is no rain start...
				$("#time").html("It will not be raining anytime soon..."); 
			}
			else if (rainEnd == null) { //if there is no rain end...
				$("#time").html("It will not stop raining anytime soon..."); 

			}
			else { //if it finds both rain start and rain end then it will rain from the start time to the end time. 
				$("#time").html("It will rain from: " + rainStart.toLocaleTimeString() + " to " + rainEnd.toLocaleTimeString()); 
			} 
			var button = ["#1","#2","#3","#4","#5","#6","#7","#8"]; //here are some arrays for the weekly forecast feature. These are ids for the buttons
			var pop = ["#day1","#day2","#day3","#day4","#day5","#day6","#day7","#day8"] //these are the tags for the popup summary 
			var poptemp = ["#t1","#t2","#t3","#t4","#t5","#t6","#t7","#t8"] //these are the tags for the popup temp 
			var thisDate = null; 
			for (var i = 1; i < 8; i++) { //it then goes through the next eight days of values matches them with each button. 
				thisDate = new Date(json.daily.data[i].time*1000)
				$(button[i]).html(thisDate.toLocaleDateString()); 
				$(pop[i]).html(json.daily.data[i].summary);
				$(poptemp[i]).html("High: " + Math.round(json.daily.data[i].temperatureMax) + "&#176;F and Low: " + Math.round(json.daily.data[i].temperatureMin) + "&#176;F");
				$(poptemp[i]).attr("data-icon", icons[json.daily.data[i].icon]); 
			} 
		},
		error: function(e) { //if theres an error then it displays a message. 
			console.log(e.message); 
		}
	}); 
}

function getCity(city) {   //here is the getCity function which takes city as a parameter and returns the longitude. City could be any address. 
	var geocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+ city + "&key=AIzaSyBWTM2jw6lrxW0BlQi1t_52Yx64lR-pSZ8"; //url to get api data
	$.ajax({
		url: geocodeURL, 
		type: 'get', 
		dataType: 'json', 
		success: function(json) { //once a success we get the data. 
			console.log(json); 
			var cityName = ""; //most of this code is dealing with city name robustness 
			if (json.results[0] === undefined) { 
				alert("This location does not exist! Please enter a new one!") 
			}
			for (var i = 0; i < json.results[0].address_components.length; i++) { 
				if (json.results[0].address_components[i].types[0] === "locality") { 
					cityName = (json.results[0].address_components[i].long_name); 
					console.log(cityName); 
					break;
				}
				else { 
					cityName = (json.results[0].address_components[0].long_name); 
				}
			}
			var c = city.toLowerCase(); 
			if (c == "monaco" || c == "singapore" || c == "djibouti") {  //hard coded for city states. 
				cityName = capitalizeFirstLetter(c); 
			}
			else if (c == "vatican+city" ) { 
				cityName = "Vatican City";
			}
			else if (cityName === undefined) { 
				cityName = capitalizeFirstLetter(c); 
			}
			var cityCoord = ((json.results[0].geometry.location.lat) + "," + (json.results[0].geometry.location.lng)); //city coord gets lat and long of location
			getWeather(cityCoord, cityName);  //then calls get weather and inputs the city name and the coords 
		}, 
		error: function(e) { 
			console.log(e.message);
		}
	});
}



function getSearchValue(variable) { //get search value is a function that finds the query from the url. 
	var query = window.location.search.substring(1); //gets the url 
	var vars = query.split("&"); //splits the query at & 
		for (var i=0;i<vars.length;i++) {
		    var pair = vars[i].split("="); 
		    if (pair[0] == variable) { //once it finds the actual query it then returns it 
		      return pair[1];
		    }
		} 

} 

function showCurrentLocation(position) { //this shows your current location using javascript api 
    var coords = position.coords.latitude + "," + position.coords.longitude;
    console.log(coords);
    getCity(coords); //then calls getCity with those current coords. 
}

function displayError(error) { //methods needed in showCurrentLocation
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}


function currentLocation() {  //method needed for showCurrentLocation 
	if (navigator.geolocation) {
		var timeoutVal = 10 * 1000 * 1000;
		navigator.geolocation.getCurrentPosition(showCurrentLocation, displayError); 
	}
	else {
		alert("Geolocation is not supported by this browser");
	}
}

function capitalizeFirstLetter(string) { //this capitalizes the first letter of a string, used for city names. 
    return string.charAt(0).toUpperCase() + string.slice(1);
}


//-------------------------------------------------------------------------------------

//Here is where the code is being run. 
 

var query1 = getSearchValue("searchfield"); //first it gets the query 
if(!query1) { //if it doesnt exist, ie you havent searched anything
	currentLocation(); //it gets your current location. 
}
else { 
	getCity(query1); //else it finds the city of whatever you searched. 
}

$(document).ready(function(){	//once the document is ready 

	$("a.city").bind("click", function() { //if you click the popular city buttons
		getCity($(this).html()); //it will get that city from the html 
	}); 	


	$("#searchform").submit(function() { //when you press enter on the search button it will quickly refresh the screen to get the query. 
		setTimeout(function() {
	    	refreshCity(); 
		}, 300)
	});

	function refreshCity() { // refreshed the screen. 
		window.location.reload();
	}

}); 



			

		
		
