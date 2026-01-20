import { LandUseWorkflow } from '@/components/land-use/LandUseWorkflow';
import { useRouter } from 'next/router';

export default function LandUseAnalysisPage() {
  const router = useRouter();

  const handleAnalysisStart = (session: any) => {
    console.log('Analysis session created:', session);
    // Future: Navigate to analysis view or update URL params
    // router.push(`/land-use/analysis?session=${session.session_id}`);
  };

  return (
    <div className="land-use-analysis-page">
      <LandUseWorkflow onAnalysisStart={handleAnalysisStart} />
    </div>
  );
}
