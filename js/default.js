/* jshint esversion: 6 */

var BRANCH = "master";
var VERSION = "0.2.26";

const NUM_ENTRIES = 7;
const MAX_VENUES = 99;

var currentGameState;

var nextmajors = [];
var nextPlaceMajors = nextPlaceMajors();

var totalVisits = "undefined";

function nextPlaceMajors() {
    return {
    get: function() {
      DBinfo(["nextPlaceMajors: ",nextmajors]);
      //alert(JSON.stringify(nextmajors));
      return nextmajors;
    }
  };
}


var curGeoPt ={};
curGeoPt.lat = "none";
curGeoPt.long = "none";



window.onload = function() {
    disableCallouts();
    console.log("On Load");
    $('#allresult').hide();
    if(!DEBUG) {
      $('#debug_button').hide();
    }else {
      $("#debug_button").html(VERSION);
    }
    $('#event_button').hide();

    //getLocation();
    currentGameState = gameState.get();
    if(currentGameState.hasOwnProperty('pageState')){
      let page = currentGameState.pageState;
      if(page === "joined") {
        //getClosestVenues(NUM_ENTRIES);
        playerStateUpdated();
        $('#introPage').hide();
        $("#listPage").show();
      }
    }

    //fakeHotspotData();


    isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    console.log('is Chrome?', isChrome);
    if(isChrome){
      $('#debug_button').hide();

      $('#event_button').show().on('click',SimBeacons);
      //var showMap = function(){console.log("showMap() not available in browser");};
      // test geopts
      //10 stone st
      curGeoPt.lat = 40.70388;
      curGeoPt.long = -74.01206;
      // wall st court
      //curGeoPt.lat = 40.70554;
      //curGeoPt.long = -74.00799;
    }
    refreshVisits();


    $('#debug_button').hide();

    var cps = playerState.get();
    DBinfo(["playerState lat: ",cps.latitude," long: ",cps.longitude]);
    curGeoPt.lat = cps.latitude;
    curGeoPt.long = cps.longitude;
    DBinfo(["isDeveloper: ",cps.isDeveloper]);


    if(cps.isDeveloper){
      $('#debug_button').show();
    }



    getClosestVenues(NUM_ENTRIES);
};


function DBinfo(param) {
  if(DEBUG) {ShowInfo(param);}
  else{}
}



function gameStateUpdated() {
  //DBinfo(["gameStateUpdated called"]);
  var currentState = gameState.get();
  if(DEBUG){
    //DBinfo(["Displaying gameState"]);
    $('#gameDB').html(ShowProps(currentState));
  }
}



function currentPlaceStateUpdated() {
  var curMajor = "";
  var venueCount = 0;
  // Get the current States
  var currentState = gameState.get();
  var currentPlace = currentPlaceState.get();
  if(DEBUG){
    $("#debug_button").css("background-color","red");
    $('#placeDB').html(ShowProps(currentPlace));
  }

  if (currentState.hasOwnProperty("venueCount")) {
    venueCount = currentState.venueCount;
  }



  if(typeof currentPlace.major === "undefined"){
    DBinfo(["placeUpdated but major is undef"]);
  } else {
    curMajor = currentPlace.major;
    DBinfo(["curMajor is: ",curMajor]);

    var venueObj = venueList.find(function(elem) {
      return elem.m === curMajor;
    });
    //var venueObj = venueList[curMajor];
    if(typeof venueObj === "undefined"){
      DBinfo(["Major not in venue list"]);
    } else {
      console.log("calling incrementVisit");
      incrementVisit(curMajor);

      notificationObject.title = "BeaconCrawl Welcome";

      notificationObject.body = "Welcome to " + venueObj.name + "!";
      notificationObject.showInApp = false;
      // Fire the notification
      userNotificationUpdated();

      setUpWelcomeAlert(venueObj);

      if (currentState.locs === undefined){
        DBinfo(["locs array initialized"]);
        currentState.locs = [];
        var newLoc = {m: curMajor, v: 1};
        (currentState.locs).push(newLoc);
        venueCount = 1;

      } else {
        // look thru locs for this major
        var notFound = true;
        var locs = currentState.locs;
        for(var i = 0; i < locs.length; i++){
          if ((locs[i]).m === curMajor ){
            // increment the visits counter
            locs[i].v++;
            notFound = false;
            DBinfo(["incrementing visit in loc array"]);
          }
        }
          if(notFound){
            let newLoc = {m: curMajor, v: 1};
            (currentState.locs).push(newLoc);
            DBinfo(["making new entry in loc array"]);
            venueCount++;
          }
      }


    }



  }
  currentState.venueCount = venueCount;
  gameState.set(currentState);
  getClosestVenues(NUM_ENTRIES);


}

function startAdventure() {
  currentGameState.pageState = "joined";
  gameState.set(currentGameState);
  getClosestVenues(NUM_ENTRIES);
  $('#introPage').fadeOut("slow");
  $("#listPage").fadeIn("slow");

}



