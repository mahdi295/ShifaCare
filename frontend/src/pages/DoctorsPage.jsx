import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import PublicLayout from '../layouts/PublicLayout';
import DoctorCard from '../components/ui/DoctorCard';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { DoctorCardSkeleton } from '../components/ui/SkeletonLoader';
import { StaggerContainer, StaggerItem, HoverLift } from '../components/ui/PageTransition';
import { Search, Filter, Loader2, Stethoscope } from 'lucide-react';

const DoctorsPage = () => {
  const [doctors,     setDoctors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [deptFilter,  setDeptFilter]  = useState('');
  const [availFilter, setAvailFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (deptFilter)  params.append('department', deptFilter);
        if (availFilter) params.append('available',  availFilter);

        const [docRes, deptRes] = await Promise.all([
          api.get(`/doctors?${params.toString()}`),
          api.get('/departments'),
        ]);
        setDoctors(docRes.data.data);
        setDepartments(deptRes.data.data);
      } catch {
        /* non-fatal */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deptFilter, availFilter]);

  const filtered = doctors.filter((doc) =>
    doc.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Find a Specialist</p>
            <h1 className="text-4xl font-bold">Our Doctors</h1>
            <p className="text-muted mt-4 max-w-xl mx-auto">
              Browse and book appointments with verified specialists across all departments.
            </p>
          </div>

          {/* Filters row */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                className="nm-input w-full pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Department filter */}
            <div className="relative md:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
              <select
                className="nm-input w-full pl-11 bg-background appearance-none cursor-pointer"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Availability filter */}
            <div className="md:w-48">
              <select
                className="nm-input w-full bg-background appearance-none cursor-pointer"
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
              >
                <option value="">All Availability</option>
                <option value="true">Available Now</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted mb-6">
              Showing <span className="font-semibold text-text">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
              {search && <> matching "<span className="text-primary">{search}</span>"</>}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <DoctorCardSkeleton key={n} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doc) => (
                <StaggerItem key={doc._id}>
                  <HoverLift><DoctorCard doctor={doc} /></HoverLift>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <NeumorphicBox className="p-16 text-center">
              <Stethoscope className="mx-auto text-muted mb-4" size={40} />
              <p className="font-semibold text-lg">No doctors found</p>
              <p className="text-muted text-sm mt-2">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => { setSearch(''); setDeptFilter(''); setAvailFilter(''); }}
                className="nm-button text-sm text-primary mt-5 py-2.5 px-6"
              >
                Clear Filters
              </button>
            </NeumorphicBox>
          )}

        </div>
      </section>
    </PublicLayout>
  );
};

export default DoctorsPage;
