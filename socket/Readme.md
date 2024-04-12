# Small C program that lets a server and a client communicate using TCP sockets

## How to build
```bash
make
```

## Usage
### Server
```bash
./server.out <port> [File name]
```

The file name is used in file transfer mode. If the file name is not provided, the server will use the default file name 'file.txt'.

### Client
```bash
./client.out <port> <mode>
```

Modes:
- '1': Echo mode. The client sends a message to the server and the server sends it back.
- '2': File transfer mode. The server sends a file to the client.