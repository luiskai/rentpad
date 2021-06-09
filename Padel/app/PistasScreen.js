import React from "react";
import f from "../database/firebase";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button } from "react-native-elements";
import { Icon } from "react-native-elements/dist/icons/Icon";
import Modal from "react-native-modal";
import SwitchSelector from "react-native-switch-selector";
import LoadingComponent from "./LoadingComponent";
import { TouchableOpacity } from "react-native";

export default class PistasScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      error: null,
      photos: [],
      search: "",
      selectedId: "",
      isModalVisible: false,
      refreshing: false,
      avatars: [],
    };
    this.arrayholder = [];
    this.day = "";
    this.hour = "";
  }

  getPistas() {
    return new Promise((resultPromise) => {
      var pistas = [];
      var fechas = [];
      var horas = [];
      f.firebase
        .database()
        .ref("/PaddleCourts/")
        .on("value", (result) => {
          pistas = [];
          const resu = result.val();
          for (const res in resu) {
            fechas = [];
            for (const res2 in resu[res].reservas) {
              horas = [];
              for (const res3 in resu[res].reservas[res2]) {
                horas.push(res3);
              }
              let fecha = { fecha: res2, horas };
              fechas.push(fecha);
            }

            pistas.push({
              id: res,
              title: resu[res].nombre.toUpperCase(),
              horarios: fechas,
            });
          }
          resultPromise(pistas);
        });
    });
  }

  getPhotos(pistas) {
    return new Promise((result) => {
      var photos = [];
      var photosProcessed = 0;

      pistas.forEach((pista, index, array) => {
        let imageRef = f.firebase
          .storage()
          .ref("/Pistas/" + pista.id + "/pistapic.jpg");
        imageRef
          .getDownloadURL()
          .then((url) => {
            photosProcessed++;
            photos.push({ id: pista.id, image: url });
            if (photosProcessed === array.length) {
              result(photos);
            }
          })
          .catch(() => {
            photosProcessed++;
            photos.push({ id: pista.id, image: null });
            if (photosProcessed === array.length) {
              result(photos);
            }
          });
      });
    });
  }

  toggleModal = (itemid) => {
    let ATeam = {};
    let BTeam = {};
    const user = f.firebase.auth().currentUser;
    this.setState({
      ...this.state,
      isModalVisible: !this.state.isModalVisible,
    });
    if (!this.state.isModalVisible) {
      f.firebase
        .database()
        .ref(
          "PaddleCourts/" +
            itemid +
            "/reservas/" +
            this.day +
            "/" +
            this.hour +
            "/"
        )
        .once("value", function (results) {
          var resu = results.val();

          for (const res in resu) {
            if (res == "ATeam") {
              ATeam = {
                player1pic: resu[res].player1pic,
                disabled1: false,
                player2pic: resu[res].player2pic,
                disabled2: false,
              };
              if (ATeam.player1pic != "") {
                ATeam = { ...ATeam, disabled1: true };
              }
              if (ATeam.player2pic != "") {
                ATeam = { ...ATeam, disabled2: true };
              }
            }
            if (res == "BTeam") {
              BTeam = {
                player1pic: resu[res].player1pic,
                disabled1: false,
                player2pic: resu[res].player2pic,
                disabled2: false,
              };
              if (BTeam.player1pic != "") {
                BTeam = { ...BTeam, disabled1: true };
              }
              if (BTeam.player2pic != "") {
                BTeam = { ...BTeam, disabled2: true };
              }
            }
          }
        })
        .then(this.setState({ avatars: [ATeam, BTeam] }));
    }
  };

  async asyncCall() {
    const pistas = await this.getPistas();
    const photos = await this.getPhotos(pistas);
    return { pistas, photos };
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.asyncCall().then((res) => {
      this.arrayholder = res.pistas;
      this.setState({ ...this.state, data: res.pistas, photos: res.photos });
      this.setState({ refreshing: false });
    });
  };

  componentDidMount() {
    this.asyncCall().then((res) => {
      this.arrayholder = res.pistas;
      this.setState({ ...this.state, data: res.pistas, photos: res.photos });
    });
  }

  changeDay(selected) {
    this.day = selected;
  }

  changeHour(selected) {
    this.hour = selected;
  }

  async insertUser(itemid, team, player) {
    const user = f.firebase.auth().currentUser;
    let ruta =
      "/PaddleCourts/" +
      itemid +
      "/reservas/" +
      this.day +
      "/" +
      this.hour +
      "/" +
      team +
      "/";

    let ruta2 =
      "/PaddleCourts/" +
      itemid +
      "/reservas/" +
      this.day +
      "/" +
      this.hour +
      "/";

    const isRegistered = (names) => {
      return new Promise((result) => {
        f.firebase
          .database()
          .ref(ruta2)
          .once("value", function (results) {
            var resu = results.val();
            for (const res in resu) {
              if (
                resu[res].player1 == user.uid ||
                resu[res].player2 == user.uid
              ) {
                result(true);
              }
            }
            result(false);
          });
      });
    };

    const isRegister = await isRegistered();

    if (isRegister == false) {
      if (player == "player1") {
        f.firebase.database().ref(ruta).update({
          player1: user.uid,
          player1pic: user.photoURL,
        });
      }
      if (player == "player2") {
        f.firebase.database().ref(ruta).update({
          player2: user.uid,
          player2pic: user.photoURL,
        });
      }
      this.toggleModal(itemid);
    } else {
      alert("Tu usuario ya está registrado en esta pista.");
    }
  }

  render() {
    const IconImage = () => {
      return (
        <Icon
          iconStyle={{ marginTop: 15 }}
          name="person-outline"
          type="ionicon"
          color="black"
          size={80}
        />
      );
    };

    const horas = [
      { label: "14:00", value: "1400" },
      { label: "16:00", value: "1600" },
      { label: "19:00", value: "1900" },
    ];

    const Item = ({ item }) => (
      <View>
        {this.state.photos.map((photo) => {
          let dias = [];
          let horass = [];
          item.horarios.map((horario) => {
            console.log(horario.horas)

            dias.push({
              label:
                horario.fecha.substring(0, 2) +
                "/" +
                horario.fecha.substring(2, 4) +
                "/" +
                horario.fecha.substring(4, 8),
              value: horario.fecha,
            });
            horass.push({ label: horario.horas, value: horario.horas });
          });
          //console.log(dias);

          return (
            <View style={styles.card} key={item.id}>
              <Text style={styles.textPhoto}>{item.title}</Text>
              <Image
                style={styles.photoCard}
                source={{
                  uri: photo.image,
                  cache: "force-cache",
                }}
              />
              <Text
                style={{
                  color: "white",
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 20,
                  marginTop: 10,
                }}
              >
                DIA
              </Text>
              <SwitchSelector
                initial={0}
                onPress={(value) => this.changeDay(value)}
                buttonColor="#F76F8E"
                hasPadding
                options={dias}
                style={{ marginTop: 10 }}
              />
              <Text
                style={{
                  color: "white",
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 20,
                  marginTop: 10,
                }}
              >
                HORA
              </Text>
              <SwitchSelector
                initial={0}
                onPress={(value) => this.changeHour(value)}
                buttonColor="#F76F8E"
                hasPadding
                options={horas}
                style={{ marginTop: 10 }}
              />
              <Button
                style={styles.reserveButton}
                title="MAS INFORMACIÓN"
                buttonStyle={styles.reserveButtonBackground}
                titleStyle={styles.reserveButtonColor}
                onPress={() => this.toggleModal(item.id)}
              ></Button>
            </View>
          );
        })}
        <Modal
          style={{
            alignSelf: "center",
          }}
          backdropColor="#cfcfcf"
          backdropOpacity={0.6}
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.toggleModal(null)}
          animationInTiming={100}
          animationOutTiming={100}
          backdropTransitionInTiming={100}
          backdropTransitionOutTiming={100}
        >
          {this.state.avatars.length == 0 ? (
            <LoadingComponent></LoadingComponent>
          ) : (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "white",
                width: 300,
                padding: 10,
              }}
            >
              <View>
                <TouchableOpacity
                  style={styles.teamSelector}
                  disabled={this.state.avatars[0].disabled1}
                  onPress={() => this.insertUser(item.id, "ATeam", "player1")}
                >
                  {this.state.avatars[0].disabled1 == true ? (
                    <Image
                      source={{
                        uri: this.state.avatars[0].player1pic,
                        cache: "force-cache",
                      }}
                      style={styles.avatarPic}
                    />
                  ) : (
                    <IconImage />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.teamSelector}
                  disabled={this.state.avatars[0].disabled2}
                  onPress={() => this.insertUser(item.id, "ATeam", "player2")}
                >
                  {this.state.avatars[0].disabled2 == true ? (
                    <Image
                      source={{
                        uri: this.state.avatars[0].player2pic,
                        cache: "force-cache",
                      }}
                      style={styles.avatarPic}
                    />
                  ) : (
                    <IconImage />
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ marginLeft: 40 }}>
                <TouchableOpacity
                  style={styles.teamSelector}
                  disabled={this.state.avatars[1].disabled1}
                  onPress={() => this.insertUser(item.id, "BTeam", "player1")}
                >
                  {this.state.avatars[1].disabled1 == true ? (
                    <Image
                      source={{
                        uri: this.state.avatars[1].player1pic,
                        cache: "force-cache",
                      }}
                      style={styles.avatarPic}
                    />
                  ) : (
                    <IconImage />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.teamSelector}
                  disabled={this.state.avatars[1].disabled2}
                  onPress={() => this.insertUser(item.id, "BTeam", "player2")}
                >
                  {this.state.avatars[1].disabled2 == true ? (
                    <Image
                      source={{
                        uri: this.state.avatars[1].player2pic,
                        cache: "force-cache",
                      }}
                      style={styles.avatarPic}
                    />
                  ) : (
                    <IconImage />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
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
          <StatusBar style="auto" />
          <View style={styles.mainWindow}>
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
  },
  window: {
    marginTop: 5,
    flex: 1,
  },
  card: {
    marginTop: 15,
    backgroundColor: "black",
    width: "90%",
    height: 560,
    marginHorizontal: 20,
  },
  photoCard: {
    marginLeft: 10,
    marginTop: 10,
    width: "95%",
    height: 250,
  },
  textPhoto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
    alignSelf: "center",
    marginTop: 10,
  },
  reserveButton: {
    alignSelf: "center",
    marginTop: 30,
    width: "50%",
  },
  reserveButtonBackground: {
    backgroundColor: "white",
  },
  reserveButtonColor: {
    color: "black",
  },
  teamSelector: {
    borderWidth: 2,
    borderColor: "#F76F8E",
    width: 120,
    height: 120,
    backgroundColor: "transparent",
    marginTop: 10,
  },
  avatarPic: { width: 116, height: 116 },
});
