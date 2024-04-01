#include <stdio.h>
#include <stdlib.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>

void checkArgs(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "ERROR, no port provided\n");
        exit(1);
    }
}

int main(int argc, char *argv[]) {
    checkArgs(argc, argv);
    int portno = atoi(argv[1]);

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
    if (serverSocket < 0) {
        fprintf(stderr, "ERROR opening socket\n");
        exit(1);
    }
    printf("Socket number: %d created!\n", serverSocket);

    // set socket options
    setSockOptResult = setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    if (setSockOptResult < 0) {
        fprintf(stderr, "ERROR setting socket options\n");
        exit(1);
    }

    // bind the socket to an address
    serverAddress.sin_addr.s_addr = INADDR_ANY; // listen to any address
    serverAddress.sin_family = AF_INET;         // use IPv4
    serverAddress.sin_port = htons(portno);     // listen to the port provided

    bindResult = bind(serverSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress));
    if (bindResult < 0) {
        fprintf(stderr, "ERROR on binding\n");
        exit(1);
    }

    // listen for connections
    listenResult = listen(serverSocket, 5);
    if (listenResult < 0) {
        fprintf(stderr, "ERROR on listen\n");
        exit(1);
    }

    // accept connections
    clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddress, (socklen_t *)&addressLength);
    if (clientSocket < 0) {
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
        if (recvSize < 0) {
            fprintf(stderr, "ERROR reading from socket\n");
            exit(1);
        }

        if (mode == 1) {
            sendSize = send(clientSocket, &(int){0}, sizeof(int), 0);
            if (sendSize < 0) {
                fprintf(stderr, "ERROR writing to socket\n");
                exit(1);
            }
            break;
        }
        else if (mode == 2) {
            sendSize = send(clientSocket, &(int){0}, sizeof(int), 0);
            if (sendSize < 0) {
                fprintf(stderr, "ERROR writing to socket\n");
                exit(1);
            }
            break;
        }
        else {
            sendSize = send(clientSocket, &(int){-1}, sizeof(int), 0);
            // ask the client to send the mode again
            continue;
        }
    }
}