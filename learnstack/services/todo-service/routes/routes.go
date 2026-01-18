package routes

import (
	"github.com/gin-gonic/gin"
	"learnstack/todo-service/handlers"
)

func SetupRoutes(router *gin.Engine) {
	todoGroup := router.Group("/todos")
	{
		todoGroup.GET("", handlers.GetTodos)
		todoGroup.POST("", handlers.CreateTodo)
		todoGroup.PUT("/:id", handlers.UpdateTodo)
		todoGroup.DELETE("/:id", handlers.DeleteTodo)
	}
}