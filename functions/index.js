const {onCall} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');

initializeApp();

// Callable function to create an entry with App Check validation
exports.createEntry = onCall(
  {
    enforceAppCheck: true, // Require valid App Check token
    consumeAppCheckToken: true, // Prevent token reuse
  },
  async (request) => {
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
    const entryRef = await getFirestore().collection('entries').add({
      userName: userName.trim(),
      productName: productName.trim(),
      imageUrl,
      purchaseDate: new Date(purchaseDate),
      fiatAmount: parseFloat(fiatAmount),
      currency,
      createdAt: new Date(),
    });

    return {success: true, id: entryRef.id};
  }
);
