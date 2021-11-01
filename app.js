const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const port = 8080;
var can = require('socketcan');


var channel = can.createRawChannel("vcan0");
channel.start();
var data;

//extract keys from the JSON object
/*
var keys = Object.keys(obj);
for (var i = 0; i < keys.length; i++) {
  console.log(obj[keys[i]]);
}
*/



// MQTT subscriber
// MQTT subscriber
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://192.168.178.20:1234')
var topic = 'car_info'

client.on('message', (topic, message)=>{
    data = message;
    message = message.toString()   
    console.log(message)
    const messages = message.split('\n');
    fs.writeFileSync('data/car_info.json', messages[0]);
    fs.writeFileSync('data/canmessages.json', messages[1]);
    var can_message = JSON.parse(messages[1]);
  
 
  for (var i = 0; i < can_message.length; i++){
    console.log(can_message[i])
    var value = Object.values(can_message[i]);
    console.log(value);
    var buffer = Buffer.from(value[1]);
    
    // Send a CAN message in EFF
    channel.send({ id: value[0],
                   ext: true,
                   data: buffer});
    
  }

})

client.on('connect', ()=>{
    client.subscribe(topic)
})


//set the view
app.set('views',__dirname+'/views');
app.set('view engine','ejs');

//return the index page with send html page
app.get('/', (req, res) => {
    res.render('index');
   });



app.listen(port, () => {
  console.log(`Server running on port${port}`);
});