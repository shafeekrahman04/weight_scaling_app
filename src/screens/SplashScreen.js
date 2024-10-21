import {Image, Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utilities/styles/GlobalStyles';
import Loader from '../shared/Loader';

export default function SplashScreen({navigation}) {
   
  const [loader, setIsloader] = useState(true);


 useEffect(()=>{
  setTimeout(() => {
    navigation.replace('Login');
  }, 500);
 })
  return (
    <View style={styles.body}>
      <View style={styles.image_container}>
        <Image
          source={require('../../assets/logo/splash_logo.png')}
          style={styles.image}
        />
      </View>
      {/* loader */}
      <Modal visible={loader} transparent>
        <Loader />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '2%',
    backgroundColor: Colors.white,
  },
  image: {
    height: '100%',
    resizeMode: 'contain',
  },
});
