package mocks

type HasherMock struct {
	HashPasswordFn    func(salt, password string) (string, error)
	ComparePasswordFn func(hashed, salt, password string) bool
}

func (m *HasherMock) HashPassword(salt, password string) (string, error) {
	return m.HashPasswordFn(salt, password)
}

func (m *HasherMock) CompareHashPassword(
	hashed, salt, password string,
) bool {
	return m.ComparePasswordFn(hashed, salt, password)
}
