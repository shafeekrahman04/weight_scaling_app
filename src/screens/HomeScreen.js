import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';

export default function HomeScreen() {
  const [client, setClient] = useState('');
  const [product, setProduct] = useState('');
  const [weight, setWeight] = useState('');
  const [emptyTray, setEmptyTray] = useState(false);
  const [data, setData] = useState([]);

  const handleAddProduct = () => {
    const finalProduct = emptyTray ? 'Empty Tray' : product;

    if (emptyTray || (product && weight)) {
      setData([
        ...data,
        {id: Date.now().toString(), product: finalProduct, weight:weight, emptyTray},
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
      <Text style={styles.gridText}>{item.weight} kg</Text>
      <Text style={styles.gridText}>{item.emptyTray ? 'Yes' : 'No'}</Text>
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.headerText}>HomeScreen</Text>
        <FontAwesome name="user-circle" size={30} color="#fff" />
      </View>
      <View style={styles.container}>
        
        {/* Client Section with Background */}
        <View style={styles.clientContainer}>
          <Text style={styles.modalTitle}>Select Client</Text>
          <View style={styles.clientRow}>
            <Text style={styles.clientTitle}>Client</Text>
            <Picker
              selectedValue={client}
              onValueChange={itemValue => setClient(itemValue)}
              style={styles.clientDropdown}>
              <Picker.Item label="Select Client" value="" />
              <Picker.Item label="Client A" value="Client A" />
              <Picker.Item label="Client B" value="Client B" />
              <Picker.Item label="Client C" value="Client C" />
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
            value={weight}
            onChangeText={setWeight}
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

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  clientContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
  },
  clientTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientDropdown: {
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
});
