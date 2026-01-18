package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"learnstack/todo-service/config"
	"learnstack/todo-service/database"
	"learnstack/todo-service/routes"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.ConnectDatabase()

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.Default())

	// Setup routes
	routes.SetupRoutes(router)

	// Start server
	log.Println("Server starting on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}