import { PageHeader } from "@aivenio/aquarium";
import add from "@aivenio/aquarium/dist/src/icons/add";
import { useNavigate } from "react-router-dom";
import PreviewBanner from "src/app/components/PreviewBanner";
import BrowseConnectors from "src/app/features/connectors/browse/BrowseConnectors";
import Layout from "src/app/layout/Layout";

const ConnectorsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <PreviewBanner linkTarget={"/kafkaConnectors"} />
      <PageHeader
        title={"All Kafka Connectors"}
        primaryAction={{
          text: "Request new Connector",
          onClick: () => navigate("/connectors/request"),
          icon: add,
        }}
      />
      <BrowseConnectors />
    </Layout>
  );
};

export default ConnectorsPage;
