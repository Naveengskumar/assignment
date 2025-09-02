import User from './user.model.js';

export const createUser = (data) => User.create(data);
export const findByEmail = (email) => User.findOne({ email });
export const findById = (id) => User.findById(id);
export const listUsers = () => User.find().select('-passwordHash');
export const paginatedList = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find().select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  return { items, total, page, limit };
};
