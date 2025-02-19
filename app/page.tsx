import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Briefcase, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">CareerPathAI</div>
          <div className="space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Resume Drop */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-white" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          {/* Resume Drop Zone */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-8 text-center">
              Drop Your Resume
            </h1>
            <div className="bg-white border-2 border-dashed border-orange-200 rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer mb-16">
              <Upload className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your file here</h3>
              <p className="text-gray-600 mb-6">or click to upload</p>
              <Button size="lg" className="text-lg px-8">
                Upload Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">
              <span className="text-orange-500">Find Your Dream Job</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let our AI match you with the perfect opportunities. No more endless job searching.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl p-6 mb-6 inline-block">
                <Upload className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1-Click Application</h3>
              <p className="text-gray-600">
                Upload once, apply everywhere. Our AI creates your professional profile automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl p-6 mb-6 inline-block">
                <Sparkles className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Get matched with jobs that perfectly align with your skills and experience.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl p-6 mb-6 inline-block">
                <Briefcase className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direct Opportunities</h3>
              <p className="text-gray-600">
                Receive job offers directly from companies looking for someone exactly like you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Join Thousands of Successful Hires
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-5xl font-bold text-orange-500 mb-2">93%</p>
                <p className="text-gray-600">Match Rate</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-5xl font-bold text-orange-500 mb-2">48h</p>
                <p className="text-gray-600">Average Response Time</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-5xl font-bold text-orange-500 mb-2">10k+</p>
                <p className="text-gray-600">Successful Placements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Dream Job is One Upload Away
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who found their perfect career match through CareerPathAI
          </p>
          <Button size="lg" className="text-lg px-12">
            Upload Your Resume
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>
  );
} 