package emailc

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"

	sctx "github.com/DatLe328/service-context"
)

type EmailProvider interface {
	SendEmail(to []string, subject string, content string) error
}

type emailProvider struct {
	id          string
	apiKey      string
	senderEmail string // Email người gửi
	senderName  string // Tên người gửi
}

func NewEmailProvider(id string) *emailProvider {
	return &emailProvider{
		id: id,
	}
}

func (p *emailProvider) ID() string { return p.id }

func (p *emailProvider) InitFlags() {
	flag.StringVar(
		&p.apiKey,
		"email-api-key",
		"",
		"Brevo API Key",
	)

	flag.StringVar(
		&p.senderEmail,
		"email-sender",
		"",
		"Sender email address (e.g., noreply@yourdomain.com)",
	)

	flag.StringVar(
		&p.senderName,
		"email-sender-name",
		"Your App",
		"Sender name displayed in email",
	)
}

func (p *emailProvider) Activate(s sctx.ServiceContext) error {
	if p.apiKey == "" {
		return fmt.Errorf("email api key is required")
	}
	if p.senderEmail == "" {
		return fmt.Errorf("email sender is required")
	}
	if p.senderName == "" {
		p.senderName = "Your App"
	}

	s.Logger("email-provider").Infof(
		"email provider initialized with Brevo API, sender=%s <%s>",
		p.senderName, p.senderEmail,
	)

	return nil
}

func (p *emailProvider) Stop() error { return nil }

// Brevo API request structure
type brevoSendRequest struct {
	Sender      brevoSender    `json:"sender"`
	To          []brevoContact `json:"to"`
	Subject     string         `json:"subject"`
	HtmlContent string         `json:"htmlContent"`
}

type brevoSender struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type brevoContact struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

func (p *emailProvider) SendEmail(to []string, subject string, content string) error {
	recipients := make([]brevoContact, 0, len(to))
	for _, email := range to {
		recipients = append(recipients, brevoContact{Email: email})
	}

	payload := brevoSendRequest{
		Sender: brevoSender{
			Name:  p.senderName,
			Email: p.senderEmail,
		},
		To:          recipients,
		Subject:     subject,
		HtmlContent: content,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal request: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest(
		"POST",
		"https://api.brevo.com/v3/smtp/email",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return fmt.Errorf("create request: %v", err)
	}

	// Set headers
	req.Header.Set("accept", "application/json")
	req.Header.Set("api-key", p.apiKey)
	req.Header.Set("content-type", "application/json")

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("send request: %v", err)
	}
	defer resp.Body.Close()

	// Check response
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return fmt.Errorf("brevo api error (status %d): %v", resp.StatusCode, errResp)
	}

	return nil
}
