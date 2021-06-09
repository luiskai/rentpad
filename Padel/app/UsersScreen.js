import React from "react";
import f from "../database/firebase";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { SearchBar } from "react-native-elements";
import Modal from "react-native-modal";
import { Button } from "react-native-elements";
import { RefreshControl } from "react-native";

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableHighlight,
  Alert,
} from "react-native";
import LoadingComponent from "./LoadingComponent";

export default class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      error: null,
      photos: "",
      search: "",
      selectedId: "",
      isModalVisible: false,
      username: "",
      userpic: "",
      userid: "",
      ownusername: "",
      refreshing: false,
    };
    this.arrayholder = [];
  }

  getNames() {
    return new Promise((result) => {
      var names = [];
      f.firebase
        .database()
        .ref("Users/")
        .once("value", function (results) {
          var resu = results.val();
          for (const res in resu) {
            //EL RES ES EL UID DE CADA USUARIO
            names.push({ id: res, title: resu[res].name });
          }
          result(names);
        });
    });
  }

  getOwnName() {
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

  async getOwnNameAsync() {
    const ownName = await this.getOwnName();
    return { ownName: ownName };
  }

  getPhotos(names) {
    return new Promise((result) => {
      var photos = [];
      var usersProcessed = 0;

      names.forEach((user, index, array) => {
        let imageRef = f.firebase
          .storage()
          .ref("/" + user.id + "/profilepic.png");
        imageRef
          .getDownloadURL()
          .then((url) => {
            usersProcessed++;
            photos.push({ id: user.id, image: url });
            if (usersProcessed === array.length) {
              result(photos);
            }
          })
          .catch(() => {
            usersProcessed++;
            imageRef = f.firebase.storage().ref("/noimage.jpg");
            imageRef.getDownloadURL().then((url) => {
              photos.push({ id: user.id, image: url });
              if (usersProcessed === array.length) {
                result(photos);
              }
            });
          });
      });
    });
  }

  getUserPic(id) {
    return new Promise((result) => {
      for (const photo in this.state.photos) {
        if (this.state.photos[photo].id == id) {
          result(this.state.photos[photo].image);
        }
      }
    });
  }

  componentDidMount() {
    this.asyncCall().then((res) => {
      this.arrayholder = res.names;
      this.setState({ ...this.state, data: res.names, photos: res.photos });
    });
    this.getOwnNameAsync().then((res) => {
      this.setState({ ...this.state, ownusername: res.ownName });
    });
  }

  async asyncCall() {
    const names = await this.getNames();
    const photos = await this.getPhotos(names);
    return { names, photos };
  }

  searchFilterFunction = (text) => {
    const newData = this.arrayholder.filter((item) => {
      const itemData = `${item.title.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({ data: newData });
    this.setState({ search: text });
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "5%",
        }}
      />
    );
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  addFriend = () => {
    const user = f.firebase.auth().currentUser;
    // COMPROBACION DE QUE NO SEAN AMIGOS YA
    f.firebase
      .database()
      .ref("/Users/" + user.uid + "/Friends/")
      .once("value", (result) => {
        const resu = result.val();
        for (const res in resu) {
          // ESTO RECORRE TODOS LOS ID DE FRIENDS PARA COMPROBAR SI YA SON AMIGOS
          if (resu[res].id == this.state.userid) {
            Alert.alert(
              "",
              "Tu y " + this.state.username + " ya sois amigos.",
              [
                {
                  text: "Cerrar",
                  onPress: () =>
                    this.setState({
                      isModalVisible: !this.state.isModalVisible,
                    }),
                  style: "cancel",
                },
              ]
            );
            return;
          }
        }
        f.firebase
          .database()
          .ref("/Users/" + user.uid + "/Friends")
          .push({
            id: this.state.userid,
            name: this.state.username,
          })
          .then((data) => {
            f.firebase
              .database()
              .ref("/Users/" + this.state.userid + "/Friends")
              .push({
                id: user.uid,
                name: this.state.ownusername,
              })
              .then((data) => {
                //console.log("HECHO");
              })
              .catch((error) => {
                console.log("ERROR");
              });
          })
          .catch((error) => {
            console.log("ERROR");
          });
      });
  };

  newConversation = () => {
    return new Promise((resultPromise) => {
      // RETORNARA:
      // 1 SI HAY QUE CREAR UNA NUEVA SALA
      // 2 SI YA ESTÁ CREADA
      // 3 SI LA SALA ESTÁ CREADA POR EL OTRO USUARIO
      const user = f.firebase.auth().currentUser;
      let returnedResult = {
        id: 1,
        initial_user: user.uid,
      };
      // COMPROBACION DE QUE NO HAYA UN CHAT ABIERTO YA
      f.firebase
        .database()
        .ref("/Messages/")
        .once("value", (result) => {
          const resu = result.val();

          for (const res in resu) {
            // AQUI ENTRARA SI EL USUARIO CONECTADO ES first_user Y YA ESTA CREADA LA SALA
            if (
              resu[res].first_user == user.uid &&
              resu[res].second_user == this.state.userid
            ) {
              returnedResult = {
                id: 2,
                initial_user: user.uid,
              };
            }

            // AQUI ENTRA SI EL USUARIO CONECTADO ES second_user Y YA ESTA CREADA LA SALA
            if (
              resu[res].second_user == user.uid &&
              resu[res].first_user == this.state.userid
            ) {
              resultPromise({
                id: 3,
                initial_user: resu[res].first_user,
              });
            }
          }
          resultPromise(returnedResult);
        });
    });
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.asyncCall().then((res) => {
      this.arrayholder = res.names;
      this.setState({ ...this.state, data: res.names, photos: res.photos });
      this.setState({ refreshing: false });
    });
  };

  newConversationAsync = async () => {
    const user = f.firebase.auth().currentUser;
    const returned = await this.newConversation();
    if (returned.id == 1) {
      f.firebase
        .database()
        .ref("/Messages/")
        .push({
          first_user: user.uid,
          second_user: this.state.userid,
          second_user_name: this.state.username,
        })
        .then((res) => {
          this.toggleModal();
          this.props.navigation.navigate("Mensajes", {
            firstuser: returned.initial_user,
            seconduser: this.state.userid,
            labelName: this.state.username,
            ownID: user.uid,
            ownName: this.state.ownusername,
          });
        });
    } else {
      if (returned.id == 2) {
        this.toggleModal();
        this.props.navigation.navigate("Mensajes", {
          firstuser: returned.initial_user,
          seconduser: this.state.userid,
          labelName: this.state.username,
          ownID: user.uid,
          ownName: this.state.ownusername,
        });
      }
      if (returned.id == 3) {
        this.toggleModal();
        this.props.navigation.navigate("Mensajes", {
          firstuser: returned.initial_user,
          seconduser: user.uid,
          labelName: this.state.username,
          ownID: user.uid,
          ownName: this.state.ownusername,
        });
      }
    }
  };

  render() {
    const Item = ({ item }) => (
      <View>
        {this.state.photos.map((photo) => {
          const user = f.firebase.auth().currentUser;
          if (user.uid != item.id) {
            if (photo.id == item.id) {
              return (
                <TouchableHighlight
                  onPress={(event) => {
                    this.toggleModal();
                    this.setState({ username: item.title, userid: item.id });
                    this.getUserPic(item.id).then((userpic) => {
                      this.setState({ userpic: userpic });
                    });
                  }}
                  key={item.id}
                  activeOpacity={1}
                  underlayColor="#DDDDDD"
                >
                  <View style={[styles.item]}>
                    <Image
                      style={styles.photoCard}
                      source={{
                        uri: photo.image,
                        cache: "force-cache",
                      }}
                    />
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                </TouchableHighlight>
              );
            }
          }
        })}
      </View>
    );

    const renderItem = ({ item }) => {
      return <Item item={item} />;
    };
    if (this.state.data.length == 0) {
      return <LoadingComponent></LoadingComponent>;
    } else {
      return (
        <View style={styles.container}>
          <View style={styles.mainWindow}>
            <View style={styles.window}>
              <SearchBar
                searchIcon={{ size: 20 }}
                placeholder="Busca"
                lightTheme
                round
                onChangeText={(text) => this.searchFilterFunction(text)}
                autoCorrect={false}
                value={this.state.search}
                containerStyle={{
                  backgroundColor: "white",
                  borderBottomColor: "transparent",
                  borderTopColor: "transparent",
                }}
                inputContainerStyle={{ backgroundColor: "#e7e7e7", height: 38 }}
                inputStyle={{ color: "black" }}
                placeholderTextColor="#707070"
                leftIconContainerStyle={{ ico: "white" }}
              />
              <FlatList
                data={this.state.data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                extraData={this.state.selectedId}
                ItemSeparatorComponent={this.renderSeparator}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                  />
                }
              />

              <Modal
                style={{
                  alignSelf: "center",
                }}
                backdropColor="#cfcfcf"
                backdropOpacity={0.6}
                isVisible={this.state.isModalVisible}
                onBackdropPress={() => this.toggleModal()}
                animationInTiming={100}
                animationOutTiming={100}
                backdropTransitionInTiming={100}
                backdropTransitionOutTiming={100}
              >
                <View
                  style={{
                    padding: 15,
                    backgroundColor: "white",
                    width: 300,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight: "bold",
                      alignSelf: "center",
                    }}
                  >
                    {this.state.username}
                  </Text>

                  {this.state.userpic != "" ? (
                    <Image
                      style={styles.profilePhoto}
                      source={{
                        uri: this.state.userpic,
                        cache: "force-cache",
                      }}
                    />
                  ) : null}

                  <View style={{ flexDirection: "row", marginTop: 15 }}>
                    <Button
                      buttonStyle={styles.cameraButton}
                      onPress={this.newConversationAsync}
                      icon={
                        <Icon
                          name="paper-plane-outline"
                          type="ionicon"
                          color="white"
                          size={30}
                        />
                      }
                    />

                    <View style={{ left: 170 }}>
                      <Button
                        buttonStyle={styles.cameraButton}
                        onPress={this.addFriend}
                        icon={
                          <Icon
                            name="person-add-outline"
                            type="ionicon"
                            color="white"
                            size={30}
                          />
                        }
                      />
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </View>
      );
    }
  }
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
  item: {
    flexDirection: "row",
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 14.5,
    alignSelf: "center",
    marginLeft: 10,
    color: "black",
    fontWeight: "bold",
  },
  photoCard: {
    width: "15%",
    height: 54,
    borderRadius: 65,
  },
  cameraButton: {
    borderRadius: 25,
    width: 50,
    backgroundColor: "#F76F8E",
  },
  profilePhoto: {
    alignSelf: "center",
    marginTop: 15,
    borderWidth: 2,
    borderRadius: 105,
    borderColor: "#F76F8E",
    width: "67%",
    height: 180,
  },
});
