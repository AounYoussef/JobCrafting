import React, { useEffect, useState } from 'react';
import { suggestJobs } from '../services/geminiService';
import { JobListing } from '../types';

interface JobFinderProps {
  targetJob: string;
  isFreelance?: boolean;
}

const JobFinder: React.FC<JobFinderProps> = ({ targetJob, isFreelance = false }) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      // In a real app, this would query a real job board API.
      // Here, we use Gemini to "dream up" perfect matching jobs to simulate the experience.
      const query = isFreelance ? `Freelance ${targetJob} projects` : `${targetJob} roles`;
      const result = await suggestJobs(query);
      
      // Filter if freelance page (in case AI mixed them up, though prompt handles it)
      const filtered = isFreelance 
        ? result.filter((j: any) => j.type === 'Freelance' || j.type === 'Contract') 
        : result;
        
      setJobs(filtered);
      setLoading(false);
    };

    if (targetJob) {
      fetchJobs();
    }
  }, [targetJob, isFreelance]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isFreelance ? 'Freelance Opportunities' : 'Job Finder'}</h2>
          <p className="text-gray-500 mt-2">
            Curated {isFreelance ? 'projects' : 'positions'} for <span className="font-semibold text-brand-600">{targetJob || 'you'}</span>
          </p>
        </div>
        <button 
            className="text-brand-600 hover:text-brand-800 text-sm font-medium"
            onClick={() => window.location.reload()}
        >
            Refresh Listings
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2 pt-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-600 font-bold text-lg">
                    {job.company ? job.company[0] : 'J'}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.type === 'Freelance' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {job.type}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1">{job.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{job.company} • {job.location}</p>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="font-semibold text-gray-900">{job.salary}</span>
                  <button className="text-brand-600 font-medium text-sm hover:underline">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
                No listings found. Try updating your target job in the dashboard.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobFinder;
