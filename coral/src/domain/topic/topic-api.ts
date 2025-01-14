import omitBy from "lodash/omitBy";
import {
  RequestVerdictApproval,
  RequestVerdictDecline,
  RequestVerdictDelete,
} from "src/domain/requests/requests-types";
import {
  transformGetTopicAdvancedConfigOptionsResponse,
  transformGetTopicRequestsResponse,
  transformTopicApiResponse,
} from "src/domain/topic/topic-transformer";
import {
  TopicAdvancedConfigurationOptions,
  TopicApiResponse,
  TopicRequestApiResponse,
} from "src/domain/topic/topic-types";
import api, { API_PATHS } from "src/services/api";
import {
  KlawApiRequest,
  KlawApiRequestQueryParameters,
  KlawApiResponse,
} from "types/utils";
import { convertQueryValuesToString } from "src/services/api-helper";
import { Schema } from "src/app/features/topics/request/form-schemas/topic-request-form";
import { transformAdvancedConfigEntries } from "src/app/features/topics/request/utils";

const getTopics = async (
  params: KlawApiRequestQueryParameters<"getTopics">
): Promise<TopicApiResponse> => {
  const queryParams = convertQueryValuesToString({
    pageNo: params.pageNo,
    env: params.env,
    ...(params.teamId && { teamId: params.teamId }),
    ...(params.topicnamesearch && {
      topicnamesearch: params.topicnamesearch,
    }),
  });

  return api
    .get<KlawApiResponse<"getTopics">>(
      API_PATHS.getTopics,
      new URLSearchParams(queryParams)
    )
    .then(transformTopicApiResponse);
};

type GetTopicNamesArgs = Partial<{
  onlyMyTeamTopics: boolean;
  envSelected?: string;
}>;

const getTopicNames = async ({
  onlyMyTeamTopics,
  envSelected = "ALL",
}: GetTopicNamesArgs = {}) => {
  const isMyTeamTopics = onlyMyTeamTopics ?? false;
  const params = {
    isMyTeamTopics: isMyTeamTopics.toString(),
    envSelected,
  };

  return api.get<KlawApiResponse<"getTopicsOnly">>(
    API_PATHS.getTopicsOnly,
    new URLSearchParams(params)
  );
};

interface GetTopicTeamArgs {
  topicName: string;
  patternType?: "LITERAL" | "PREFIXED";
}

const getTopicTeam = async ({
  topicName,
  patternType = "LITERAL",
}: GetTopicTeamArgs) => {
  const params = { topicName, patternType };

  return api.get<KlawApiResponse<"getTopicTeam">>(
    API_PATHS.getTopicTeam,
    new URLSearchParams(params)
  );
};

const getTopicAdvancedConfigOptions = (): Promise<
  TopicAdvancedConfigurationOptions[]
> =>
  api
    .get<KlawApiResponse<"getAdvancedTopicConfigs">>(
      API_PATHS.getAdvancedTopicConfigs
    )
    .then(transformGetTopicAdvancedConfigOptionsResponse);

const requestTopic = (data: Schema): Promise<unknown> => {
  const payload: KlawApiRequest<"createTopicsCreateRequest"> = {
    description: data.description,
    environment: data.environment.id,
    remarks: data.remarks,
    topicname: data.topicname,
    replicationfactor: data.replicationfactor,
    topicpartitions: parseInt(data.topicpartitions, 10),
    advancedTopicConfigEntries: transformAdvancedConfigEntries(
      data.advancedConfiguration
    ),
    requestOperationType: "CREATE",
  };
  return api.post<
    KlawApiResponse<"createTopicsCreateRequest">,
    KlawApiRequest<"createTopicsCreateRequest">
  >(API_PATHS.createTopicsCreateRequest, payload);
};

const getTopicRequestsForApprover = (
  params: KlawApiRequestQueryParameters<"getTopicRequestsForApprover">
): Promise<TopicRequestApiResponse> => {
  const filteredParams = omitBy(
    { ...params, teamId: String(params.teamId) },
    (value, property) => {
      const omitTeamId = property === "teamId" && value === "undefined";
      const omitSearch = property === "search" && value === "";
      const omitEnv =
        property === "env" && (value === "ALL" || value === undefined);
      const omitOperationType =
        property === "operationType" && value === undefined;

      return omitTeamId || omitSearch || omitEnv || omitOperationType;
    }
  );

  return api
    .get<KlawApiResponse<"getTopicRequestsForApprover">>(
      API_PATHS.getTopicRequestsForApprover,
      new URLSearchParams(filteredParams)
    )
    .then(transformGetTopicRequestsResponse);
};

const getTopicRequests = (
  params: KlawApiRequestQueryParameters<"getTopicRequests">
): Promise<TopicRequestApiResponse> => {
  const filteredParams = omitBy(
    { ...params, isMyRequest: String(Boolean(params.isMyRequest)) },
    (value, property) => {
      const omitIsMyRequest = property === "isMyRequest" && value !== "true"; // Omit if anything else than true
      const omitSearch =
        property === "search" && (value === "" || value === undefined);
      const omitEnv =
        property === "env" && (value === "ALL" || value === undefined);
      const omitRequestOperationType =
        property === "operationType" &&
        (value === "ALL" || value === undefined);

      return (
        omitIsMyRequest || omitSearch || omitEnv || omitRequestOperationType
      );
    }
  );

  return api
    .get<KlawApiResponse<"getTopicRequests">>(
      API_PATHS.getTopicRequests,
      new URLSearchParams(filteredParams)
    )
    .then(transformGetTopicRequestsResponse);
};

const approveTopicRequest = ({
  reqIds,
}: {
  reqIds: RequestVerdictApproval<"SCHEMA">["reqIds"];
}) => {
  return api.post<
    KlawApiResponse<"approveRequest">,
    RequestVerdictApproval<"TOPIC">
  >(API_PATHS.approveRequest, {
    reqIds,
    requestEntityType: "TOPIC",
  });
};

const declineTopicRequest = ({
  reqIds,
  reason,
}: Omit<RequestVerdictDecline<"TOPIC">, "requestEntityType">) => {
  return api.post<
    KlawApiResponse<"declineRequest">,
    RequestVerdictDecline<"TOPIC">
  >(API_PATHS.declineRequest, {
    reqIds,
    reason,
    requestEntityType: "TOPIC",
  });
};

const deleteTopicRequest = ({
  reqIds,
}: Omit<RequestVerdictDelete<"TOPIC">, "requestEntityType">) => {
  return api.post<
    KlawApiResponse<"deleteRequest">,
    RequestVerdictDelete<"TOPIC">
  >(API_PATHS.deleteRequest, {
    reqIds,
    requestEntityType: "TOPIC",
  });
};

export {
  getTopics,
  getTopicNames,
  getTopicTeam,
  getTopicAdvancedConfigOptions,
  requestTopic,
  getTopicRequestsForApprover,
  getTopicRequests,
  approveTopicRequest,
  declineTopicRequest,
  deleteTopicRequest,
};
