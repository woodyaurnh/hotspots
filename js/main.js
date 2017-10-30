/* jshint esversion: 6 */
/*
 * main.js
 *
 * District 1.0
 *
 */

/*
 * Disable Callouts
 */

function disableCallouts() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerText = '*:not(input):not(textarea) { -webkit-user-select: none; -webkit-touch-callout: none; }';
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
}


/*
 * Share Object
 *
*/


// function to allow on-click
function share() {}

var shareObject =
{
title: 'Title',
body: 'Body',
imagePath: '',
url: '',
htmlPath: ''
};

/*
 * Notification Object
 *
 * Store in the webview the current Notification to fire. The navtive app will query this value before fireing.
 *
 *
*/

function userNotificationUpdated() {}

var notificationObject =
{
title: 'Title',
subTitle: 'SubTitle',
body: 'Body',
timeInterval: 0.1,
repeats: false,
sound: 'default',
image: 'default',
showInApp: false
};

function takePhoto() {}

/*
 * User
 *
 * The current User's ID and Display Name.
 *
*/


var defaultPlayer =
{
playerDisplayName: '',
latitude: '',
longitude: '',
placeName: '',
beaconName: ''

};

function globalPlayerState() {
    var closure;
    return {
    get: function() {
        return jQuery.extend(true, {}, closure);  //performs a deep copy to pass object by value
    },
    set: function(object) {
        newValue = JSON.stringify(object);
        oldValue = JSON.stringify(closure);
        if (newValue != oldValue) {
            closure = object;
            playerStateUpdated();
        }
    }
  };
}

var playerState = globalPlayerState();



/*
 * CurrentPlaceState
 *
 * Store in the webview the Player's PlaceState
 *
 * Uses: currentPlaceState.set({'placeID' : XXX });, currentPlaceState.get()
 *
 * A dictionary of representing the current place.
 */

var defaultPlace =
{
placeName: 'Fraunces Tavern',
placeID: '5229721F-3F7B-4685-95DA-10FF6FB46DBF',
city: '',
state: '',
zip: '',
accuracy: 30,
currentDistance: 0,
descriptiveText: '',
favorite: true,
imageSmall: '',
latitude: 0,
longitude: 0,
major: 0,
tags: ''
};

var currentPlaceState = globalCurrentPlaceState();

function globalCurrentPlaceState() {
    var closure;
    return {
    get: function() {
        return jQuery.extend(true, {}, closure);  //performs a deep copy to pass object by value
    },
    set: function(object) {
        newValue = JSON.stringify(object);
        oldValue = JSON.stringify(closure);
        if (newValue != oldValue) {
            closure = object;
            currentPlaceStateUpdated();
        }
    }
  };
}

/*
 * BeaconState
 *
 * Store in the webview the Player's BeaconState
 *
 * Uses: beaconState({'beaconID' : XXX });, beaconState.get()
 *
 * A dictionary of representing the current beacon.
*/

var beaconState = globalBeaconState();

var defaultBeacon =
{
beaconName: 'Beacon 1',
beaconID: 'E3A42479-6D11-4CBC-9BF8-869F511A9F0F'
};

function globalBeaconState() {
    var closure;
    return {
    get: function() {
        return jQuery.extend(true, {}, closure);  //performs a deep copy to pass object by value
    },
    set: function(object) {
        closure = object;
        beaconStateUpdated();
    }
  };
}


/*
 * GameState
 * Store in the webview the Game's Data
 *
 * the GameState is a json serialized blob that can be used by the web archive to store its internal state
 *
 */

var gameState = globalGameState();


function globalGameState() {
    var closure;
    return {
    get: function() {
        return jQuery.extend(true, {}, closure);  //performs a deep copy to pass object by value
    },
    set: function(object) {
        newValue = JSON.stringify(object);
        oldValue = JSON.stringify(closure);
        if (newValue != oldValue) {
            closure = object;
            gameStateUpdated();
        }
    }
  };
}


/* Helper Functions */

function paginateText(text) {
  var clueString = "";
  for(var i = 0; i < text.length;i++){
    if(i === 0){
      // first line, do leading capital
      var initialChar = (text[i]).charAt(0);
      var followingText = (text[i]).substring(1);
      console.log("clue first line: " + initialChar + " followed by " + followingText);
      clueString = clueString + "<span class='leading'>" + initialChar + "</span>" + followingText + "<br>";
    }
    else {
      clueString = clueString +  text[i] + "<br> ";
    }
  }
  return clueString;
}

var special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}
