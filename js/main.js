$(document).ready(function()
{

    /** initialize variables for use **/
    var meanWeather = {};
    meanWeather.dataURL = "http://meanserver.herokuapp.com/";
    meanWeather.retryTime = 5100;



    /** 
     *  helper function to see if the page is in debug mode which enables console logging
     */
    meanWeather.isDebugMode = function()
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
    meanWeather.debugMode = meanWeather.isDebugMode();




    /**  
     *   function that will take in a json object and hopefully
     *   update our weather icon and temperature, if test cases are 
     *   passed
     **/ 
    meanWeather.parseWeather = function(data)
    {
        /** 
         *  check to make sure both the temperature and conditions exist
         *  and are strings before proceeding 
         **/
        try
        {
            /** check for object type because we pass data in as a string for testing, but
             *  normally comes through as an object **/
            var parsedJSON, temperature, conditions;
            if (typeof data === 'string')
            {
                parsedJSON = JSON.parse(data);
                temperature = parsedJSON.Temperature;
                conditions = parsedJSON.Conditions;
            }
            else
            {
                temperature = data.Temperature;
                conditions = data.Conditions;
            }


            if ((typeof temperature !== 'undefined') && (typeof conditions === 'string'))
            {
                /** both are set and, start checks to see if the data is a garbage object **/
                
                /** check to make sure there is no script tag(s) in either of the strings **/
                if (conditions.indexOf('script>') < 0)
                {

                    /** handled specific use case, but need to clean input before writing it to the page **/

                    switch(conditions)
                    {
                        case "sunny":
                            var response = [temperature, 'img/weather-icons/weather-sunny.png'];
                            return response;
                        break;

                        case "cloudy":
                            var response = [temperature, 'img/weather-icons/weather-cloudy.png'];
                            return response;
                        break;

                        case "foggy":
                            var response =  [temperature, 'img/weather-icons/weather-foggy.png'];
                            return response;
                        break;

                        default:
                            /** unknown weather type, try again **/
                            if (meanWeather.debugMode)
                            {
                                console.log('Mean server tried to trick us with a condition we do not know!');
                            }
                            return false;
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
                    return false;
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
                return false;
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
                return false;         
        }
        
    }




    /** main function to update the weather, kicks off helper functions **/
    meanWeather.updateWeather = function(data)
    {
        var result = meanWeather.parseWeather(data);
        if (result)
        {
            meanWeather.writeWeatherUpdates(result[0], result[1]);
            meanWeather.getWeatherDataHelper();
        }
        else
        {
            meanWeather.getWeatherDataHelper();
        }
    }




    /** 
     *  helper function to actually update the page once we know it's safe to do so
     **/
    meanWeather.writeWeatherUpdates = function(temperature, condition)
    {
        $('.weather-icon').attr('src', condition);
        $('.weather-temperature').text(temperature + ' °F');
    }




    /** 
     *  function to grab the weather from the server and pass it to our function that handles the data
    **/
    meanWeather.getWeatherData = function(dataURL)
    {
        try
        {
            $.getJSON(dataURL, function(data)
            {
                meanWeather.updateWeather(data);
            }).fail(function(jqXHR)
            {
                if (meanWeather.debugMode)
                {
                    console.log('HTTP Error ' + jqXHR.status);
                }
                meanWeather.getWeatherDataHelper();
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
            meanWeather.getWeatherDataHelper();  
        }
    }




    meanWeather.runMeanWeatherTests = function()
    {
        /** temporarily rewrite getWeatherDataHelper to avoid making server calls **/
        meanWeather._getWeatherDataHelper = meanWeather.getWeatherData;
        meanWeather.getWeatherData = function(){}

        try
        {
            test("Check good responses", function() 
            {
                /** check for real weather conditions **/
                deepEqual(meanWeather.parseWeather('{"Temperature":-62,"Conditions":"foggy"}'), [-62, 'img/weather-icons/weather-foggy.png']);
                deepEqual(meanWeather.parseWeather('{"Temperature":62,"Conditions":"sunny"}'), [62, 'img/weather-icons/weather-sunny.png']);
                deepEqual(meanWeather.parseWeather('{"Temperature":0,"Conditions":"cloudy"}'), [0, 'img/weather-icons/weather-cloudy.png']);
            });

            test("Check JavaScript injection", function()
            {
                equal(meanWeather.parseWeather('{"Temperature": "<script>window.location = \'http://www.google.com\'</script>", "Conditions":"<script>window.location = \'http://www.google.com\'</script>" }'), false);
            });
            test("Check sleepy server", function()
            {
                equal(meanWeather.parseWeather('{"Server Tired": "ZzZzZzZzZzZzZzZzZ" }'), false);
            });
            test("Check garbage", function()
            {
                equal(meanWeather.parseWeather('"{ weather: ++_--_(*&^$#$^&*("'), false);
            });                        
        }
        catch(e)
        {
            /** safe to use console log, we are in debug on non-production code **/
            console.log('test fail: ' + e.toString());
        }

        /** undo the damage we just did **/
        meanWeather.getWeatherData = meanWeather._getWeatherDataHelper;

    }



    /** helper function to fire off a request for data **/
    meanWeather.getWeatherDataHelper = function()
    {
        setTimeout(function(){ meanWeather.getWeatherData(meanWeather.dataURL); }, meanWeather.retryTime);
    }




    /** check to see if page is in debug mode **/
    if (meanWeather.debugMode)
    {

        /** show the test divs and run the tests **/
        $('#qunit').show();
        $('#qunit-fixture').show();
        meanWeather.runMeanWeatherTests();

    }

    /** fire off the first weather fetch **/
    try
    {
        /** make sure the user can't refresh the page into a lock out **/
        setTimeout(function(){ meanWeather.getWeatherData(meanWeather.dataURL); }, 1100);
    }
    catch(e)
    {
        if (meanWeather.debugMode)
        {
            console.log('Error launching the first getWeatherData: ' + e.toString());
        }       
    }
    
});