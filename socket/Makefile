all: server.out client.out

server.out: server.c
	gcc -g -o server.out server.c

client.out: client.c
	gcc -g -o client.out client.c

clean:
	rm -f server.out client.out