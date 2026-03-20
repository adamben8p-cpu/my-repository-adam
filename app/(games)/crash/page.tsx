import CrashComponent from "@/app/_components/Crash/CrashComponent";
import CrashConfig from "@/app/_components/Crash/CrashConfig";

export default function Page() {
  return (
    <main className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row w-full p-4 lg:p-8">
        <div className="flex justify-center w-full lg:w-1/3 p-4">
          <CrashConfig />
        </div>
        <div className="flex justify-center flex-col w-full lg:w-2/3 p-4">
          <CrashComponent />
        </div>
      </div>
    </main>
  );
}
