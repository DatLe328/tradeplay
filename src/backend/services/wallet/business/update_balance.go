package business

import (
	"context"
	"errors"
	"fmt"
	"tradeplay/services/wallet/entity"

	"github.com/DatLe328/service-context/core"
	"gorm.io/gorm"
)

func (biz *business) Deposit(ctx context.Context, userId int, amount float64, refType, refId, description string) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}

	return biz.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		wallet, err := biz.repo.GetWalletForUpdate(ctx, tx, userId, "VND")
		if err != nil {
			return core.ErrEntityNotFound(entity.Wallet{}.TableName(), errors.New("wallet not found"))
		}

		before := wallet.Balance
		after := before + amount

		if err := tx.Model(wallet).Update("balance", after).Error; err != nil {
			return err
		}

		log := &entity.WalletTransaction{
			SQLModel:      core.NewSQLModel(),
			WalletId:      wallet.Id,
			Amount:        amount,
			BeforeBalance: before,
			AfterBalance:  after,
			Type:          entity.TxTypeDeposit,
			RefType:       refType,
			RefId:         refId,
			Description:   description,
		}

		if err := biz.repo.CreateWalletTransaction(ctx, tx, log); err != nil {
			return err
		}

		return nil
	})
}

func (biz *business) Deduct(ctx context.Context, userId int, amount float64, refType, refId, description string) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}

	return biz.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		wallet, err := biz.repo.GetWalletForUpdate(ctx, tx, userId, "VND")
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return core.ErrEntityNotFound(entity.Wallet{}.TableName(), errors.New("wallet not found"))
			}
			return err
		}

		if wallet.Balance < amount {
			return fmt.Errorf("insufficient balance: have %.2f, need %.2f", wallet.Balance, amount)
		}

		before := wallet.Balance
		after := before - amount

		if err := tx.Model(wallet).Update("balance", after).Error; err != nil {
			return err
		}

		log := &entity.WalletTransaction{
			SQLModel:      core.NewSQLModel(),
			WalletId:      wallet.Id,
			Amount:        -amount,
			BeforeBalance: before,
			AfterBalance:  after,
			Type:          entity.TxTypePurchase,

			RefType:     refType,
			RefId:       refId,
			Description: description,
		}

		if err := biz.repo.CreateWalletTransaction(ctx, tx, log); err != nil {
			return err
		}

		return nil
	})
}
