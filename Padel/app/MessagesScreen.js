import React, { useState, useEffect, useCallback } from "react";
import f from "../database/firebase";
import { StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GiftedChat } from "react-native-gifted-chat";

function readName() {
  return new Promise((result) => {
    var name;
    const user = f.firebase.auth().currentUser;
    f.firebase
      .database()
      .ref("Users/")
      .once("value", function (results) {
        var resu = results.val();
        for (const res in resu) {
          if (user.uid == res) {
            name = resu[res].name;
            result(name);
          }
        }
      });
  });
}

function readProfilePic() {
  return new Promise((result) => {
    const user = f.firebase.auth().currentUser;
    let imageRef = f.firebase.storage().ref("/" + user.uid + "/profilepic.png");
    imageRef
      .getDownloadURL()
      .then((url) => {
        result(url);
      })
      .catch(() => {
        imageRef = f.firebase.storage().ref("/noimage.jpg");
        imageRef.getDownloadURL().then((url) => {
          result(url);
        });
      });
  });
}

async function asyncCall() {
  const name = await readName();
  const photo = await readProfilePic();
  return { name: name, photo: photo };
}

function MessagesScreen({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState({
    name: "",
    photo: "",
  });

  function getPath() {
    return new Promise((resolvePath) => {
      f.firebase
        .database()
        .ref("/Messages/")
        .once("value", (result) => {
          const resu = result.val();
          for (const res in resu) {
            if (
              route.params.firstuser == resu[res].first_user &&
              route.params.seconduser == resu[res].second_user
            ) {
              resolvePath(res);
            }
          }
        });
    });
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert(
            "La aplicación necesita permisos para poder obtener la foto de perfil."
          );
        }
      }
    })();

    // LEER LOS DATOS

    async function readMsg() {
      const path = await getPath();
      f.firebase
        .database()
        .ref("/Messages/" + path + "/msg/")
        .on("value", (result) => {
          const resu = result.val();
          let messages = [];
          for (const res in resu) {
            let message = {
              _id: res,
              text: resu[res].text,
              createdAt: resu[res].createdAt,
              user: {
                _id: resu[res].user._id,
                name: resu[res].user.name,
              },
            };
            messages.push(message);
          }
          setMessages(messages.reverse());
        });
    }
    readMsg();
  }, []);

  // ESCRIBIR LOS DATOS
  const onSend = useCallback((messages = []) => {
    const user = f.firebase.auth().currentUser;
    const text = messages[0].text;

    async function sendMsg() {
      const path = await getPath();
      f.firebase
        .database()
        .ref("/Messages/" + path + "/msg/")
        .push({
          _id: user.uid,
          text: text,
          createdAt: new Date().getTime(),
          user: {
            _id: user.uid,
            name: route.params.ownName,
          },
        });
     
    }
    sendMsg();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mainWindow}>
        <View style={styles.window}>
          <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            user={{
              _id: route.params.ownID,
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    position: "relative",
  },
  mainWindow: {
    flex: 8.5,
    backgroundColor: "white",
  },
  window: {
    marginTop: 5,
    flex: 1,
  },
});

export default MessagesScreen;
