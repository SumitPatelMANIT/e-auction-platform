import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { 
    first_name, middle_name, last_name, email, password, role, 
    dob, phone, house_no, street, city, state, country, pin_code 
  } = req.body;

  console.log('--- REGISTRATION PAYLOAD RECEIVED ---');
  console.log(req.body);
  console.log('-------------------------------------');

  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        first_name,
        middle_name: middle_name || null,
        last_name,
        email,
        password: hashedPassword,
        role: role || 'BIDDER',
        dob: dob || null,
        house_no: house_no || null,
        street: street || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pin_code: pin_code || null,
        phones: phone ? {
          create: [{ phone_number: phone }]
        } : undefined,
      },
    });

    if (user) {
      res.status(201).json({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        dob: user.dob,
        house_no: user.house_no,
        street: user.street,
        city: user.city,
        state: user.state,
        country: user.country,
        pin_code: user.pin_code,
        phone: phone || null,
        photoUrl: user.profile_picture,
        token: generateToken(user.user_id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { phones: true },
    });

    if (user && (await comparePassword(password, user.password))) {
      res.json({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        dob: user.dob,
        house_no: user.house_no,
        street: user.street,
        city: user.city,
        state: user.state,
        country: user.country,
        pin_code: user.pin_code,
        phone: user.phones && user.phones.length > 0 ? user.phones[0].phone_number : null,
        photoUrl: user.profile_picture,
        token: generateToken(user.user_id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  // req.user is set in authMiddleware
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { phone, address, photoUrl } = req.body;
  const userId = req.user.user_id;

  try {
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        house_no: address?.houseNo || null,
        street: address?.street || null,
        city: address?.city || null,
        state: address?.state || null,
        country: address?.country || null,
        pin_code: address?.pin || null,
        profile_picture: photoUrl || null,
      },
      include: { phones: true },
    });

    if (phone) {
      // Check if phone exists, if so update it, else create
      const existingPhone = updatedUser.phones[0];
      if (existingPhone) {
        await prisma.userPhone.update({
          where: { phone_id: existingPhone.phone_id },
          data: { phone_number: phone }
        });
      } else {
        await prisma.userPhone.create({
          data: {
            user_id: userId,
            phone_number: phone
          }
        });
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { current, new: newPassword } = req.body;
  const userId = req.user.user_id;

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await comparePassword(current, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password successfully changed!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
