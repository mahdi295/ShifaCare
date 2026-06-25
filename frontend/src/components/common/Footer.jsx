import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => (
  <footer className="bg-surface border-t border-border pt-14 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-base text-heading">ShifaCare</span>
          </div>
          <p className="text-muted text-sm leading-relaxed">
            Modern hospital management delivering compassionate care with technology
            across Bangladesh.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-sm text-heading mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['Home','/'],['About Us','/about'],['Our Doctors','/doctors'],['Departments','/departments'],['Contact','/contact']].map(([label, path]) => (
              <li key={path}>
                <Link to={path} className="text-sm text-muted hover:text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-sm text-heading mb-4">Services</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {['Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','General Medicine'].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-sm text-heading mb-4">Contact Us</h4>
          <ul className="space-y-3">
            {[
              { icon: MapPin, text: 'Chandgaon, Chattogram, Bangladesh' },
              { icon: Phone,  text: '+880 1234-567890' },
              { icon: Mail,   text: 'care@shifacare.health' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-sm text-muted">
                <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-primary" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <p>© {new Date().getFullYear()} ShifaCare. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made with <Heart size={11} className="text-red-400 fill-red-400" /> in Bangladesh
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
