import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Entry, CalculatedEntry } from '../utils/types';
import { calculateEntryValue, formatCurrency, formatPercentage } from '../utils/calculations';
import { useRouter } from 'expo-router';

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const router = useRouter();
  const [calculated, setCalculated] = useState<CalculatedEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    calculateEntryValue(entry)
      .then(setCalculated)
      .catch((err) => {
        console.error('Error calculating entry:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [entry]);

  const handlePress = () => {
    router.push(`/entry/${entry.id}`);
  };

  if (loading) {
    return (
      <View style={{
        backgroundColor: '#1a1a1a',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        alignItems: 'center'
      }}>
        <ActivityIndicator color="#F7931A" />
      </View>
    );
  }

  if (error || !calculated) {
    return null;
  }

  const displayDate = new Date(entry.purchaseDate).toISOString().split('T')[0];
  const statusColor = calculated.saved ? '#10b981' : '#ef4444';
  const statusText = calculated.saved ? 'SAVED' : 'LOST';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: '#1a1a1a',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
      }}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: entry.imageUrl }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 8,
          marginRight: 12,
          backgroundColor: '#333'
        }}
      />

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
          {entry.productName}
        </Text>
        <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
          {displayDate} • {entry.userName}
        </Text>
        <Text style={{ color: statusColor, fontSize: 14, fontWeight: 'bold' }}>
          {statusText} {formatCurrency(calculated.difference, entry.currency)} ({formatPercentage(calculated.percentageDiff)}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
}
