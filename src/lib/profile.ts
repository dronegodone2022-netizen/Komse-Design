import { UserProfile } from '../types';

export const profileFromRow = (row: Record<string, unknown>): UserProfile => ({
  id: String(row.id),
  name: String(row.name || 'Customer'),
  email: String(row.email || ''),
  profilePicture: typeof row.profile_picture === 'string' ? row.profile_picture : undefined,
  phone: typeof row.phone === 'string' ? row.phone : undefined,
  address: typeof row.address === 'string' ? row.address : undefined,
  postalCode: typeof row.postal_code === 'string' ? row.postal_code : undefined,
  city: typeof row.city === 'string' ? row.city : undefined,
  country: typeof row.country === 'string' ? row.country : undefined,
  joinedDate: typeof row.joined_date === 'string' ? row.joined_date : undefined,
  role: row.role === 'Admin' ? 'Admin' : 'Customer',
  status: row.status === 'Suspended' ? 'Suspended' : 'Active',
  ordersCount: typeof row.orders_count === 'number' ? row.orders_count : undefined,
});

export const profileToRow = (profile: UserProfile) => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  profile_picture: profile.profilePicture || null,
  phone: profile.phone || null,
  address: profile.address || null,
  postal_code: profile.postalCode || null,
  city: profile.city || null,
  country: profile.country || null,
  role: profile.role || 'Customer',
  status: profile.status || 'Active',
});
