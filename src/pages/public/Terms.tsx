import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const Terms: React.FC = () => {
  return (
    <div className="py-12 bg-gray-50/50 flex-1 animate-fade-in-up">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <Badge variant="neutral" size="sm">Legal Agreement</Badge>
          <h1 className="text-3xl font-extrabold font-heading text-gray-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-gray-400 font-semibold">Last updated: June 19, 2026</p>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>1. Acceptable Use of KnowToHire</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              By signing up for KnowToHire, you agree to submit only authentic credentials and accurate company parameters. Candidates, employers, and administrators must utilize the platform strictly for career intelligence, professional resources collection, and recruitment coordination.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>2. Platform Subscriptions & Billing</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              While this is Sprint 1 of the platform foundation build where payment configurations are mocked, future sprints will integrate paid subscriptions. All mock charges generated in the simulator are for demonstration purposes only.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>3. User Roles & Account Security</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              Your account permissions are tied to your designated role (Candidate, Employer, or Admin). Any attempt to bypass access layouts or edit role configurations without proper administrative rights constitutes a breach of these terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
