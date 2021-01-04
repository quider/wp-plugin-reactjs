import React from 'react';
import {addResponseMessage, addUserMessage, deleteMessages, Widget} from 'react-chat-widget';
import {$msg, $pres, Strophe} from 'strophe.js';
import 'react-chat-widget/lib/styles.css';

let connection = null

/**
 * sends presence to server
 * @param connection - ready coonnection is required
 */
function sendPresence(connection) {
  let pres = $pres().tree();
  // console.log(pres)
  connection.send(pres);
}

/**
 * Fired when message arrives to page.
 * @param msg received message
 * @returns {boolean} unfortunately it always need to return true.
 */
function onMessage(msg) {
  console.log(msg)
  var elems = msg.getElementsByTagName('body');
  if (elems.length < 1) {
    return true;
  }
  var body = elems[0];
  let text = Strophe.getText(body);
  console.log(text);
  addResponseMessage(text);
  return true;
}

function prepareMessageToSend(to, from, type, message) {
  return $msg({
    to: to,
    from: from,
    type: type,
  }).c("body").t(message);
}

function App() {
  if (connection == null) {
    connection = new Strophe.Connection("http://adriankozlowski.pl:7070/http-bind/", {})
    connection.connect('anonymous', '', onConnect);
    connection.addHandler(onMessage, null, 'message', "chat", null, null);
  }

  const handleNewUserMessage = (newMessage) => {
    let reply = prepareMessageToSend('admin@adriankozlowski.pl', connection.jid, "chat", newMessage)
    connection.send(reply.tree());
    // console.log(reply.tree())
  };

  return (
      <div className="App">
        <Widget
            handleNewUserMessage={handleNewUserMessage}
            senderPlaceHolder={"Wpisz wiadomość"}
            title="Buathaimassage"
            subtitle="Służymy pomocą"
        />
      </div>
  );
}

function onConnect(status) {
  if (status == Strophe.Status.CONNECTING) {
    console.log('Strophe is connecting.');
    addUserMessage("Łączenie...", "1");
  } else if (status == Strophe.Status.CONNFAIL) {
    console.log('Strophe failed to connect.');
    deleteMessages(1, "1");
    addUserMessage("Nie udało się połączyć", "2");
  } else if (status == Strophe.Status.DISCONNECTING) {
    console.log('Strophe is disconnecting.');
  } else if (status == Strophe.Status.DISCONNECTED) {
    console.log('Strophe is disconnected.');
  } else if (status == Strophe.Status.CONNECTED) {
    console.log('Strophe is connected.');
    deleteMessages(1, "1");
    addResponseMessage("Połączono", "3");
    connection.send($pres().tree());
    console.log("sent presence");
  }

}

export default App;