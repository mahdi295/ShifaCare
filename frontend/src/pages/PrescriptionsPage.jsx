import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Download, Loader2, Calendar,
  Pill, User, Stethoscope, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ── PDF generator ─────────────────────────────────────────────────────────────
const downloadPrescriptionPDF = async (px) => {
  // Dynamic import so jsPDF only loads when needed
  const { jsPDF } = await import('jspdf');
  // jspdf-autotable v3: exports autoTable as both default and named export
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule.autoTable;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const ACCENT  = [108, 99, 255];   // #6C63FF
  const TEAL    = [56, 178, 172];   // #38B2AC
  const DARK    = [61, 72, 82];     // #3D4852
  const MUTED   = [107, 114, 128];  // #6B7280
  const LIGHT   = [240, 242, 247];  // near background
  const WHITE   = [255, 255, 255];

  const W = doc.internal.pageSize.getWidth();

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 38, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ShifaCare', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital Management System  |  care@shifacare.health  |  +880 1234-567890', 14, 23);
  doc.text('Chandgaon, Chattogram, Bangladesh', 14, 30);

  // Rx badge (right side of header)
  doc.setFillColor(...TEAL);
  doc.roundedRect(W - 30, 8, 22, 22, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rx', W - 22, 23, { align: 'center' });

  // ── MEDICAL PRESCRIPTION title ───────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.rect(0, 38, W, 12, 'F');
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL PRESCRIPTION', W / 2, 46, { align: 'center' });

  // ── Info row ─────────────────────────────────────────────────────────────
  let y = 58;
  const col1 = 14, col2 = W / 2 + 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);

  const field = (label, value, x, cy) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(label, x, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(value || '—', x + 28, cy);
  };

  field('Patient:',    px.patient?.name || '—',               col1, y);
  field('Rx Date:',    new Date(px.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }), col2, y);
  y += 7;
  field('Doctor:',     `Dr. ${px.doctor?.user?.name || '—'}`, col1, y);
  field('Department:', px.doctor?.department?.name || '—',    col2, y);
  y += 7;
  field('Phone:',      px.patient?.phone || '—',              col1, y);
  if (px.appointment?.appointmentDate) {
    field('Visit Date:', new Date(px.appointment.appointmentDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }), col2, y);
  }

  // Divider
  y += 8;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.line(14, y, W - 14, y);

  // ── Diagnosis ────────────────────────────────────────────────────────────
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text('DIAGNOSIS', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  const diagLines = doc.splitTextToSize(px.diagnosis || '—', W - 28);
  doc.text(diagLines, 14, y);
  y += diagLines.length * 5 + 4;

  // ── Medicines table ───────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text('PRESCRIBED MEDICINES', 14, y);
  y += 4;

  const medicines = px.medicines || [];
  autoTable(doc, {
    startY: y,
    head: [['#', 'Medicine Name', 'Dosage', 'Duration', 'Instructions']],
    body: medicines.length > 0
      ? medicines.map((m, i) => [
          i + 1,
          m.name || '—',
          m.dosage || '—',
          m.duration || '—',
          m.instructions || '—',
        ])
      : [['—', 'No medicines prescribed', '', '', '']],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: DARK,
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: WHITE,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 42 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Advice ───────────────────────────────────────────────────────────────
  if (px.advice) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ACCENT);
    doc.text('ADVICE & INSTRUCTIONS', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const adviceLines = doc.splitTextToSize(px.advice, W - 28);
    doc.text(adviceLines, 14, y);
    y += adviceLines.length * 5 + 6;
  }

  // ── Follow-up ────────────────────────────────────────────────────────────
  if (px.followUpDate) {
    doc.setFillColor(...TEAL);
    doc.roundedRect(14, y, W - 28, 10, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Follow-up Date: ${new Date(px.followUpDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}`,
      W / 2, y + 6.5,
      { align: 'center' }
    );
    y += 16;
  }

  // ── Doctor signature block ────────────────────────────────────────────────
  const sigX = W - 65;
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.3);
  doc.line(sigX, y + 12, W - 14, y + 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Dr. ${px.doctor?.user?.name || '—'}`, sigX + (W - 14 - sigX) / 2, y + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(px.doctor?.specialization || '', sigX + (W - 14 - sigX) / 2, y + 22, { align: 'center' });
  doc.text('Authorised Signature', sigX + (W - 14 - sigX) / 2, y + 27, { align: 'center' });

  // ── Footer ───────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...ACCENT);
  doc.rect(0, pageH - 14, W, 14, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is a digitally generated prescription from ShifaCare. Valid only with doctor authorisation.',
    W / 2, pageH - 6,
    { align: 'center' }
  );

  // Save
  const fileName = `Prescription_${px.patient?.name?.replace(/\s+/g, '_')}_${new Date(px.createdAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};

// ── Main component ─────────────────────────────────────────────────────────────
const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [downloading, setDownloading]     = useState(null); // prescription _id being downloaded
  const [expanded, setExpanded]           = useState(null); // expanded card _id

  useEffect(() => {
    api.get('/prescriptions/me')
      .then((r) => setPrescriptions(r.data.data))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (px) => {
    setDownloading(px._id);
    try {
      await downloadPrescriptionPDF(px);
      toast.success('Prescription PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageTransition>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Prescription History</h3>
            <p className="text-muted text-sm mt-1">{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <FileText className="mx-auto text-muted mb-4" size={40} />
            <p className="font-semibold">No prescriptions yet</p>
            <p className="text-muted text-sm mt-2">
              {user?.role === 'patient'
                ? 'Your prescriptions will appear here after a completed consultation.'
                : 'Prescriptions you have issued will appear here.'}
            </p>
          </NeumorphicBox>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prescriptions.map((px) => (
              <NeumorphicBox key={px._id} className="p-6">

                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded-lg border border-border flex items-center justify-center text-primary shrink-0">
                      <FileText size={19} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{px.diagnosis}</h4>
                      <p className="text-xs text-muted">
                        {user?.role === 'patient'
                          ? `Dr. ${px.doctor?.user?.name}`
                          : px.patient?.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted flex items-center gap-1 shrink-0">
                    <Calendar size={11} />
                    {new Date(px.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Medicines preview */}
                <div className="bg-background rounded-lg border border-border p-3 mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Pill size={13} className="text-primary" />
                    <p className="text-xs font-semibold">Medicines</p>
                    <span className="ml-auto text-xs text-muted">{px.medicines?.length || 0} item{px.medicines?.length !== 1 ? 's' : ''}</span>
                  </div>
                  {(expanded === px._id ? px.medicines : px.medicines?.slice(0, 2))?.map((med, i) => (
                    <div key={i} className="flex justify-between text-xs text-muted py-1 border-b border-gray-300/20 last:border-0">
                      <span className="font-medium text-text">{med.name}</span>
                      <span>{med.dosage} · {med.duration}</span>
                    </div>
                  ))}
                  {px.medicines?.length > 2 && (
                    <button
                      onClick={() => setExpanded(expanded === px._id ? null : px._id)}
                      className="text-xs text-primary mt-1.5 hover:underline"
                    >
                      {expanded === px._id ? 'Show less' : `+${px.medicines.length - 2} more`}
                    </button>
                  )}
                </div>

                {/* Advice snippet */}
                {px.advice && (
                  <p className="text-xs text-muted mb-4 px-1 line-clamp-2">
                    <span className="font-semibold text-text">Advice: </span>{px.advice}
                  </p>
                )}

                {/* Follow-up */}
                {px.followUpDate && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-secondary font-medium mb-4">
                    <Calendar size={12} />
                    Follow-up: {new Date(px.followUpDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                )}

                {/* Download button */}
                <button
                  onClick={() => handleDownload(px)}
                  disabled={downloading === px._id}
                  className="nm-button-accent w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {downloading === px._id
                    ? <><Loader2 size={15} className="animate-spin" /> Generating PDF...</>
                    : <><Download size={15} /> Download Prescription PDF</>
                  }
                </button>
              </NeumorphicBox>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PrescriptionsPage;
