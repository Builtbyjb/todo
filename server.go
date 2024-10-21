package main

import (
	"todo-go/templates"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.GET("/", getHandler)
	e.Logger.Fatal(e.Start(":8000"))
}

func getHandler(c echo.Context) error {
	component := templates.Todo()
	return render(c, component)
}

func render(ctx echo.Context, cmp templ.Component) error {
	return cmp.Render(ctx.Request().Context(), ctx.Response())
}

// func database() {
//
// }
//
