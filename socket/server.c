#include <stdio.h>
#include <stdlib.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

int port;
char *fileName;

void checkArgs(int argc, char *argv[])
{
    if (argc < 2)
    {
        fprintf(stderr, "Usage: %s <port> [File name]\n", argv[0]);
        fprintf(stderr, "The file name is used for file transfer mode, if not provided, the default file name is file.txt\n");
        exit(1);
    }

    if (argc == 3)
    {
        fileName = argv[2];
    }
    else
    {
        fileName = "file.txt";
    }

    port = atoi(argv[1]);
}

void handleEcho(int clientSocket)
{
    ssize_t sendSize;
    ssize_t recvSize;

    char buffer[256];
    while (1)
    {
        // receive the message from the client
        recvSize = read(clientSocket, buffer, sizeof(buffer));
        if (recvSize < 0)
        {
            fprintf(stderr, "ERROR reading from socket\n");
            exit(1);
        }
        if (recvSize == 0)
        {
            break;
        }
        printf("Message: %s\n", buffer);

        if (strncmp(buffer, "close", 5) == 0)
        {
            // send goodbye message
            sendSize = send(clientSocket, "goodbye", 7, 0);
            if (sendSize < 0)
            {
                fprintf(stderr, "ERROR writing to socket\n");
                exit(1);
            }
            break;
        }
        // send the message back to the client
        sendSize = send(clientSocket, buffer, recvSize, 0);
        if (sendSize < 0)
        {
            fprintf(stderr, "ERROR writing to socket\n");
            exit(1);
        }

        // clear the buffer
        memset(buffer, 0, sizeof(buffer));
    }
}

void handleFileTransfer(int clientSocket)
{
    FILE *file = fopen(fileName, "r");
    if (file == NULL)
    {
        fprintf(stderr, "ERROR opening file\n");
        exit(1);
    }

    fseek(file, 0, SEEK_END);
    size_t fileLength = ftell(file);
    if (fileLength == -1)
    {
        fprintf(stderr, "ERROR getting file length\n");
        exit(1);
    }

    rewind(file);

    printf("File length: %ld\n", fileLength);

    // send the file length to the client
    ssize_t sendSize = send(clientSocket, &fileLength, sizeof(fileLength), 0);
    if (sendSize < 0)
    {
        fprintf(stderr, "ERROR writing to socket\n");
        exit(1);
    }

    // wait for the client to acknowledge the file length
    int sizeFromClient;
    ssize_t recvSize = recv(clientSocket, &sizeFromClient, sizeof(sizeFromClient), 0);
    if (recvSize < 0)
    {
        fprintf(stderr, "ERROR reading from socket\n");
        exit(1);
    }

    if (sizeFromClient <= 0)
    {
        fprintf(stderr, "ERROR receiving file size from client\n");
        exit(1);
    }

    char fileBuffer[256];
    // read and send the file in chunks
    while (1)
    {
        size_t bytesRead = fread(fileBuffer, 1, sizeof(fileBuffer), file);
        if (bytesRead == 0)
        {
            break;
        }

        ssize_t sendSize = send(clientSocket, fileBuffer, bytesRead, 0);
        if (sendSize < 0)
        {
            fprintf(stderr, "ERROR writing to socket\n");
            exit(1);
        }

        memset(fileBuffer, 0, sizeof(fileBuffer));
    }

    fclose(file);
}

int main(int argc, char *argv[])
{
    checkArgs(argc, argv);

    // create a socket
    int serverSocket;
    int clientSocket;

    int setSockOptResult;
    int bindResult;
    int listenResult;

    struct sockaddr_in serverAddress;
    struct sockaddr_in clientAddress;
    int addressLength = sizeof(struct sockaddr_storage);

    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0)
    {
        fprintf(stderr, "ERROR opening socket\n");
        exit(1);
    }
    printf("Socket number: %d created!\n", serverSocket);

    // set socket options
    setSockOptResult = setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    if (setSockOptResult < 0)
    {
        fprintf(stderr, "ERROR setting socket options\n");
        exit(1);
    }

    // bind the socket to an address
    serverAddress.sin_addr.s_addr = INADDR_ANY; // listen to any address
    serverAddress.sin_family = AF_INET;         // use IPv4
    serverAddress.sin_port = htons(port);       // listen to the port provided

    bindResult = bind(serverSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress));
    if (bindResult < 0)
    {
        fprintf(stderr, "ERROR on binding\n");
        exit(1);
    }

    // listen for connections
    listenResult = listen(serverSocket, 5);
    if (listenResult < 0)
    {
        fprintf(stderr, "ERROR on listen\n");
        exit(1);
    }

    printf("Listening for connections on port %d\n", port);

    // accept connections
    clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddress, (socklen_t *)&addressLength);
    if (clientSocket < 0)
    {
        fprintf(stderr, "ERROR on accept\n");
        exit(1);
    }
    printf("Connection accepted, client socket number: %d and client address: %s\n", clientSocket, inet_ntoa(clientAddress.sin_addr));

    ssize_t sendSize;
    ssize_t recvSize;

    while (1)
    {
        // receive the mode from the client (1: echo, 2: file transfer)
        int mode;
        recvSize = read(clientSocket, &mode, sizeof(mode));
        printf("Mode: %d\n", mode);
        if (recvSize < 0)
        {
            fprintf(stderr, "ERROR reading from socket\n");
            exit(1);
        }

        if (mode == 1)
        {
            sendSize = send(clientSocket, &(int){0}, sizeof(int), 0);
            if (sendSize < 0)
            {
                fprintf(stderr, "ERROR writing to socket\n");
                exit(1);
            }
            handleEcho(clientSocket);
        }
        else if (mode == 2)
        {
            sendSize = send(clientSocket, &(int){0}, sizeof(int), 0);
            if (sendSize < 0)
            {
                fprintf(stderr, "ERROR writing to socket\n");
                exit(1);
            }
            handleFileTransfer(clientSocket);
        }
        else
        {
            sendSize = send(clientSocket, &(int){-1}, sizeof(int), 0);
            // ask the client to send the mode again
            continue;
        }

        // go back to listening for connections
        printf("Connection closed\n");
        printf("Listening for connections on port %d\n", port);
        clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddress, (socklen_t *)&addressLength);
        if (clientSocket < 0)
        {
            fprintf(stderr, "ERROR on accept\n");
            exit(1);
        }
    }
}