import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/api-helpers';

export async function PATCH(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, profilePhoto, mobile, dob, gender, addressLine1, addressLine2, city, state, pincode, guardianPhone, qualification, experience, subjects } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (profilePhoto !== undefined) update.photoURL = profilePhoto;
    if (mobile !== undefined) update.mobile = mobile;
    if (dob !== undefined) update.dob = dob;
    if (gender !== undefined) update.gender = gender;
    if (addressLine1 !== undefined) update.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) update.addressLine2 = addressLine2;
    if (city !== undefined) update.city = city;
    if (state !== undefined) update.state = state;
    if (pincode !== undefined) update.pincode = pincode;
    if (guardianPhone !== undefined) update.guardianPhone = guardianPhone;
    if (qualification !== undefined) update.qualification = qualification;
    if (experience !== undefined) update.experience = experience;
    if (subjects !== undefined) update.subjects = typeof subjects === 'string' ? subjects.split(',').map((s: string) => s.trim()) : subjects;

    const user = await User.findOneAndUpdate(
      { id: session.id },
      { $set: update },
      { new: true }
    ).select('-password');

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
