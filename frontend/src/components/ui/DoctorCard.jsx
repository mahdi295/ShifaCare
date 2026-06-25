import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const avatarUrl =
    !doctor.user?.avatar || doctor.user.avatar === 'no-photo.jpg'
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name || 'D')}&size=200&background=1A6BCC&color=fff`
      : doctor.user.avatar;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-card-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <img
          src={avatarUrl}
          alt={`Dr. ${doctor.user?.name}`}
          className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            {doctor.department?.name || 'General'}
          </span>
          <h3 className="text-base font-bold text-heading mt-0.5 truncate">Dr. {doctor.user?.name}</h3>
          <p className="text-sm text-muted truncate">{doctor.specialization}</p>
          <div className="flex items-center gap-3 text-xs text-muted mt-2">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{doctor.experience} yrs exp</span>
            </div>
            <div className={`flex items-center gap-1 ${doctor.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
              {doctor.isAvailable
                ? <CheckCircle2 size={12} />
                : <XCircle size={12} />}
              <span>{doctor.isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-[11px] text-muted">Consultation</p>
          <p className="text-base font-bold text-primary">৳{doctor.fees}</p>
        </div>
        <Link
          to={`/doctors/${doctor._id}`}
          className="btn-primary text-sm py-2 px-4"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
