import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Public
export const getDepartments = asyncHandler(async (req, res, next) => {
  const departments = await Department.find().sort('name');
  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments,
  });
});

// @desc    Get single department with its doctors
// @route   GET /api/v1/departments/:id
// @access  Public
export const getDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Department not found', 404));
  }

  // Also fetch doctors belonging to this department
  const doctors = await Doctor.find({ department: req.params.id, isAvailable: true })
    .populate('user', 'name avatar');

  res.status(200).json({
    success: true,
    data: { ...department.toObject(), doctors },
  });
});

// @desc    Create department
// @route   POST /api/v1/departments
// @access  Private/Admin
export const createDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
export const updateDepartment = asyncHandler(async (req, res, next) => {
  let department = await Department.findById(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Department not found', 404));
  }

  department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department,
  });
});

// @desc    Delete department  ← THIS WAS MISSING
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
export const deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new ErrorResponse('Department not found', 404));
  }

  // Check if any doctors are still assigned to this department
  const doctorsInDept = await Doctor.countDocuments({ department: req.params.id });
  if (doctorsInDept > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete — ${doctorsInDept} doctor(s) are still assigned to this department. Reassign them first.`,
        400
      )
    );
  }

  await department.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully',
    data: {},
  });
});
