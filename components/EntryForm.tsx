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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { detectUserCurrency } from '../utils/currency';
import { Currency, CURRENCIES } from '../utils/types';
import { generatePlaceholderImage } from '../services/imageGen';

interface EntryFormProps {
  onEntryCreated?: () => void;
}

interface ValidationErrors {
  userName?: string;
  productName?: string;
  purchaseDate?: string;
  fiatAmount?: string;
}

const MIN_DATE = new Date('2011-01-01');
const MAX_DATE = new Date();

export default function EntryForm({ onEntryCreated }: EntryFormProps) {
  const [userName, setUserName] = useState('');
  const [productName, setProductName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fiatAmount, setFiatAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [loading, setLoading] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate user name
    if (!userName.trim()) {
      newErrors.userName = 'Name is required';
    } else if (userName.trim().length < 3) {
      newErrors.userName = 'Name must be at least 3 characters';
    }

    // Validate product name
    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (productName.trim().length < 3) {
      newErrors.productName = 'Product name must be at least 3 characters';
    }

    // Validate purchase date
    if (!purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    // Validate amount
    if (!fiatAmount.trim()) {
      newErrors.fiatAmount = 'Amount is required';
    } else {
      const amount = parseFloat(fiatAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.fiatAmount = 'Amount must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Upload image or generate placeholder
      let imageUrl: string;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      } else {
        imageUrl = await generatePlaceholderImage(productName);
      }

      // Create entry in Firestore
      await addDoc(collection(db, 'entries'), {
        userName: userName.trim(),
        productName: productName.trim(),
        imageUrl,
        purchaseDate: purchaseDate!,
        fiatAmount: parseFloat(fiatAmount),
        currency,
        createdAt: serverTimestamp()
      });

      // Reset form
      setUserName('');
      setProductName('');
      setImageUri(null);
      setPurchaseDate(null);
      setFiatAmount('');
      setErrors({});

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
    <View style={{ backgroundColor: '#000', padding: 16, borderRadius: 12, margin: 16, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
      {/* Row 1: Name and Product Name */}
      <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
        {/* User Name */}
        <View style={{ marginBottom: 12, flex: 1, paddingHorizontal: 6 }}>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: errors.userName ? '#ef4444' : '#F7931A',
              fontSize: 18
            }}
            placeholder="Name *"
            placeholderTextColor="#666"
            value={userName}
            onChangeText={(text) => {
              setUserName(text);
              if (errors.userName) setErrors({ ...errors, userName: undefined });
            }}
          />
          {errors.userName && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.userName}
            </Text>
          )}
        </View>

        {/* Product Name */}
        <View style={{ marginBottom: 12, flex: 1, paddingHorizontal: 6 }}>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: errors.productName ? '#ef4444' : '#F7931A',
              fontSize: 18
            }}
            placeholder="Product *"
            placeholderTextColor="#666"
            value={productName}
            onChangeText={(text) => {
              setProductName(text);
              if (errors.productName) setErrors({ ...errors, productName: undefined });
            }}
          />
          {errors.productName && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.productName}
            </Text>
          )}
        </View>
      </View>

      {/* Row 2: Date, Amount, Currency, Photo */}
      <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
        {/* Purchase Date */}
        <View style={{ marginBottom: 12, flex: 1.5, paddingHorizontal: 6 }}>
        {Platform.OS === 'web' ? (
          <div
            onClick={(e) => {
              const input = (e.currentTarget as HTMLDivElement).querySelector('input');
              input?.showPicker?.();
            }}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 8,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: errors.purchaseDate ? '#ef4444' : '#F7931A',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              height: 48,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {!purchaseDate && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  color: '#666',
                  fontSize: 18,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                Date *
              </div>
            )}
            <input
              type="date"
              min="2011-01-01"
              max={MAX_DATE.toISOString().split('T')[0]}
              value={purchaseDate ? purchaseDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setPurchaseDate(new Date(e.target.value));
                  if (errors.purchaseDate) setErrors({ ...errors, purchaseDate: undefined });
                }
              }}
              style={{
                backgroundColor: 'transparent',
                color: purchaseDate ? '#fff' : 'transparent',
                padding: '0 12px',
                border: 'none',
                width: '100%',
                fontSize: 18,
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                colorScheme: 'dark',
                position: 'relative',
                zIndex: 2
              }}
            />
            <style>{`
              input[type="date"]::-webkit-calendar-picker-indicator {
                display: none;
                -webkit-appearance: none;
              }
              input[type="date"]::-webkit-inner-spin-button,
              input[type="date"]::-webkit-clear-button {
                display: none;
                -webkit-appearance: none;
              }
            `}</style>
          </div>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: '#1a1a1a',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: errors.purchaseDate ? '#ef4444' : '#F7931A'
              }}
            >
              <Text style={{ color: purchaseDate ? '#fff' : '#666' }}>
                {purchaseDate
                  ? purchaseDate.toISOString().split('T')[0]
                  : 'Date *'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={purchaseDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setPurchaseDate(selectedDate);
                    if (errors.purchaseDate) setErrors({ ...errors, purchaseDate: undefined });
                  }
                }}
                minimumDate={MIN_DATE}
                maximumDate={MAX_DATE}
              />
            )}
          </>
        )}
          {errors.purchaseDate && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.purchaseDate}
            </Text>
          )}
        </View>

        {/* Amount */}
        <View style={{ marginBottom: 12, flex: 1.5, paddingHorizontal: 6 }}>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: errors.fiatAmount ? '#ef4444' : '#F7931A',
              height: 48,
              fontSize: 18
            }}
            placeholder="Amount *"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={fiatAmount}
            onChangeText={(text) => {
              setFiatAmount(text);
              if (errors.fiatAmount) setErrors({ ...errors, fiatAmount: undefined });
            }}
          />
          {errors.fiatAmount && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.fiatAmount}
            </Text>
          )}
        </View>

        {/* Currency */}
        <View style={{ marginBottom: 12, flex: 0.7, paddingHorizontal: 6 }}>
          <TouchableOpacity
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            style={{
              backgroundColor: '#1a1a1a',
              padding: 12,
              borderRadius: 8,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#F7931A'
            }}
          >
            <Text style={{ color: '#F7931A', fontWeight: 'bold' }}>{currency}</Text>
          </TouchableOpacity>
        </View>

        {/* Image Picker */}
        <View style={{ marginBottom: 12, flex: 0.7, paddingHorizontal: 6 }}>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              backgroundColor: '#1a1a1a',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#F7931A',
              height: 48,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0.3,
                  borderRadius: 8
                }}
                resizeMode="cover"
              />
            )}
            <Text style={{ color: '#F7931A', position: 'relative', zIndex: 1 }}>📷 Photo</Text>
          </TouchableOpacity>
        </View>
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
            Submit
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
