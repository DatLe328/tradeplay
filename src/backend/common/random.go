package common

import (
	"crypto/rand"
	"math/big"
)

const (
	Letters          = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	LettersAndDigits = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	Digits           = "0123456789"
	Alphanumeric     = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	HexCharacters    = "0123456789abcdef"
)

func GenOTP(length int) (string, error) {
	b := make([]byte, length)

	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(Digits))))
		if err != nil {
			return "", err
		}
		b[i] = Digits[n.Int64()]
	}

	return string(b), nil
}

func GenSalt(length int) (string, error) {
	if length <= 0 {
		length = 50
	}
	return randSequence(length, LettersAndDigits)
}

func randSequence(n int, charset string) (string, error) {
	if n <= 0 {
		return "", nil
	}

	result := make([]byte, n)
	charsetLen := big.NewInt(int64(len(charset)))

	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		result[i] = charset[num.Int64()]
	}

	return string(result), nil
}
