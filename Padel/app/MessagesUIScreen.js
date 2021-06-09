import React from "react";
import f from "../database/firebase";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { SearchBar } from "react-native-elements";
import Modal from "react-native-modal";
import { Button } from "react-native-elements";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableHighlight,
} from "react-native";
import LoadingComponent from "./LoadingComponent";
import { RefreshControl } from "react-native";

export default class MessagesUIScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      photos: "",
      search: "",
      selectedId: "",
      userpic: "",
      lastMsg: "",
      refreshing: false,
    };
    this.arrayholder = [];
  }

  getNames() {
    return new Promise((resultPromise) => {
      var names = [];
      const user = f.firebase.auth().currentUser;
      f.firebase
        .database()
        .ref("/Messages/")
        .on("value", (result) => {
          names = [];
          const resu = result.val();
          let ultimaConv = {};
          for (const res in resu) {
            if (
              resu[res].first_user == user.uid ||
              resu[res].second_user == user.uid
            ) {
              let ultimaFecha = 0;
              for (const res2 in resu[res].msg) {
                if (resu[res].msg[res2].createdAt > ultimaFecha) {
                  ultimaConv = {
                    id: resu[res].second_user,
                    title: resu[res].second_user_name,
                    lastMsg: resu[res].msg[res2].text,
                  };
                  ultimaFecha = resu[res].msg[res2].createdAt;
                }
              }
              names.push(ultimaConv);
            }
          }

          //this.setState({ lastMsg: ultimaConv.lastMsg });
          this.forceUpdate();
          resultPromise(names);
        });
    });
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

  deleteConver = (itemId) => {
    const user = f.firebase.auth().currentUser;
    f.firebase
      .database()
      .ref("Messages/")
      .once("value", function (results) {
        var resu = results.val();
        for (const res in resu) {
          if (
            (resu[res].first_user == user.uid &&
              resu[res].second_user == itemId) ||
            (resu[res].first_user == itemId &&
              resu[res].second_user == user.uid)
          ) {
            f.firebase
              .database()
              .ref("Messages/" + res + "/")
              .remove();
          }
        }
      })
      .then(
        this.asyncCall().then((res) => {
          this.arrayholder = res.names;
          this.setState({ ...this.state, data: res.names, photos: res.photos });
        })
      );
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.asyncCall().then((res) => {
      this.arrayholder = res.names;
      this.setState({ ...this.state, data: res.names, photos: res.photos });
      this.setState({ refreshing: false });
    });
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
                  onPress={(event) => {}}
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
                    <View style={styles.userinfo}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.lastMsg}>{item.lastMsg}</Text>
                    </View>
                    <View style={{ position: "absolute", right: 10, top: 10 }}>
                      <Button
                        buttonStyle={styles.trashButton}
                        onPress={() => this.deleteConver(item.id)}
                        icon={
                          <Icon
                            name="trash-outline"
                            type="ionicon"
                            color="red"
                            size={25}
                          />
                        }
                      />
                    </View>
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
    color: "black",
    fontWeight: "bold",
  },
  lastMsg: {
    fontSize: 12.5,
    color: "black",
  },
  userinfo: {
    marginLeft: 10,
    justifyContent: "center",
  },
  photoCard: {
    width: "15%",
    height: 54,
    borderRadius: 65,
  },
  trashButton: {
    width: 50,
    backgroundColor: "white",
    borderRadius: 25,
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
