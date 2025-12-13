import Container from "@/components/container";
import { Header } from "@/components/header";
import { SettingsClient } from "@/components/settings-client";

const Page = () => {
  return (
    <Container className="max-w-6xl">
      <div className="max-w-3xl flex-1 w-full gap-20 flex flex-col mx-auto">
        <Header />
        <div className="flex  flex-col w-full gap-6 flex-1">
          <SettingsClient />
        </div>
      </div>
    </Container>
  );
};

export default Page;
