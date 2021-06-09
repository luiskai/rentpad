import React, { useState, useEffect } from "react";
import f from "../database/firebase";
import { StyleSheet, Text, View, Image } from "react-native";
import { Button, SearchBar } from "react-native-elements";
import LoadingComponent from "./LoadingComponent";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator, FlatList, TouchableHighlight } from "react-native";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { BackgroundImage } from "react-native-elements/dist/config";
import { Divider } from "react-native-elements/dist/divider/Divider";

function ProfileScreen({ navigation }) {
  const [state, setState] = useState({
    photo: "",
    loading: true,
    isModalVisible: false,
    data: [],
    error: null,
    photos: "",
    search: "",
    selectedId: "",
    username: "",
    userpic: "",
    userid: "",
    hasProfilePic: true,
  });

  let arrayholder = [];

  const getNames = () => {
    return new Promise((result) => {
      const user = f.firebase.auth().currentUser;
      var names = [];
      f.firebase
        .database()
        .ref("Users/" + user.uid + "/Friends")
        .once("value", function (results) {
          var resu = results.val();
          for (const res in resu) {
            //EL RES ES EL UID DE CADA USUARIO
            names.push({ id: resu[res].id, title: resu[res].name });
          }
          result(names);
        });
    });
  };

  const getPhotos = (names) => {
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
  };

  async function getInfo() {
    const names = await getNames();
    const photos = await getPhotos(names);
    return { names, photos };
  }

  const toggleModal = () => {
    setState({ ...state, isModalVisible: !state.isModalVisible });
  };

  useEffect(() => {
    const user = f.firebase.auth().currentUser;
    if (user.photoURL == "") {
      setState({ ...state, hasProfilePic: false });
    } else {
      setState({ ...state, photo: user.photoURL });
    }
    getInfo().then((res) => {
      arrayholder = res.names;
      setState({
        ...state,
        data: res.names,
        photos: res.photos,
      });
    });

    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("La aplicación necesita permisos para poder abrir la galería.");
        }
      }
    })();

    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("La aplicación necesita permisos para poder abrir la cámara.");
        }
      }
    })();
  }, []);

  const onLoadEnd_ = () => {
    setState({ ...state, loading: false });
  };

  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled) {
      const user = f.firebase.auth().currentUser;
      const response = await (await fetch(result.uri)).blob();
      f.firebase
        .storage()
        .ref("/" + user.uid + "/" + "profilepic.png")
        .put(response)
        .then((res) => {
          res.ref.getDownloadURL().then((url) => {
            setState({ ...state, photo: url, loading: true });
            user.updateProfile({
              photoURL: url,
            });
          });
        });
    }
  };

  const pickImageFromCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled) {
      const user = f.firebase.auth().currentUser;
      const response = await (await fetch(result.uri)).blob();
      f.firebase
        .storage()
        .ref("/" + user.uid + "/" + "profilepic.png")
        .put(response)
        .then((res) => {
          res.ref.getDownloadURL().then((url) => {
            setState({ ...state, photo: url, loading: true });
            user.updateProfile({
              photoURL: url,
            });
          });
        });
    }
  };

  const Item = ({ item }) => (
    <View>
      {state.photos.map((photo) => {
        const user = f.firebase.auth().currentUser;
        if (user.uid != item.id) {
          if (photo.id == item.id) {
            return (
              <TouchableHighlight
                onPress={(event) => {
                  toggleModal();
                  setState({ ...state, username: item.title, userid: item.id });
                  getUserPic(item.id).then((userpic) => {
                    setState({ ...state, userpic: userpic });
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

  const renderSeparator = () => {
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

  const searchFilterFunction = (text) => {
    const newData = arrayholder.filter((item) => {
      const itemData = `${item.title.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    setState({ data: newData });
    setState({ search: text });
  };

  // SI EL NOMBRE Y LA FOTO ESTÁ VACIO CARGARA EL LOADER
  const user = f.firebase.auth().currentUser;

  if (state.photo == "" && state.hasProfilePic == true) {
    return <LoadingComponent></LoadingComponent>;
  } else {
    return (
      <View style={styles.container}>
        <BackgroundImage
          source={{
            uri: state.photo,
            cache: "force-cache",
          }}
          style={styles.backgroundImage}
          blurRadius={9}
        >
          <View style={styles.window}>
            <Modal
              style={{
                alignSelf: "center",
              }}
              backdropColor="#cfcfcf"
              backdropOpacity={0.6}
              isVisible={state.isModalVisible}
              onBackdropPress={() => toggleModal()}
              animationInTiming={100}
              animationOutTiming={100}
              backdropTransitionInTiming={100}
              backdropTransitionOutTiming={100}
            >
              <View
                style={{
                  padding: 15,
                  backgroundColor: "white",
                  width: 350,
                }}
              >
                <SearchBar
                  searchIcon={{ size: 20 }}
                  placeholder="Busca"
                  lightTheme
                  round
                  onChangeText={(text) => searchFilterFunction(text)}
                  autoCorrect={false}
                  value={state.search}
                  containerStyle={{
                    backgroundColor: "white",
                    borderBottomColor: "transparent",
                    borderTopColor: "transparent",
                  }}
                  inputContainerStyle={{
                    backgroundColor: "#e7e7e7",
                    height: 38,
                  }}
                  inputStyle={{ color: "black" }}
                  placeholderTextColor="#707070"
                  leftIconContainerStyle={{ ico: "white" }}
                />
                <FlatList
                  data={state.data}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  extraData={state.selectedId}
                  ItemSeparatorComponent={renderSeparator}
                />
              </View>
            </Modal>

            <View style={styles.photosAndChanges}>
              <Button
                buttonStyle={styles.galeryButton}
                onPress={pickImageFromGallery}
                icon={
                  <Icon
                    name="image-outline"
                    type="ionicon"
                    color="white"
                    size={30}
                  />
                }
              />
              <Image
                style={styles.profilePhoto}
                source={{
                  uri: state.photo,
                  cache: "force-cache",
                }}
                onLoadEnd={onLoadEnd_}
              />
              <Button
                buttonStyle={styles.cameraButton}
                onPress={pickImageFromCamera}
                icon={
                  <Icon
                    name="camera-outline"
                    type="ionicon"
                    color="white"
                    size={30}
                  />
                }
              />

              {state.hasProfilePic == false ? (
                <ActivityIndicator
                  style={styles.activityIndicator}
                  animating={state.loading}
                />
              ) : null}
            </View>

            {state.hasProfilePic == false ? (
              <Text style={styles.profileNameBlack}>{user.displayName}</Text>
            ) : (
              <Text style={styles.profileName}>{user.displayName}</Text>
            )}

            <View style={styles.profileButtons}>
              <View style={styles.profileButtonsMargin}>
                <View style={styles.row}>
                  <Button
                    buttonStyle={{ backgroundColor: "#ffffff00", width: 125 }}
                    icon={
                      <Icon
                        name="calendar-outline"
                        type="ionicon"
                        color="#121212"
                        size={40}
                      />
                    }
                    title="Pistas reservadas"
                    iconPosition="top"
                    titleStyle={{
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                    onPress={(res) => console.log("Apretado")}
                  />
                  <Button
                    buttonStyle={{ backgroundColor: "#ffffff00", width: 125 }}
                    icon={
                      <Icon
                        name="time-outline"
                        type="ionicon"
                        color="#121212"
                        size={40}
                      />
                    }
                    title="Historial de pistas"
                    iconPosition="top"
                    titleStyle={{
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                    onPress={(res) => console.log("Apretado")}
                  />
                </View>
                <Divider style={{ backgroundColor: "black" }} />
                <View style={styles.row}>
                  <Button
                    buttonStyle={{ backgroundColor: "#ffffff00", width: 125 }}
                    icon={
                      <Icon
                        name="people-outline"
                        type="ionicon"
                        color="#121212"
                        size={40}
                      />
                    }
                    title="Amigos"
                    iconPosition="top"
                    titleStyle={{
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                    onPress={(res) => toggleModal()}
                  />
                  <Button
                    buttonStyle={{ backgroundColor: "#ffffff00", width: 125 }}
                    icon={
                      <Icon
                        name="settings-outline"
                        type="ionicon"
                        color="#121212"
                        size={40}
                      />
                    }
                    title="Configuración"
                    iconPosition="top"
                    titleStyle={{
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                    onPress={(res) => navigation.navigate("Config")}
                  />
                </View>
              </View>
            </View>
            <View style={styles.closeSessionSection}>
              <Button
                buttonStyle={styles.closeSessionButton}
                title="Cerrar sesión"
                titleStyle={styles.closeSessionButtonTitle}
                onPress={() => {
                  f.firebase.auth().signOut();
                  navigation.navigate("Login");
                }}
              />
            </View>
          </View>
        </BackgroundImage>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  window: {
    flexDirection: "column",
    marginTop: 5,
    flex: 1,
  },
  photosAndChanges: {
    flexDirection: "row",
    width: "100%",
    marginTop: 30,
    marginLeft: 30,
    alignItems: "center",
    flex: 6.5,
  },
  galeryButton: {
    borderRadius: 25,
    width: 50,
    backgroundColor: "#F76F8E",
  },
  cameraButton: {
    borderRadius: 25,
    width: 50,
    backgroundColor: "#F76F8E",
  },
  profilePhoto: {
    borderWidth: 2,
    borderRadius: 105,
    borderColor: "#F76F8E",
    width: "50%",
    height: 200,
    left: 24,
    marginRight: 50,
  },
  profileName: {
    marginTop: 10,
    color: "white",
    alignSelf: "center",
    fontSize: 33,
    fontFamily: "PingFangSC-Light",
    fontWeight: "bold",
  },
  profileNameBlack: {
    marginTop: 10,
    color: "black",
    alignSelf: "center",
    fontSize: 33,
    fontFamily: "PingFangSC-Light",
    fontWeight: "bold",
  },
  profileButtons: {
    flex: 4.7,
    padding: 18,
    alignSelf: "center",
    marginTop: 100,
    backgroundColor: "#ffffff70",
    borderRadius: 25,
  },
  profileButtonsMargin: {
    flex: 1,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  closeSessionSection: {
    flex: 3.8,
    justifyContent: "flex-end",
  },
  closeSessionButton: {
    backgroundColor: "white",
  },
  closeSessionButtonTitle: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
  },
  activityIndicator: {
    position: "absolute",
    left: 0,
    right: 57,
    top: 95,
  },
  item: {
    flexDirection: "row",
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  photoCard: {
    width: "20%",
    height: 54,
    borderRadius: 65,
  },
  title: {
    fontSize: 14.5,
    alignSelf: "center",
    marginLeft: 10,
    color: "black",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
