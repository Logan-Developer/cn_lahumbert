#include <stdio.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <string.h>
#include <stdlib.h>

int checkArgs(int argc, char *argv[])
{
    if (argc != 2)
    {
        fprintf(stderr, "Usage: %s <hostname>\n", argv[0]);
        return 1;
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
    hints.ai_family = AF_UNSPEC; // Both IPv4 and IPv6 are allowed
    hints.ai_socktype = SOCK_STREAM; // SOCK_STREAM for TCP, SOCK_DGRAM for UDP

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