function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getClosestVenues(limit) {
  refreshVisits();
  currentGameState = gameState.get();
  if(typeof currentGameState.venueCount === "undefined"){
    DBinfo(["venueCount is undefined"]);
  } else {
    DBinfo(["venueCount = ", currentGameState.venueCount]);
    $("#visitCount").text(currentGameState.venueCount);
    $("#unvisitCount").text(MAX_VENUES - currentGameState.venueCount);

  }
  var locs = "null";
  if(currentGameState.hasOwnProperty("locs")){
    //DBinfo(["state has locs"]);
    locs = currentGameState.locs;
  }

  DBinfo(["totalVisits: ",totalVisits]);
  if(totalVisits === "undefined"){
    DBinfo(["using fake hotspot data"]);
    fakeHotspotData();
  }else if ($.isNumeric(totalVisits)) {
    DBinfo(["using parse hotspot data"]);
    getHotspotData();
  }else {
    DBinfo(["totalVisits is an odd value"]);
  }

  for(let i = 0;i<venueList.length;i++){
    var pt = (venueList[i]).geoPt;
    (venueList[i]).dist = getDistanceFromLatLonInKm(curGeoPt.lat,curGeoPt.long,pt.lat,pt.long);
  }
  var sorted = venueList.sort(function(obj1, obj2) {
	// Ascending: first age less than the previous
	return obj1.dist - obj2.dist;
});
$("#venueList").empty();
//console.log(sorted);
for(let i = 0; i<limit;i++){
  // put the venues in the list
  //icon
  var thisEntry = sorted[i];
  console.log(thisEntry);
  //DBinfo(["entry major ",thisEntry.m]);

  var venueIcon = $('<div/>', {
    class: 'venueIcon circle',
    });
    var venueName = $('<div/>', {
      class: 'venueName',
      text: (sorted[i]).name,
        });
    var hotspotIcon = $('<div/>', {
      class: 'hotspotIcon',
        });
    var hotspotFrame = $('<div/>', {
      class: 'hotspotFrame',
        });
    var hotspotRing = $('<div/>', {
      class: 'ring',
        });
    var hotspotDot = $('<div/>', {
      class: 'dot',
        });

  var venueEntry = $('<div/>', {
    class: 'venueEntry',
  });
  //console.log(venueEntry);
  $(venueEntry).append(venueIcon);
  $(venueEntry).append(venueName);
  $(venueEntry).append(hotspotIcon);

  let pop = sorted[i].p;
  console.log("POP " + pop);


  $(hotspotIcon).append(hotspotFrame);
  $(hotspotFrame).append(hotspotDot);
  if(pop === 1){
    $(hotspotFrame).append(hotspotRing);
    $(hotspotDot).css("background-color","green");
  }
  if(pop === 2){
    $(hotspotFrame).append(hotspotRing);
    $(hotspotRing).css("border-color","green");
    $(hotspotDot).css("background-color","green");
  }
  $('#venueList').append(venueEntry);
  $(venueEntry).click(function(){ setupDetailsPage(sorted[i]); });
  var logoImage = "url(images/logos/noLogo.png)";
  if((sorted[i]).hasOwnProperty("l")){
    logoImage = "url(images/logos/" + (sorted[i]).l + ")";
  }
  $(venueIcon).css("background-size","100%").css("background-image",logoImage);
  if(pop)
  //$("venueName").on("setupDetailsPage(sorted[i])");
  //DBinfo(["checking loc list"]);
  if(locs !== "null"){
    //DBinfo(["found Locs"]);
    for(let i = 0; i < locs.length; i++) {
      //DBinfo(["loc m: ", locs[i].m,]);
      if (locs[i].m == thisEntry.m) {
        DBinfo(["found match in <b>locs</b> ",thisEntry.m," and ",locs[i].m ]);
        $(venueName).css("color","green");
        break;
      }
    }
  }

  }
}


function playerStateUpdated() {
  DBinfo(["playerStateUpdated()"]);
  var currentPlayerState = playerState.get();
  curGeoPt.lat = currentPlayerState.latitude;
  curGeoPt.long = currentPlayerState.longitude;
  $("#info").html("<p>PLAYER - Lat: " + curGeoPt.lat +
  "</p><p>Long: " + curGeoPt.long + "</p>");
  DBinfo(["lat: ",curGeoPt.lat," long: ",curGeoPt.long]);
  getClosestVenues(NUM_ENTRIES);
}

