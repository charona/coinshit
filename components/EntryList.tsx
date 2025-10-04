import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { collection, query, orderBy, limit, startAfter, where, onSnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Entry } from '../utils/types';
import EntryCard from './EntryCard';

interface EntryListProps {
  filterUserName?: string;
}

const ENTRIES_PER_PAGE = 20;

export default function EntryList({ filterUserName }: EntryListProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Reset state when filter changes
    setEntries([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);

    // Build query
    let q = query(
      collection(db, 'entries'),
      orderBy('createdAt', 'desc'),
      limit(ENTRIES_PER_PAGE)
    );

    // Add filter if userName is provided
    if (filterUserName && filterUserName.trim()) {
      q = query(
        collection(db, 'entries'),
        where('userName', '==', filterUserName.trim()),
        orderBy('createdAt', 'desc'),
        limit(ENTRIES_PER_PAGE)
      );
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newEntries: Entry[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          newEntries.push({
            id: doc.id,
            userName: data.userName,
            productName: data.productName,
            imageUrl: data.imageUrl,
            purchaseDate: data.purchaseDate?.toDate() || new Date(),
            fiatAmount: data.fiatAmount,
            currency: data.currency,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });

        console.log('Fetched entries:', newEntries.length);
        setEntries(newEntries);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === ENTRIES_PER_PAGE);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching entries:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterUserName]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    setLoadingMore(true);

    // Build query for next page
    let q = query(
      collection(db, 'entries'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(ENTRIES_PER_PAGE)
    );

    if (filterUserName && filterUserName.trim()) {
      q = query(
        collection(db, 'entries'),
        where('userName', '==', filterUserName.trim()),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(ENTRIES_PER_PAGE)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: Entry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        newEntries.push({
          id: doc.id,
          userName: data.userName,
          productName: data.productName,
          imageUrl: data.imageUrl,
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          fiatAmount: data.fiatAmount,
          currency: data.currency,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      setEntries((prev) => [...prev, ...newEntries]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === ENTRIES_PER_PAGE);
      setLoadingMore(false);

      unsubscribe();
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#F7931A" />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#999', fontSize: 16 }}>
          {filterUserName ? 'No entries found for this user' : 'No entries yet. Be the first to add one!'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EntryCard entry={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator color="#F7931A" />
          </View>
        ) : null
      }
    />
  );
}
