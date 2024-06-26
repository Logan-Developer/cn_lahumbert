import express from 'express';
import session from 'express-session';
import { createUser, findUser, jsonwebtoken, passport, initPassport } from './modules/authentication';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { MyFileSystem, MyFile } from './modules/filesystem';

const fs = new MyFileSystem();

const app = express();
const port = 3000; // You can change the port if needed

app.use(cors());
app.use(express.json());

// upload file
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

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
    // Checks
    // special characters
    if (!/^[a-zA-Z][a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Invalid username, must start with a letter and contain only letters, numbers, and underscores' });
    }
    const existingUser = await findUser(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    const newUser = await createUser(username, password);
    if (!newUser) {
      return res.status(500).json({ message: 'Registration error' });
    }

    fs.createUserDataFolder(username);

    return res.json({ message: 'User registered successfully' });

  } catch (error) {
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
    res.json({ files: files });
  }, (error: any) => {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  });
});

app.get('/get-files/:subdirectory', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const subdirectory = req.params.subdirectory;

  fs.getUserFiles(req.user.username, subdirectory).then((files: MyFile[]) => {
    res.json({ files: files });
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

      if (file.type === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');

        const pdf = fs.getFileData(file, 'base64');
        res.writeHead(200);
        res.end(pdf, 'base64');
        return;
      }

      // send the file
      const data = fs.getFileData(file, 'binary');
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${file.name}`,
        'Content-Length': data.length,
      });
      res.end(data);

    } else {
      res.status(404).json({ message: 'File not found' });
    }
  }, (error: any) => {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  });
});

app.post('/upload-file', passport.authenticate('jwt', { session: false }), protectRoute, upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileName = req.file.originalname;

  // move the file from the uploads folder to the user's folder
  fs.moveFile(req.user.username, '../../uploads/' + file.filename, fileName);

  res.json({ message: 'File uploaded successfully' });
});

app.post('/upload-file/:subdirectory', passport.authenticate('jwt', { session: false }), protectRoute, upload.single('file'), (req, res) => {
  const file = req.file;
  const subdirectory = req.params.subdirectory;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  let filePath = subdirectory ? subdirectory + '/' + file.originalname : file.originalname;

  // move the file from the uploads folder to the user's folder
  fs.moveFile(req.user.username, '../../uploads/' + file.filename, filePath);

  res.json({ message: 'File uploaded successfully' });
});

app.post('/create-folder', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const { folderName, subdirectory } = req.body;

  if (!folderName) {
    return res.status(400).json({ message: 'Invalid folder name' });
  }

  fs.createDirectory(req.user.username, subdirectory + folderName);

  res.json({ message: 'Folder created successfully' });
});

app.post('/rename-file', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const { path, newFileName } = req.body;

  if (!path || !newFileName) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  fs.renameFile(req.user.username, path, newFileName);

  res.json({ message: 'File renamed successfully' });
});

app.delete('/delete-file/:filePath', passport.authenticate('jwt', { session: false }), protectRoute, (req, res) => {
  const filePath = req.params.filePath;

  if (!filePath) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  // check if this is a directory
  const file = fs.getFile(req.user.username, filePath).then((file: MyFile | null) => {
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.type === 'directory') {
      fs.deleteDirectory(req.user.username, filePath);
    } else {
      fs.deleteFile(req.user.username, filePath);
    }

    res.json({ message: 'File deleted successfully' });
  }, (error: any) => {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file' });
  });
});

// Start the server
app.listen(port, '127.0.0.1', () => {
  console.log(`Server listening at http://localhost:${port}`);
});
