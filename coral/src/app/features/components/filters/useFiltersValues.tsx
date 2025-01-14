import { useSearchParams } from "react-router-dom";
import { AclType } from "src/domain/acl/acl-types";
import {
  RequestOperationType,
  RequestStatus,
} from "src/domain/requests/requests-types";

type SetFiltersParams =
  | { name: "topic"; value: string }
  | { name: "environment"; value: string }
  | { name: "aclType"; value: AclType | "ALL" }
  | { name: "status"; value: RequestStatus }
  | { name: "teamId"; value: string }
  | { name: "showOnlyMyRequests"; value: boolean }
  | { name: "requestType"; value: RequestOperationType | "ALL" }
  | { name: "search"; value: string };

type UseFiltersValuesParams =
  | {
      defaultTopic?: string;
      defaultEnvironment?: string;
      defaultAclType?: AclType | "ALL";
      defaultStatus?: RequestStatus;
      defaultTeam?: string;
      defaultRequestType?: RequestOperationType | "ALL";
      defaultShowOnlyMyRequests?: boolean;
      defaultSearch?: string;
    }
  | undefined;

const useFiltersValues = (defaultValues: UseFiltersValuesParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    defaultTopic = "",
    defaultEnvironment = "ALL",
    defaultAclType = "ALL",
    defaultStatus = "ALL",
    defaultTeam = "ALL",
    defaultRequestType = "ALL",
    defaultShowOnlyMyRequests = false,
    defaultSearch = "",
  } = defaultValues;

  const topic = searchParams.get("topic") ?? defaultTopic;
  const environment = searchParams.get("environment") ?? defaultEnvironment;
  const aclType =
    (searchParams.get("aclType") as AclType | "ALL") ?? defaultAclType;
  const status = (searchParams.get("status") as RequestStatus) ?? defaultStatus;
  const teamId = searchParams.get("teamId") ?? defaultTeam;
  const showOnlyMyRequests =
    searchParams.get("showOnlyMyRequests") === "true"
      ? true
      : defaultShowOnlyMyRequests;
  const requestType =
    (searchParams.get("requestType") as RequestOperationType | "ALL") ??
    defaultRequestType;
  const search = searchParams.get("search") ?? defaultSearch;

  const setFilterValue = ({ name, value }: SetFiltersParams) => {
    if (
      (value === "ALL" && name !== "status") ||
      value === "" ||
      value === false
    ) {
      searchParams.delete(name);
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    } else {
      const parsedValue = typeof value === "boolean" ? String(value) : value;
      searchParams.set(name, parsedValue);
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    }
  };

  return {
    topic,
    environment,
    aclType,
    status,
    teamId,
    showOnlyMyRequests,
    requestType,
    search,
    setFilterValue,
  };
};

export { useFiltersValues };
