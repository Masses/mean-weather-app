$(document).ready(function()
{

	/** initialize variables for use **/
	meanWeather = {};
	meanWeather.dataURL = "http://meanserver.herokuapp.com/";
	meanWeather.retryTime = 5100;

	/** 
	 *  helper function to see if the page is in debug mode which enables console logging
	 */
	function isDebugMode()
	{
		try
		{
			if (Boolean(window.location.href.match(/debug=true/gi)))
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		catch(e)
		{
			/** really screwed up! **/
			return false;
		}
	}
	meanWeather.debugMode = isDebugMode();

	/**  
	 *   function that will take in a json object and hopefully
	 *   update our weather icon and temperature, if test cases are 
	 *   passed
	 **/ 
	function updateWeather(data)
	{
		/** 
		 *  check to make sure both the temperature and conditions exist
		 *  and are strings before proceeding 
		 **/
		try
		{
			if ((typeof data.Temperature !== 'undefined') && (typeof data.Conditions === 'string'))
			{
				/** both are set and, start checks to see if the data is a garbage object **/
				
				/** check to make sure there is no script tag(s) in either of the strings **/
				if (data.Conditions.indexOf('script>') < 0)
				{

					/** there were digits in the response check for the condition type **/
					switch(data.Conditions)
					{
						case "sunny":
							updateWeatherHelper(data.Temperature, 'img/weather-icons/weather-sunny.png');
							setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
						break;

						case "cloudy":
							updateWeatherHelper(data.Temperature, 'img/weather-icons/weather-cloudy.png');
							setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
						break;

						case "foggy":
							updateWeatherHelper(data.Temperature, 'img/weather-icons/weather-foggy.png');
							setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
						break;

						default:
							/** unknown weather type, try again **/
			 				if (meanWeather.debugMode)
							{
							 	console.log('Mean server tried to trick us with a condition we do not know!');
							}
							setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);						
		
						break;

					}

				}
				else
				{
					/**
					  * mean server tried to inject javascript! what a meanie!
					  * ask for another response after the proper time
					 **/
	 				if (meanWeather.debugMode)
					{
					 	console.log('Mean server tried to inject JavaScript');
					}
					setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
				}
			}
			else
			{
				/** 
				 *  mean data from a mean server, try again in 5.5 seconds 
				 *  just to be safe and avoid the 4 second limit and timing inconsistencies
				 **/
				if (meanWeather.debugMode)
				{
				 	console.log('No temperature and/or conditions set');
				}
				setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
			}
		}
		catch(e)
		{
				/** 
				 *  tragedy! fire another request in 5.5 seconds to avoid any 4 second limit and
				 *  timing inconsistencies
				 **/
				 if (meanWeather.debugMode)
				 {
				 	console.log('Error in updateWeather function: ' + e.toString());
				 }
				setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);			
		}
		
	}

	/** 
	 *  helper function to actually update the page once we know it's safe to do so
	 **/
	function updateWeatherHelper(temperature, condition)
	{
		$('.weather-icon').attr('src', condition);
		$('.weather-temperature').text(temperature + ' °F');
	}

	/** 
     *	function to grab the weather from the server and pass it to our function that handles the data
	**/
	function getWeatherData(dataURL)
	{
		try
		{
			$.getJSON(dataURL, function(data)
			{
				updateWeather(data);
			}).fail(function(jqXHR)
			{
				if (meanWeather.debugMode)
				{
					console.log('HTTP Error ' + jqXHR.status);
				}
				setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
			});
		}
		catch(e)
		{
			/** 
			 *  tragedy! fire another request in 5.5 seconds to avoid any 4 second limit and
			 *  timing inconsistencies
			 **/
			 if (meanWeather.debugMode)
			 {
			 	console.log('Error in getWeatherData function: ' + e.toString());
			 }
			setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);	
		}
	}

	/** fire off the first weather fetch **/
	try
	{
		/** make sure the user can't refresh the page into a lock out **/
		setTimeout(function(){ getWeatherData(meanWeather.dataURL); }, 1100);
	}
	catch(e)
	{
		if (meanWeather.debugMode)
		{
			console.log('Error launching the first getWeatherData: ' + e.toString());
		}		
	}
	
});