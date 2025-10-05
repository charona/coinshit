const {onCall} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');

initializeApp();

// Callable function to create an entry with App Check validation
exports.createEntry = onCall(
  {
    enforceAppCheck: true, // Require valid App Check token
    consumeAppCheckToken: true, // Prevent token reuse
  },
  async (request) => {
    console.log('createEntry called with data:', request.data);
    console.log('App Check verified:', request.app ? 'Yes' : 'No');
    // Validate input data
    const {userName, productName, imageUrl, purchaseDate, fiatAmount, currency} = request.data;

    if (!userName || !productName || !imageUrl || !purchaseDate || !fiatAmount || !currency) {
      throw new Error('Missing required fields');
    }

    if (userName.length < 3 || productName.length < 3) {
      throw new Error('Name and product must be at least 3 characters');
    }

    if (fiatAmount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Create entry in Firestore
    try {
      const entryRef = await getFirestore().collection('entries').add({
        userName: userName.trim(),
        productName: productName.trim(),
        imageUrl,
        purchaseDate: new Date(purchaseDate),
        fiatAmount: parseFloat(fiatAmount),
        currency,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log('Entry created successfully:', entryRef.id);
      return {success: true, id: entryRef.id};
    } catch (error) {
      console.error('Error creating entry in Firestore:', error);
      throw new Error('Failed to create entry: ' + error.message);
    }
  }
);