function setupDetailsPage(venueObj){
    nextmajors = [parseInt(venueObj.m,10)];
  console.log(nextmajors);
  DBinfo(["set nextmajors to: ", nextmajors]);
  //var mm = nextPlaceMajors.get();
  //alert("npm " + JSON.stringify(mm));

  $("#detailName").html(venueObj.name);
  let infoHtml = "<div>" + venueObj.addr + "</div> <div>New York, NY " + venueObj.zip;
  infoHtml += "</div><div>" + venueObj.phone + "</div>";
  if(venueObj.hasOwnProperty("v")){
    infoHtml += "<div>Total Visits: " + venueObj.v + "</div>";
  }
  $("#detailInfo").html(infoHtml);
  $('#detailLogo img').attr('src',"images/logos/" + venueObj.l);
  $("#listPage").fadeOut("slow");
  $("#detailsPage").fadeIn("slow");
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// we add a value p in the range 0-2 to represent
// three hotspot icon appearances
// the fake and real ones have different biases

function fakeHotspotData(){
  for(let i = 0; i < venueList.length; i++){
    if(venueList[i].hasOwnProperty("p")){
      // fake changing data
      let rnd = Math.random();
      if (rnd> 0.8) { venueList[i].p += 1;}
      if (rnd< 0.2) { venueList[i].p -= 1;}
    } else {
      venueList[i].p = 0;
      let rnd = Math.random();
      if (rnd> 0.5) { venueList[i].p = 1;}
      if (rnd> 0.8) { venueList[i].p = 2;}

    }
  }
}

function getHotspotData(){
for(let i = 0; i < venueList.length; i++){
  if(venueList[i].hasOwnProperty("v")){
    //venueList[i].p = hotspotValuebyPct(venueList[i].v);
    venueList[i].p = hotspotValuebyVisits(venueList[i].v);
  } else {
    DBinfo(["getHotspotData: no visits property"]);
  }
}

}

function hotspotValuebyPct(visits){
  var result = 0;
  let pct = (visits/totalVisits);
  if (pct > 0.2 ) { result = 1;}
  if (pct > 0.5 ) { result = 2;}
  return result;
}

function hotspotValuebyVisits(visits){
  var result = 0;
  if (visits > 3 )  { result = 1;}
  if (visits > 10 ) { result = 2;}
  return result;
}



function setUpWelcomeAlert(venueObj){
  $("#welcomeInfo").html("<div>Welcome to " + venueObj.name + " !</div> " );
  $('#welcomeLogo img').attr('src',"images/logos/" + venueObj.l);
  $("#listPage").fadeOut("slow");
  $("#welcomeAlert").fadeIn("slow");

}

function backToMain() {
  getClosestVenues(NUM_ENTRIES);
  $(".appPage").fadeOut("slow");

  $("#listPage").fadeIn("slow");
}

function resetState() {
  gameState.set('');
  gameState.get();
  $('.appPage').hide();
  $('#introPage').show();


}

/* Parse-related functions
*/

function getHotspot(major) {
    let majorIsNumber = (typeof major === 'number');
    if( !majorIsNumber ){
      major = parseInt(major,10);
    }
    var promise = new Parse.Promise();
    var hs = Parse.Object.extend("HotSpots");
    var query = new Parse.Query(hs);
    query.equalTo("major",major);
    query.first().then(function(result){
        if(result){
            // If result was defined, the object with this objectID was found
            promise.resolve(result);
        } else {
            console.log("major: " + major + " was not found");
            promise.resolve(null);
        }
    }, function(error){
            DBinfo(["Error searching for hotspot with id: ",major," Error: ",error]);
            promise.error(error);
    });
    return promise;
}

function refreshVisits(){

  var hotSpots = Parse.Object.extend("HotSpots");
  var query = new Parse.Query(hotSpots);

  query.find({
    success: function(results) {
      totalVisits = 0;
    // Successfully retrieved the object.
      for(var i in results){
        // add visit property to each venue in list by major
        var record = results[i];
        var major = record.get("major");
        var name = record.get("name");
        var visits = record.get("visits");
        totalVisits += visits;
        console.log("refreshVisits --> " + name + " visits: " + visits);
        (getVenueByMajor(major.toString())).v = visits;
        //console.log(index);

        //venue.v = visits;
    }
    DBinfo(["refreshVisits() ended totalVisists: ",totalVisists]);
    getHotspotData();

  },
  error: function(error) {
    DBinfo(["Error: ",error.code," ",error.message]);
  }
  });

}

function getVenueByMajor(major){
  var index = venueList.findIndex(function(elem) { return elem.m === major; });
  return venueList[index];
}

function incrementVisit(major){
  let nmajor = parseInt(major,10);
  DBinfo(["incrementVisit() for major:",nmajor]);
  getHotspot(nmajor).then(function(result){
    if(result){
      let visits = result.get("visits");
      visits++;
      result.set("visits",visits);
      result.save();
      DBinfo(["visit count for ",nmajor, " incremented"]);
    }
  });
}






/*
 * Impement this method when using native maps for directions to next place
 *
*/



function setupShareObject() {
    shareObject.title = "I'm doing the Hamiltour In Lower Manhattan";
    shareObject.body = "Interested in joining Hamiltour?\nIt's an hour long interactive tour to learn more about Alexander Hamilton, George Washington and important historical landmarks in Lower Manhattan.";
    shareObject.imagePath = "images/tourAsk_AH_plus_long.jpg";
    shareObject.url = "https://itunes.apple.com/us/app/beaconcrawl/id857854877?mt=8";
    shareObject.htmlPath = "html/email.html";
}


function getBeacons() {
    return beacons;
}

var beacons = [
               {major: 104, minors: [1]},
               {major: 126, minors: [1]},
               {major: 1053, minors: [1]},

];
