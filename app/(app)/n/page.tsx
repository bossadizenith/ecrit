import Container from "@/components/container";
import { Footer } from "@/components/footer";
import { UserButton } from "@/components/user-button";
import { Notes } from "@/components/notes";

const page = () => {
  return (
    <Container>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold font-mono">ecrit.</h1>
        <UserButton />
      </div>
      <Notes />
      <Footer />
    </Container>
  );
};

export default page;
