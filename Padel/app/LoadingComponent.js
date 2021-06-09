import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";

function LoadingComponent() {
  const navigation = useNavigation();
  return (
    <View>
      <Text style={styles.title}>Cargando...</Text>
      <ActivityIndicator
        color="black"
        size="large"
        style={{ top: 300, left: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    alignSelf: "center",
    top: 365,
  },
});

export default LoadingComponent;
