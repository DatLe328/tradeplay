package common

import (
	"crypto/rand"
	"math/big"
)

func GenOTP(length int) (string, error) {
	const digits = "0123456789"
	b := make([]byte, length)

	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		b[i] = digits[n.Int64()]
	}

	return string(b), nil
}
