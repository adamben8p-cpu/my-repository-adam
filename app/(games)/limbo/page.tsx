import LimboComponent from "@/app/_components/Limbo/LimboComponent";
import LimboConfig from "@/app/_components/Limbo/LimboConfig";

export default function Page() {
  return (
    <main className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row w-full p-4 lg:p-8">
        <div className="flex justify-center w-full lg:w-1/3 p-4">
          <LimboConfig />
        </div>
        <div className="flex justify-center items-center flex-col w-full lg:w-2/3 p-4">
          <LimboComponent />
        </div>
      </div>
    </main>
  );
}
