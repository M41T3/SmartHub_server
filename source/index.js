var express = require('express');
var app = express();
var io = require('socket.io')(app.listen(8080));
var SerialPort = require('serialport');
var mqtt = require('mqtt');
var r,g,b,m;

var buffer = new Buffer(4);
buffer[0] = 0;
buffer[1] = 0;
buffer[2] = 0;
buffer[3] = 0;



var com = new SerialPort("/dev/ttyUSB0", {
    baudRate: 115200,
    databits: 8,
    parity: 'none'
}, false);


var MQTT_ADDR           = "mqtt://127.0.0.1";   //MQTT-Broker
var MQTT_PORT           = 1883;

var mqttClient  = mqtt.connect(MQTT_ADDR,{clientId: 'SMARTHUB', protocolId: 'MQIsdp', protocolVersion: 3, connectTimeout:1000, debug:true});

//Verwaltung der MQTT-Subscribtions:
mqttClient.on('connect', function () {
    mqttClient.subscribe("MQTT-ESP-DESK/aliveRes");
    mqttClient.subscribe("MQTT-ESP-BED/aliveRes");
    mqttClient.subscribe("MQTT-ESP-DESK/LEDres");
    mqttClient.subscribe("MQTT-ESP-BED/LEDres");
});

//Alive-Request für Systemstart
console.log("[SMARTHUB] Send alive-Request to MQTT-Clients");
mqttClient.publish("MQTT-ESP-DESK/alive", "alive");
mqttClient.publish("MQTT-ESP-BED/alive", "alive");



// MQTT-Daten Eingang
mqttClient.on('message', function (topic, message) {

  switch(topic){
    case 'MQTT-ESP-DESK/aliveRes':
      console.log("[MQTT-ESP-DESK] alive!")
      io.emit("MQTT-ESP-DESK/aliveRes", "1");
      break;
    case 'MQTT-ESP-BED/aliveRes':
      console.log("[MQTT-ESP-BED] alive!")
      io.emit("MQTT-ESP-BED/aliveRes", "1");
      break;
    case 'MQTT-ESP-DESK/LEDres':
      console.log("[MQTT-ESP-DESK] ok!"); //debug
  }

});

function selectClients(){


  buffer[0] = r;
  buffer[1] = g;
  buffer[2] = b;
  buffer[3] = m;

  console.log("[SMARTHUB] Created buffer", buffer);

  /*
  Mode: 2^3
  0000 0000 all off (no message)
  0000 0001 TV(Arduino)
  0000 0010 Bed(MQTT-ESP-Bed)
  0000 0011 Desk(MQTT-ESP-Desk)
  0000 0100 TV + Bed
  0000 0101 TV + Desk
  0000 0110 Bed + Desk
  0000 0111 TV + Bed + Desk
  	*/


  switch(buffer[3]){
    case 00:
      break;
    case 01:
      sendTV();
      break;
    case 02:
      sendBed();
      break;
    case 03:
      sendDesk();
      break;
    case 04:
      sendTV();
      sendBed();
      break;
    case 05:
      sendTV();
      sendDesk();
      break;
    case 06:
      sendBed();
      sendDesk();
      break;
    case 07:
      sendTV();
      sendDesk();
      sendBed();
      break;
  }

}

function sendTV(){  //Arduino

  com.write(buffer, function (err, result) {
      if (err) {
          console.log('Error while sending message : ' + err);
      }
      if (result) {
          console.log('Response received after sending message : ' + result);
      }
  });
  console.log("[SMARTHUB] Shipped to Arduino!");
}

function sendDesk(){
  console.log("[SMARTHUB] Send buffer to MQTT-ESP-DESK"); //DEBUG until MQTT works

  mqttClient.publish("MQTT-ESP-DESK/LED", r + "," + g + "," + b);

}

function sendBed(){
  console.log("[SMARTHUB] Send buffer to MQTT-ESP-BED"); //DEBUG until MQTT works
}

app.use(express.static(__dirname + '/app'));

console.log('[SMARTHUB] Setting up server @8080');
console.log('[SMARTHUB] Ready..');

//HTML-Datei, die an Client gesendet wird

app.get('/', function (res) {
    res.sendFile('/index.html')
});


com.open(function () {




io.on('connection', function (socket) {       //Wenn Client Webserver abruft

    console.log('[SMARTHUB] Someone conected to server');

    socket.on("valueR", function(data){
      r = data;
      console.log("[Webclient] r: ", r);
    });

    socket.on("valueG", function(data){
      g = data;
      console.log("[Webclient] g: ", g);
    });

    socket.on("valueB", function(data){
      b = data;
      console.log("[Webclient] b: ", b);
    });

    socket.on("mode", function(data){
      m = data;
      console.log("[Webclient] m: ", m);
      selectClients();
    });

    socket.on("app_connected", function(data){  //connection to android app
      console.log(data);
      socket.emit("welcome_client", true);
    });

    socket.on("app_disconnected", function(data){ //connection to android app
      console.log(data);
    });

});

com.on('data', function(data) {   //incomming arduino
        console.log("[ARDUINO] " + data.toString("ascii"));
  });

});
