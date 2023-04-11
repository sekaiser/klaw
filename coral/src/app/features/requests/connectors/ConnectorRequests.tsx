import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "src/app/components/Pagination";
import { TableLayout } from "src/app/features/components/layouts/TableLayout";
import { ConnectorRequestsTable } from "src/app/features/requests/connectors/components/ConnectorRequestsTable";
import { getConnectorRequests } from "src/domain/connector";
import { useFiltersValues } from "src/app/features/components/filters/useFiltersValues";
import SearchFilter from "src/app/features/components/filters/SearchFilter";

function ConnectorRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;

  const { search } = useFiltersValues();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["connectorRequests", currentPage, search],
    queryFn: () =>
      getConnectorRequests({
        pageNo: String(currentPage),
        search,
      }),
    keepPreviousData: true,
  });

  const setCurrentPage = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  const pagination =
    data?.totalPages && data.totalPages > 1 ? (
      <Pagination
        activePage={data.currentPage}
        totalPages={data?.totalPages}
        setActivePage={setCurrentPage}
      />
    ) : undefined;

  return (
    <TableLayout
      filters={[<SearchFilter key="connector" />]}
      table={
        <ConnectorRequestsTable
          ariaLabel="Connector requests"
          requests={data?.entries ?? []}
          onDetails={() => null}
          onDelete={() => null}
        />
      }
      pagination={pagination}
      isLoading={isLoading}
      isErrorLoading={isError}
      errorMessage={error}
    />
  );
}

export { ConnectorRequests };
