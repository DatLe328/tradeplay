package business

import (
	"context"
	"html"
	"strings"
	"tradeplay/common"
	"tradeplay/services/account/entity"
)

func (biz *business) FindAccounts(
	ctx context.Context,
	filter *entity.Filter,
	paging *common.Paging,
) ([]entity.Account, error) {
	if filter.Search != "" {
		filter.Search = strings.TrimSpace(filter.Search)

		if len(filter.Search) > 30 {
			filter.Search = filter.Search[:30]
		}

		filter.Search = html.EscapeString(filter.Search)

		filter.Search = strings.ReplaceAll(filter.Search, "%", "")
		filter.Search = strings.ReplaceAll(filter.Search, "_", "")
	}
	result, err := biz.accountRepo.FindAccounts(ctx, filter, paging)
	if err != nil {
		return nil, err
	}

	for i := range result {
		result[i].Mask()
	}

	return result, nil
}
