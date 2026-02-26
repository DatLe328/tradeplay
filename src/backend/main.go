// @title           TradePlay API
// @version         1.0
// @description     TradePlay API Documentation
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@tradeplay.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

package main

import "tradeplay/cmd"

func main() {
	cmd.Execute()
}
