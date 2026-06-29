import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import PublicLayout from "../layouts/PublicLayout";
import NeumorphicBox from "../components/ui/NeumorphicBox";
import DoctorCard from "../components/ui/DoctorCard";
import { useTranslation } from "react-i18next";
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";

// ── Department icons map (by name keyword) ───────────────────────────────────
const getDeptIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("cardio")) return "❤️";
  if (n.includes("neuro")) return "🧠";
  if (n.includes("pediatr")) return "👶";
  if (n.includes("ortho")) return "🦴";
  if (n.includes("eye") || n.includes("ophthal")) {
    return "👁️";
  }
  if (n.includes("derm")) return "🧴";
  if (n.includes("gyn") || n.includes("gyne") || n.includes("obst")) {
    return "🌸";
  }
  if (n.includes("ent")) return "👂";
  if (n.includes("dent")) return "🦷";
  if (n.includes("uro")) return "🧍";
  if (n.includes("neph")) return "🩸";
  if (n.includes("pulmo")) return "🫁";
  if (n.includes("onco")) return "🧬";
  if (n.includes("psych")) return "🧘";
  if (n.includes("general")) return "🩺";
  return "🏥";
};

// ── Department list page ──────────────────────────────────────────────────────
const DepartmentsList = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/departments")
      .then((r) => setDepartments(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-28">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            {t('departmentsPage.tag')}
          </p>
          <h1 className="text-4xl font-bold">{t('departmentsPage.title')}</h1>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            {t('departmentsPage.subtitle')}
          </p>
        </div>

        {departments.length === 0 ? (
          <NeumorphicBox className="p-16 text-center">
            <p className="text-muted">{t('departmentsPage.noDepartments')}</p>
          </NeumorphicBox>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Link key={dept._id} to={`/departments/${dept._id}`}>
                <NeumorphicBox className="p-7 h-full hover:scale-[1.01] transition-transform duration-200 group">
                  <div className="text-4xl mb-5">{getDeptIcon(dept.name)}</div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  {dept.description && (
                    <p className="text-sm text-muted leading-relaxed mt-2 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-1.5 text-primary text-sm font-semibold">
                    {t('departmentsPage.viewDoctors')} <ArrowRight size={15} />
                  </div>
                </NeumorphicBox>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Single department detail page ─────────────────────────────────────────────
const DepartmentDetail = ({ id }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/departments/${id}`)
      .then((r) => setData(r.data.data))
      .catch(() => navigate("/departments"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-28">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  if (!data) return null;

  const { name, description, doctors = [] } = data;

  return (
    <div className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/departments"
          className="inline-flex items-center gap-2 text-muted hover:text-primary text-sm font-medium mb-10 transition-colors"
        >
          <ArrowLeft size={15} /> {t('departmentsPage.backToDepartments')}
        </Link>

        {/* Header */}
        <NeumorphicBox className="p-10 mb-10">
          <div className="flex items-start gap-6">
            <div className="text-5xl shrink-0">{getDeptIcon(name)}</div>
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              {description && (
                <p className="text-muted mt-3 leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 text-sm text-muted">
                <Users size={15} className="text-primary" />
                <span>
                  {doctors.length} {doctors.length !== 1 ? t('departmentsPage.availableDoctors') : t('departmentsPage.availableDoctor')}
                </span>
              </div>
            </div>
          </div>
        </NeumorphicBox>

        {/* Doctors */}
        {doctors.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <Stethoscope className="mx-auto text-muted mb-4" size={36} />
            <p className="font-semibold">
              {t('departmentsPage.noDoctorsTitle')}
            </p>
            <p className="text-muted text-sm mt-2">
              {t('departmentsPage.noDoctorsText')}
            </p>
            <Link
              to="/doctors"
              className="nm-button-accent inline-block mt-6 text-sm py-2.5 px-8"
            >
              {t('departmentsPage.browseAllDoctors')}
            </Link>
          </NeumorphicBox>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6">{t('departmentsPage.availableDoctorsHeading')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Router component — switches between list and detail ───────────────────────
const DepartmentsPage = () => {
  const { id } = useParams();
  return (
    <PublicLayout>
      {id ? <DepartmentDetail id={id} /> : <DepartmentsList />}
    </PublicLayout>
  );
};

export default DepartmentsPage;
