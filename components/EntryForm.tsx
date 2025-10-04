import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { detectUserCurrency } from '../utils/currency';
import { Currency, CURRENCIES } from '../utils/types';
import { generatePlaceholderImage } from '../services/imageGen';

interface EntryFormProps {
  onEntryCreated?: () => void;
  onUserNameChange?: (name: string) => void;
}

export default function EntryForm({ onEntryCreated, onUserNameChange }: EntryFormProps) {
  const [userName, setUserName] = useState('');
  const [productName, setProductName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    // Detect user's currency on mount
    detectUserCurrency().then(setCurrency);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `entries/${filename}`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    // Validation
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }
    if (!purchaseDate) {
      Alert.alert('Error', 'Please enter a purchase date');
      return;
    }
    if (!fiatAmount || parseFloat(fiatAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Upload image or generate placeholder
      let imageUrl: string;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      } else {
        imageUrl = generatePlaceholderImage(productName);
      }

      // Parse date
      const dateParts = purchaseDate.split('-');
      const date = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2])
      );

      // Create entry in Firestore
      await addDoc(collection(db, 'entries'), {
        userName: userName.trim(),
        productName: productName.trim(),
        imageUrl,
        purchaseDate: date,
        fiatAmount: parseFloat(fiatAmount),
        currency,
        createdAt: serverTimestamp()
      });

      // Reset form
      setUserName('');
      setProductName('');
      setImageUri(null);
      setPurchaseDate('');
      setFiatAmount('');

      Alert.alert('Success', 'Entry created successfully!');
      onEntryCreated?.();
    } catch (error) {
      console.error('Error creating entry:', error);
      Alert.alert('Error', 'Failed to create entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: '#000', padding: 16, borderRadius: 12, margin: 16 }}>
      {/* User Name */}
      <TextInput
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#F7931A'
        }}
        placeholder="Your Name"
        placeholderTextColor="#666"
        value={userName}
        onChangeText={(text) => {
          setUserName(text);
          onUserNameChange?.(text);
        }}
      />

      {/* Product Name */}
      <TextInput
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#F7931A'
        }}
        placeholder="Product Name"
        placeholderTextColor="#666"
        value={productName}
        onChangeText={setProductName}
      />

      {/* Image Picker */}
      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: '#1a1a1a',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#F7931A'
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
        ) : (
          <Text style={{ color: '#F7931A' }}>Add Photo (optional)</Text>
        )}
      </TouchableOpacity>

      {/* Purchase Date */}
      <TextInput
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#F7931A'
        }}
        placeholder="Purchase Date (YYYY-MM-DD)"
        placeholderTextColor="#666"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />

      {/* Amount and Currency */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TextInput
          style={{
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginRight: 8,
            borderWidth: 1,
            borderColor: '#F7931A'
          }}
          placeholder="Amount"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={fiatAmount}
          onChangeText={setFiatAmount}
        />

        <TouchableOpacity
          onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          style={{
            backgroundColor: '#1a1a1a',
            padding: 12,
            borderRadius: 8,
            minWidth: 80,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#F7931A'
          }}
        >
          <Text style={{ color: '#F7931A', fontWeight: 'bold' }}>{currency}</Text>
        </TouchableOpacity>
      </View>

      {/* Currency Picker */}
      {showCurrencyPicker && (
        <View style={{ marginBottom: 12 }}>
          {CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => {
                setCurrency(curr);
                setShowCurrencyPicker(false);
              }}
              style={{
                backgroundColor: curr === currency ? '#F7931A' : '#1a1a1a',
                padding: 8,
                marginBottom: 4,
                borderRadius: 4
              }}
            >
              <Text style={{ color: curr === currency ? '#000' : '#fff', textAlign: 'center' }}>
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#F7931A',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
            Submit Entry
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
