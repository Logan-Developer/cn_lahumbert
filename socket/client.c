#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

int port;
int mode;

void checkArgs(int argc, char *argv[])
{
    if (argc < 3)
    {
        fprintf(stderr, "Usage: %s <port> <mode>\n", argv[0]);
        fprintf(stderr, "Mode: 1 (echo), 2 (file transfer)\n");
        exit(1);
    }

    port = atoi(argv[1]);
    mode = atoi(argv[2]);

    if (mode != 1 && mode != 2)
    {
        fprintf(stderr, "Mode not supported (1: echo, 2: file transfer)\n");
        exit(1);
    }
}

void handleEcho(int clientSocket)
{
    ssize_t sendSize;
    ssize_t recvSize;
    int closeConnection = 0;

    char buffer[256];
    while (1)
    {
        // ask user for input
        printf("Enter message: ");
        fgets(buffer, sizeof(buffer), stdin);

        // send the message to the server
        sendSize = send(clientSocket, buffer, strlen(buffer), 0);
        if (sendSize < 0)
        {
            fprintf(stderr, "Error sending message to server\n");
            return;
        }

        // receive the message from the server
        recvSize = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (recvSize < 0)
        {
            fprintf(stderr, "Error receiving message from server\n");
            return;
        }

        // print the message from the server
        printf("Server: %s\n", buffer);

        // check if the server wants to close the connection
        if (strncmp(buffer, "goodbye", 7) == 0)
        {
            break;
        }

        // clear the buffer
        memset(buffer, 0, sizeof(buffer));
    }
}

void handleFileTransfer(int clientSocket)
{
    ssize_t sendSize;
    ssize_t recvSize;

    size_t fileSize;
    
    // receive the file size from the server
    recvSize = recv(clientSocket, &fileSize, sizeof(fileSize), 0);

    if (recvSize < 0)
    {
        fprintf(stderr, "Error receiving file size from server\n");
        return;
    }

    printf("File length: %ld\n", fileSize);

    // send the file size to the server
    sendSize = send(clientSocket, &fileSize, sizeof(fileSize), 0);
    if (sendSize < 0)
    {
        fprintf(stderr, "Error sending file size to server\n");
        return;
    }

    // receive the file from the server
    FILE *file = fopen("fileRecv.txt", "w");
    if (file == NULL)
    {
        fprintf(stderr, "Error opening file\n");
        return;
    }

    size_t fileReadSize;
    size_t totalReadSize = 0;

    char buffer[256];

    while (totalReadSize < fileSize)
    {
        recvSize = recv(clientSocket, buffer, sizeof(buffer), 0);
        if (recvSize < 0)
        {
            fprintf(stderr, "Error receiving file from server\n");
            return;
        }

        fileReadSize = fwrite(buffer, 1, recvSize, file);
        if (fileReadSize != recvSize)
        {
            fprintf(stderr, "Error writing to file\n");
            return;
        }

        totalReadSize += fileReadSize;
    }

    fclose(file);
    // check if the file exists
    if (access("fileRecv.txt", F_OK) != 0)
    {
        fprintf(stderr, "Error writing file\n");
        return;
    }

    printf("File successfully received\n");
    printf("Total read size: %ld / %ld\n", totalReadSize, fileSize);
}

int main(int argc, char *argv[])
{
    checkArgs(argc, argv);

    // Create a socket
    int clientSocket;
    int connectResult;

    struct sockaddr_in serverAddress;

    clientSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (clientSocket < 0)
    {
        printf("Error creating socket\n");
        return 1;
    }
    printf("Socket number: %d created!\n", clientSocket);

    // Connect to the server
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(port);
    serverAddress.sin_addr.s_addr = INADDR_ANY;

    connectResult = connect(clientSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress));
    if (connectResult < 0)
    {
        printf("Error connecting to server\n");
        return 2;
    }
    printf("Connected to server on port %d\n", port);

    ssize_t sendResult;
    ssize_t recvResult;
    while (1)
    {
        // send mode to server
        sendResult = send(clientSocket, &mode, sizeof(mode), 0);
        if (sendResult < 0)
        {
            printf("Error sending mode to server\n");
            return 3;
        }

        // check server response
        int serverResponse;
        recvResult = recv(clientSocket, &serverResponse, sizeof(serverResponse), 0);
        if (recvResult < 0)
        {
            printf("Error receiving server response\n");
            return 4;
        }
        
        if (serverResponse == -1)
        {
            fprintf(stderr, "Mode not supported (1: echo, 2: file transfer)\n");
        }
        else
        {
            break;
        }
    }

    if (mode == 1)
    {
        handleEcho(clientSocket);
    }
    else if (mode == 2)
    {
        handleFileTransfer(clientSocket);
    }

    printf("Connection closed\n");

    // close the socket
    close(clientSocket);

    return 0;
}