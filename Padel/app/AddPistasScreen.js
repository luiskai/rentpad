import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import { Button } from "react-native-elements";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

function AddPistasScreen({ navigation }) {
  const [state, setState] = useState({
    nombre: "",
    ubicacion: "",
  });

  const addPista = () => {
    f.firebase
      .database()
      .ref("/PaddleCourts/")
      .push({
        nombre: state.nombre,
        ubicacion: this.state.userid,
      })
      .then((res) => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainWindow}>
        <View style={styles.window}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              console.log(data, details);
            }}
            query={{
              key: "AIzaSyDxad7OTc6NeAK2i5JcjZhOPCR36cy1AcA",
              language: "es",
              components: 'country:es',
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
  },
  window: {
    marginTop: 5,
    flex: 1,
  },
});

export default AddPistasScreen;
