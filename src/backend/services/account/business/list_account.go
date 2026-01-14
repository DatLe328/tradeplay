package business

import (
	"context"
	"fmt"
	"html"
	"strings"
	"tradeplay/services/account/entity"

	"github.com/DatLe328/service-context/core"
)

func (biz *business) ListAccount(
	ctx context.Context,
	filter *entity.Filter,
	paging *core.Paging,
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
	result, err := biz.accountRepo.GetAccountList(ctx, filter, paging)
	if err != nil {
		return nil, err
	}

	for i := range result {
		result[i].Mask()
	}

	if len(result) > 0 {
		lastItem := result[len(result)-1]

		paging.NextCursor = fmt.Sprintf("%d", lastItem.FakeId)
	}

	if len(result) < paging.Limit {
		paging.NextCursor = ""
	}

	return result, nil
}
