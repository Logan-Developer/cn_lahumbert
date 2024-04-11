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

  if (!filePath) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  fs.getFile(req.user.username, filePath).then((file: MyFile | null) => {
    if (file) {
      if (file.type === 'directory') {
        return res.status(400).json({ message: 'Directories cannot be downloaded' });
      }

      console.log('file:', file);

      if (file.type === 'video') {
        res.setHeader('Content-Type', 'video/' + file.name.split('.').pop());

        // Stream the file
        const range = req.headers.range;

        if (!range) {
          res.status(400).send('Requires Range header');
          return;
        }

        const videoSize = fs.getFileSize(file);

        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${videoSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': 'video/' + file.name.split('.').pop(),
        };

        console.log('headers:', headers);

        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(file, start, end);
        videoStream.pipe(res);

        return;
      }

      if (file.type === 'audio') {
        res.setHeader('Content-Type', 'audio/' + file.name.split('.').pop());

        // Stream the file
        const range = req.headers.range;

        if (!range) {
          res.status(400).send('Requires Range header');
          return;
        }

        const audioSize = fs.getFileSize(file);

        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, audioSize - 1);

        console.log('start:', start);
        console.log('end:', end);

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${audioSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': 'audio/' + file.name.split('.').pop(),
        };

        console.log('headers:', headers);

        res.writeHead(206, headers);

        const audioStream = fs.createReadStream(file, start, end);
        audioStream.pipe(res);

        return;
      }

      if (file.type === 'image') {
        res.setHeader('Content-Type', 'image/' + file.name.split('.').pop());

        const image = fs.readImage(file);
        res.writeHead(200);
        res.end(image, 'binary');
        return;
      }
      
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