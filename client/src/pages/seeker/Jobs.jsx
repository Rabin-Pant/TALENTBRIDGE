import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Briefcase, Filter, X,
  Building2, Clock, DollarSign, ChevronRight, Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP", "REMOTE"];
const EXPERIENCE = ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"];

const formatJobType = (type) => type?.replace("_", " ");

const JobCard = ({ job, index }) => (
  <Link
    to={`/seeker/jobs/${job.id}`}
    className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="flex items-start gap-4">
      {/* Company Logo Placeholder */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-bold text-lg">{job.company?.charAt(0)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 size={13} className="text-gray-400" />
              <span className="text-sm text-gray-500">{job.company}</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 flex-shrink-0 mt-1" />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={12} />
            <span>{formatJobType(job.jobType)}</span>
          </div>
          {(job.salaryMin || job.salaryMax) && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span>
                {job.salaryMin && `$${job.salaryMin.toLocaleString()}`}
                {job.salaryMin && job.salaryMax && " – "}
                {job.salaryMax && `$${job.salaryMax.toLocaleString()}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{new Date(job.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </Link>
);

const SeekerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "", location: "", jobType: "", experience: "", industry: "",
  });

  const fetchJobs = async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/seeker/jobs", { params });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 100);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(filters);
  };

  const clearFilters = () => {
    setFilters({ keyword: "", location: "", jobType: "", experience: "", industry: "" });
    fetchJobs();
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-16 p-6">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-sm text-amber-600 font-medium">
                {jobs.length} opportunities available
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">Find your next career opportunity</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Filter size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{formatJobType(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    {EXPERIENCE.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Technology"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
                >
                  <X size={14} /> Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Jobs List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeekerJobs;