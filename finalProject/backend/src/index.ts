import express from 'express';
import session from 'express-session';
import { createUser, findUser, jsonwebtoken, passport, initPassport } from './modules/authentication';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000; // You can change the port if needed

app.use(cors());
app.use(express.json());

// Session Configuration
app.use(session({
  secret: 'your_strong_secret_string', // Replace with a secure string
  resave: false, // Option to optimize session updates
  saveUninitialized: false, // Option to optimize session creation
  // Add additional options like 'cookie' for security, as needed 
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// A basic route
app.get('/', (req, res) => {
  res.send('Hello from your TypeScript Express server!');
});

// Login route using passport
app.post('/login', passport.authenticate('local'), (req, res) => {
  if (req.user) { // Authentication successful
    const token = jsonwebtoken.sign({ username: req.user.username }, 'your_jwt_secret');
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' }); 
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Check if user exists (Modify according to how you check for existing users)
    const existingUser = await findUser(username); 
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // 3. Create new user (adapt to your User model) 
    const newUser = await createUser(username, password);

    // 4. Respond with success 
    res.json({ message: 'User registered successfully' });

  } catch(error) {
    console.error(error); 
    res.status(500).json({ message: 'Registration error' });
  }
});

// Middleware to protect routes
const protectRoute = (req: any, res: any, next: any) => {
  console.log('Checking authentication');
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

app.get('/get-files', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  // Logic to get files
  res.status(200).json({files: ['file1.txt', 'file2.txt']});
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});