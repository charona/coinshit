import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  Modal,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Entry, CalculatedEntry } from '../../utils/types';
import { calculateEntryValue, formatCurrency, formatPercentage } from '../../utils/calculations';
import * as Clipboard from 'expo-clipboard';

export default function EntryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [calculated, setCalculated] = useState<CalculatedEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      try {
        const docRef = doc(db, 'entries', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedEntry: Entry = {
            id: docSnap.id,
            userName: data.userName,
            productName: data.productName,
            imageUrl: data.imageUrl,
            purchaseDate: data.purchaseDate?.toDate() || new Date(),
            fiatAmount: data.fiatAmount,
            currency: data.currency,
            createdAt: data.createdAt?.toDate() || new Date()
          };

          setEntry(fetchedEntry);

          // Calculate values
          const calc = await calculateEntryValue(fetchedEntry);
          setCalculated(calc);
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = Platform.OS === 'web'
      ? `${window.location.origin}/entry/${id}`
      : `https://coinshit.app/entry/${id}`;

    if (Platform.OS === 'web') {
      try {
        await Clipboard.setStringAsync(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    } else {
      try {
        await Share.share({
          message: `Check out this purchase on Coinshit: ${shareUrl}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F7931A" />
      </View>
    );
  }

  if (!entry || !calculated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 16 }}>Entry not found</Text>
      </View>
    );
  }

  const displayDate = new Date(entry.purchaseDate).toISOString().split('T')[0];
  const statusColor = calculated.saved ? '#10b981' : '#ef4444';
  const statusText = calculated.saved ? 'SAVED' : 'LOST';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Image */}
      <TouchableOpacity onPress={() => setImageModalVisible(true)}>
        <Image
          source={{ uri: entry.imageUrl }}
          style={{
            width: '100%',
            height: 300,
            backgroundColor: '#1a1a1a'
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Content */}
      <View style={{ padding: 20 }}>
        {/* User Name */}
        <Text style={{ color: '#999', fontSize: 14, marginBottom: 8 }}>
          Posted by {entry.userName}
        </Text>

        {/* Product Name */}
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
          {entry.productName}
        </Text>

        {/* Purchase Details */}
        <View style={{ backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Purchase Date</Text>
            <Text style={{ color: '#fff', fontSize: 16 }}>{displayDate}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Amount Paid</Text>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {formatCurrency(entry.fiatAmount, entry.currency)}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Bitcoin That Could Have Been Bought</Text>
            <Text style={{ color: '#F7931A', fontSize: 16, fontWeight: 'bold' }}>
              {calculated.btcAmount.toFixed(8)} BTC
            </Text>
          </View>

          <View>
            <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>That BTC would now be worth</Text>
            <Text style={{ color: '#F7931A', fontSize: 16, fontWeight: 'bold' }}>
              {formatCurrency(calculated.currentValue, entry.currency)}
            </Text>
          </View>
        </View>

        {/* Savings/Loss */}
        <View style={{
          backgroundColor: statusColor + '20',
          padding: 20,
          borderRadius: 12,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: statusColor
        }}>
          <Text style={{ color: statusColor, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
            {statusText}
          </Text>
          <Text style={{ color: statusColor, fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>
            {formatCurrency(calculated.difference, entry.currency)}
          </Text>
          <Text style={{ color: statusColor, fontSize: 20, textAlign: 'center' }}>
            ({formatPercentage(calculated.percentageDiff)}%)
          </Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={{
            backgroundColor: '#F7931A',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
            Share This Entry
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.95)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={{ color: '#F7931A', fontSize: 32, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: entry.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
