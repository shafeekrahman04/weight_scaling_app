/* eslint-disable no-bitwise */
import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

const WEIGHT_SCALE_UUID = '181D'; // Standard UUID for Weight Scale service
const WEIGHT_CHARACTERISTIC = '2A9D'; // Standard UUID for Weight characteristic

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  weight: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [weight, setWeight] = useState<number>(0);

  // Request permissions for Android and iOS
  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([ 
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN, 
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, 
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        ]);

        const isGranted = 
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED && 
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED && 
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  // Helper function to check if the device already exists in the list
  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  // Start scanning for peripherals
  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes('RAJFOOD')) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

    const connectToDevice = async (device: Device) => {
      try {
        const deviceConnection = await bleManager.connectToDevice(device.id);
        setConnectedDevice(deviceConnection);
    
        // Discover all services and characteristics of the connected device
        const services = await deviceConnection.discoverAllServicesAndCharacteristics();
    
        // Log the discovered services and characteristics
        deviceConnection.services().then(services => {
          services.forEach(service => {
            console.log(`Discovered Service: ${service.uuid}`);
            
            // Check if the service is the custom service (e.g., 0000ffe0)
            if (service.uuid === '0000ffe0-0000-1000-8000-00805f9b34fb') {
              console.log("Found custom service 0000ffe0");
    
              // Discover characteristics of this service
              service.characteristics().then(characteristics => {
                characteristics.forEach(characteristic => {
                  console.log(`Discovered Characteristic: ${characteristic.uuid}`);
    
                  // Check if the characteristic is readable
                  if (characteristic.isReadable) {
                    console.log(`Characteristic ${characteristic.uuid} is readable.`);
                    characteristic.read().then((value) => {
                      console.log("Characteristic Value: ", value.value);
                    }).catch(e => {
                      console.log("Error reading characteristic", e);
                    });
                  }
    
                  // Check if the characteristic supports notifications
                  if (characteristic.isNotifiable) {
                    console.log(`Characteristic ${characteristic.uuid} supports notifications.`);
                    characteristic.monitor((error, updatedCharacteristic) => {
                      if (error) {
                        console.log("Error monitoring characteristic:", error);
                        return;
                      }
                    
                      // Ensure updatedCharacteristic is not null or undefined
                      if (updatedCharacteristic && updatedCharacteristic.value) {
                        console.log("Updated Characteristic Value: ", updatedCharacteristic.value);
                      }
                    });
                  }
                });
              });
            }
          });
        });
    
        bleManager.stopDeviceScan();
      } catch (e) {
        console.log('FAILED TO CONNECT', e);
      }
    };
    
    
  

  // Disconnect from the currently connected device
  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setWeight(0);
    }
  };

  // Decode base64 string
  const decodeBase64 = (base64String: string) => {
    try {
      // Decode the base64 string to raw bytes
      const decoded = Buffer.from(base64String, 'base64');
      return decoded;
    } catch (error) {
      console.log('Error decoding base64:', error);
      return null;
    }
  };

  // Process the decoded byte data to extract the weight
  const processWeight = (data: Buffer): number | null => {
    if (data && data.length >= 4) {
      const weight = data.readFloatLE(0); // Little-endian float32
      return weight;
    }
    return null;
  };

  // Handle updates to the weight characteristic
  const onWeightUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return;
    }

    if (!characteristic?.value) {
      console.log('No Data received');
      return;
    }

    // Check if characteristic value is base64 encoded
    const decodedData = decodeBase64(characteristic.value);

    if (decodedData) {
      const weight = processWeight(decodedData);
      if (weight !== null) {
        console.log('Weight:', weight);
        setWeight(weight); // Set the weight to state
      }
    }
  };

  // Start streaming weight data from the connected device
  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        WEIGHT_SCALE_UUID, // Standard Weight Scale Service UUID
        WEIGHT_CHARACTERISTIC, // Standard Weight Characteristic UUID
        (error, characteristic) => onWeightUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    weight,
  };
}

export default useBLE;
