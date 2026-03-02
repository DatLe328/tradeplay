package gormc

import (
	"os"
	"testing"

	sctx "tradeplay/pkg/service-context"
)

var testServiceCtx sctx.ServiceContext

func TestMain(m *testing.M) {
	_ = os.Setenv("DB_DRIVER", "sqlite")
	_ = os.Setenv("DB_DSN", ":memory:")

	testServiceCtx = sctx.NewServiceContext(
		sctx.WithName("test"),
		sctx.WithComponent(NewGormDB("gorm", "")),
	)

	if err := testServiceCtx.Load(); err != nil {
		panic(err)
	}

	defer testServiceCtx.Stop()

	code := m.Run()
	os.Exit(code)
}

func TestGormDB_Connect_Success(t *testing.T) {
	gormComp := testServiceCtx.MustGet("gorm").(*gormDB)

	db := gormComp.db
	if db == nil {
		t.Fatal("gorm db should not be nil")
	}
}

type TestUser struct {
	ID   uint
	Name string
}

func TestGormDB_InsertFind_Success(t *testing.T) {
	gormComp := testServiceCtx.MustGet("gorm").(*gormDB)
	db := gormComp.GetDB()

	err := db.AutoMigrate(&TestUser{})
	if err != nil {
		t.Fatal(err)
	}

	user := TestUser{Name: "dat"}

	if err := db.Create(&user).Error; err != nil {
		t.Fatal(err)
	}

	var found TestUser
	if err := db.First(&found, "name = ?", "dat").Error; err != nil {
		t.Fatal(err)
	}
}

func Test_gormDB_Activate(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for receiver constructor.
		id     string
		prefix string
		// Named input parameters for target function.
		serviceCtx sctx.ServiceContext
		wantErr    bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gdb := NewGormDB(tt.id, tt.prefix)
			gotErr := gdb.Activate(tt.serviceCtx)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("Activate() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("Activate() succeeded unexpectedly")
			}
		})
	}
}
