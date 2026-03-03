const mongoose = require('mongoose');
require('dotenv').config();

const clearData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\nCollections found:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Clear each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      await db.collection(collectionName).deleteMany({});
      console.log(`\n✓ Cleared collection: ${collectionName}`);
    }

    console.log('\n✅ All data cleared successfully!');
    console.log('You can now register new users.');

  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

clearData();
