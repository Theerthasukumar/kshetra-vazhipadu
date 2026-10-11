import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'bookings_db.json');

const INITIAL_DATA = [
  {
    tokenNo: 'GVR-464-1',
    templeId: 'temple-guruvayur',
    vazhipaduName: 'പാൽപായസം (Palpayasam)',
    devoteeName: 'Theertha',
    nakshathram: 'തൃക്കേട്ട (Thrikketta)',
    date: '11 Oct 2026',
    time: '02:14 PM',
    amount: 120,
    status: 'Ready for Collection',
    collected: false,
    phone: '+91 98471 23456'
  },
  {
    tokenNo: 'GVR-101',
    templeId: 'temple-guruvayur',
    vazhipaduName: 'പാൽപായസം (Palpayasam)',
    devoteeName: 'അനന്തകൃഷ്ണൻ കെ.പി (Ananthakrishnan)',
    nakshathram: 'രോഹിണി (Rohini)',
    date: 'Today',
    time: '08:30 AM',
    amount: 120,
    status: 'Ready for Collection',
    collected: false,
    phone: '+91 98471 23456'
  },
  {
    tokenNo: 'GVR-102',
    templeId: 'temple-guruvayur',
    vazhipaduName: 'ഭാഗ്യസൂക്ത പുഷ്പാഞ്ജലി',
    devoteeName: 'മീര സുരേഷ് (Meera Suresh)',
    nakshathram: 'ഉത്രം (Uthram)',
    date: 'Today',
    time: '08:45 AM',
    amount: 60,
    status: 'Pooja Completed',
    collected: true,
    phone: '+91 94470 98765'
  },
  {
    tokenNo: 'GVR-103',
    templeId: 'temple-guruvayur',
    vazhipaduName: 'തൃക്കൈ വെണ്ണ (Thrikkai Venna)',
    devoteeName: 'വിഷ്ണുപ്രിയ ആർ. (Vishnupriya)',
    nakshathram: 'തിരുവോണം (Thiruvonam)',
    date: 'Today',
    time: '09:05 AM',
    amount: 50,
    status: 'Ready for Collection',
    collected: false,
    phone: '+91 97455 11223'
  },
  {
    tokenNo: 'ALV-101',
    templeId: 'temple-aluva',
    vazhipaduName: 'ജലധാര (Jala Dhara)',
    devoteeName: 'ഹരികൃഷ്ണൻ വി. (Harikrishnan)',
    nakshathram: 'തിരുവാതിര (Thiruvathira)',
    date: 'Today',
    time: '07:15 AM',
    amount: 50,
    status: 'Pooja Completed',
    collected: true,
    phone: '+91 98950 44332'
  },
  {
    tokenNo: 'ALV-102',
    templeId: 'temple-aluva',
    vazhipaduName: 'മൃത്യുഞ്ജയ ഹോമം',
    devoteeName: 'രാജേന്ദ്രൻ നായർ (Rajendran Nair)',
    nakshathram: 'പൂയം (Pooyyam)',
    date: 'Today',
    time: '07:45 AM',
    amount: 200,
    status: 'In Sanctum',
    collected: false,
    phone: '+91 94951 88776'
  },
  {
    tokenNo: 'CKR-101',
    templeId: 'temple-chottanikkara',
    vazhipaduName: 'കീഴ്‍ക്കാവ് വലിയ ഗുരുതി',
    devoteeName: 'സരിത മനോജ് (Saritha Manoj)',
    nakshathram: 'ആയില്യം (Aayilyam)',
    date: 'Today',
    time: '08:00 PM (Night)',
    amount: 150,
    status: 'Scheduled',
    collected: false,
    phone: '+91 97441 55667'
  }
];

// In-memory cache for instant zero-latency responses
let inMemoryBookings = null;

function loadFromDisk() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      return [...INITIAL_DATA];
    }
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
  return [...INITIAL_DATA];
}

function getBookings() {
  if (!inMemoryBookings) {
    inMemoryBookings = loadFromDisk();
  }
  return inMemoryBookings;
}

function saveBookings(data) {
  inMemoryBookings = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function templeApiPlugin() {
  return {
    name: 'temple-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Fast URL matching ignoring query strings
        const parsedUrl = req.url.split('?')[0];

        // GET /api/bookings
        if (parsedUrl === '/api/bookings' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(getBookings()));
          return;
        }

        // POST /api/bookings
        if (parsedUrl === '/api/bookings' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newBookings = JSON.parse(body);
              const current = getBookings();
              const items = Array.isArray(newBookings) ? newBookings : [newBookings];
              const updated = [...items, ...current];
              saveBookings(updated);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: items.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/bookings/toggle-collected
        if (parsedUrl === '/api/bookings/toggle-collected' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { tokenNo } = JSON.parse(body);
              const current = getBookings();
              const target = current.find(b => b.tokenNo === tokenNo);
              if (target) {
                target.collected = !target.collected;
                saveBookings(current);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}
