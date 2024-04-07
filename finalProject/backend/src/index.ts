import express from 'express'; 

const app = express();
const port = 3000; // You can change the port if needed

// A basic route
app.get('/', (req, res) => {
  res.send('Hello from your TypeScript Express server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});