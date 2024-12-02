import Recommendations from '@/components/Recomendations';

const Page = () => {

  return (
    <div className="h-screen rounded-md p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
      <h1>AI Recommendations</h1>
      <Recommendations />
    </div>
  );
};

export default Page;