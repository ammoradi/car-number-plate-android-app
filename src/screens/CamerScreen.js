import React, { Component } from 'react';
import {
  CameraRoll,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
  PermissionsAndroid,
  TouchableOpacity,
  Icon,
  Text
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob'

import { RNCamera } from 'react-native-camera';

import ViewPhotos from './ViewPhotos';

import { Dimensions } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

class CameraScreen extends Component {

  state = {
    showPhotoGallery: false,
    photoArray: []
  }

  takePicture = async function() {
    if (this.camera) {
      const options = { base64: true }
      this.camera.takePictureAsync(options).then(async (data) => {
        console.log(data)
        fetch('http://192.168.43.174/upload', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
        }).then(res => {
          console.log(res)
        });
      })

      // RNFetchBlob.fetch('POST', 'http://10.0.3.2:3000/upload', {
      //   'Content-Type': 'formData'
      // }, RNFetchBlob.wrap(data.uri))
      // .then((res) => {
      //   let status = res.info().status;
      //   console.log(res)
      //   if(status == 200) {
      //     // the conversion is done in native code
      //     let base64Str = res.base64()
      //     // the following conversions are done in js, it's SYNC
      //     let text = res.text()
      //     let json = res.json()
      //   } else {
      //     // handle other status codes
      //   }
      // })
      // .catch((err) => {
      //   console.log(err)
      // })
    }
  };

  async requestExternalStoreageRead() {
    try {
        const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                       'title': 'اجازه دسترسی',
                       'message': 'برنامه نیاز به اجازه شما برای دسترسی به گالری دارد'
                   }
        );

        return granted == PermissionsAndroid.RESULTS.GRANTED
    } 
    catch (err) {
      //Handle this error
      return false;
    }
  }

  getPhotosFromGallery() {
    const agreed = this.requestExternalStoreageRead()
    if (agreed){
      CameraRoll.getPhotos({ first: 1000000 })
      .then(res => {
        let photoArray = res.edges;
        this.setState({ showPhotoGallery: true, photoArray: photoArray })
      })
    }
  }

  render() {
    if (this.state.showPhotoGallery) {
      return (
        <ViewPhotos
          photoArray={this.state.photoArray} />
      )
    }
    return (
      <View style={styles.container}>

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          permissionDialogTitle={'اجازه دسترسی'}
          permissionDialogMessage={'برنامه نیاز به اجازه شما برای دسترسی به دوربین دارد'}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            console.log(barcodes);
          }}
        />
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
              <Text style={styles.text}> گرفتن عکس </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity onPress={() => this.getPhotosFromGallery()} style={styles.capture}>
              <Text style={styles.text}> انتخاب از گالری </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'space-around'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  buttonContainer:{
    // flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    width: SCREEN_WIDTH,
    height: 120,
    margin: 0,
  },
  capture: {
    // flex: 0,
    width: (SCREEN_WIDTH / 2) - 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  button: {
    width: SCREEN_WIDTH / 2,
    paddingHorizontal: 25,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

export default CameraScreen;