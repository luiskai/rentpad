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
import { TouchableHighlight } from "react-native";

export default class ContactScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const Item = (props) => (
      <TouchableHighlight
        onPress={(event) => {
          this.props.navigation.navigate(props.name);
        }}
        activeOpacity={1}
        underlayColor="#DDDDDD"
      >
        <View style={[styles.item]}>
          <Icon name={props.icon} type="ionicon" color="black" size={30} />
          <Text style={styles.title}>{props.text}</Text>
        </View>
      </TouchableHighlight>
    );
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.mainWindow}>
          <View style={styles.window}>
            <Item text="Cambiar nombre" icon="person-circle-outline" name="account"></Item>
            <Item
              text="Cambiar contraseña"
              icon="key-outline"
              name="privacy"
            ></Item>
          </View>
        </View>
      </View>
    );
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
  item: {
    flexDirection: "row",
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemSL: {
    flexDirection: "row",
    padding: 5,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 14.5,
    alignSelf: "center",
    marginLeft: 10,
    color: "black",
  },
  sl: {
    fontSize: 12.5,
    alignSelf: "center",
    marginLeft: 4,
    color: "gray",
  },
});
