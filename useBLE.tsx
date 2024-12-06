/* eslint-disable no-bitwise */
import { useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const WEIGHT_SCALE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb'; // Standard UUID for Weight Scale service
const WEIGHT_CHARACTERISTIC = '0000ffe1-0000-1000-8000-00805f9b34fb'; // Standard UUID for Weight characteristic

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
  checkPermissionsAndScan: () => void;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [weight, setWeight] = useState<number>(0);

  // Function to open Bluetooth settings
  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
    } else {
      Linking.openURL('app-settings:');
    }
  };

  // Function to check and request permissions for Bluetooth and Location
  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      try {
        // Request Bluetooth-related permissions
        const grantedLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const grantedBluetoothConnect = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Bluetooth Connect Permission',
            message: 'This app needs Bluetooth Connect permission',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const grantedBluetoothScan = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Bluetooth Scan Permission',
            message: 'This app needs Bluetooth Scan permission',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        // Check if all required permissions are granted
        if (
          grantedLocation === PermissionsAndroid.RESULTS.GRANTED &&
          grantedBluetoothConnect === PermissionsAndroid.RESULTS.GRANTED &&
          grantedBluetoothScan === PermissionsAndroid.RESULTS.GRANTED
        ) {
          cb(true);
        } else {
          cb(false);
        }
      } catch (e) {
        console.warn(e);
        cb(false);
      }
    } else {
      // For iOS, permission is automatically handled via Info.plist
      cb(true);
    }
  };

  // Function to check Bluetooth state and handle if it's powered off
  const checkBluetoothState = async () => {
    const bluetoothState = await bleManager.state();
    if (bluetoothState !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth is Off',
        'Please turn on Bluetooth to continue.',
        [
          {
            text: 'Go to Settings',
            onPress: openBluetoothSettings,
          },
          { text: 'Cancel', onPress: () => {} },
        ],
        { cancelable: false }
      );
    } else {
      scanForPeripherals(); // Bluetooth is on, start scanning
    }
  };

  // Helper function to prevent scanning duplicate devices
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  // Function to start scanning for BLE peripherals
  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }
      if (device && device.name?.includes('RAJFOOD')) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  // Function to connect to a BLE device
  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  // Function to disconnect from the currently connected device
  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setWeight(0);
    }
  };

  // Function to parse the weight from the characteristic data
  const parseWeight = (data: Uint8Array): number => {
    let weightString = '';
    for (let i = 0; i < data.length; i++) {
      weightString += String.fromCharCode(data[i]);
    }

    // Trim non-numeric characters (like '\r' or '\n')
    const cleanWeightString = weightString.trim();

    // Convert the string to a number
    let weight = parseFloat(cleanWeightString);

    // Validate the weight, ignore invalid or very small numbers
    if (isNaN(weight) || weight > 1000) {
      console.log('Invalid or unrealistic weight data:', weight);
      return 0; // Return 0 when the weight is invalid
    }

    return weight;
  };

  // Function to handle weight updates from the device
  const onWeightUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log('Error in weight update:', error);
      return;
    }

    if (!characteristic?.value) {
      console.log('No data received');
      return;
    }

    const rawData = characteristic.value; // This is expected to be Base64 encoded string or raw byte array
    const bytes = new Uint8Array(Buffer.from(rawData, 'base64')); // Decode Base64 to bytes (if the value is Base64)

    // Parse the weight value from the raw data
    const weight = parseWeight(bytes);
    if (weight !== 0) {
      setWeight(weight);
    } else {
      setWeight(0); // Ensure weight is set to 0 if invalid data is received
    }
  };

  // Function to start streaming data from the connected device
  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        WEIGHT_SCALE_UUID,
        WEIGHT_CHARACTERISTIC,
        (error, characteristic) => onWeightUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  };

  // Call this function to initiate scanning, check for Bluetooth state and permissions
  const checkPermissionsAndScan = async () => {
    await requestPermissions((granted) => {
      if (granted) {
        checkBluetoothState();
      } else {
        Alert.alert('Permission Denied', 'Please grant the required permissions.');
      }
    });
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    weight,
    checkPermissionsAndScan,  // Exposed method to start the process
  };
}

export default useBLE;
