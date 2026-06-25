/**
 * ShifaCare HMS — Database Seeder
 *
 * Run:  node seed.js
 * Run:  node seed.js --clear
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';

import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import Payment from './models/Payment.js';
import Prescription from './models/Prescription.js';

const clearAll = async () => {
  await Promise.all([
    User.deleteMany(),
    Department.deleteMany(),
    Doctor.deleteMany(),
    Appointment.deleteMany(),
    Payment.deleteMany(),
    Prescription.deleteMany(),
  ]);

  console.log('Database cleared.');
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('Seed disabled in production.');
    process.exit(1);
  }

  await connectDB();

  if (process.argv.includes('--clear')) {
    await clearAll();
    await mongoose.connection.close();
    process.exit(0);
  }

  try {
    await clearAll();

    // ─────────────────────────────────────────────────────────────
    // Departments
    // ─────────────────────────────────────────────────────────────

    const departments = await Department.create([
      {
        name: 'Cardiology',
        description: 'Heart disease diagnosis, treatment and prevention.',
      },
      {
        name: 'ENT',
        description: 'Ear, nose and throat specialist care.',
      },
      {
        name: 'Neurology',
        description: 'Brain, spine and nervous system disorders.',
      },
      {
        name: 'Ophthalmology',
        description: 'Comprehensive eye care and vision correction.',
      },
      {
        name: 'Orthopedics',
        description: 'Bone, joint and muscle care including surgery.',
      },
      {
        name: 'Pediatrics',
        description:
          'Compassionate child healthcare from newborn through adolescence.',
      },
      {
        name: 'Dermatology',
        description: 'Skin, hair and nail treatments.',
      },
      {
        name: 'Gynecology',
        description: 'Women’s reproductive healthcare and pregnancy care.',
      },
      {
        name: 'Dentistry',
        description: 'Dental surgery and oral healthcare.',
      },
      {
        name: 'Urology',
        description: 'Urinary tract and male reproductive healthcare.',
      },
      {
        name: 'Nephrology',
        description: 'Kidney diseases and dialysis treatment.',
      },
      {
        name: 'Pulmonology',
        description: 'Respiratory and lung disease treatment.',
      },
      {
        name: 'Oncology',
        description: 'Cancer diagnosis and treatment.',
      },
      {
        name: 'General Medicine',
        description: 'Primary and internal medical care.',
      },
      {
        name: 'Psychiatry',
        description: 'Mental health and behavioral care.',
      },
    ]);

    const dept = (name) =>
      departments.find((d) => d.name === name)._id;

    // ─────────────────────────────────────────────────────────────
    // Users (Admin)
    // ─────────────────────────────────────────────────────────────

    const admin = await User.create({
      name: 'Admin User',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      email: 'admin@shifacare.com',
      password: 'Admin@2024',
      role: 'admin',
      phone: '01711000001',
    });

    // ─────────────────────────────────────────────────────────────
    // Patients
    // ─────────────────────────────────────────────────────────────

    const patients = await User.create([
      {
        name: 'Rahim Ahmed',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        email: 'rahim@gmail.com',
        password: 'Admin@2024',
        role: 'patient',
        phone: '01721000001',
      },
      {
        name: 'Fatema Khatun',
        email: 'fatema@gmail.com',
        password: 'Admin@2024',
        role: 'patient',
        phone: '01721000002',
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat@gmail.com',
        password: 'Admin@2024',
        role: 'patient',
        phone: '01721000003',
      },
      {
        name: 'Sabbir Hossain',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
        email: 'sabbir@gmail.com',
        password: 'Admin@2024',
        role: 'patient',
        phone: '01721000004',
      },
      {
        name: 'Mehedi Hasan',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        email: 'mehedi@gmail.com',
        password: 'Admin@2024',
        role: 'patient',
        phone: '01721000005',
      },
    ]);

    // ─────────────────────────────────────────────────────────────
    // Doctors Data
    // ─────────────────────────────────────────────────────────────

    const doctorsData = [
      {
        name: 'Arafat Hossain',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769018845/t0mt2oozfy57vwvjgcfy.png',
        email: 'arafat@shifacare.com',
        phone: '01711000004',
        department: 'Cardiology',
        specialization: 'Interventional Cardiology',
        experience: 12,
        degree: 'MBBS, MD (Cardiology)',
        fees: 800,
        about: 'Senior cardiologist with expertise in coronary intervention.',
      },
      {
        name: 'Nazma Khanam',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'nazma@shifacare.com',
        phone: '01711000005',
        department: 'Neurology',
        specialization: 'Clinical Neurology',
        experience: 8,
        degree: 'MBBS, FCPS (Neurology)',
        fees: 600,
        about: 'Specialist in stroke and epilepsy management.',
      },
      {
        name: 'Mahmud Hasan',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769018656/tnz9oc7eewapa7gmgxjl.png',
        email: 'mahmud@shifacare.com',
        phone: '01711000006',
        department: 'ENT',
        specialization: 'ENT Surgery',
        experience: 10,
        degree: 'MBBS, DLO',
        fees: 650,
        about: 'Experienced ENT surgeon.',
      },
      {
        name: 'Farhana Rahman',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'farhana@shifacare.com',
        phone: '01711000007',
        department: 'Gynecology',
        specialization: 'Obstetrics & Gynecology',
        experience: 11,
        degree: 'MBBS, FCPS',
        fees: 750,
        about: 'Women’s reproductive healthcare specialist.',
      },
      {
        name: 'Imran Chowdhury',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769018233/dsf3bg24fi2pbnbbwnmp.png',
        email: 'imran@shifacare.com',
        phone: '01711000008',
        department: 'Urology',
        specialization: 'Urology',
        experience: 9,
        degree: 'MBBS, MS (Urology)',
        fees: 700,
        about: 'Expert in urinary tract surgery.',
      },
      {
        name: 'Tasnim Akter',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'tasnim@shifacare.com',
        phone: '01711000009',
        department: 'Dermatology',
        specialization: 'Dermatology',
        experience: 6,
        degree: 'MBBS, DDV',
        fees: 500,
        about: 'Skin, hair and nail specialist.',
      },
      {
        name: 'Rezaul Karim',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769017546/wexalgmrwzivgix8xqb8.png',
        email: 'rezaul@shifacare.com',
        phone: '01711000010',
        department: 'Nephrology',
        specialization: 'Kidney Specialist',
        experience: 13,
        degree: 'MBBS, MD (Nephrology)',
        fees: 850,
        about: 'Kidney disease and dialysis expert.',
      },
      {
        name: 'Nusrat Jahan',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'nusratdoc@shifacare.com',
        phone: '01711000011',
        department: 'Pediatrics',
        specialization: 'Child Specialist',
        experience: 7,
        degree: 'MBBS, DCH',
        fees: 550,
        about: 'Dedicated pediatric healthcare specialist.',
      },
      {
        name: 'Shafiqul Islam',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769017331/ko046cztg2k3dltjulik.png',
        email: 'shafiqul@shifacare.com',
        phone: '01711000012',
        department: 'Orthopedics',
        specialization: 'Joint Replacement',
        experience: 15,
        degree: 'MBBS, MS (Orthopedics)',
        fees: 950,
        about: 'Experienced orthopedic surgeon.',
      },
      {
        name: 'Sharmin Sultana',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'sharmin@shifacare.com',
        phone: '01711000013',
        department: 'Ophthalmology',
        specialization: 'Eye Specialist',
        experience: 9,
        degree: 'MBBS, DO',
        fees: 650,
        about: 'Cataract and glaucoma specialist.',
      },
      {
        name: 'Tanvir Alam',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769017250/cjifx1ckjh3bbrkzdkcb.png',
        email: 'tanvir@shifacare.com',
        phone: '01711000014',
        department: 'Pulmonology',
        specialization: 'Pulmonology',
        experience: 10,
        degree: 'MBBS, MD (Pulmonology)',
        fees: 700,
        about: 'Respiratory and asthma specialist.',
      },
      {
        name: 'Sadia Karim',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'sadia@shifacare.com',
        phone: '01711000015',
        department: 'Psychiatry',
        specialization: 'Psychiatry',
        experience: 8,
        degree: 'MBBS, MD (Psychiatry)',
        fees: 650,
        about: 'Mental health specialist.',
      },
      {
        name: 'Rakib Ahmed',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769016499/twxwg2lkxn8domfaboyi.png',
        email: 'rakib@shifacare.com',
        phone: '01711000016',
        department: 'General Medicine',
        specialization: 'Internal Medicine',
        experience: 12,
        degree: 'MBBS, FCPS',
        fees: 600,
        about: 'General physician and internal medicine specialist.',
      },
      {
        name: 'Jannatul Ferdous',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1780921718/doctor-girl-hijab-minimalist-illustration-600nw-2215497797_wuimy3.png',
        email: 'jannat@shifacare.com',
        phone: '01711000017',
        department: 'Dentistry',
        specialization: 'Dental Surgery',
        experience: 7,
        degree: 'BDS',
        fees: 500,
        about: 'Cosmetic and oral surgery expert.',
      },
      {
        name: 'Shamsul Alam',
        avatar: 'https://res.cloudinary.com/doywsclsl/image/upload/v1769013368/bao519bhuinwu25yrtyk.png',
        email: 'shamsul@shifacare.com',
        phone: '01711000018',
        department: 'Oncology',
        specialization: 'Medical Oncology',
        experience: 14,
        degree: 'MBBS, MD (Oncology)',
        fees: 1000,
        about: 'Cancer diagnosis and chemotherapy specialist.',
      },
    ];

    // ─────────────────────────────────────────────────────────────
    // Create Doctors
    // ─────────────────────────────────────────────────────────────

    const createdDoctors = [];

    for (const d of doctorsData) {
      const doctorUser = await User.create({
        name: d.name,
        avatar: d.avatar,
        email: d.email,
        password: 'Admin@2024',
        role: 'doctor',
        phone: d.phone,
      });

      const doctor = await Doctor.create({
        user: doctorUser._id,
        department: dept(d.department),
        specialization: d.specialization,
        experience: d.experience,
        degree: d.degree,
        fees: d.fees,
        about: d.about,
        isAvailable: true,

        schedule: [
          {
            day: 'Saturday',
            startTime: '09:00',
            endTime: '13:00',
          },
          {
            day: 'Monday',
            startTime: '15:00',
            endTime: '19:00',
          },
          {
            day: 'Wednesday',
            startTime: '10:00',
            endTime: '14:00',
          },
        ],
      });

      createdDoctors.push(doctor);
    }

    // ─────────────────────────────────────────────────────────────
    // Appointments
    // ─────────────────────────────────────────────────────────────

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const appointment1 = await Appointment.create({
      patient: patients[0]._id,
      doctor: createdDoctors[0]._id,
      appointmentDate: tomorrow,
      slot: '09:00 AM',
      fees: createdDoctors[0].fees,
      symptoms: 'Chest pain and breathing difficulty.',
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    const appointment2 = await Appointment.create({
      patient: patients[1]._id,
      doctor: createdDoctors[1]._id,
      appointmentDate: tomorrow,
      slot: '10:00 AM',
      fees: createdDoctors[1].fees,
      symptoms: 'Recurring headache and dizziness.',
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const appointment3 = await Appointment.create({
      patient: patients[2]._id,
      doctor: createdDoctors[5]._id,
      appointmentDate: tomorrow,
      slot: '11:00 AM',
      fees: createdDoctors[5].fees,
      symptoms: 'Skin allergy and itching.',
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    // ─────────────────────────────────────────────────────────────
    // Payments
    // ─────────────────────────────────────────────────────────────

    await Payment.create([
      {
        appointment: appointment1._id,
        patient: patients[0]._id,
        amount: appointment1.fees,
        transactionId: `TXN-${Date.now()}-1`,
        status: 'successful',
        method: 'card',
        paidAt: new Date(),
      },

      {
        appointment: appointment3._id,
        patient: patients[2]._id,
        amount: appointment3.fees,
        transactionId: `TXN-${Date.now()}-2`,
        status: 'successful',
        method: 'bkash',
        paidAt: new Date(),
      },
    ]);

    // ─────────────────────────────────────────────────────────────
    // Prescriptions
    // ─────────────────────────────────────────────────────────────

    await Prescription.create({
      appointment: appointment1._id,
      doctor: createdDoctors[0]._id,
      patient: patients[0]._id,

      diagnosis: 'Stable Angina',

      medicines: [
        {
          name: 'Aspirin',
          dosage: '75mg',
          duration: '30 days',
          instructions: 'Once daily after breakfast',
        },

        {
          name: 'Atorvastatin',
          dosage: '20mg',
          duration: '30 days',
          instructions: 'Once daily at night',
        },
      ],

      advice:
        'Reduce salt intake and avoid heavy physical activity.',

      followUpDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ),
    });

    // ─────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────

    console.log('\n✅ Seed completed successfully!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login');
    console.log('Email: admin@shifacare.com');
    console.log('Password: Admin@2024');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`Departments: ${departments.length}`);
    console.log(`Doctors: ${createdDoctors.length}`);
    console.log(`Patients: ${patients.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (err) {
    console.error('Seed error:', err.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();