import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Platform, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';

export default function Index() {
  const [filterText, setFilterText] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce filter text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterText);
    }, 1000);

    return () => clearTimeout(timer);
  }, [filterText]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />

      {/* Header with tagline */}
      <View style={{ padding: 16, backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#F7931A' }}>
        <Text style={{ color: '#F7931A', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
          Coinshit
        </Text>
        <Text style={{ color: '#999', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
          Spending BTC on shitty products (coinshit) is as bad as spending it on a shitcoin. Keep track of shit you bought, and this app shows you if you had better kept your BTC.
        </Text>
      </View>

      {/* Web install prompt */}
      {Platform.OS === 'web' && (
        <View style={{ backgroundColor: '#F7931A', padding: 12 }}>
          <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
            Get the app for the best experience!
          </Text>
        </View>
      )}

      {/* Scrollable content area */}
      <ScrollView style={{ flex: 1 }}>
        {/* Entry Form */}
        <EntryForm
          onEntryCreated={() => {
            setRefreshKey(prev => prev + 1);
          }}
        />

        {/* Filter Field */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, maxWidth: 800, alignSelf: 'center', width: '100%', position: 'relative' }}>
          <TextInput
            style={{
              backgroundColor: '#1a1a1a',
              color: '#fff',
              padding: 12,
              paddingRight: 40,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#F7931A',
              fontSize: 18
            }}
            placeholder="Filter entries..."
            placeholderTextColor="#666"
            value={filterText}
            onChangeText={setFilterText}
          />
          {filterText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setFilterText('');
                setDebouncedFilter('');
              }}
              style={{
                position: 'absolute',
                right: 24,
                top: 12,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#F7931A', fontSize: 20, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Entry List */}
        <EntryList key={refreshKey} filterText={debouncedFilter} />
      </ScrollView>
    </View>
  );
}
