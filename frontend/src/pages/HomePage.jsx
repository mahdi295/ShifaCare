import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import PublicLayout from "../layouts/PublicLayout";
import NeumorphicBox from "../components/ui/NeumorphicBox";
import DoctorCard from "../components/ui/DoctorCard";
import HeroSlider from "../components/ui/HeroSlider";
import { DoctorCardSkeleton } from "../components/ui/SkeletonLoader";
import {
  StaggerContainer,
  StaggerItem,
  FadeIn,
  HoverLift,
} from "../components/ui/PageTransition";
import {
  Activity,
  ArrowRight,
  Users,
  Calendar,
  Award,
  Clock,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Stethoscope,
  ChevronDown,
  CheckCircle2,
  Star,
  Phone,
} from "lucide-react";

const STATS = [
  { icon: Users, value: "15,000+", label: "Patients Served" },
  { icon: Award, value: "120+", label: "Expert Doctors" },
  { icon: Calendar, value: "50,000+", label: "Appointments Done" },
  { icon: Clock, value: "24/7", label: "Emergency Support" },
];

const SERVICES = [
  {
    icon: Heart,
    title: "Cardiology",
    desc: "Heart disease diagnosis, treatment & prevention by senior cardiologists.",
  },
  {
    icon: Brain,
    title: "Neurology",
    desc: "Expert neurological care for brain, spine and nervous system disorders.",
  },
  {
    icon: Baby,
    title: "Pediatrics",
    desc: "Compassionate child healthcare from newborn through adolescence.",
  },
  {
    icon: Bone,
    title: "Orthopedics",
    desc: "Bone, joint and muscle care including minimally-invasive surgery.",
  },
  {
    icon: Eye,
    title: "Ophthalmology",
    desc: "Comprehensive eye care and advanced vision correction treatments.",
  },
  {
    icon: Stethoscope,
    title: "General Medicine",
    desc: "Primary healthcare, routine check-ups and chronic disease management.",
  },
];

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Visit our Doctors page, choose a specialist, pick an available date and time slot, and confirm. You receive a serial number immediately.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept bKash, Nagad, Rocket, Visa and MasterCard via SSLCommerz. You can also pay cash at reception.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Log into your patient dashboard and cancel any pending appointment. Rescheduling requires cancelling and rebooking.",
  },
  {
    q: "How do I get my prescription?",
    a: "After your consultation the doctor issues a digital prescription. It appears in your dashboard and can be downloaded as a PDF.",
  },
  {
    q: "Is my medical data secure?",
    a: "All data is encrypted in transit and at rest. Only you, your doctor, and authorized hospital staff can access your records.",
  },
  {
    q: "Do you offer emergency services?",
    a: "Yes, our emergency department operates 24/7. For life-threatening emergencies please call 999 or come directly to the hospital.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rahima Begum",
    role: "Patient, Dhaka",
    rating: 5,
    text: "Booking was effortless and the doctor was incredibly thorough. The digital prescription saved me a trip back.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Md. Karim",
    role: "Patient, Chittagong",
    rating: 5,
    text: "The slot system means no waiting in queue. I show up exactly at my time. Absolutely fantastic experience.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Nasrin Akter",
    role: "Patient, Sylhet",
    rating: 5,
    text: "Online payment via bKash was smooth. I could see my full appointment history in one place.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Dr. Arafat Hossain",
    role: "General Physician",
    rating: 5,
    text: "As a doctor, the prescription module is a game-changer. My patients always have their records ready.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Salma Khatun",
    role: "Patient, Rajshahi",
    rating: 5,
    text: "I was worried about online payment but it was completely secure. Got my confirmation instantly.",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
  },
  {
    name: "Tanvir Ahmed",
    role: "Patient, Khulna",
    rating: 5,
    text: "The department filter helped me find exactly the right specialist within minutes.",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-background transition-colors"
      >
        <span className="font-semibold text-sm text-body pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={`text-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const TestimonialsCarousel = () => {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const SPEED = 0.4;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      posRef.current += SPEED;
      const half = track.scrollWidth / 2;
      if (posRef.current >= half) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    const pause = () => cancelAnimationFrame(animRef.current);
    const resume = () => {
      animRef.current = requestAnimationFrame(step);
    };
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(animRef.current);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-16 bg-surface border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          Patient Stories
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-heading">
          What Our Patients Say
        </h2>
      </div>
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map(({ name, role, rating, text, avatar }, idx) => (
            <div
              key={idx}
              className="w-72 shrink-0 rounded-xl bg-surface border border-border p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5 line-clamp-3">
                "{text}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={name}
                  className="w-9 h-9 rounded-lg object-cover border border-border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="w-9 h-9 rounded-lg items-center justify-center bg-primary-light text-primary font-bold text-sm"
                  style={{ display: "none" }}
                >
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-heading">{name}</p>
                  <p className="text-xs text-muted">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/doctors?available=true"), api.get("/departments")])
      .then(([docRes, deptRes]) => {
        setFeaturedDoctors(docRes.data.data.slice(0, 3));
        setDepartments(deptRes.data.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  return (
    <PublicLayout>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Image Slider */}
            <div className="order-2 lg:order-1">
              <HeroSlider />
            </div>

            {/* Right: Text Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
                <Activity size={12} /> Bangladesh's Leading Healthcare Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-tight text-heading">
                Your Health, <span className="text-primary">Perfectly</span>{" "}
                Managed
              </h1>
              <p className="mt-5 text-body text-lg leading-relaxed max-w-xl">
                Book appointments with verified specialists, receive digital
                prescriptions, and manage your entire healthcare journey — all
                in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/doctors" className="btn-primary py-3 px-7 text-base">
                  Book Appointment <ArrowRight size={17} />
                </Link>
                <Link to="/about" className="btn-outline py-3 px-7 text-base">
                  Learn More
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-5">
                {[
                  "No waiting queues",
                  "Digital prescriptions",
                  "Secure payments",
                ].map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-secondary shrink-0"
                    />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <section className="px-6 py-4 border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-6 py-4 first:pl-0 last:pr-0"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-heading">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              What We Offer
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-heading">
              Comprehensive Medical Services
            </h2>
            <p className="text-muted mt-2 max-w-xl">
              World-class specialists across every major medical discipline, all
              bookable online.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-surface rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-card-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-heading mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/departments"
              className="btn-outline text-sm inline-flex items-center gap-2"
            >
              View All Departments <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ──────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              Meet Our Team
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-heading">
              Featured Specialists
            </h2>
            <p className="text-muted mt-2 max-w-xl">
              Handpicked doctors with exceptional expertise and patient
              satisfaction records.
            </p>
          </div>

          {loadingDoctors ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <DoctorCardSkeleton key={n} />
              ))}
            </div>
          ) : featuredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredDoctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          ) : (
            <div className="bg-background rounded-xl p-10 text-center border border-border">
              <p className="text-muted">
                No doctors available at the moment. Check back soon.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/doctors"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              See All Doctors <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS STRIP ─────────────────────────────────────────────── */}
      {departments.length > 0 && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
                Specialties
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-heading">
                Browse Departments
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {departments.map((dept) => (
                <Link key={dept._id} to={`/departments/${dept._id}`}>
                  <div className="bg-surface rounded-xl border border-border p-4 text-center hover:border-primary/40 hover:bg-primary-light transition-all duration-150 group">
                    <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center mx-auto mb-2.5 group-hover:bg-surface transition-colors">
                      <Stethoscope size={16} className="text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-body group-hover:text-primary transition-colors">
                      {dept.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link
                to="/departments"
                className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <TestimonialsCarousel />

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              Got Questions?
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-heading">
              Frequently Asked
            </h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-surface/15 flex items-center justify-center mx-auto mb-5">
            <Activity size={24} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Join thousands of patients managing their healthcare seamlessly.
            Book your first appointment in under 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-surface text-primary font-semibold px-7 py-3 rounded-lg hover:bg-surface/90 transition-colors text-sm"
            >
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 bg-surface/15 text-white font-semibold px-7 py-3 rounded-lg hover:bg-surface/25 transition-colors text-sm"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
