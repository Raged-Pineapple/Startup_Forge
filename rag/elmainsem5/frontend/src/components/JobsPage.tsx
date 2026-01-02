import { Search, MapPin, Briefcase, DollarSign, Filter, Bookmark } from 'lucide-react';
import { useState } from 'react';

export function JobsPage() {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const jobs = [
    {
      id: 'job-1',
      title: 'Senior Product Designer',
      company: 'Tech Corp',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      location: 'San Francisco, CA',
      salary: '$120k-$160k',
      type: 'Full-time',
      workType: 'Remote',
      postedDate: '2 days ago',
      applicants: 45,
      description: 'We are looking for a talented Senior Product Designer to join our team...'
    },
    {
      id: 'job-2',
      title: 'UX/UI Designer',
      company: 'StartupXYZ',
      companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      location: 'New York, NY',
      salary: '$100k-$140k',
      type: 'Full-time',
      workType: 'Hybrid',
      postedDate: '5 days ago',
      applicants: 78,
      description: 'Join our growing startup as a UX/UI Designer and help shape our product...'
    },
    {
      id: 'job-3',
      title: 'Product Designer',
      company: 'Design Studio',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop',
      location: 'Austin, TX',
      salary: '$90k-$120k',
      type: 'Full-time',
      workType: 'On-site',
      postedDate: '1 week ago',
      applicants: 32,
      description: 'Creative product designer needed for innovative projects...'
    },
    {
      id: 'job-4',
      title: 'Lead UX Designer',
      company: 'Innovation Labs',
      companyLogo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop',
      location: 'Seattle, WA',
      salary: '$140k-$180k',
      type: 'Full-time',
      workType: 'Remote',
      postedDate: '3 days ago',
      applicants: 89,
      description: 'Lead a team of talented designers and create amazing user experiences...'
    }
  ];

  const handleToggleSave = (jobId: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
    } else {
      newSaved.add(jobId);
    }
    setSavedJobs(newSaved);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !location || 
      job.location.toLowerCase().includes(location.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Job type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Full-time</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Part-time</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Contract</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm text-gray-700 mb-2">Work type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Remote</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Hybrid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">On-site</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm text-gray-700 mb-2">Experience level</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Entry level</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Mid-level</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-700">Senior</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Lead</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {/* Search Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, skill, or company"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, state, or zip code"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>

          {/* Job Preferences Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Briefcase className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-gray-900">Set your job preferences</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tell us what you're looking for and we'll show you jobs that match your preferences
                </p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm">
                  Set preferences
                </button>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            <h2 className="text-xl text-gray-900">
              {filteredJobs.length} jobs found
            </h2>

            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <img 
                    src={job.companyLogo} 
                    alt={job.company}
                    className="w-16 h-16 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl text-gray-900 hover:text-blue-600 cursor-pointer">
                          {job.title}
                        </h3>
                        <p className="text-gray-700 mt-1">{job.company}</p>
                      </div>
                      <button
                        onClick={() => handleToggleSave(job.id)}
                        className={`p-2 rounded hover:bg-gray-100 ${
                          savedJobs.has(job.id) ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        <Bookmark className="w-5 h-5" fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        job.workType === 'Remote' ? 'bg-green-100 text-green-700' :
                        job.workType === 'Hybrid' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.workType}
                      </span>
                      <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-3">{job.description}</p>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-500">
                        {job.applicants} applicants • Posted {job.postedDate}
                      </p>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
