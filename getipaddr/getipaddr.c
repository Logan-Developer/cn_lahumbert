#include <stdio.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <string.h>
#include <stdlib.h>

int showUDP = 0;
int showIPv4 = 1;
int showIPv6 = 1;

void printHelp()
{
    fprintf(stderr, "Usage: getipaddr <hostname> [-u]\n");
    fprintf(stderr, "Options:\n");
    fprintf(stderr, "  -u: UDP instead of TCP\n");
    fprintf(stderr, "  -v [4|6]: IPV4 or IPV6\n");
    fprintf(stderr, "  -h: Show this help message\n");
}

int checkArgs(int argc, char *argv[])
{
    if (argc < 2)
    {
        printHelp();
        return 1;
    }
    // check that first argument is a hostname
    if (argv[1][0] == '-')
    {
        fprintf(stderr, "Invalid hostname: %s\n", argv[1]);
        printHelp();
        return 1;
    }

    for (int i = 2; i < argc; i++)
    {
        if (strcmp(argv[i], "-u") == 0)
        {
            showUDP = 1;
        }
        else if (strcmp(argv[i], "-v") == 0)
        {
            if (i + 1 >= argc)
            {
                fprintf(stderr, "Missing argument for -v\n");
                printHelp();
                return 1;
            }

            if (strcmp(argv[i + 1], "4") == 0)
            {
                // IPv4
                showIPv6 = 0;
            }
            else if (strcmp(argv[i + 1], "6") == 0)
            {
                // IPv6
                showIPv4 = 0;
            }
            else
            {
                fprintf(stderr, "Invalid argument for -v: %s\n", argv[i + 1]);
                printHelp();
                return 1;
            }

            i++;
        }
        else if (strcmp(argv[i], "-h") == 0)
        {
            printHelp();
            return 1;
        }
        else
        {
            fprintf(stderr, "Unknown option: %s\n", argv[i]);
            printHelp();
            return 1;
        }
    }

    return 0;
}

int main(int argc, char *argv[])
{
    if (checkArgs(argc, argv))
    {
        return 1;
    }

    struct addrinfo *addressInfo, hints;

    // set hints
    memset(&hints, 0, sizeof(hints));
    hints.ai_socktype = showUDP ? SOCK_DGRAM : SOCK_STREAM; // SOCK_STREAM for TCP, SOCK_DGRAM for UDP

    if (showIPv4 && showIPv6)
    {
        hints.ai_family = AF_UNSPEC; // AF_UNSPEC for both IPv4 and IPv6
    }
    else if (showIPv4)
    {
        hints.ai_family = AF_INET; // AF_INET for IPv4
    }
    else
    {
        hints.ai_family = AF_INET6; // AF_INET6 for IPv6
    }

    // get address info
    int status = getaddrinfo(argv[1], NULL, &hints, &addressInfo);

    if (status != 0)
    {
        perror("getaddrinfo");
        return 1;
    }

    printf("IP addresses for %s:\n\n", argv[1]);
    
    struct addrinfo *currentAddressInfo;
    for (currentAddressInfo = addressInfo; currentAddressInfo != NULL; currentAddressInfo = currentAddressInfo->ai_next)
    {
        void *address;
        char ipAddress[INET6_ADDRSTRLEN];

        if (currentAddressInfo->ai_family == AF_INET)
        {
            struct sockaddr_in *ipv4 = (struct sockaddr_in *)currentAddressInfo->ai_addr;
            address = &(ipv4->sin_addr);
        }
        else
        {
            struct sockaddr_in6 *ipv6 = (struct sockaddr_in6 *)currentAddressInfo->ai_addr;
            address = &(ipv6->sin6_addr);
        }

        inet_ntop(currentAddressInfo->ai_family, address, ipAddress, sizeof(ipAddress));

        printf("%s\n", ipAddress);
    }

    free(addressInfo);
    return 0;
}