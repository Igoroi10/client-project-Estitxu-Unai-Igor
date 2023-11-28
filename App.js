import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Context } from './AppContext';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import BootSplash from "react-native-bootsplash";
import { storeData, getData } from './helpers/localStorage';

import GoogleModal from './components/GoogleModal.js';
import StandardModal from './components/Modal.js';

import globalStateModel from './helpers/globalStateModel';

import {asignRol} from './helpers/asingRol';
import socket from './helpers/socket'
import SocketListener from './components/SocketListener';

import Toast from 'react-native-toast-message'
import axios from 'axios';



const Tab = createMaterialTopTabNavigator();

GoogleSignin.configure({
  webClientId: '191142773304-svg8ajvir2075qjot6q18b7bhq45e4ps.apps.googleusercontent.com',
});

const App = () => {
  const [globalState, setGlobalState] = useState(globalStateModel);

  const handleGlobalState = (data) => {
    setGlobalState(globalState =>({
      ...globalState,
      ...data
    }))
  }

  //REST OF STATES
  const [logState, setLogged] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState([]);


  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks

      const userData = await getData();


      if (userData !== null) {
        setLogged(true);
        setUserRole(userData.rol);
        setUser(userData);
        handleGlobalState({user: userData});

      } else {
        setLogged(false);
      }
      
      const response = await axios.get('https://fly-eg-staging.fly.dev/api/artifacts/');
      const responseData = response.data.data;
      handleGlobalState(responseData);

    
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
    });
  }, []);

  const tabScreens = [];
  
  useEffect(() => {
    const screenCharge = async() => {
      asignRol(userRole, tabScreens, user)
    }
    screenCharge();
  },[userRole, user])

  asignRol(userRole, tabScreens, user)

  socket.onAny((data, ...args) => {
    console.log('************ SOCKET INCOMING **************')
    console.log(data)
  });

  return (
    <Context.Provider value={{globalState, handleGlobalState}}>
      <NavigationContainer>
        <GoogleModal logStatus={logState} setMethod={setUserRole} setUser={setUser}/>
        <StandardModal />
        <Tab.Navigator>
          {tabScreens}
        </Tab.Navigator>
        <Toast/>
      </NavigationContainer>
    </Context.Provider>
  );
  
};

export default App;