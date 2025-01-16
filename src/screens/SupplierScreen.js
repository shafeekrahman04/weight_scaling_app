import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Modal,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import useBLE from '../../useBLE';
import DeviceModal from '../../DeviceConnectionModal';

export default function SupplierScreen({navigation}) {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    weight,
    disconnectFromDevice,
    checkPermissionsAndScan,
  } = useBLE();
  const [isDeviceModalVisible, setIsDeviceModalVisible] = useState(false); // Device Modal visibility
  const [isConnectPopupVisible, setIsConnectPopupVisible] = useState(false); // Connect Popup visibility

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };
  useEffect(() => {
    checkPermissionsAndScan(); // Start scanning when the app is opened
  }, []);

  const hideDeviceModal = () => {
    setIsDeviceModalVisible(false);
  };

  const openDeviceModal = async () => {
    scanForDevices();
    setIsDeviceModalVisible(true);
  };

  const showConnectPopup = () => {
    setIsConnectPopupVisible(true); // Show the connect popup when no device is connected
  };

  const hideConnectPopup = () => {
    setIsConnectPopupVisible(false); // Hide the connect popup
  };

  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState('');
  const [weightData, setWeight] = useState(0);
  const [emptyTray, setEmptyTray] = useState(false);
  const [data, setData] = useState([]);

  const handleAddProduct = () => {
    const finalProduct = emptyTray ? 'Empty Tray' : product;

    if (emptyTray || (product && weight)) {
      setData([
        ...data,
        {
          id: Date.now().toString(),
          product: finalProduct,
          weightData: weight,
          emptyTray,
        },
      ]);
      setProduct('');
      setWeight('');
      setEmptyTray(false);
    } else {
      alert('Please fill in all fields!');
    }
  };

  const handleSubmit = () => {
    if (data.length > 0) {
      alert('Data submitted successfully!');
    } else {
      alert('No products to submit.');
    }
  };

  const renderGridItem = ({item}) => (
    <View style={styles.gridItem}>
      <Text style={styles.gridText}>{item.product}</Text>
      <Text style={styles.gridText}>{item.weightData} kg</Text>
      <Text style={styles.gridText}>{item.emptyTray ? 'Yes' : 'No'}</Text>
    </View>
  );

  // Show connect popup if no device is connected
  useEffect(() => {
    if (!connectedDevice) {
      showConnectPopup(); // Show popup if not connected
    }
  }, [connectedDevice]);

  const totalProductWeight = data
    .filter(item => !item.emptyTray)
    .reduce((acc, curr) => acc + parseFloat(curr.weightData || 0), 0);

  // Calculate total tray weight
  const totalTrayWeight = data
    .filter(item => item.emptyTray)
    .reduce((acc, curr) => acc + parseFloat(curr.weightData || 0), 0);

  // Calculate net weight
  const netWeight = totalProductWeight - totalTrayWeight;

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.headerText}>HomeScreen</Text>
        <FontAwesome name="user-circle" size={30} color="#fff" />
      </View>
      <View style={styles.container}>
        {/* Supplier Section with Background */}
        <View style={styles.supplierContainer}>
          <Text style={styles.modalTitle}>Select Supplier</Text>
          <View style={styles.supplierRow}>
            <Text style={styles.supplierTitle}>Supplier</Text>
            <Picker
              selectedValue={supplier}
              onValueChange={itemValue => setSupplier(itemValue)}
              style={styles.supplierDropdown}>
              <Picker.Item label="Select Supplier" value="" />
              <Picker.Item label="Supplier A" value="Supplier A" />
              <Picker.Item label="Supplier B" value="Supplier B" />
              <Picker.Item label="Supplier C" value="Supplier C" />
            </Picker>
          </View>
        </View>

        {/* Add Product Section */}
        <View style={styles.addProductSection}>
          <Text style={styles.modalTitle}>Add Product</Text>

          {!emptyTray && (
            <>
              <Text style={styles.label}>Product</Text>
              <Picker
                selectedValue={product}
                onValueChange={itemValue => setProduct(itemValue)}
                style={styles.dropdown}>
                <Picker.Item label="Select Product" value="" />
                <Picker.Item label="Product A" value="Product A" />
                <Picker.Item label="Product B" value="Product B" />
                <Picker.Item label="Product C" value="Product C" />
              </Picker>
            </>
          )}

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter weight"
            value={weight ? weight.toString() : '0'}
            onChangeText={setWeight}
            readOnly
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Empty Tray</Text>
            <CheckBox
              value={emptyTray}
              onValueChange={newValue => setEmptyTray(newValue)}
            />
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleAddProduct}>
            <Text style={styles.modalButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Product Grid Section */}
        <View style={styles.grid}>
          <Text style={styles.gridHeader}>Added Products</Text>
          {data.length === 0 ? (
            <Text style={styles.emptyText}>No data added yet.</Text>
          ) : (
            <FlatList
              data={data}
              renderItem={renderGridItem}
              keyExtractor={item => item.id}
            />
          )}
          <View style={styles.calculationsSection}>
            <Text style={styles.calculationTitle}>Total Weight</Text>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Product Weight:</Text>
              <Text style={styles.calculationValue}>
                {totalProductWeight} kg
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Total Tray Weight:</Text>
              <Text style={styles.calculationValue}>{totalTrayWeight} kg</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Net Weight:</Text>
              <Text style={styles.calculationValue}>{netWeight} kg</Text>
            </View>
          </View>
          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connect Popup Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isConnectPopupVisible}
        onRequestClose={hideConnectPopup}>
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>No Bluetooth Device Connected</Text>
            <Text style={styles.popupMessage}>
              Please connect a device to proceed.
            </Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => {
                hideConnectPopup();
                openDeviceModal();
              }}>
              <Text style={styles.popupButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Device Modal */}
      <DeviceModal
        closeModal={hideDeviceModal}
        visible={isDeviceModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0163d2',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 10,
  },
  supplierContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
  },
  supplierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  supplierDropdown: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flex: 1,
    height: 50,
    justifyContent: 'center',
    marginLeft: 10,
  },
  addProductSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#0163d2',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    height: 50,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 5,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#0163d2',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  grid: {
    marginTop: 20,
  },
  gridHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0163d2',
  },
  gridItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 3,
  },
  gridText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: 'grey',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Your existing styles go here...
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  popupButton: {
    backgroundColor: '#0163d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calculationsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0163d2',
    marginBottom: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#333',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
});
