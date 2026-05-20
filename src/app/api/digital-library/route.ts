import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import LibraryItem from '../../../models/LibraryItem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    await connectToDatabase();
    
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    
    const items = await LibraryItem.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const item = await LibraryItem.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
