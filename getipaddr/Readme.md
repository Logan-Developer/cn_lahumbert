# Small C program that uses the getaddrinfo() function to get the IP addresses associated with a domain name.

## Usage
```bash
make
./getipaddr <domain> [-v [46]] [-u] [-h]
```

## Options
- `<domain>`: The domain name to get the IP addresses for.
- `-v [46]`: Use IPv4 or IPv6. If not specified, both are used.
- `-u`: Use UDP instead of TCP.
- `-h`: Display help message.

