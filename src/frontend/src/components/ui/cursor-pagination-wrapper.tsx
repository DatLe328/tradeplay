import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/stores/languageStore";

interface CursorPaginationProps {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  currentPage?: number;
  onGoToPage?: (page: number) => void;
  maxKnownPage?: number;
  hasMoreBeyondKnown?: boolean;
  itemCount?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (current > 3) pages.push("...");

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  if (!pages.includes(total)) pages.push(total);

  return pages;
}

export function CursorPaginationWrapper({
  hasMore,
  hasPrev,
  onNext,
  onPrev,
  currentPage,
  onGoToPage,
  maxKnownPage,
  hasMoreBeyondKnown = false,
  itemCount,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true,
}: CursorPaginationProps) {
  const { t } = useTranslation();

  const nothingToShow = !hasPrev && !hasMore && !showPageSizeSelector;
  if (nothingToShow) return null;

  const showPages = currentPage !== undefined && onGoToPage !== undefined && currentPage >= 1;
  const effectiveTotal = maxKnownPage ?? (hasMore ? currentPage! + 1 : currentPage ?? 1);
  const pageNumbers = showPages ? buildPageNumbers(currentPage!, effectiveTotal) : [];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 pt-4">
      {/* Page size selector & item count — left */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {itemCount !== undefined && (
          <span>
            {t("pagination.showingCount", { count: itemCount })}
          </span>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>{t("pagination.perPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Prev / page numbers / Next — center */}
      {(hasPrev || hasMore) ? (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="default"
            onClick={onPrev}
            disabled={!hasPrev}
            className="gap-1 pl-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t("pagination.previous")}</span>
          </Button>

          {showPages && (
            <>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground select-none">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon"
                    className="w-9 h-9"
                    onClick={() => {
                      if (p === currentPage) return;
                      if (hasMore && p === currentPage! + 1) onNext();
                      else onGoToPage!(p as number);
                    }}
                    disabled={p === currentPage}
                  >
                    {p}
                  </Button>
                ),
              )}
              {hasMoreBeyondKnown && (
                <span className="px-1 text-muted-foreground select-none">…</span>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="default"
            onClick={onNext}
            disabled={!hasMore}
            className="gap-1 pr-2.5"
          >
            <span>{t("pagination.next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div />
      )}

      {/* Right spacer */}
      <div />
    </div>
  );
}
