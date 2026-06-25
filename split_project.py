import os
import shutil

SOURCE = "."
OUTPUT_ROOT = "_split_output"
DESTINATIONS = {

    "member1": [
        "backend/controllers/authController.js",
        "backend/controllers/doctorController.js",
        "backend/controllers/departmentController.js",

        "backend/routes/authRoutes.js",
        "backend/routes/doctorRoutes.js",
        "backend/routes/departmentRoutes.js",

        "backend/models/User.js",
        "backend/models/Doctor.js",
        "backend/models/Department.js",

        "frontend/src/components/common/Footer.jsx",
        "frontend/src/components/common/Navbar.jsx",

        "frontend/src/components/ui/DoctorCard.jsx",
        "frontend/src/components/ui/HeroSlider.jsx",

        "frontend/src/pages/HomePage.jsx",
        "frontend/src/pages/AboutPage.jsx",
        "frontend/src/pages/DoctorsPage.jsx",
        "frontend/src/pages/DoctorDetailsPage.jsx",
        "frontend/src/pages/DepartmentsPage.jsx",

        "frontend/src/pages/LoginPage.jsx",
        "frontend/src/pages/RegisterPage.jsx",
        "frontend/src/pages/ForgotPasswordPage.jsx",
        "frontend/src/pages/ResetPasswordPage.jsx",

        "frontend/src/pages/dashboard/PatientDashboard.jsx",

        "frontend/src/layouts/PublicLayout.jsx",

        "frontend/public/images/hero/2.jpg",
        "frontend/public/images/hero/pexels-contact-me-923323219715-262056873-13176356.jpg",
        "frontend/public/images/hero/pexels-tima-miroshnichenko-5452282.jpg"
    ],

    "member2": [
        "backend/controllers/adminController.js",
        "backend/controllers/appointmentController.js",
        "backend/controllers/slotController.js",

        "backend/routes/adminRoutes.js",
        "backend/routes/appointmentRoutes.js",

        "backend/models/Appointment.js",

        "frontend/src/pages/admin/AdminAppointmentsPage.jsx",
        "frontend/src/pages/admin/AdminDepartmentsPage.jsx",
        "frontend/src/pages/admin/AdminDoctorsPage.jsx",
        "frontend/src/pages/admin/AdminRefundsPage.jsx",
        "frontend/src/pages/admin/AdminRevenueChartPage.jsx",
        "frontend/src/pages/admin/AdminUsersPage.jsx",

        "frontend/src/pages/dashboard/AdminDashboard.jsx",
        "frontend/src/pages/dashboard/OverviewDashboard.jsx",
        "frontend/src/pages/AppointmentsDashboard.jsx",

        "frontend/src/components/ui/NeumorphicBox.jsx",
        "frontend/src/components/ui/PageTransition.jsx",
        "frontend/src/components/ui/SkeletonLoader.jsx",

        "frontend/src/pages/ContactPage.jsx"
    ],

    "member3": [
        "backend/config/db.js",

        "backend/controllers/paymentController.js",
        "backend/controllers/prescriptionController.js",

        "backend/routes/paymentRoutes.js",
        "backend/routes/prescriptionRoutes.js",

        "backend/models/Payment.js",
        "backend/models/Prescription.js",

        "backend/middleware/auth.js",
        "backend/middleware/error.js",
        "backend/middleware/upload.js",

        "backend/utils/asyncHandler.js",
        "backend/utils/errorResponse.js",
        "backend/utils/slotGenerator.js",

        "backend/index.js",
        "backend/seed.js",

        "backend/package.json",
        "backend/package-lock.json",

        "backend/.env",
        "frontend/.env",
        "backend/.env.example",
        "backend/README.md",

        "frontend/src/components/PrescriptionForm.jsx",
        "frontend/src/components/ProtectedRoute.jsx",

        "frontend/src/context/AuthContext.jsx",

        "frontend/src/layouts/DashboardLayout.jsx",

        "frontend/src/pages/PaymentsPage.jsx",
        "frontend/src/pages/PrescriptionsPage.jsx",
        "frontend/src/pages/ProfilePage.jsx",

        "frontend/src/pages/dashboard/DoctorDashboard.jsx",
        "frontend/src/pages/dashboard/DoctorEarningsPage.jsx",

        "frontend/src/App.jsx",
        "frontend/src/main.jsx",

        "frontend/src/styles/index.css",
        "frontend/src/utils/axios.js",

        "frontend/index.html",
        "frontend/package.json",
        "frontend/package-lock.json",
        "frontend/postcss.config.cjs",
        "frontend/tailwind.config.js",
        "frontend/vercel.json",
        "frontend/vite.config.js",

        "frontend/.env.example",
        "frontend/README.md",
        "frontend/folder-structure.txt",

        ".gitignore",
        "env.example",
        "folder-structure.txt",

        "README.md",
        "README_Short.md",
        "FULL_ANALYSIS.md",
        "GIT_COLLABORATION_GUIDE.md",
        "HOW_TO_RUN.md",
        "SHIFACARE_SETUP_GUIDE.md",

        "render.yaml",
        "test_audit.md"
    ]
}

assigned = set()

for files in DESTINATIONS.values():
    assigned.update(files)

all_files = []

for root, dirs, files in os.walk(SOURCE):
    IGNORE_DIRS = {
    "node_modules",
    ".git",
    "_split_output",
    "__pycache__"
}

    IGNORE_FILES = {
    "split_project.py"
}

    dirs[:] = [
        d for d in dirs
        if d not in IGNORE_DIRS
    ]

    for file in files:
        if file in IGNORE_FILES:
            continue

        relative = os.path.relpath(
            os.path.join(root, file),
            SOURCE
        ).replace("\\", "/")

        all_files.append(relative)

missing = set(all_files) - assigned

if missing:
    print("\nMissing files:\n")
    for m in sorted(missing):
        print(m)

    print("\nFix missing files first.")
    exit()

print("\nAll files assigned successfully.\n")

for member, file_list in DESTINATIONS.items():

    os.makedirs(member, exist_ok=True)

    for file_path in file_list:

        source_file = os.path.join(
            SOURCE,
            file_path
        )

        if not os.path.exists(source_file):
            print("Not found:", file_path)
            continue
        
        destination_file = os.path.join(
            OUTPUT_ROOT,
            member,
            file_path
        )

        os.makedirs(
            os.path.dirname(destination_file),
            exist_ok=True
        )

        shutil.copy2(
            source_file,
            destination_file
        )

print("\nProject split completed successfully.")