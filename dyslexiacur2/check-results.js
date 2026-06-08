import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyslexia-screening';

async function checkScreeningResults() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all screening results
    const results = await mongoose.connection.collection('screeningresults').find({}).toArray();

    if (results.length === 0) {
      console.log('📋 No screening results found in the database.');
      console.log('\n💡 Screening results will appear after users complete dyslexia screening tests.');
    } else {
      console.log(`📊 Found ${results.length} screening result(s):\n`);
      
      results.forEach((result, index) => {
        console.log(`═══════════════════════════════════════`);
        console.log(`Result #${index + 1}:`);
        console.log(`═══════════════════════════════════════`);
        console.log(`  User ID: ${result.userId}`);
        console.log(`  Completed: ${result.completedAt}`);
        console.log(`  Duration: ${result.duration} seconds`);
        console.log(`\n  Tests Completed: ${result.totalTestsCompleted}`);
        console.log(`  Overall Score: ${result.overallScore}/100`);
        console.log(`  Average Test Score: ${result.averageTestScore}/100`);
        console.log(`\n  Final Risk Level: ${result.finalRiskLevel.toUpperCase()}`);
        console.log(`  Recommendation: ${result.recommendation}`);
        
        if (result.audioAnalysis) {
          console.log(`\n  Audio Analysis:`);
          console.log(`    Risk Level: ${result.audioAnalysis.riskLevel}`);
          console.log(`    Risk Score: ${result.audioAnalysis.riskScore}`);
          console.log(`    Fluency Score: ${result.audioAnalysis.fluencyScore}`);
        }
        
        if (result.testScores) {
          console.log(`\n  Individual Test Scores:`);
          if (result.testScores.reading) console.log(`    Reading: ${result.testScores.reading}`);
          if (result.testScores.spelling) console.log(`    Spelling: ${result.testScores.spelling}`);
          if (result.testScores.phonological) console.log(`    Phonological: ${result.testScores.phonological}`);
          if (result.testScores.wordRecognition) console.log(`    Word Recognition: ${result.testScores.wordRecognition}`);
          if (result.testScores.syllable) console.log(`    Syllable: ${result.testScores.syllable}`);
        }
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkScreeningResults();
