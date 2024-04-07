import express from 'express';
import session from 'express-session';
import { jsonwebtoken, passport } from './modules/authentication';
import cors from 'cors';

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

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});