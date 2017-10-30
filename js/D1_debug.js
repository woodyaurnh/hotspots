/* jshint esversion: 6 */

var DEBUG = true;


function DebugToggle(elem){
  $("#debug_button").css("background-color","green");
  let id = $(elem).attr('id');
  if(id === 'debug_button') $("#allresult").show();
  if(id === 'allresult') $("#debug_button").show();
  $(elem).hide();
}

// utility function
function ShowProps(obj){
  var str = "";
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if(Array.isArray(val)){
        str += "<p><b>"+ key + "</b><p>\n";
        for(var i = 0; i < val.length; i++){
          str += "<p>";
          for(var akey in val[i]) {
                if((val[i]).hasOwnProperty(akey)) {
                str  += akey + ": <b>" + (val[i])[akey] + "</b> ";
              }
            }
          str += "</p>\n";

          }
        } else {
        str  += "<p>" + key + ": <b>" + val + "</b></p>\n";
      }
    }
}
  console.log(str);
  return str;
}

function ShowInfo(textArray) {
  let len = textArray.length;
  if(len > 0){
    let str = "<p>";
    let cstr = "";
    for(var i = 0; i < len; i++){
      str = str + textArray[i] + " ";
      cstr = cstr + textArray[i] + " ";
    }
    str = str + "</p>";
    console.log(cstr);
    $("#allresult #infoDB").append(str);
  }

}

var simPlacesCount = 0;

function SimBeacons(){
  console.log("SimBeacons called");
  //var simBs = ['A263C265-64B1-4A7B-B24E-957575A44472','58E12B94-DBAF-4F10-A05C-35420DD735FD','40871CE9-736A-43F6-B505-12A7870C0A71'];
  var simPlaces = [{name: "121 Fulton", major: "148"},
      {name: "bavaria", major: "106"},
      {name: "murphys", major: "108"},
      {name: "art bar", major: "137"},
  ];
  if(simPlaces[simPlacesCount]){
    //simulate a beacon discovery
    currentPlaceState.set(simPlaces[simPlacesCount]);
    simPlacesCount++;
  } else {
    console.log("No more Sim Places in array");
  }
}
