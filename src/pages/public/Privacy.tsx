import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const Privacy: React.FC = () => {
  return (
    <div className="py-12 bg-gray-50/50 flex-1 animate-fade-in-up">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <Badge variant="neutral" size="sm">Legal Notice</Badge>
          <h1 className="text-3xl font-extrabold font-heading text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-gray-400 font-semibold">Last updated: June 19, 2026</p>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>1. Data Collection & Synced Clerk Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              KnowToHire utilizes Clerk for core user identity and session management. When you sign up, your basic metadata (email address, full name, profile image) is captured by Clerk and subsequently synced to our secure database environment.
            </p>
            <p>
              We collect profile information including professional achievements, employer details, and system configurations to offer custom career matching diagnostics.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white" id="cookies">
          <CardHeader>
            <CardTitle>2. Cookies & Local Session Cache</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              We utilize essential cookies and browser local storage mechanisms (such as localStorage caches) to maintain user dashboard roles (Candidate, Employer, Admin) and sync layout states.
            </p>
            <p>
              These identifiers do not track user activities across third-party websites and are deleted when signing out.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>3. System Logs & Audit Trails</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500 leading-relaxed space-y-3">
            <p>
              To protect the integrity of candidate resources and employer listings, administrative alterations are tracked using audit logs. We capture changes to roles, billing parameters, and profile details to prevent identity fraud.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
