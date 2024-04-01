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

    // close the socket
    close(clientSocket);

    return 0;
}