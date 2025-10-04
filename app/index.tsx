import React, { useState } from 'react';
import { View, ScrollView, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';

export default function Index() {
  const [filterUserName, setFilterUserName] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />

      {/* Header with tagline */}
      <View style={{ padding: 16, backgroundColor: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: '#F7931A' }}>
        <Text style={{ color: '#F7931A', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
          Coinshit
        </Text>
        <Text style={{ color: '#999', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
          What if you'd bought Bitcoin instead?
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

      {/* Entry Form */}
      <EntryForm
        onUserNameChange={setFilterUserName}
        onEntryCreated={() => {
          // List will auto-update via real-time listener
        }}
      />

      {/* Entry List */}
      <View style={{ flex: 1 }}>
        <EntryList filterUserName={filterUserName} />
      </View>
    </View>
  );
}
