mean-weather-app
================

A front-end for displaying weather from the mean weather server, a particularly mean server that spits out bad data


Assumptions
================
- temperature given was in degrees fahrenheit, because this is "AMURICA" and we don't use the metric system
- User will only be access this web page in one location/browser on their machine/IP address. This seems reasonable to me.
- Back end data will not change; tried to future proof this as much as possible, but if there are significant revisions to the data it would require revisions on the front end (as always)

Notes
================
- for debug mode, append query string 'debug=true' to the URL
- Made the decision to always wait 5.1 seconds before calling the server again to avoid any issues with the too many requests piece. I don't feel this is a cop out because in the real world the weather system would not update that frequently. The place where this causes pain is on load, however.

Possible Improvements
================
- better handling of polling: instead of always waiting the 'safe' amount of time, listen and handle too many request errors from the server, to reduce wait time. This would be especially important on the first run, as sometimes the server will be super mean and not return a proper response for some time.
- push updates (would require server modifications)
- Unit test cases
