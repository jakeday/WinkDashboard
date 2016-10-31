#Wink Dashboard
#####Web based solution to control your smart devices connected to you Wink Hub.

Feeling let down by the Wink Relay product? Don't feel like pulling your phone out all the time for smart home control? Wish you could just open a web page and control them? Maybe from a Raspberry Pi? Now you can!

![alt text](https://s22.postimg.org/tnhp66tcx/Wink_Dashboard.png "Wink Dashboard")

* * *

### Configuring your Wink Dashboard

Open `js/config.js` and put in your Wink username/email and password:

```javascript
/* WINK CREDENTIALS */
var wink_username = "";
var wink_password = "";

/* USE WITH WEATHER */
var enable_weather = false;
var weather_path = "";
```

If you happen to be running my Pi Btc Weather Clock (https://github.com/jakeday/pi-btc-weather-clock), you can turn on the built in link!

## Credit

Project is a cleaned up, slimmed down, and enhanced version of WinkPost (https://github.com/davidgruhin/WinkPost).

Bitcoin donations appreciated! 1JkpbAJ41W6SUjH9vCRDpHNNpecjPK3Zid
