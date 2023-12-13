const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (replace with your service account key)
const serviceAccount = require('./path/to/your/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-project-id.firebaseio.com', // replace with your Firebase project URL
});

const firestore = admin.firestore();

async function importCsvToFirebase(csvFilePath, collectionName) {
  try {
    // Read CSV file
    const csvData = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', async () => {
        // Send data to Firebase Firestore
        const batch = firestore.batch();
        const collectionRef = firestore.collection(collectionName);

        csvData.forEach((data) => {
          const docRef = collectionRef.doc(); // Automatically generate document ID
          batch.set(docRef, data);
        });

        await batch.commit();

        console.log(`CSV data imported to Firestore collection "${collectionName}" successfully.`);
      });
  } catch (error) {
    console.error('Error importing CSV to Firestore:', error);
  }
}

// Example usage:
const csvFilePath = '../../../archive/game_info.csv';
const collectionName = 'games';
importCsvToFirebase(csvFilePath, collectionName);