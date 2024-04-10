import express from 'express';
import session from 'express-session';
import { createUser, findUser, jsonwebtoken, passport, initPassport } from './modules/authentication';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import {MyFileSystem, MyFile} from './modules/filesystem';

const fs = new MyFileSystem();

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
    if (!newUser) {
      return res.status(500).json({ message: 'Registration error' });
    }

    fs.createUserDataFolder(username);

    // 4. Respond with success 
    return res.json({ message: 'User registered successfully' });

  } catch(error) {
    console.error(error); 
    return res.status(500).json({ message: 'Registration error' });
  }
});

// Middleware to protect routes
const protectRoute = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

app.get('/get-files', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {

  fs.getUserFiles(req.user.username, null).then((files: MyFile[]) => {
    res.json({ files: files});
  }, (error: any) => {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  });
});

app.get('/get-files/:subdirectory', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const subdirectory = req.params.subdirectory;

  fs.getUserFiles(req.user.username, subdirectory).then((files: MyFile[]) => {
    res.json({ files: files});
  }, (error: any) => {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  });
});

app.get('/get-file/:filePath', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const filePath = req.params.filePath;

  fs.getFile(req.user.username, filePath).then((file: MyFile | null) => {
    if (file) {
      const response = {
        name: file.name,
        type: file.type,
        data: fs.getFileData(file)
      };

      res.json(response);

    } else {
      res.status(404).json({ message: 'File not found' });
    }
  }, (error: any) => {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});