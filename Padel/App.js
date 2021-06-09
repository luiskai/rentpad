import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon, Button } from "react-native-elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import f from "./database/firebase";

import LoginScreen from "./app/LoginScreen";
import PistasScreen from "./app/PistasScreen";
import RegisterScreen from "./app/RegisterScreen";
import ProfileScreen from "./app/ProfileScreen";
import MessagesScreen from "./app/MessagesScreen";
import UsersScreen from "./app/UsersScreen";
import AddPistasScreen from "./app/AddPistasScreen";
import MessagesUIScreen from "./app/MessagesUIScreen";
import ConfigScreen from "./app/ConfigScreen";
import AccountScreen from "./app/AccountScreen";
import PrivacyScreen from "./app/PrivacyScreen";
import ContactScreen from "./app/ContactScreen";
import PolicyScreen from "./app/PolicyScreen";
import AboutScreen from "./app/AboutScreen";

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function isAdmin() {
  return new Promise((result) => {
    var admin;
    const user = f.firebase.auth().currentUser;
    f.firebase
      .database()
      .ref("Users/")
      .once("value", function (results) {
        var resu = results.val();
        for (const res in resu) {
          if (user.uid == res) {
            admin = resu[res].admin;
            result(admin);
          }
        }
      });
  });
}

async function asyncCall() {
  const admin = await isAdmin();
  return { admin: admin };
}

function getHeaderTitle(route) {
  const user = f.firebase.auth().currentUser;
  switch (getFocusedRouteNameFromRoute(route)) {
    case "Pistas":
      return "Pistas";
    case "MensajesUI":
      return user.displayName;
    case "Usuarios":
      return "Usuarios";
    case "Profile":
      return "Perfil";
    case "addPista":
      return "Añadir pistas";
    case undefined:
      return "Pistas";
  }
}

function HomeTabs() {
  const [state, setState] = useState({
    admin: "",
  });
  f.firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      asyncCall().then((res) => {
        setState({ ...state, admin: res.admin });
      });
    }
  });
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "white",
        inactiveTintColor: "#707070",
        activeBackgroundColor: "black",
        inactiveBackgroundColor: "black",
        style: {
          backgroundColor: "black",
        },
      }}
    >
      <Tab.Screen
        name="Pistas"
        component={PistasScreen}
        options={{
          tabBarLabel: "Pistas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="tennisball-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MensajesUI"
        component={MessagesUIScreen}
        options={{
          tabBarLabel: "Mensajes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Usuarios"
        component={UsersScreen}
        options={{
          tabBarLabel: "Usuarios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />

      {state.admin == 1 ? (
        <Tab.Screen
          name="addPista"
          component={AddPistasScreen}
          options={{
            tabBarLabel: "Añadir pistas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" color={color} size={size} />
            ),
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerTintColor: "white",
            headerStyle: {
              backgroundColor: "#121212",
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
        <RootStack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerTintColor: "white",
            headerStyle: {
              backgroundColor: "#121212",
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
        <RootStack.Screen
          name="Mensajes"
          component={MessagesScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: route.params.labelName,
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Config"
          component={ConfigScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Configuración",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Account"
          component={AccountScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Cuenta",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Privacidad",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Contact"
          component={ContactScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Contacto",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Policy"
          component={PolicyScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Política de privacidad",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="About"
          component={AboutScreen}
          options={({ navigation: { goBack }, route }) => ({
            title: "Acerca de rentpad",
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: "black",
            headerBackTitle: null,
            headerLeft: () => (
              <Button
                buttonStyle={{ backgroundColor: "white" }}
                onPress={() => goBack()}
                icon={
                  <Icon
                    name="chevron-back-outline"
                    type="ionicon"
                    color="black"
                    size={30}
                  />
                }
              />
            ),
          })}
        />
        <RootStack.Screen
          name="Home"
          component={HomeTabs}
          options={({ route }) => ({
            headerTitle: getHeaderTitle(route),
            headerLeft: () => null,
            gestureEnabled: false,
            headerRight: () =>
              getFocusedRouteNameFromRoute(route) == "Pistas" ||
              getFocusedRouteNameFromRoute(route) == undefined ? (
                <Button
                  buttonStyle={{ backgroundColor: "white" }}
                  icon={
                    <Icon
                      name="funnel-outline"
                      type="ionicon"
                      color="black"
                      onPress={() => console.log("Filtrar")}
                    />
                  }
                />
              ) : null,
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
