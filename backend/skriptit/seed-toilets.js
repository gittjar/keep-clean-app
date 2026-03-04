import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const cleaningEntrySchema = new mongoose.Schema(
  { cleanedAt: { type: Date, default: Date.now }, cleanedBy: { type: String, required: true } },
  { _id: false }
);

const toiletSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  location:    { type: String, required: true },
  toiletId:    { type: String },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allowedUsers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  cleaningLog: { type: [cleaningEntrySchema], default: [] },
  createdAt:   { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({ username: String, role: String });

const Toilet = mongoose.models.Toilet || mongoose.model('Toilet', toiletSchema);
const User   = mongoose.models.User   || mongoose.model('User',   userSchema);

// 15 vaihtelevaa WC-tilaa
const toiletTemplates = [
  { name: 'Terminal 2 / Gate 24',       location: 'Helsinki-Vantaa Airport',    toiletId: '2.24'  },
  { name: 'Departures / M',             location: 'Helsinki-Vantaa Airport',    toiletId: '1.12'  },
  { name: 'Food Court / W',             location: 'Helsinki-Vantaa Airport',    toiletId: '1.33'  },
  { name: 'Asema-aukio / M',            location: 'Helsinki Central Station',   toiletId: 'HKI-1' },
  { name: 'Asema-aukio / W',            location: 'Helsinki Central Station',   toiletId: 'HKI-2' },
  { name: 'Platform 11 / M',            location: 'Helsinki Central Station',   toiletId: 'HKI-3' },
  { name: 'Hamburg Hbf B2 South / M',   location: 'Hamburg Hauptbahnhof',       toiletId: '2.88'  },
  { name: 'Hamburg Hbf B2 South / W',   location: 'Hamburg Hauptbahnhof',       toiletId: '2.89'  },
  { name: 'Kauppakeskus / 2. kerros M', location: 'Kamppi Shopping Centre',     toiletId: 'KP-2M' },
  { name: 'Kauppakeskus / 2. kerros W', location: 'Kamppi Shopping Centre',     toiletId: 'KP-2W' },
  { name: 'Kauppakeskus / K1 / M',      location: 'Kamppi Shopping Centre',     toiletId: 'KP-B1' },
  { name: 'Palloiluhalli / M',          location: 'Hartwall Arena',             toiletId: 'HA-1'  },
  { name: 'Palloiluhalli / W',          location: 'Hartwall Arena',             toiletId: 'HA-2'  },
  { name: 'Gate C3 / M',               location: 'Stockholm Arlanda Airport',  toiletId: 'C3-M'  },
  { name: 'Arrivals Hall / W',          location: 'Stockholm Arlanda Airport',  toiletId: 'ARR-W' },
];

// Vaihtelevat siivousajat: 30min – 4 vrk sitten
function randomPastDate(minMinutes = 30, maxHours = 96) {
  const ms = (Math.random() * (maxHours * 60 - minMinutes) + minMinutes) * 60 * 1000;
  return new Date(Date.now() - ms);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Yhdistetty MongoDB:hen');

  const users = await User.find({}).select('_id username');
  if (users.length === 0) {
    console.error('Ei käyttäjiä tietokannassa – rekisteröidy ensin.');
    process.exit(1);
  }

  console.log(`Löytyi ${users.length} käyttäjää:`);
  users.forEach(u => console.log(`  ${u.username} (${u._id})`));

  const docs = toiletTemplates.map((t, i) => {
    const owner = users[i % users.length];
    const cleanedAt = randomPastDate();
    return {
      ...t,
      owner: owner._id,
      allowedUsers: [],
      cleaningLog: [{ cleanedAt, cleanedBy: owner.username }],
      createdAt: new Date(cleanedAt.getTime() - Math.random() * 14 * 24 * 3600 * 1000),
    };
  });

  const result = await Toilet.insertMany(docs);
  console.log(`\nLisätty ${result.length} WC-tilaa:\n`);
  result.forEach(t => console.log(`  [${t._id}] ${t.name} @ ${t.location}`));

  await mongoose.disconnect();
  console.log('\nValmis!');
}

seed().catch(err => { console.error(err); process.exit(1); });
