var socket = io();
var ColorPicker = new iro.ColorPicker("#color-picker-container", {
  // Set the size of the color picker UI
  width: 320,
  height: 320,
  // Set the initial color to red
  color: "#a0a0a0"
});


//Websocket senden rgb values an node js server

function sendRGB(r,g,b,m){

  console.log("sendRGB");

  socket.emit("valueR", r);    //Sendet Wert an Server
  socket.emit("valueG", g);    //Sendet Wert an Server
  socket.emit("valueB", b);    //Sendet Wert an Server
  socket.emit("mode", m)

  console.log("rgb emitted");
}

function getValueM(){ //Get a value from checkboxes



    var TV_val = document.getElementById("TV_checkbox").checked;
    var Desk_val = document.getElementById("desk_checkbox").checked;
    var Bed_val = document.getElementById("bed_checkbox").checked;

    if(TV_val == 0 && Desk_val == 0 && Bed_val == 0){
      m = 0;
    }else if(TV_val == 1 && Desk_val == 0 && Bed_val == 0){
      m = 1;
    }else if(TV_val == 0 && Desk_val == 0 && Bed_val == 1){
      m = 2;
    }else if(TV_val == 0 && Desk_val == 1 && Bed_val == 0){
      m = 3;
    }else if(TV_val == 1 && Desk_val == 0 && Bed_val == 1){
      m = 4;
    }else if(TV_val == 1 && Desk_val == 1 && Bed_val == 0){
      m = 5;
    }else if(TV_val == 0 && Desk_val == 1 && Bed_val == 1){
      m = 6;
    }else if(TV_val == 1 && Desk_val == 1 && Bed_val == 1){
      m = 7;
    }


    return m;

}

ColorPicker.on("color:change", function(color, changes) {
  // Log the color's hex RGB value to the dev console
  console.log("r: " + color.rgb.r + " g: " + color.rgb.g + " b: " + color.rgb.b);

  r = color.rgb.r;
  g = color.rgb.g;
  b = color.rgb.b;
  m = getValueM();

  console.log("m: ",m);

  sendRGB(r,g,b,m);
});




//socket.on("DB_angHum", function(data){

  //angHum = parseFloat(data);
  //document.getElementById("angHum").innerHTML = angHum.toFixed(2)+ "%";

//});
