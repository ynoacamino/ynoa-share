package main

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	ID   string
	Conn *websocket.Conn
}

var clients = make(map[string]*Client)
var clientMutex sync.Mutex

func HandleWs(w http.ResponseWriter, r *http.Request) {
	userId := uuid.New().String()
	conn, err := upgrader.Upgrade(w, r, nil)

	fmt.Println("User connected:", userId)

	if err != nil {
		log.Println("Error upgrading websocket:", err)
		return
	}
	defer conn.Close()

	clientMutex.Lock()
	clients[userId] = &Client{ID: userId, Conn: conn}
	clientMutex.Unlock()

	defer func() {
		clientMutex.Lock()
		delete(clients, userId)
		clientMutex.Unlock()
	}()

	for {
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading from websocket:", err)
			break
		}

		log.Println("Received message from websocket:", string(data))

		broadcastMessage(userId, messageType, data)
	}
}

func broadcastMessage(senderId string, messageType int, data []byte) {
	clientMutex.Lock()
	defer clientMutex.Unlock()

	for id, client := range clients {
		if id != senderId {
			err := client.Conn.WriteMessage(messageType, data)
			if err != nil {
				log.Println("Error writing to client:", err)
				client.Conn.Close()
				delete(clients, id)
			}
		}
	}
}
